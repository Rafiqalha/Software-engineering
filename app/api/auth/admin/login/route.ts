import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan kata sandi wajib diisi' }, { status: 400 });
    }

    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      
      const { data: admin, error: supabaseError } = await supabase
        .from('administrator')
        .select('*')
        .eq('username', username)
        .single();
        
      if (supabaseError || !admin) {
        return NextResponse.json({ error: 'Username administrator tidak dikenali' }, { status: 401 });
      }

      if (!admin.password_hash) {
         return NextResponse.json({ error: 'Akun administrator belum dikonfigurasi' }, { status: 401 });
      }

      const isValid = await bcrypt.compare(password, admin.password_hash);

      if (!isValid) {
        return NextResponse.json({ error: 'Kata sandi salah' }, { status: 401 });
      }

      const token = signToken({ userId: admin.admin_id.toString(), role: 'Administrator Utama' });
      
      const response = NextResponse.json({
        token,
        role: 'Administrator Utama',
        name: admin.nama,
        adminId: admin.admin_id,
      });

      // Set cookies for multi-tenant session
      response.cookies.set('evalora_admin_id', admin.admin_id.toString(), {
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
      response.cookies.set('evalora_admin_name', admin.nama, {
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
