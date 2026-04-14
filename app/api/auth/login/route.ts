import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'NIP dan password wajib diisi' }, { status: 400 });
    }

    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      
      // Query dosen by NIP (multi-tenant: each dosen is a tenant)
      const { data: user, error: supabaseError } = await supabase
        .from('dosen')
        .select('*')
        .eq('nip', username)
        .single();
        
      if (supabaseError || !user) {
        // Fallback mock login
        if (username === 'dosen123' && password === 'password') {
          const token = signToken({ userId: 'DSN007', role: 'Dosen' });
          const response = NextResponse.json({ 
            token, role: 'Dosen', name: 'Agus Prasetyo (Mock)', dosenId: 'DSN007' 
          });
          // Set dosen_id cookie for multi-tenant filtering
          response.cookies.set('evalora_dosen_id', 'DSN007', {
            httpOnly: true, 
            secure: false,
            sameSite: 'lax', 
            path: '/',
            maxAge: 60 * 60 * 8 // 8 hours
          });
          response.cookies.set('evalora_token', token, {
            httpOnly: true, 
            secure: false,
            sameSite: 'lax', 
            path: '/',
            maxAge: 60 * 60 * 8
          });
          response.cookies.set('evalora_dosen_name', 'Dr. Dosen', {
            httpOnly: false,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 8
          });
          return response;
        }
        return NextResponse.json({ error: 'NIP tidak dikenali' }, { status: 401 });
      }

      let isValid = false;

      // Backward compatibility: if password_hash is null, NIP is the default password
      if (!user.password_hash) {
        if (password === user.nip) {
          isValid = true;
          // Auto hash and save for future logins
          const password_hash = await bcrypt.hash(password, 10);
          await supabase.from('dosen').update({ password_hash }).eq('dosen_id', user.dosen_id);
        }
      } else {
        isValid = await bcrypt.compare(password, user.password_hash);
      }

      if (!isValid) {
        return NextResponse.json({ error: 'Password salah' }, { status: 401 });
      }

      const dosenId = user.dosen_id;
      const token = signToken({ userId: dosenId.toString(), role: 'Dosen' });
      
      // Fetch dosen's mata kuliah for context
      const { data: mataKuliah } = await supabase
        .from('mata_kuliah')
        .select('mk_id, kode_mk, nama_mk')
        .eq('dosen_id', dosenId);

      const response = NextResponse.json({
        token,
        role: 'Dosen',
        name: user.nama,
        dosenId,
        mataKuliah: mataKuliah || []
      });

      // Set cookies for multi-tenant session
      response.cookies.set('evalora_dosen_id', dosenId.toString(), {
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
      response.cookies.set('evalora_dosen_name', user.nama, {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8
      });

      return response;
      
    } catch (dbError: any) {
      // Fallback mock
      if (username === 'dosen123' && password === 'password') {
        const token = signToken({ userId: '1', role: 'Dosen' });
        const response = NextResponse.json({ 
          token, role: 'Dosen', name: 'Dr. Dosen', dosenId: 1 
        });
        response.cookies.set('evalora_dosen_id', '1', {
          httpOnly: true, secure: false, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8
        });
        response.cookies.set('evalora_token', token, {
          httpOnly: true, secure: false, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8
        });
        response.cookies.set('evalora_dosen_name', 'Dr. Dosen', {
          httpOnly: false, secure: false, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8
        });
        return response;
      }
      return NextResponse.json({ error: dbError.message || 'Koneksi database gagal' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// triggered hot reload
