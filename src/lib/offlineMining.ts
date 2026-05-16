const OFFLINE_KEY = 'rmp_offline_exit';
const MAX_HOURS = 8;
const ROBUX_PER_HR = 100;
const MIN_MINUTES = 3;
interface OfflineState { exitTime: number; miningPower: number; }
export function recordMiningExit(miningPower: number): void { if (typeof window === 'undefined') return; try { localStorage.setItem(OFFLINE_KEY, JSON.stringify({ exitTime: Date.now(), miningPower })); } catch { /* ignore storage write failure */ } }
export function computeOfflineEarnings(): { robux: number; hours: number } | null { if (typeof window === 'undefined') return null; let raw: string | null; try { raw = localStorage.getItem(OFFLINE_KEY); } catch { return null; } if (!raw) return null; let state: OfflineState; try { state = JSON.parse(raw) as OfflineState; } catch { localStorage.removeItem(OFFLINE_KEY); return null; } localStorage.removeItem(OFFLINE_KEY); const elapsedHours = Math.min((Date.now() - state.exitTime) / 3600000, MAX_HOURS); if (elapsedHours < MIN_MINUTES / 60) return null; return { robux: Math.max(1, Math.floor(elapsedHours * state.miningPower * ROBUX_PER_HR)), hours: Math.round(elapsedHours * 10) / 10 }; }
export function clearOfflineMiningState(): void { if (typeof window === 'undefined') return; try { localStorage.removeItem(OFFLINE_KEY); } catch { /* ignore storage write failure */ } }
