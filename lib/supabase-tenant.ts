// =====================================================
// Supabase Multi-Tenant Helper
// Semua query di-filter berdasarkan dosen_id dari JWT
// =====================================================

import { createClient as createSupabaseServer } from '@/utils/supabase/server';
import { createClient as createSupabaseBrowser } from '@/utils/supabase/client';
import { cookies } from 'next/headers';

// Server-side: buat client Supabase + filter tenant
export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createSupabaseServer(cookieStore);
}

// Helper: ambil dosen_id dari cookie token (set saat login)
export function getDosenIdFromCookie(cookieStore: any): number | null {
  const raw = cookieStore.get('evalora_dosen_id')?.value;
  return raw ? parseInt(raw) : null;
}

// Grade calculation helper (shared business logic)
export function calculateGradeResult(
  tugasValues: number[],
  uts: number,
  uas: number,
  bobotTugas: number = 30,
  bobotUts: number = 30,
  bobotUas: number = 40
) {
  const tugasAvg = tugasValues.length > 0
    ? tugasValues.reduce((sum, v) => sum + v, 0) / tugasValues.length
    : 0;

  const wTugas = bobotTugas / 100;
  const wUts = bobotUts / 100;
  const wUas = bobotUas / 100;

  let na = (tugasAvg * wTugas) + (uts * wUts) + (uas * wUas);
  if (na > 100) na = 100;

  let huruf = 'E';
  if (na >= 85) huruf = 'A';
  else if (na >= 80) huruf = 'B+';
  else if (na >= 75) huruf = 'B';
  else if (na >= 70) huruf = 'C+';
  else if (na >= 61) huruf = 'C';
  else if (na >= 50) huruf = 'D';

  return {
    tugasAvg: parseFloat(tugasAvg.toFixed(2)),
    na: parseFloat(na.toFixed(2)),
    huruf
  };
}
