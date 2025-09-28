import { API_BASE } from './config';

export async function get(path: string) {
  try {
    const res = await fetch(API_BASE + path, {
      headers: { accept: 'application/json' }
    });
    if (res.status === 404) return stub(path);
    if (res.status === 204) return null;
    return await res.json().catch(() => ({}));
  } catch {
    return stub(path);
  }
}

function stub(path: string) {
  if (path.includes('/earnings/session/active')) return { balance: 0, perMinute: 0, elapsed: '00:00:00' };
  if (path.includes('/earnings/streak')) return { days: 0 };
  if (path.includes('/earnings/milestones')) return [];
  if (path.includes('/ai/recommendations')) return ['Create & sell UGC', 'Optimize sessions safely'];
  if (path.includes('/squads')) return [];
  if (path.includes('/achievements')) return [];
  if (path.includes('/learning-paths')) return [];
  if (path.includes('/events')) return [];
  return {};
}