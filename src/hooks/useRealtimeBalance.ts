import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

/** useRealtimeBalance subscribes to profile and mining session updates. */
export function useRealtimeBalance(userId: string | undefined): void {
  const queryClient = useQueryClient();
  const profileChannelRef = useRef<RealtimeChannel | null>(null);
  const sessionChannelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userId || !isSupabaseConfigured) return;
    profileChannelRef.current = supabase.channel(`rmp:profile:${userId}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `user_id=eq.${userId}` }, (payload) => {
      queryClient.setQueryData<Record<string, unknown>>(['profile', userId], (old) => old ? { ...old, total_robux: payload.new.total_robux, mining_power: payload.new.mining_power, streak_count: payload.new.streak_count, updated_at: payload.new.updated_at } : old);
    }).subscribe();
    sessionChannelRef.current = supabase.channel(`rmp:sessions:${userId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mining_sessions', filter: `user_id=eq.${userId}` }, () => {
      queryClient.invalidateQueries({ queryKey: ['mining_sessions', userId] });
    }).subscribe();
    return () => {
      profileChannelRef.current?.unsubscribe();
      sessionChannelRef.current?.unsubscribe();
    };
  }, [userId, queryClient]);
}
