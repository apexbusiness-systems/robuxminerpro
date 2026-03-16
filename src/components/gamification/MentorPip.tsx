import React, { useState, useEffect } from 'react';
import { PipAgent } from '../pip/PipAgent';
import { Button } from '@/components/ui/button';
import { X, Mic, BrainCircuit, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MentorPip = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState<string[]>([
    "INITIALIZING NEURAL LINK...",
    "SCANNING ROBLOX MARKET DATA...",
    "READY FOR GAMEPLAY."
  ]);
  const [isListening, setIsListening] = useState(false);
  const [efficiency, setEfficiency] = useState(98);

  useEffect(() => {
    const interval = setInterval(() => {
      setEfficiency(prev => Math.max(85, Math.min(100, prev + (Math.random() * 4 - 2))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const addMessage = (msg: string) => {
    setMessages(prev => [...prev.slice(-3), msg]);
  };

  const handleMicClick = () => {
    setIsListening(!isListening);
    if (!isListening) {
      addMessage("LISTENING TO GAME AUDIO...");
      setTimeout(() => addMessage("OPTIMIZING MINING ROUTE..."), 3000);
    } else {
      addMessage("AUDIO ANALYSIS PAUSED.");
    }
  };

  return (
    <div className="w-full h-full bg-[#050508] border border-white/10 text-white flex flex-col rounded-xl overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.15)] relative font-sans">

      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/20 rounded-full blur-[60px]" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-600/20 rounded-full blur-[60px]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/5 bg-white/[0.02] backdrop-blur-md relative z-10">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <h3 className="font-black text-[10px] tracking-widest text-white/80 uppercase">Apex Mentor</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-white/50 hover:text-white hover:bg-white/10 rounded-full" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Core UI */}
      <div className="flex-1 flex flex-col p-4 relative z-10 overflow-hidden">

        {/* Top Status */}
        <div className="flex justify-between items-start mb-6">
           <div className="space-y-1">
             <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
               <Activity className="w-3 h-3 text-purple-400" />
               Node Efficiency
             </div>
             <div className="text-2xl font-black text-white tabular-nums tracking-tighter">
               {efficiency.toFixed(1)}<span className="text-sm text-purple-400 ml-0.5">%</span>
             </div>
           </div>

           <div className="bg-white/5 border border-white/10 rounded-lg p-2 flex items-center gap-2">
             <ShieldCheck className="w-4 h-4 text-emerald-400" />
             <span className="text-[9px] font-bold uppercase tracking-wider text-white/60">Protected</span>
           </div>
        </div>

        {/* Avatar Visualization */}
        <div className="flex-1 flex items-center justify-center relative mb-6 group cursor-pointer">
           <div className="absolute inset-0 flex items-center justify-center">
             <div className={`w-40 h-40 rounded-full border border-pink-500/20 absolute transition-all duration-1000 ${isListening ? 'scale-110 animate-spin-slow' : 'scale-100'}`} style={{ borderStyle: 'dashed' }} />
           </div>
           <div className="relative z-10">
             <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-full blur-2xl opacity-20 animate-pulse" />
             <img
               src="/rbp-avatar-icon.png"
               alt="RBP-Agent"
               className={`w-32 h-32 object-contain filter drop-shadow-[0_0_15px_rgba(217,70,239,0.5)] transition-transform duration-500 ${isListening ? 'scale-110 -translate-y-2' : 'scale-100'}`}
             />
           </div>
        </div>

        {/* Live Feed */}
        <div className="h-24 bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col justify-end overflow-hidden relative">
          <div className="absolute top-2 left-3 text-[8px] font-black text-white/30 tracking-widest uppercase">Live Telemetry</div>
          <div className="space-y-1.5 w-full flex flex-col justify-end mt-4">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={msg + i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: i === messages.length - 1 ? 1 : 0.5, x: 0 }}
                  className="text-[10px] font-mono tracking-tight text-white/80 truncate w-full"
                >
                  <span className="text-purple-400 mr-2">›</span>{msg}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Footer Controls */}
      <div className="p-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between relative z-10">
        <button
          onClick={handleMicClick}
          className={`flex items-center justify-center w-full py-2.5 rounded-lg font-bold text-[10px] tracking-widest uppercase transition-all duration-300 ${
            isListening
              ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.2)]'
              : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Mic className={`w-3.5 h-3.5 mr-2 ${isListening ? 'animate-pulse' : ''}`} />
          {isListening ? 'Analyzing Audio' : 'Enable Voice Analysis'}
        </button>
      </div>

    </div>
  );
};
