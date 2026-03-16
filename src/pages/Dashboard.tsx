import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  TrendingUp,
  Trophy,
  Target,
  ChevronRight,
  PackageOpen,
  ExternalLink,
  Cpu,
  Star,
  Sparkles,
  ShieldCheck,
  ZapOff,
  Compass,
  Users,
  Activity,
  Flame,
  Lock,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer, XAxis } from 'recharts';
import { get } from '@/shared/api';
import { RewardUnboxing } from '@/components/gamification/RewardUnboxing';

interface DashboardData {
  session: {
    balance: number;
    perMinute: number;
    elapsed: string;
    totalEarned: number;
  };
  streak: {
    days: number;
    multiplier: number;
    nextMilestone: number;
  };
  milestones: unknown[];
  recommendations: string[];
}

const CACHE_KEY = 'apex_dashboard_data';

const getCachedData = (): DashboardData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {
    // Ignore error
  }
  return null;
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = React.memo(({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  delay = 0
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#0d0d14] p-6 group hover:border-white/15 transition-all duration-300"
    style={{ boxShadow: '0 4px 40px 0 rgba(0,0,0,0.6)' }}
  >
    {/* Accent glow top-right */}
    <div
      className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-25 group-hover:opacity-40 transition-opacity"
      style={{ background: accent }}
    />
    <div className="relative z-10 flex items-start justify-between mb-4">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{label}</span>
      <div
        className="p-2 rounded-xl"
        style={{ background: `${accent}22`, border: `1px solid ${accent}33` }}
      >
        <Icon className="h-4 w-4" style={{ color: accent }} />
      </div>
    </div>
    <div className="relative z-10">
      <div className="text-4xl font-black tracking-tighter text-white mb-1 tabular-nums">{value}</div>
      {sub && <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest">{sub}</div>}
    </div>
    {/* Animated bottom line */}
    <div
      className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700 rounded-b-2xl"
      style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
    />
  </motion.div>
));

// ─── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>(() => getCachedData() || {
    session: { balance: 0, perMinute: 0, elapsed: '00:00:00', totalEarned: 0 },
    streak: { days: 0, multiplier: 1, nextMilestone: 7 },
    milestones: [],
    recommendations: []
  });
  const [isLoading, setIsLoading] = useState(!getCachedData());
  const [showReward, setShowReward] = useState(false);
  const [tick, setTick] = useState(0);

  // Live-update clock for the chart
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  // Seed chart data + re-roll the last point on each tick
  const chartData = useMemo(() => {
    const base = Array.from({ length: 24 }, (_, i) => ({
      t: `${i}:00`,
      v: 180 + Math.sin(i / 3.5) * 60 + Math.cos(i / 2) * 30 + Math.random() * 25
    }));
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  useEffect(() => {
    setIsLoading(!getCachedData());
    Promise.all([
      get<DashboardData['streak']>('/earnings/streak'),
      get<DashboardData['session']>('/earnings/session/active'),
      get<string[]>('/ai/recommendations')
    ]).then(([streak, session, recs]) => {
      const freshData = {
        session: (session || { balance: 0, perMinute: 0.5, elapsed: '00:00:00', totalEarned: 0 }) as DashboardData['session'],
        streak: (streak || { days: 3, multiplier: 1.5, nextMilestone: 7 }) as DashboardData['streak'],
        milestones: [],
        recommendations: recs || [
          'Complete Daily Quest Chain for +500 R$',
          'Upgrade Mining Node to Tier 3',
          'Refer a friend — earn 2,500 R$ bonus',
          'Open weekly loot crate before reset'
        ]
      };
      setData(freshData);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
      } catch {
        // ignore
      }
      setIsLoading(false);
    });
  }, []);

  const cardDelay = React.useCallback((i: number) => i * 0.08, []);

  return (
    /* Force dark-mode palette inline regardless of Tailwind dark class */
    <div
      className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 0% 0%, #1a0a2e 0%, #0a0a0d 50%, #0d0510 100%)',
      }}
    >
      {/* === Ambient Background Lights === */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[140px] opacity-20"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[140px] opacity-15"
          style={{ background: 'radial-gradient(circle, #d946ef, transparent 70%)' }} />
        {/* Cyber grid overlay */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* === Header ============================================================ */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">NODE OPERATIONAL</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white mb-1 leading-none">
              ALGO‑FORGE{' '}
              <span style={{ color: '#a78bfa' }}>CORE</span>
            </h1>
            <p className="text-white/30 text-xs font-black tracking-[0.25em] uppercase">
              Quantum Optimization Engine · v4.5
            </p>
          </div>

          {/* Session badge */}
          <div
            className="flex items-center gap-6 rounded-2xl px-7 py-4 border border-white/8"
            style={{ background: 'rgba(139,92,246,0.07)', backdropFilter: 'blur(20px)' }}
          >
            <div>
              <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.25em] mb-1">Active Session</div>
              <div className="text-xl font-mono font-black text-white">{data.session.elapsed}</div>
            </div>
            <div className="h-10 w-px bg-white/8" />
            <div>
              <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.25em] mb-1">Secure Link</div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-black">
                <ShieldCheck className="h-3.5 w-3.5" /> VERIFIED
              </div>
            </div>
            <div className="h-10 w-px bg-white/8" />
            <div>
              <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.25em] mb-1">Mining Rate</div>
              <div className="text-[11px] font-black" style={{ color: '#a78bfa' }}>
                +{data.session.perMinute.toFixed(2)} R$/min
              </div>
            </div>
          </div>
        </motion.header>

        {/* === KPI Row =========================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Liquid Assets" value={isLoading ? '···' : `${data.session.balance.toLocaleString()} R$`} sub="Available Balance" icon={Zap} accent="#a78bfa" delay={cardDelay(0)} />
          <StatCard label="Mining Streak" value={`${data.streak.days}d`} sub={`Next: ${data.streak.nextMilestone}d`} icon={Flame} accent="#f97316" delay={cardDelay(1)} />
          <StatCard label="Multiplier" value={`${data.streak.multiplier}×`} sub="Active Boost" icon={TrendingUp} accent="#22d3ee" delay={cardDelay(2)} />
          <StatCard label="Squad Members" value="12" sub="Online Now" icon={Users} accent="#d946ef" delay={cardDelay(3)} />
        </div>

        {/* === Main Grid ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* --- Throughput Graph (2/3 width) ------------------------------------ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="lg:col-span-2 rounded-2xl border border-white/8 p-6 overflow-hidden relative"
            style={{ background: '#0d0d14', boxShadow: '0 4px 40px rgba(0,0,0,0.6)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)' }} />
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Throughput Graph</h3>
                <p className="text-[10px] text-white/30 font-bold tracking-[0.2em] uppercase mt-0.5">Quantum Hashrate Analytics · Live</p>
              </div>
              <div className="flex items-center gap-2 rounded-full px-3 py-1.5 border border-emerald-500/30 bg-emerald-500/10">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Live Feed</span>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAccent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d946ef" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#d946ef" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10,10,16,0.97)',
                      borderColor: 'rgba(139,92,246,0.35)',
                      borderRadius: '16px',
                      backdropFilter: 'blur(16px)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'white'
                    }}
                    labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}
                  />
                  <Area type="monotone" dataKey="v" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPrimary)" animationDuration={1200} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* --- Loot Drop (1/3 width) ------------------------------------------ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.5 }}
            className="rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-900/20 to-[#0d0d14] p-6 relative overflow-hidden group"
            style={{ boxShadow: '0 4px 40px rgba(139,92,246,0.1)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)' }} />
            <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-20 group-hover:opacity-35 transition-opacity"
              style={{ background: '#8b5cf6' }} />

            <h3 className="text-sm font-black text-white uppercase tracking-tighter mb-0.5 relative z-10">Algo-Forge Loot</h3>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-8 relative z-10">Tier 4 Content Unbox</p>

            <div className="flex flex-col items-center py-4 relative z-10">
              <div className="relative mb-8 group-hover:scale-110 transition-transform duration-500">
                <PackageOpen className="h-28 w-28 drop-shadow-2xl" style={{ color: '#c4b5fd', filter: 'drop-shadow(0 0 24px rgba(139,92,246,0.7))' }} />
                <div className="absolute inset-0 rounded-full blur-3xl opacity-40 animate-pulse"
                  style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)', transform: 'scale(1.6)' }} />
              </div>

              <button
                onClick={() => setShowReward(true)}
                className="w-full py-4 rounded-xl font-black text-sm tracking-[0.15em] uppercase transition-all duration-300 hover:-translate-y-1 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7, #7c3aed)',
                  backgroundSize: '200%',
                  boxShadow: '0 8px 32px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                  color: 'white',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 12px 48px rgba(139,92,246,0.7), inset 0 1px 0 rgba(255,255,255,0.2)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)')}
              >
                🎁 DEPLOY LOOT DROP
              </button>
            </div>
          </motion.div>

          {/* --- Streak Tracker -------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="rounded-2xl border border-white/8 bg-[#0d0d14] p-6 relative overflow-hidden"
            style={{ boxShadow: '0 4px 40px rgba(0,0,0,0.6)' }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl border" style={{ background: 'rgba(251,146,60,0.1)', borderColor: 'rgba(251,146,60,0.2)' }}>
                <Trophy className="h-5 w-5" style={{ color: '#fb923c' }} />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">Mining Streak</h3>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Efficiency Bonus Active</p>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-6xl font-black text-white tabular-nums">{data.streak.days}</span>
              <span className="text-xl font-black uppercase tracking-tighter" style={{ color: '#fb923c' }}>Days</span>
            </div>
            <p className="text-xs text-white/30 font-bold mb-6">
              <span style={{ color: '#fb923c' }}>{data.streak.nextMilestone - data.streak.days} days</span> to unlock 3× Reward Multiplier
            </p>

            {/* Progress pips */}
            <div className="flex gap-2">
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className="flex-1 h-3 rounded-full"
                  style={{
                    background: i < data.streak.days
                      ? 'linear-gradient(180deg, #fed7aa, #fb923c)'
                      : 'rgba(255,255,255,0.06)',
                    boxShadow: i < data.streak.days ? '0 0 12px rgba(251,146,60,0.4)' : 'none',
                    border: i < data.streak.days ? 'none' : '1px solid rgba(255,255,255,0.05)'
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* --- APEX Directives ------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.57, duration: 0.5 }}
            className="lg:col-span-2 rounded-2xl border border-white/8 bg-[#0d0d14] p-6 relative overflow-hidden"
            style={{ boxShadow: '0 4px 40px rgba(0,0,0,0.6)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl border border-purple-500/20" style={{ background: 'rgba(139,92,246,0.1)' }}>
                  <Compass className="h-5 w-5" style={{ color: '#a78bfa' }} />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">APEX Directives</h3>
              </div>
              <div className="rounded-full px-3 py-1 border border-purple-500/20 text-[9px] font-black tracking-[0.2em] uppercase" style={{ color: '#a78bfa', background: 'rgba(139,92,246,0.08)' }}>
                AI Analysis Complete
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(data.recommendations.length > 0 ? data.recommendations : [
                'Complete Daily Quest Chain for +500 R$',
                'Upgrade Mining Node to Tier 3',
                'Refer a friend — earn 2,500 R$ bonus',
                'Open weekly loot crate before reset'
              ]).slice(0, 4).map((rec, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.04)' }}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Star className="h-3.5 w-3.5 text-white/20 group-hover:text-purple-400 group-hover:scale-110 transition-all flex-shrink-0" />
                    <span className="text-xs font-bold text-white/40 group-hover:text-white/80 transition-colors leading-snug">{rec}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-purple-400 flex-shrink-0 transition-colors" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* --- PiP Companion --------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.64, duration: 0.5 }}
            className="lg:col-span-3 rounded-2xl border border-white/8 bg-[#0d0d14] p-6 relative overflow-hidden group"
            style={{ boxShadow: '0 4px 40px rgba(0,0,0,0.6)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(217,70,239,0.4), transparent)' }} />

            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              {/* Text */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-pink-500/25 bg-pink-500/10 mb-4">
                  <Radio className="h-3 w-3 animate-pulse" style={{ color: '#d946ef' }} />
                  <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Active Companion</span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase mb-3 leading-none">
                  PiP Neural{' '}
                  <span style={{ color: '#d946ef' }}>Assistant</span>
                </h3>
                <p className="text-sm text-white/35 font-bold tracking-wide mb-6 leading-relaxed max-w-md">
                  Persistent Overlay System for real-time monitoring while in other applications. 100% Stealth-safe technology.
                </p>
                <button
                  className="flex items-center gap-3 px-8 py-4 rounded-xl font-black tracking-widest uppercase text-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                  style={{
                    background: 'white',
                    color: '#0a0a0d',
                    boxShadow: '0 8px 32px rgba(255,255,255,0.15)'
                  }}
                >
                  ACTIVATE NEURAL BRIDGE
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>

              {/* CPU Orb */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"
                  style={{ background: 'radial-gradient(circle, #d946ef, transparent 70%)', transform: 'scale(2)' }} />
                <div
                  className="relative z-10 p-8 rounded-[40px]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(217,70,239,0.1), rgba(139,92,246,0.05))',
                    border: '1px solid rgba(217,70,239,0.2)',
                    backdropFilter: 'blur(20px)'
                  }}
                >
                  <Cpu className="h-24 w-24 animate-pulse" style={{ color: '#d946ef', filter: 'drop-shadow(0 0 32px rgba(217,70,239,0.6))' }} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* === Footer Status Bar ================================================= */}
        <footer className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 text-[9px] font-black text-white/25 uppercase tracking-[0.25em]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Quantum Encryption Active
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" style={{ color: '#a78bfa' }} />
              Downside Protection Enabled
            </span>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
            <div className="h-1.5 w-1.5 rounded-full animate-ping" style={{ background: '#a78bfa' }} />
            Node Sync: {new Date().toLocaleTimeString()}
          </div>
        </footer>
      </div>

      {/* === Reward Overlay ====================================================== */}
      <AnimatePresence>
        {showReward && (
          <RewardUnboxing
            rewardType="ROBUX"
            rewardValue="1,250 R$"
            onComplete={() => setShowReward(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
