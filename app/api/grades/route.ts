import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { calculateGradeResult } from '@/lib/supabase-tenant';

// =====================================================
// GET: Ambil semua data nilai mahasiswa untuk dosen ini
// Multi-tenant: filter berdasarkan dosen_id dari cookie
// =====================================================
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const dosenId = cookieStore.get('evalora_dosen_id')?.value;
    const supabase = createClient(cookieStore);

    // Parse query params
    const { searchParams } = new URL(request.url);
    const mkId = searchParams.get('mk_id');

    if (!dosenId) {
      return NextResponse.json(fallbackData(), { status: 200 });
    }

    // 1. Ambil mata kuliah milik dosen ini
    let mkQuery = supabase
      .from('mata_kuliah')
      .select('*')
      .eq('dosen_id', parseInt(dosenId));
    
    if (mkId) {
      mkQuery = mkQuery.eq('mk_id', parseInt(mkId));
    }

    const { data: mataKuliah, error: mkError } = await mkQuery;

    if (mkError || !mataKuliah || mataKuliah.length === 0) {
      return NextResponse.json(fallbackData(), { status: 200 });
    }

    const activeMk = mataKuliah[0]; // default to first MK
    const mkIds = mataKuliah.map((mk: any) => mk.mk_id);

    // 2. Ambil semua mahasiswa di mata kuliah ini
    const { data: mahasiswaList, error: mhsError } = await supabase
      .from('mahasiswa')
      .select('*')
      .eq('mk_id', activeMk.mk_id)
      .order('nim');

    if (mhsError || !mahasiswaList || mahasiswaList.length === 0) {
      return NextResponse.json({
        mataKuliah: mataKuliah,
        activeMkId: activeMk.mk_id,
        jumlahTugas: activeMk.jumlah_tugas || 3,
        bobot: {
          tugas: activeMk.bobot_tugas || 30,
          uts: activeMk.bobot_uts || 30,
          uas: activeMk.bobot_uas || 40
        },
        grades: []
      });
    }

    // 3. Ambil semua nilai tugas individual
    const mahasiswaIds = mahasiswaList.map((m: any) => m.mahasiswa_id);
    
    const { data: nilaiTugasList } = await supabase
      .from('nilai_tugas')
      .select('*')
      .eq('mk_id', activeMk.mk_id)
      .in('mahasiswa_id', mahasiswaIds)
      .order('tugas_ke');

    // 4. Ambil nilai UTS/UAS dari tabel nilai
    const { data: nilaiList } = await supabase
      .from('nilai')
      .select('*')
      .eq('mk_id', activeMk.mk_id)
      .in('mahasiswa_id', mahasiswaIds);

    // 5. Build response: gabungkan data
    const jumlahTugas = activeMk.jumlah_tugas || 3;
    
    const grades = mahasiswaList.map((mhs: any) => {
      // Tugas values array
      const tugasValues = Array(jumlahTugas).fill(0);
      const mhsTugas = (nilaiTugasList || []).filter((nt: any) => nt.mahasiswa_id === mhs.mahasiswa_id);
      mhsTugas.forEach((nt: any) => {
        if (nt.tugas_ke >= 1 && nt.tugas_ke <= jumlahTugas) {
          tugasValues[nt.tugas_ke - 1] = parseFloat(nt.nilai) || 0;
        }
      });

      // UTS/UAS
      const nilaiRow = (nilaiList || []).find((n: any) => n.mahasiswa_id === mhs.mahasiswa_id);
      const uts = nilaiRow ? parseFloat(nilaiRow.nilai_uts) || 0 : 0;
      const uas = nilaiRow ? parseFloat(nilaiRow.nilai_uas) || 0 : 0;

      // Calculate
      const calc = calculateGradeResult(
        tugasValues, uts, uas,
        activeMk.bobot_tugas, activeMk.bobot_uts, activeMk.bobot_uas
      );

      return {
        id: mhs.mahasiswa_id,
        nim: mhs.nim,
        name: mhs.nama,
        tugasValues,
        tugasAvg: calc.tugasAvg,
        uts,
        uas,
        na: calc.na,
        huruf: calc.huruf,
        nilaiId: nilaiRow?.nilai_id || null
      };
    });

    return NextResponse.json({
      mataKuliah,
      activeMkId: activeMk.mk_id,
      jumlahTugas,
      bobot: {
        tugas: parseFloat(activeMk.bobot_tugas) || 30,
        uts: parseFloat(activeMk.bobot_uts) || 30,
        uas: parseFloat(activeMk.bobot_uas) || 40
      },
      grades
    });

  } catch (error: any) {
    console.error('GET /api/grades error:', error);
    return NextResponse.json(fallbackData(), { status: 200 });
  }
}

