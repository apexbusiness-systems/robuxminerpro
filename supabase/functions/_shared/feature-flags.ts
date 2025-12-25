import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  rollout_percentage: number;
  description?: string;
}

/**
 * Check if a feature flag is enabled for a given user
 * Supports percentage-based rollout (A/B testing)
 *
 * @param flagName - Name of the feature flag
 * @param userId - Optional user ID for percentage-based rollout
 * @returns Promise<boolean> - Whether feature is enabled for this user
 */
export async function checkFeatureFlag(flagName: string, userId?: string): Promise<boolean> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    return false;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('enabled, rollout_percentage')
      .eq('name', flagName)
      .single();

    if (error) {
      console.error(`Feature flag ${flagName} not found:`, error);
      return false;
    }

    if (!data.enabled) {
      return false;
    }

    // If fully rolled out, return true
    if (data.rollout_percentage >= 100) {
      return true;
    }

    // If no user ID provided, check only the enabled flag
    if (!userId) {
      return data.enabled && data.rollout_percentage > 0;
    }

    // Percentage-based rollout using consistent hashing
    // Same user always gets same result for stable experience
    const hash = await hashUserId(userId);
    const userPercentile = hash % 100;

    return userPercentile < data.rollout_percentage;
  } catch (err) {
    console.error(`Error checking feature flag ${flagName}:`, err);
    return false;
  }
}

/**
 * Simple hash function for consistent user bucketing
 * @param userId - User ID to hash
 * @returns number - Hash value modulo 100
 */
async function hashUserId(userId: string): Promise<number> {
  const encoder = new TextEncoder();
  const data = encoder.encode(userId);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.reduce((acc, byte) => acc + byte, 0);
}

/**
 * Get all feature flags (for admin dashboard)
 */
export async function getAllFeatureFlags(): Promise<FeatureFlag[]> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase.from('feature_flags').select('*').order('name');

  if (error) {
    throw new Error(`Failed to fetch feature flags: ${error.message}`);
  }

  return data || [];
}
