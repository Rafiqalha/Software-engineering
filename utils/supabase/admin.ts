import { createClient } from "@supabase/supabase-js";

// Admin client — menggunakan service_role untuk bypass RLS di server side
// Hanya digunakan di Server Actions / API Routes, TIDAK di client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const createAdminClient = () =>
  createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