// =====================================================
// POST: Simpan nilai (tugas individual + UTS + UAS)
// Juga menulis ke audit_logs
// =====================================================
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const dosenId = cookieStore.get('evalora_dosen_id')?.value;
    const supabase = createClient(cookieStore);
    const body = await request.json();

    if (!dosenId) {
      return NextResponse.json({ success: true, message: 'Mock save (no tenant)' });
    }

    const { mkId, updates } = body;
    // updates = [{ id (mahasiswa_id), tugasValues: [...], uts, uas }]

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Ambil bobot dari MK
    const { data: mk } = await supabase
      .from('mata_kuliah')
      .select('*')
      .eq('mk_id', mkId)
      .eq('dosen_id', parseInt(dosenId))
      .single();

    if (!mk) {
      return NextResponse.json({ error: 'Mata kuliah tidak ditemukan' }, { status: 404 });
    }

    for (const upd of updates) {
      const { id: mahasiswaId, tugasValues, uts, uas } = upd;

      // 1. Upsert setiap nilai tugas individual
      if (tugasValues && Array.isArray(tugasValues)) {
        for (let i = 0; i < tugasValues.length; i++) {
          await supabase
            .from('nilai_tugas')
            .upsert({
              mahasiswa_id: mahasiswaId,
              mk_id: mkId,
              tugas_ke: i + 1,
              nilai: tugasValues[i]
            }, {
              onConflict: 'mahasiswa_id,mk_id,tugas_ke'
            });
        }
      }

      // 2. Hitung NA baru
      const calc = calculateGradeResult(
        tugasValues || [], uts || 0, uas || 0,
        mk.bobot_tugas, mk.bobot_uts, mk.bobot_uas
      );

      // 3. Cek apakah record nilai sudah ada
      const { data: existingNilai } = await supabase
        .from('nilai')
        .select('*')
        .eq('mahasiswa_id', mahasiswaId)
        .eq('mk_id', mkId)
        .single();

      if (existingNilai) {
        // Audit log: catat perubahan
        if (parseFloat(existingNilai.nilai_akhir) !== calc.na) {
          await supabase.from('audit_logs').insert({
            nilai_id: existingNilai.nilai_id,
            field_changed: 'nilai_akhir',
            nilai_lama: existingNilai.nilai_akhir,
            nilai_baru: calc.na,
            dosen_id: parseInt(dosenId)
          });
        }

        // Update
        await supabase
          .from('nilai')
          .update({
            nilai_tugas_avg: calc.tugasAvg,
            nilai_uts: uts,
            nilai_uas: uas,
            nilai_akhir: calc.na,
            nilai_huruf: calc.huruf,
            updated_at: new Date().toISOString()
          })
          .eq('nilai_id', existingNilai.nilai_id);

      } else {
        // Insert baru
        await supabase
          .from('nilai')
          .insert({
            mahasiswa_id: mahasiswaId,
            mk_id: mkId,
            nilai_tugas_avg: calc.tugasAvg,
            nilai_uts: uts,
            nilai_uas: uas,
            nilai_akhir: calc.na,
            nilai_huruf: calc.huruf
          });
      }
    }

    return NextResponse.json({ success: true, message: 'Nilai berhasil disimpan' });

  } catch (error: any) {
    console.error('POST /api/grades error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// =====================================================
// Fallback mock data saat belum ada koneksi DB
// =====================================================
function fallbackData() {
  return {
    mataKuliah: [
      { mk_id: 1, kode_mk: 'CS-101', nama_mk: 'Rekayasa Perangkat Lunak', bobot_tugas: 30, bobot_uts: 30, bobot_uas: 40, jumlah_tugas: 4 }
    ],
    activeMkId: 1,
    jumlahTugas: 4,
    bobot: { tugas: 30, uts: 30, uas: 40 },
    grades: [
      { id: 1, nim: '19230001', name: 'Zidane Alfarizi', tugasValues: [85, 90, 78, 88], uts: 80, uas: 90 },
      { id: 2, nim: '19230002', name: 'Nadia Pratama', tugasValues: [90, 85, 92, 88], uts: 85, uas: 95 },
      { id: 3, nim: '19230003', name: 'Arya Wiguna', tugasValues: [75, 80, 70, 65], uts: 78, uas: 82 },
      { id: 4, nim: '19230004', name: 'Diana Rahmat', tugasValues: [60, 55, 70, 65], uts: 65, uas: 70 },
    ]
  };
}
