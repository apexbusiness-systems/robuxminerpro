export type SupabaseConfigStatus = 'enabled' | 'misconfigured';

export type SupabaseConfig = {
  url: string | null;
  anonKey: string | null;
  functionsUrl: string | null;
  status: SupabaseConfigStatus;
};

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || null;
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || null;
const rawFunctionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL?.trim() || null;

export function getSupabaseConfig(): SupabaseConfig {
  const baseUrl = rawUrl;
  const anonKey = rawAnonKey;
  const functionsUrl = rawFunctionsUrl || (baseUrl ? `${baseUrl.replace(/\/?$/, '')}/functions/v1` : null);

  if (!baseUrl || !anonKey) {
    return {
      url: baseUrl,
      anonKey,
      functionsUrl,
      status: 'misconfigured',
    };
  }

  return {
    url: baseUrl,
    anonKey,
    functionsUrl,
    status: 'enabled',
  };
}

export function requireSupabaseConfig() {
  const config = getSupabaseConfig();
  if (config.status !== 'enabled' || !config.url || !config.anonKey) {
    throw new Error('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  }
  return config as Required<Pick<SupabaseConfig, 'url' | 'anonKey' | 'functionsUrl'>> & SupabaseConfig;
}

export function getSupabaseFunctionUrl(path: string) {
  const config = getSupabaseConfig();
  const base = config.functionsUrl;
  if (!base) throw new Error('[Supabase] Functions URL not configured');
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return new URL(normalizedPath, normalizedBase).toString();
}

