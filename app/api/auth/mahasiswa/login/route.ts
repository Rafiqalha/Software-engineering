import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { nim, password } = await request.json();

    if (!nim || !password) {
      return NextResponse.json({ error: 'NIM dan password wajib diisi' }, { status: 400 });
    }

    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      
      const { data: user, error: supabaseError } = await supabase
        .from('mahasiswa')
        .select('*')
        .eq('nim', nim)
        .single();
        
      if (supabaseError || !user) {
        return NextResponse.json({ error: 'NIM tidak terdaftar' }, { status: 401 });
      }

      let isValid = false;

      // Backward compatibility for existing students where password_hash is null
      if (!user.password_hash) {
        if (password === nim) {
          isValid = true;
          // Auto hash and save for future logins
          const password_hash = await bcrypt.hash(password, 10);
          await supabase.from('mahasiswa').update({ password_hash }).eq('nim', nim);
        }
      } else {
        isValid = await bcrypt.compare(password, user.password_hash);
      }

      if (!isValid) {
        return NextResponse.json({ error: 'Password salah' }, { status: 401 });
      }

      const token = signToken({ userId: user.nim.toString(), role: 'Mahasiswa' });
      
      const response = NextResponse.json({
        token,
        role: 'Mahasiswa',
        name: user.nama,
        nim: user.nim,
      });

      // Set cookies for session
      response.cookies.set('evalora_mhs_nim', user.nim, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8
      });
      response.cookies.set('evalora_token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8
      });
      response.cookies.set('evalora_mhs_name', user.nama, {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8
      });

      return response;
      
    } catch (dbError: any) {
      return NextResponse.json({ error: dbError.message || 'Koneksi database gagal' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
