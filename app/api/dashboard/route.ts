import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const [
      { count: totalMahasiswa },
      { count: totalMk },
      { data: nilaiData },
      { data: auditData },
    ] = await Promise.all([
      supabase.from('mahasiswa').select('*', { count: 'exact', head: true }),
      supabase.from('mata_kuliah').select('*', { count: 'exact', head: true }),
      supabase.from('nilai').select('nilai_huruf'),
      supabase
        .from('audit_logs')
        .select('log_id, nilai_id, nilai_lama, nilai_baru, timestamp, nilai:nilai_id(nim, mk_id, mahasiswa:nim(nama, nim), mata_kuliah:mk_id(nama_mk))')
        .order('timestamp', { ascending: false })
        .limit(5),
    ]);

    const distribusi: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    let totalNilaiA = 0;
    let totalNilai = 0;

    (nilaiData || []).forEach((n: any) => {
      const h = n.nilai_huruf?.trim();
      if (h && distribusi[h] !== undefined) distribusi[h]++;
      if (h === 'A') totalNilaiA++;
      if (h) totalNilai++;
    });

    const rataA = totalNilai > 0 ? Math.round((totalNilaiA / totalNilai) * 100) : 0;

    return NextResponse.json({
      totalMahasiswa: totalMahasiswa || 0,
      totalMk: totalMk || 0,
      rataA,
      distribusi,
      auditTrail: auditData || [],
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({
      totalMahasiswa: 0,
      totalMk: 0,
      rataA: 0,
      distribusi: { A: 0, B: 0, C: 0, D: 0, E: 0 },
      auditTrail: [],
    });
  }
}
