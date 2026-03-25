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
      <div className="relative z-10 hidden sm:block">
        <EmbeddedPipPanel activeAvatar={activeAvatar} avatarConfig={avatarConfig} />
      </div>

    </div>
  );
};

const EmbeddedPipPanel: React.FC<{ activeAvatar: 'nova' | 'orion', avatarConfig: Record<string, AvatarConfig> }> = ({ activeAvatar, avatarConfig }) => {
  const currentConfig = avatarConfig[activeAvatar];

  return (
    <div className="w-[380px] h-[180px] rounded-2xl border border-white/10 overflow-hidden relative flex flex-col transition-all duration-500" style={{ background: '#050508', boxShadow: `0 0 40px ${currentConfig.color}20` }}>
      {/* Background Grid & Glows */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] rounded-full blur-[60px] opacity-40 mix-blend-screen" style={{ background: '#8b5cf6' }}></div>
      <div className="absolute bottom-[-50px] left-[-50px] w-[150px] h-[150px] rounded-full blur-[60px] opacity-30 mix-blend-screen" style={{ background: '#d946ef' }}></div>

      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/40 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-5 h-5">
            <svg className="w-4 h-4" style={{ color: currentConfig.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">In-Game Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Live Sync</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex px-4 items-center relative z-10 gap-4">
        
        {/* Avatar Section */}
        <div className="relative shrink-0 ml-2 group cursor-pointer">
           <div className="absolute inset-0 rounded-full blur-xl opacity-50 transition-colors duration-500" style={{ backgroundColor: currentConfig.color }}></div>
           <div className="w-16 h-16 rounded-full border-2 bg-black/50 backdrop-blur-lg flex items-center justify-center relative z-10 overflow-hidden transition-all duration-300" style={{ borderColor: `${currentConfig.color}80` }}>
             <img src={`/${currentConfig.image}`} alt={currentConfig.name} className="w-full h-full object-cover relative z-20 group-hover:scale-110 transition-transform agent-showcase-float" />
           </div>
           <div className="absolute bottom-0 right-[-4px] w-4 h-4 rounded-full border-2 border-[#050508] bg-emerald-500 z-20 transition-colors duration-300"></div>
        </div>

        {/* Interaction & Voice Section */}
        <div className="flex-1 flex flex-col justify-center gap-2">
           <div className="text-[11px] font-black text-white/90 uppercase tracking-widest flex items-center gap-2">
             {currentConfig.name}
           </div>
           
           {/* Fake Voice Waveform */}
           <div className="flex items-center gap-[2px] h-5 px-3 rounded-lg bg-white/5 border border-white/10 w-fit transition-all duration-300">
              <div className="w-1 rounded-full opacity-70" style={{ height: '40%', animation: 'custom-bounce 1s infinite ease-in-out', backgroundColor: currentConfig.color }}></div>
              <div className="w-1 rounded-full opacity-70" style={{ height: '80%', animation: 'custom-bounce 1.2s infinite ease-in-out 100ms', backgroundColor: currentConfig.color }}></div>
              <div className="w-1 rounded-full opacity-70" style={{ height: '60%', animation: 'custom-bounce 0.8s infinite ease-in-out 200ms', backgroundColor: currentConfig.color }}></div>
              <div className="w-1 rounded-full opacity-70" style={{ height: '100%', animation: 'custom-bounce 1.5s infinite ease-in-out 300ms', backgroundColor: currentConfig.color }}></div>
              <div className="w-1 rounded-full opacity-70" style={{ height: '50%', animation: 'custom-bounce 1.1s infinite ease-in-out 400ms', backgroundColor: currentConfig.color }}></div>
              <div className="w-1 rounded-full opacity-70" style={{ height: '70%', animation: 'custom-bounce 0.9s infinite ease-in-out 500ms', backgroundColor: currentConfig.color }}></div>
           </div>
           
           {/* Controls */}
           <div className="flex gap-2 mt-1">
             <button className="text-white rounded-full p-1.5 transition-colors border" style={{ backgroundColor: currentConfig.color, borderColor: `${currentConfig.color}50` }}>
               <Mic className="w-3 h-3" />
             </button>
             <button className="bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 transition-colors border border-white/5">
                <MessageSquare className="w-3 h-3" />
             </button>
             <button className="bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 transition-colors border border-white/5">
                <Volume2 className="w-3 h-3" />
             </button>
             <button className="bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 transition-colors border border-white/5">
                <Monitor className="w-3 h-3" />
             </button>
           </div>
        </div>

        {/* Agent Vision Area */}
        <div className="w-16 h-16 rounded-xl border-2 border-white/5 bg-white/5 overflow-hidden relative flex-shrink-0 flex items-center justify-center group" style={{ borderColor: `${currentConfig.color}20` }}>
          <span className="text-[7px] font-black text-white/30 text-center uppercase tracking-widest leading-relaxed">Vision<br/>Offline</span>
        </div>
      </div>
    </div>
  );
};
