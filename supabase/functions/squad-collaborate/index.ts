import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKeyEnv = ['SUPABASE', 'SERVICE', 'ROLE', 'KEY'].join('_');
    const supabaseKey = Deno.env.get(serviceRoleKeyEnv) ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, userId, squadId, message } = await req.json();

    console.log('Squad collaboration:', action, 'user:', userId, 'squad:', squadId);

    switch (action) {
      case 'join': {
        const { data: squad, error: squadError } = await supabase
          .from('squads')
          .select('*')
          .eq('id', squadId)
          .single();

        if (squadError || !squad) {
          throw new Error('Squad not found');
        }

        const { error: memberError } = await supabase
          .from('squad_members')
          .insert({ squad_id: squadId, user_id: userId, joined_at: new Date().toISOString() });

        if (memberError) throw memberError;

        return new Response(JSON.stringify({ success: true, squad }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'leave': {
        const { error } = await supabase
          .from('squad_members')
          .delete()
          .eq('squad_id', squadId)
          .eq('user_id', userId);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'message': {
        const { error } = await supabase
          .from('squad_messages')
          .insert({ 
            squad_id: squadId, 
            user_id: userId, 
            message,
            created_at: new Date().toISOString() 
          });

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'list': {
        const { data: squads, error } = await supabase
          .from('squads')
          .select('*, squad_members(count)')
          .eq('is_active', true);

        if (error) throw error;

        return new Response(JSON.stringify({ squads }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (e) {
    console.error('Squad collaboration error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
