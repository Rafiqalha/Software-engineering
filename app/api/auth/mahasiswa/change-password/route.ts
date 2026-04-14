import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { nim, oldPassword, newPassword } = await request.json();

    if (!nim || !oldPassword || !newPassword) {
      return NextResponse.json({ error: 'NIM, password lama, dan password baru wajib diisi' }, { status: 400 });
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
        return NextResponse.json({ error: 'Mahasiswa tidak ditemukan' }, { status: 404 });
      }

      let isValid = false;

      if (!user.password_hash) {
        if (oldPassword === nim) {
          isValid = true;
        }
      } else {
        isValid = await bcrypt.compare(oldPassword, user.password_hash);
      }

      if (!isValid) {
        return NextResponse.json({ error: 'Password lama salah' }, { status: 401 });
      }

      const password_hash = await bcrypt.hash(newPassword, 10);
      
      const { error: updateError } = await supabase
        .from('mahasiswa')
        .update({ password_hash })
        .eq('nim', nim);
        
      if (updateError) {
         return NextResponse.json({ error: 'Gagal memperbarui password' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Password berhasil diubah' });
      
    } catch (dbError: any) {
      return NextResponse.json({ error: dbError.message || 'Koneksi database gagal' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
