// =====================================================
// Real-time Supabase hook for EVALORA
// Subscribes to table changes filtered by dosen's MK 
// =====================================================
"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeOptions {
  table: string;
  filter?: string;             // e.g. "mk_id=eq.5"
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  enabled?: boolean;
}

export function useSupabaseRealtime({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      const supabase = createClient();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();
    const channelName = `realtime_${table}_${filter || 'all'}_${Date.now()}`;

    const channelConfig: any = {
      event: '*',
      schema: 'public',
      table,
    };

    if (filter) {
      channelConfig.filter = filter;
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', channelConfig, (payload: any) => {
        switch (payload.eventType) {
          case 'INSERT':
            onInsert?.(payload);
            break;
          case 'UPDATE':
            onUpdate?.(payload);
            break;
          case 'DELETE':
            onDelete?.(payload);
            break;
        }
      })
      .subscribe();

    channelRef.current = channel;

    return cleanup;
  }, [table, filter, enabled, onInsert, onUpdate, onDelete, cleanup]);

  return { cleanup };
}
