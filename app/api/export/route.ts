import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { calculateGradeResult } from '@/lib/supabase-tenant';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const dosenId = cookieStore.get('evalora_dosen_id')?.value;
    const supabase = createClient(cookieStore);

    const { searchParams } = new URL(request.url);
    const mkId = searchParams.get('mk_id');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Nilai');
    
    // Kolom sesuai PRD
    worksheet.columns = [
      { header: 'Kode MK', key: 'kode_mk', width: 12 },
      { header: 'NIM', key: 'nim', width: 20 },
      { header: 'Nama Mahasiswa', key: 'nama', width: 30 },
      { header: 'Nilai Tugas (Rata²)', key: 'tugas_avg', width: 18 },
      { header: 'Prosentase Tugas', key: 'pct_tugas', width: 18 },
      { header: 'Nilai UTS', key: 'uts', width: 15 },
      { header: 'Prosentase UTS', key: 'pct_uts', width: 18 },
      { header: 'Nilai UAS', key: 'uas', width: 15 },
      { header: 'Prosentase UAS', key: 'pct_uas', width: 18 },
      { header: 'Nilai Akhir', key: 'na', width: 15 },
      { header: 'Huruf', key: 'huruf', width: 10 }
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4338CA' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    let data: any[] = [];

    if (dosenId) {
      // Real data from Supabase (multi-tenant)
      const dId = parseInt(dosenId);

      // Get mata kuliah
      let mkQuery = supabase.from('mata_kuliah').select('*').eq('dosen_id', dId);
      if (mkId) mkQuery = mkQuery.eq('mk_id', parseInt(mkId));
      const { data: mkList } = await mkQuery;

      if (mkList && mkList.length > 0) {
        for (const mk of mkList) {
          const { data: mahasiswaList } = await supabase
            .from('mahasiswa')
            .select('*')
            .eq('mk_id', mk.mk_id)
            .order('nim');

          if (!mahasiswaList) continue;

          const mhsIds = mahasiswaList.map((m: any) => m.mahasiswa_id);

          // Nilai tugas
          const { data: nilaiTugasList } = await supabase
            .from('nilai_tugas')
            .select('*')
            .eq('mk_id', mk.mk_id)
            .in('mahasiswa_id', mhsIds);

          // Nilai akhir
          const { data: nilaiList } = await supabase
            .from('nilai')
            .select('*')
            .eq('mk_id', mk.mk_id)
            .in('mahasiswa_id', mhsIds);

          const jumlahTugas = mk.jumlah_tugas || 3;
          const bobotT = parseFloat(mk.bobot_tugas) || 30;
          const bobotU = parseFloat(mk.bobot_uts) || 30;
          const bobotA = parseFloat(mk.bobot_uas) || 40;

          for (const mhs of mahasiswaList) {
            const tugasValues = Array(jumlahTugas).fill(0);
            const mhsTugas = (nilaiTugasList || []).filter((nt: any) => nt.mahasiswa_id === mhs.mahasiswa_id);
            mhsTugas.forEach((nt: any) => {
              if (nt.tugas_ke >= 1 && nt.tugas_ke <= jumlahTugas) {
                tugasValues[nt.tugas_ke - 1] = parseFloat(nt.nilai) || 0;
              }
            });

            const nilaiRow = (nilaiList || []).find((n: any) => n.mahasiswa_id === mhs.mahasiswa_id);
            const uts = nilaiRow ? parseFloat(nilaiRow.nilai_uts) || 0 : 0;
            const uas = nilaiRow ? parseFloat(nilaiRow.nilai_uas) || 0 : 0;

            const calc = calculateGradeResult(tugasValues, uts, uas, bobotT, bobotU, bobotA);

            data.push({
              kode_mk: mk.kode_mk,
              nim: mhs.nim,
              nama: mhs.nama,
              tugas_avg: calc.tugasAvg,
              pct_tugas: parseFloat((calc.tugasAvg * bobotT / 100).toFixed(2)),
              uts,
              pct_uts: parseFloat((uts * bobotU / 100).toFixed(2)),
              uas,
              pct_uas: parseFloat((uas * bobotA / 100).toFixed(2)),
              na: calc.na,
              huruf: calc.huruf
            });
          }
        }
      }
    }

    // Fallback mock data if no DB rows
    if (data.length === 0) {
      const bobot = { tugas: 0.3, uts: 0.3, uas: 0.4 };
      data = [
        { kode_mk: 'CS-101', nim: '19230001', nama: 'Zidane Alfarizi', tugas_avg: 85.25, pct_tugas: 25.58, uts: 80, pct_uts: 24, uas: 90, pct_uas: 36, na: 85.58, huruf: 'A' },
        { kode_mk: 'CS-101', nim: '19230002', nama: 'Nadia Pratama', tugas_avg: 88.75, pct_tugas: 26.63, uts: 85, pct_uts: 25.5, uas: 95, pct_uas: 38, na: 90.13, huruf: 'A' },
      ];
    }

    worksheet.addRows(data);

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=laporan_nilai_evalora.xlsx'
      }
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
