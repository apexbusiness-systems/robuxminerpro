import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MessageSquare, Volume2, Monitor } from 'lucide-react';

interface AvatarConfig {
  readonly name: string;
  readonly image: string;
  readonly color: string;
}

interface AgentSelectionShowcaseProps {
  readonly activeAvatar: 'nova' | 'orion';
  readonly onSelect: (avatar: 'nova' | 'orion') => void;
  readonly avatarConfig: Record<string, AvatarConfig>;
}


/* ─── Agent Card ────────────────────────────────────────────────────────────── */
const AgentCard: React.FC<{
  readonly config: AvatarConfig;
  readonly isActive: boolean;
  readonly onSelect: () => void;
}> = ({ config, isActive, onSelect }) => (
  <motion.button
    onClick={onSelect}
    whileHover={{ scale: 1.04, rotateY: 4 }}
    whileTap={{ scale: 0.97 }}
    className="relative flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-500 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/30"
    style={{
      perspective: '800px',
      background: isActive
        ? `linear-gradient(145deg, ${config.color}18, ${config.color}08)`
        : 'rgba(255,255,255,0.02)',
      borderColor: isActive ? `${config.color}50` : 'rgba(255,255,255,0.06)',
      boxShadow: isActive
        ? `0 12px 48px ${config.color}30, 0 0 0 1px ${config.color}20`
        : '0 4px 16px rgba(0,0,0,0.3)',
    }}
  >
    {/* ── Holographic orbit ring ─── */}
    {isActive && (
      <div className="absolute inset-[-12px] pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full agent-showcase-orbit" style={{ filter: `drop-shadow(0 0 6px ${config.color})` }}>
          <defs>
            <linearGradient id={`orbit-${config.color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.color} stopOpacity="0.8" />
              <stop offset="50%" stopColor="transparent" stopOpacity="0" />
              <stop offset="100%" stopColor={config.color} stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke={`url(#orbit-${config.color.replace('#', '')})`}
            strokeWidth="1.5"
            strokeDasharray="40 30 10 30"
          />
        </svg>
      </div>
    )}

    {/* ── Glow backdrop ──────────── */}
    <div
      className="absolute inset-0 rounded-2xl transition-opacity duration-700 pointer-events-none"
      style={{
        opacity: isActive ? 0.15 : 0,
        background: `radial-gradient(circle at 50% 30%, ${config.color}, transparent 70%)`,
      }}
    />

    {/* ── Avatar ─────────────────── */}
    <div className="relative">
      {isActive && (
        <div
          className="absolute inset-[-8px] rounded-full blur-xl agent-showcase-glow-pulse"
          style={{ background: config.color, opacity: 0.4 }}
        />
      )}
      <div
        className={`w-20 h-20 rounded-full border-2 overflow-hidden relative z-10 transition-all duration-500 ${
          isActive ? 'agent-showcase-float' : 'opacity-60 grayscale-[40%]'
        }`}
        style={{
          borderColor: isActive ? `${config.color}80` : 'rgba(255,255,255,0.1)',
          boxShadow: isActive ? `0 0 24px ${config.color}40` : 'none',
        }}
      >
        <img src={`/${config.image}`} alt={config.name} className="w-full h-full object-cover" />
      </div>
      {/* Status dot */}
      <div
        className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 z-20 transition-colors duration-300"
        style={{
          borderColor: '#0d0d14',
          background: isActive ? '#10b981' : '#475569',
        }}
      />
    </div>

    {/* ── Name label ─────────────── */}
    <span
      className="text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300"
      style={{ color: isActive ? config.color : 'rgba(255,255,255,0.3)' }}
    >
      {config.name}
    </span>

    {/* ── Active indicator bar ──── */}
    <div
      className="h-[2px] w-12 rounded-full transition-all duration-500"
      style={{
        background: isActive ? `linear-gradient(90deg, transparent, ${config.color}, transparent)` : 'transparent',
      }}
    />
  </motion.button>
);

/* ─── Main Showcase ─────────────────────────────────────────────────────────── */
export const AgentSelectionShowcase: React.FC<AgentSelectionShowcaseProps> = ({
  activeAvatar,
  onSelect,
  avatarConfig,
}) => {
  const currentConfig = avatarConfig[activeAvatar];

  return (
    <div className="relative flex-shrink-0 flex flex-col md:flex-row items-center gap-8 w-full max-w-2xl mt-8 md:mt-0 ml-auto">
      {/* ── Ambient glow ─────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none blur-3xl opacity-20 transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${currentConfig.color}, transparent 70%)`,
          transform: 'scale(1.8)',
        }}
      />

      {/* ── Agent Cards Row ──────────────────── */}
      <div className="relative z-10 flex flex-col sm:flex-row md:flex-col gap-4">
        {(Object.entries(avatarConfig) as [string, AvatarConfig][]).map(([key, config]) => (
          <AgentCard
            key={key}
            config={config}
            isActive={activeAvatar === key}
            onSelect={() => onSelect(key as 'nova' | 'orion')}
          />
        ))}
      </div>

      {/* ── Embedded PiP Panel ──────────────────── */}

    </div>
  );
};
