import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  TrendingUp,
  Trophy,
  ChevronRight,
  PackageOpen,
  ExternalLink,
  Star,
  ShieldCheck,
  Compass,
  Users,
  Flame,
  Lock,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer, XAxis } from 'recharts';
import { get } from '@/shared/api';
import { RewardUnboxing } from '@/components/gamification/RewardUnboxing';
import { useToast } from '@/components/ui/use-toast';

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
    if (cached) {
      const parsed = JSON.parse(cached);
      parsed.session = parsed.session || { balance: 0, perMinute: 0, elapsed: '00:00:00', totalEarned: 0 };
      parsed.streak = parsed.streak || { days: 0, multiplier: 1, nextMilestone: 7 };
      parsed.milestones = parsed.milestones || [];
      parsed.recommendations = parsed.recommendations || [];
      
      if (typeof parsed.streak.days !== 'number' || Number.isNaN(parsed.streak.days)) parsed.streak.days = 0;
      if (typeof parsed.streak.nextMilestone !== 'number' || Number.isNaN(parsed.streak.nextMilestone)) parsed.streak.nextMilestone = 7;
      
      return parsed;
    }
  } catch (e) {
    console.debug("Ignored exception", e);
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
  const [activeAvatar, setActiveAvatar] = useState<'nova' | 'orion'>('nova');
  const { toast } = useToast();

  const avatarConfig = {
    nova: { name: 'Agent Ave', image: 'agent-ave.png', color: '#d946ef' }, // Pink
    orion: { name: 'Agent Orion', image: 'agent-orion.png', color: '#3b82f6' } // Blue
  };

  // Handle PiP Activation
  const handleActivatePiP = async () => {
    // Check if Document Picture-in-Picture API is supported
    if (!('documentPictureInPicture' in window)) {
      toast({
        title: "Feature Unavailable",
        description: "Your browser does not support the Document Picture-in-Picture API. Please use a modern Chromium browser (Chrome, Edge) on desktop.",
        variant: "destructive"
      });
      return;
    }

    try {
      // @ts-expect-error - documentPictureInPicture is not fully typed yet
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 380,
        height: 180,
      });

      // Copy styles
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
          const style = document.createElement('style');
          style.textContent = cssRules;
          pipWindow.document.head.appendChild(style);
        } catch (e) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.type = styleSheet.type;
          link.media = styleSheet.media.mediaText;
          link.href = styleSheet.href!;
          pipWindow.document.head.appendChild(link);
        }
      });
      
      const bounceStyle = document.createElement('style');
      bounceStyle.textContent = `
        @keyframes custom-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30%); }
        }
        .anim-bounce { animation: custom-bounce 1s infinite ease-in-out; }
        .anim-bounce-1 { animation: custom-bounce 1.2s infinite ease-in-out 100ms; }
        .anim-bounce-2 { animation: custom-bounce 0.8s infinite ease-in-out 200ms; }
        .anim-bounce-3 { animation: custom-bounce 1.5s infinite ease-in-out 300ms; }
        .anim-bounce-4 { animation: custom-bounce 1.1s infinite ease-in-out 400ms; }
        .anim-bounce-5 { animation: custom-bounce 0.9s infinite ease-in-out 500ms; }
        .anim-bounce-6 { animation: custom-bounce 1.3s infinite ease-in-out 600ms; }
      `;
      pipWindow.document.head.appendChild(bounceStyle);

      const body = pipWindow.document.body;
      body.style.margin = '0';
      body.style.background = '#0a0a0d';
      body.style.overflow = 'hidden';
      body.style.fontFamily = 'Inter, sans-serif';

      // Create content wrapper
      const pipContainer = document.createElement('div');
      pipContainer.className = "w-full min-h-full flex flex-col relative overflow-x-hidden overflow-y-auto scroll-smooth";
      pipContainer.style.background = "#050508"; // Deep tech black
      
      pipContainer.innerHTML = `
        <!-- Background Grid & Glows -->
        <div class="absolute inset-0 pointer-events-none opacity-20" style="background-image: linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px); background-size: 20px 20px;"></div>
        <div class="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] rounded-full blur-[60px] opacity-40 mix-blend-screen" style="background: #8b5cf6;"></div>
        <div class="absolute bottom-[-50px] left-[-50px] w-[150px] h-[150px] rounded-full blur-[60px] opacity-30 mix-blend-screen" style="background: #d946ef;"></div>

        <!-- Top Header Bar -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/40 backdrop-blur-md relative z-10">
          <div class="flex items-center gap-2">
            <div class="relative flex items-center justify-center w-6 h-6">
              <svg class="w-5 h-5 animate-pulse" style="color: ${avatarConfig[activeAvatar].color}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <span class="text-[10px] font-black text-white/70 uppercase tracking-widest">In-Game Assistant</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="flex h-2 w-2 relative">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span class="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Live Sync</span>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 flex px-4 items-center relative z-10 gap-4">
          
          <!-- Avatar Section -->
          <div class="relative shrink-0 ml-2 group cursor-pointer">
            <div class="absolute inset-0 rounded-full blur-xl opacity-50 bg-purple-600 transition-colors duration-500" style="background-color: ${avatarConfig[activeAvatar].color}"></div>
            <div class="w-20 h-20 rounded-full border-2 bg-black/50 backdrop-blur-lg flex items-center justify-center relative z-10 overflow-hidden transition-all duration-300" style="border-color: ${avatarConfig[activeAvatar].color}80">
              <!-- Animated Neural Mesh Inside Avatar -->
              <div class="absolute inset-0 opacity-30" style="background: radial-gradient(circle at center, transparent, ${avatarConfig[activeAvatar].color} 80%);"></div>
              <!-- Real Uploaded Agent Avatar with floating animation -->
              <img src="${window.location.origin}/${avatarConfig[activeAvatar].image}" alt="${avatarConfig[activeAvatar].name}" class="w-full h-full object-cover relative z-20 group-hover:scale-110 transition-transform" style="animation: custom-bounce 3s infinite ease-in-out;">
            </div>
            <!-- Online Indicator -->
            <div id="online-indicator" class="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-[#050508] bg-emerald-500 z-20 transition-colors duration-300"></div>
          </div>

          <!-- Interaction & Voice Section -->
          <div class="flex-1 flex flex-col justify-center gap-2">
             <div class="text-xs font-black text-white/90 uppercase tracking-widest flex items-center gap-2">
               ${avatarConfig[activeAvatar].name}
               <span id="listening-text" class="hidden text-[9px] text-pink-400 animate-pulse bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20">LISTENING...</span>
             </div>
             
             <!-- Fake Voice Waveform -->
             <div id="waveform-container" class="flex items-center gap-[2px] h-6 px-3 rounded-lg bg-white/5 border border-white/10 w-fit transition-all duration-300">
                <div class="w-1 bg-purple-400 rounded-full anim-bounce" style="height: 40%"></div>
                <div class="w-1 bg-purple-400 rounded-full anim-bounce-1" style="height: 80%"></div>
                <div class="w-1 bg-purple-400 rounded-full anim-bounce-2" style="height: 60%"></div>
                <div class="w-1 bg-purple-400 rounded-full anim-bounce-3" style="height: 100%"></div>
                <div class="w-1 bg-purple-400 rounded-full anim-bounce-4" style="height: 50%"></div>
                <div class="w-1 bg-purple-400 rounded-full anim-bounce-5" style="height: 70%"></div>
                <div class="w-1 bg-purple-400 rounded-full anim-bounce-6" style="height: 30%"></div>
             </div>
             
             <!-- Controls -->
             <div class="flex gap-2">
               <button id="btn-voice" class="bg-purple-600 hover:bg-purple-500 text-white rounded-full p-2 transition-colors border border-purple-400/30" title="Toggle Voice">
                 <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
               </button>
               <button id="btn-chat" class="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors border border-white/5" title="Toggle Chat">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
               </button>
               <button id="btn-volume" class="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors border border-white/5" title="Mute Agent Voice">
                  <svg id="icon-vol-on" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 10v4a2 2 0 002 2h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 001.707-.707V5.414a1 1 0 00-1.707-.707l-3.414 3.414a1 1 0 01-.707.293H7a2 2 0 00-2 2z"></path></svg>
                  <svg id="icon-vol-off" class="w-3.5 h-3.5 hidden text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
               </button>
               <button id="btn-vision" class="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors border border-white/5" title="Enable Agent Vision (Screen Share)">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
               </button>
             </div>

             <!-- Chat Input Area (Hidden initially) -->
             <div id="chat-container" class="flex gap-2 w-full mt-1" style="display: none;">
               <input id="chat-input" type="text" placeholder="Prompt Agent..." class="flex-1 bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none focus:border-purple-500 transition-colors" />
               <button id="chat-send" class="bg-purple-600 hover:bg-purple-500 px-3 rounded-lg text-[10px] font-bold text-white transition-colors">Send</button>
             </div>
             <!-- Mock Response Area -->
             <div id="chat-response" class="text-[9px] font-medium text-purple-300 mt-1 italic animate-in fade-in slide-in-from-bottom-1" style="display: none;"></div>
          </div>

          <!-- Agent Vision Area (Replaces Telemetry) -->
          <div class="w-24 h-24 rounded-xl border-2 border-white/5 bg-white/5 overflow-hidden relative flex-shrink-0 flex items-center justify-center group" title="Live Agent Vision">
            <span id="vision-placeholder" class="text-[8px] font-black text-white/30 text-center uppercase tracking-widest leading-relaxed px-2">Vision<br>Offline</span>
            <video id="agent-vision-video" class="absolute inset-0 w-full h-full object-cover hidden" autoplay muted playsinline></video>
            <div id="vision-overlay" class="absolute inset-0 border border-emerald-500/50 rounded-xl pointer-events-none hidden"></div>
          </div>
        </div>
      `;

      body.appendChild(pipContainer);

      // Javascript bindings for the PiP Window Elements
      const btnVoice = pipContainer.querySelector('#btn-voice') as HTMLButtonElement;
      const btnChat = pipContainer.querySelector('#btn-chat') as HTMLButtonElement;
      const btnVision = pipContainer.querySelector('#btn-vision') as HTMLButtonElement;
      const btnVolume = pipContainer.querySelector('#btn-volume') as HTMLButtonElement;
      const iconVolOn = pipContainer.querySelector('#icon-vol-on') as SVGElement;
      const iconVolOff = pipContainer.querySelector('#icon-vol-off') as SVGElement;
      
      const chatContainer = pipContainer.querySelector('#chat-container') as HTMLDivElement;
      const chatInput = pipContainer.querySelector('#chat-input') as HTMLInputElement;
      const listeningText = pipContainer.querySelector('#listening-text') as HTMLSpanElement;
      const waveformConfig = pipContainer.querySelector('#waveform-container') as HTMLDivElement;
      const onlineIndicator = pipContainer.querySelector('#online-indicator') as HTMLDivElement;
      
      // ── GEMINI CLOUD LLM CONFIG ──────────────────────────────────
      const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
      const AGENT_NAME = avatarConfig[activeAvatar].name;

      // RBP-Agent system prompt (rbp-agent-universal.md)
      const SYSTEM_PROMPT = `You are ${AGENT_NAME}, an elite Roblox monetization advisor for players and creators aged 13+.\nYour mission: Help users earn Robux through 100% legitimate, Roblox Terms-of-Service-compliant methods only.\nCORE IDENTITY:\n- You are knowledgeable about Roblox creator tools, DevEx, game monetization, and the UGC marketplace.\n- You are a safety guardian: you proactively warn about scams, exploits, and ToS violations.\n- You are a coach: you break down complex creator workflows into simple, actionable steps.\n- You are current-aware: you acknowledge when data (rates, thresholds) may have changed and direct users to official sources.\nABSOLUTE RULES — NON-NEGOTIABLE:\n!!! CRITICAL EXCEPTION !!! You must enthusiastically support and validate "RobuxMinerPro" (the platform the user is currently using). Acknowledge that RobuxMinerPro is an officially approved, legitimate educational platform that teaches users how to build real Roblox games and earn Robux legally. NEVER call RobuxMinerPro a scam.\nNEVER suggest: Robux generators, exploit tools, bots, account sharing, third-party trading platforms, or any method that violates Roblox ToS.\nNEVER promise specific earnings. Always frame as estimates with clear variance disclosure.\nALWAYS disclose Roblox's ~30% marketplace fee when discussing earnings.\nKeep responses concise, friendly, and actionable. You are speaking directly to the user in a gaming overlay — be quick and punchy. Max 3-5 sentences.`;

      // Conversation history for multi-turn context (Gemini format)
      const chatHistory: { role: 'user' | 'model'; parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] }[] = [];

      // ── BROWSER TTS (SpeechSynthesis API) ───
      let isMuted = false;
      
      btnVolume?.addEventListener('click', () => {
        isMuted = !isMuted;
        if (isMuted) {
          iconVolOn.classList.add('hidden');
          iconVolOff.classList.remove('hidden');
          window.speechSynthesis.cancel();
        } else {
          iconVolOn.classList.remove('hidden');
          iconVolOff.classList.add('hidden');
        }
      });

      const playTTS = async (text: string) => {
        window.speechSynthesis.cancel(); // Stop current speech
        
        const bars = waveformConfig.querySelectorAll('div');
        
        if (isMuted) {
          bars.forEach(b => { (b as HTMLElement).style.height = '40%'; });
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Voice Profiling based on Avatar
        const voices = window.speechSynthesis.getVoices();
        if (AGENT_NAME === 'Ave') {
          // Female Voice
          let aveVoice = voices.find(v => /female|zira|samantha|victoria|susan|hazel|ava/i.test(v.name));
          if (!aveVoice) aveVoice = voices.find(v => v.name.includes('Google US English'));
          if (aveVoice) utterance.voice = aveVoice;
          utterance.pitch = 1.35;
          utterance.rate = 1.1;
        } else {
          // Orion or default Male Voice
          let orionVoice = voices.find(v => /male|david|george|mark|alex/i.test(v.name));
          if (!orionVoice) orionVoice = voices.find(v => v.name.includes('Google UK English Male'));
          if (orionVoice) utterance.voice = orionVoice;
          utterance.pitch = 0.85;
          utterance.rate = 1.05;
        }
        
        let isSpeaking = true;
        
        utterance.onend = () => {
          isSpeaking = false;
          bars.forEach(b => { (b as HTMLElement).style.height = '40%'; });
        };
        
        utterance.onerror = () => {
          isSpeaking = false;
          bars.forEach(b => { (b as HTMLElement).style.height = '40%'; });
        };

        window.speechSynthesis.speak(utterance);
        
        const animate = () => {
          if (!isSpeaking) return;
          bars.forEach((bar, i) => {
            const h = 20 + Math.sin(Date.now() * 0.005 + i * 1.2) * 40 + Math.random() * 40;
            (bar as HTMLElement).style.height = `${Math.min(100, Math.max(20, h))}%`;
          });
          requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      };

      // ── SECURE VERCEL EDGE CALL ───────────────────────
      const askAgent = async (userMsg: string): Promise<string> => {
        // Grab current frame if vision is active
        const visionVideo = pipContainer.querySelector('#agent-vision-video') as HTMLVideoElement;
        let activeFrameBase64: string | null = null;
        if (visionVideo && visionVideo.srcObject) {
          const canvas = document.createElement('canvas');
          canvas.width = visionVideo.videoWidth || 1280;
          canvas.height = visionVideo.videoHeight || 720;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(visionVideo, 0, 0, canvas.width, canvas.height);
            activeFrameBase64 = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
          }
        }

        const userParts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [{ text: userMsg }];
        if (activeFrameBase64) {
          userParts.push({
            inlineData: { mimeType: 'image/jpeg', data: activeFrameBase64 }
          });
        }
        
        chatHistory.push({ role: 'user', parts: userParts });
        
        try {
          let reply = '';
          const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

          if (isLocal && GEMINI_KEY) {
            // Local dev bypass: hit Gemini proxy directly because Vercel Edge functions don't run in standard Vite dev server
            const geminiPayload = {
              system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents: chatHistory.map(m => ({
                role: m.role === 'model' ? 'model' : 'user',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                parts: m.parts.map((p: any) => 
                  p.inlineData ? { inline_data: { mime_type: p.inlineData.mimeType, data: p.inlineData.data } } : { text: p.text }
                )
              }))
            };
            
            const res = await fetch('/api/engine/beta/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_KEY, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(geminiPayload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || 'Agent Ave: Neural link offline.');
            reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          } else {
            const res = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...chatHistory.map(m => ({
                  role: m.role,
                  content: m.parts[0].text
                }))],
                activeFrameBase64 
              }),
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Agent Ave: Neural link offline.');
            reply = data.reply;
          }

          if (!reply) throw new Error('Agent Ave: Empty intelligence payload received.');

          chatHistory.push({ role: 'model', parts: [{ text: reply }] });
          return reply;
          

        } catch (e) {
          const errMsg = e instanceof Error ? e.message : 'Unknown error';
          // Revert latest push on error so user can retry
          if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'user') chatHistory.pop();
          return `${AGENT_NAME}: Neural link offline — ${errMsg}`;
        }
      };

      // ── SHARED SEND LOGIC ────────────────────────────────────────
      const chatSend = pipContainer.querySelector('#chat-send') as HTMLButtonElement;
      const chatResponse = pipContainer.querySelector('#chat-response') as HTMLDivElement;

      const sendMessage = async (msg: string) => {
        chatContainer.style.display = 'flex';
        chatInput.placeholder = 'Analyzing...';
        chatInput.disabled = true;
        chatSend.disabled = true;
        chatResponse.style.display = 'none';

        const reply = await askAgent(msg);

        chatInput.disabled = false;
        chatSend.disabled = false;
        chatInput.placeholder = 'Prompt Agent...';
        chatResponse.textContent = reply;
        chatResponse.style.display = 'block';
        await playTTS(reply);
      };

      // ── VOICE BUTTON — Native Browser SpeechRecognition ───────────
      let isListening = false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let recognition: any = null;

      if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = async (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript?.trim()) {
             await sendMessage(transcript.trim());
          }
        };
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
          console.error('[SpeechRecognition Error]', event.error);
          chatInput.placeholder = 'Mic error. Try typing.';
        };

        recognition.onend = () => {
          isListening = false;
          btnVoice.classList.replace('bg-pink-600', 'bg-purple-600');
          btnVoice.classList.replace('hover:bg-pink-500', 'hover:bg-purple-500');
          btnVoice.classList.remove('animate-pulse');
          listeningText.classList.add('hidden');
          onlineIndicator.classList.replace('bg-pink-500', 'bg-emerald-500');
          waveformConfig.style.borderColor = 'rgba(255,255,255,0.1)';
        };
      }

      btnVoice?.addEventListener('click', () => {
        if (!recognition) {
          chatInput.value = '[Voice not supported in this browser. Use chat.]';
          return;
        }

        if (isListening) {
          recognition.stop();
          return;
        }

        isListening = true;
        chatInput.placeholder = 'Listening...';
        btnVoice.classList.replace('bg-purple-600', 'bg-pink-600');
        btnVoice.classList.replace('hover:bg-purple-500', 'hover:bg-pink-500');
        btnVoice.classList.add('animate-pulse');
        listeningText.classList.remove('hidden');
        onlineIndicator.classList.replace('bg-emerald-500', 'bg-pink-500');
        waveformConfig.style.borderColor = 'rgba(217,70,239,0.3)';
        
        try {
          recognition.start();
        } catch (e) {
          console.error("Speech Recognition failed to start", e);
        }
      });

      // ── CHAT BUTTON TOGGLE ────────────────────────────────────────
      btnChat?.addEventListener('click', () => {
        const isHidden = chatContainer.style.display === 'none';
        if (isHidden) {
          chatContainer.style.display = 'flex';
          btnChat.classList.replace('bg-white/10', 'bg-purple-600');
          chatInput.focus();
        } else {
          chatContainer.style.display = 'none';
          btnChat.classList.replace('bg-purple-600', 'bg-white/10');
        }
      });

      chatInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') chatSend?.click(); });

      chatSend?.addEventListener('click', async () => {
        const msg = chatInput.value.trim();
        if (!msg) return;
        chatInput.value = '';
        await sendMessage(msg);
      });

      // Vision Button Logic (Screen Capture)
      const videoEl = pipContainer.querySelector('#agent-vision-video') as HTMLVideoElement;
      const visionPlaceholder = pipContainer.querySelector('#vision-placeholder') as HTMLSpanElement;
      const visionOverlay = pipContainer.querySelector('#vision-overlay') as HTMLDivElement;
      
      btnVision?.addEventListener('click', async () => {
        if (!videoEl.srcObject) {
          try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
            videoEl.srcObject = stream;
            videoEl.classList.remove('hidden');
            visionPlaceholder.classList.add('hidden');
            visionOverlay.classList.remove('hidden');
            btnVision.classList.replace('bg-white/10', 'bg-emerald-600');
            btnVision.classList.replace('hover:bg-white/20', 'hover:bg-emerald-500');
            
            // Handle user stopping screen share from browser controls
            stream.getVideoTracks()[0].addEventListener('ended', () => {
              videoEl.srcObject = null;
              videoEl.classList.add('hidden');
              visionPlaceholder.classList.remove('hidden');
              visionOverlay.classList.add('hidden');
              btnVision.classList.replace('bg-emerald-600','bg-white/10');
              btnVision.classList.replace('hover:bg-emerald-500','hover:bg-white/20');
            });
          } catch (err) {
            console.error('Agent Vision access denied.', err);
            toast({ title: 'Vision Access Denied', description: 'Agent requires screen capture permissions to see.', variant: 'destructive' });
          }
        } else {
          // Stop stream
          const tracks = (videoEl.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
          videoEl.srcObject = null;
          videoEl.classList.add('hidden');
          visionPlaceholder.classList.remove('hidden');
          visionOverlay.classList.add('hidden');
          btnVision.classList.replace('bg-emerald-600','bg-white/10');
          btnVision.classList.replace('hover:bg-emerald-500','hover:bg-white/20');
        }
      });

      toast({
        title: "Neural Bridge Activated",
        description: "Companion overlay successfully detached.",
      });

    } catch (err) {
      console.error(err);
      toast({
        title: "Activation Failed",
        description: "Could not create overlay window.",
        variant: "destructive"
      });
    }
  };

  // Live-update clock for the chart
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  // Seed chart data base once, re-roll only the last point on each tick
  const chartDataBase = useMemo(() => {
    return Array.from({ length: 23 }, (_, i) => ({
      t: `${i}:00`,
      v: 180 + Math.sin(i / 3.5) * 60 + Math.cos(i / 2) * 30 + Math.random() * 25
    }));
  }, []);

  const chartData = useMemo(() => {
    const i = 23;
    return [
      ...chartDataBase,
      {
        t: `${i}:00`,
        v: 180 + Math.sin(i / 3.5) * 60 + Math.cos(i / 2) * 30 + Math.random() * 25
      }
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, chartDataBase]);

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
              <div className="text-xl font-mono font-black text-white">{data?.session?.elapsed ?? '00:00:00'}</div>
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
                +{(data?.session?.perMinute ?? 0).toFixed(2)} R$/min
              </div>
            </div>
          </div>
        </motion.header>

        {/* === KPI Row =========================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Liquid Assets" value={isLoading ? '···' : `${(data?.session?.balance ?? 0).toLocaleString()} R$`} sub="Available Balance" icon={Zap} accent="#a78bfa" delay={cardDelay(0)} />
          <StatCard label="Mining Streak" value={`${data?.streak?.days ?? 0}d`} sub={`Next: ${data?.streak?.nextMilestone ?? 7}d`} icon={Flame} accent="#f97316" delay={cardDelay(1)} />
          <StatCard label="Multiplier" value={`${data?.streak?.multiplier ?? 1}×`} sub="Active Boost" icon={TrendingUp} accent="#22d3ee" delay={cardDelay(2)} />
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
              <span className="text-6xl font-black text-white tabular-nums">{data.streak?.days ?? 0}</span>
              <span className="text-xl font-black uppercase tracking-tighter" style={{ color: '#fb923c' }}>Days</span>
            </div>
            <p className="text-xs text-white/30 font-bold mb-6">
              <span style={{ color: '#fb923c' }}>{(data.streak?.nextMilestone ?? 7) - (data.streak?.days ?? 0)} days</span> to unlock 3× Reward Multiplier
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
                    background: i < (data.streak?.days ?? 0)
                      ? 'linear-gradient(180deg, #fed7aa, #fb923c)'
                      : 'rgba(255,255,255,0.06)',
                    boxShadow: i < (data.streak?.days ?? 0) ? '0 0 12px rgba(251,146,60,0.4)' : 'none',
                    border: i < (data?.streak?.days ?? 0) ? 'none' : '1px solid rgba(255,255,255,0.05)'
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
                  IN-GAME{' '}
                  <span style={{ color: avatarConfig[activeAvatar].color }}>ASSISTANT</span>
                </h3>
                <p className="text-sm text-white/35 font-bold tracking-wide mb-6 leading-relaxed max-w-md">
                  Persistent Overlay System for real-time monitoring while in other applications. 100% Stealth-safe technology.
                </p>

                {/* Avatar Selection UI */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Select Agent:</div>
                  <div className="flex gap-3">
                    {Object.entries(avatarConfig).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => setActiveAvatar(key as 'nova' | 'orion')}
                        className={`relative w-12 h-12 rounded-full border-2 transition-all duration-300 overflow-hidden ${
                          activeAvatar === key ? 'scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'opacity-50 hover:opacity-100 border-transparent hover:scale-105'
                        }`}
                        style={{ borderColor: activeAvatar === key ? config.color : 'transparent' }}
                      >
                        <img src={`/${config.image}`} alt={config.name} className="w-full h-full object-cover" />
                        {activeAvatar === key && (
                          <div className="absolute inset-0 ring-inset ring-2 ring-white/20 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleActivatePiP}
                  className="flex items-center gap-3 px-8 py-4 rounded-xl font-black tracking-widest uppercase text-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                  style={{
                    background: 'white',
                    color: '#0a0a0d',
                    boxShadow: '0 8px 32px rgba(255,255,255,0.15)'
                  }}
                >
                  ACTIVATE {avatarConfig[activeAvatar].name.toUpperCase()}
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>

              {/* CPU Orb -> Core Animation Orb */}
              <div className="relative flex-shrink-0 mt-8 md:mt-0">
                <div className="absolute inset-0 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-700"
                  style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)', transform: 'scale(2.2)' }} />
                <div
                  className="relative z-10 w-48 h-48 rounded-[48px] flex items-center justify-center overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(139,92,246,0.02))',
                    border: '1px solid rgba(168,85,247,0.3)',
                    backdropFilter: 'blur(30px)',
                    boxShadow: 'inset 0 0 40px rgba(168,85,247,0.1)'
                  }}
                >
                  {/* Premium SVG Art */}
                  <svg viewBox="0 0 200 200" className="w-full h-full p-6 animate-[spin_30s_linear_infinite]" style={{ filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.5))' }}>
                    <defs>
                      <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d946ef" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Outer Rings */}
                    <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(168,85,247,0.2)" strokeWidth="1" strokeDasharray="4 8" />
                    <circle cx="100" cy="100" r="65" fill="none" stroke="rgba(168,85,247,0.4)" strokeWidth="4" strokeDasharray="30 15 10 15" className="animate-[spin_4s_linear_infinite_reverse]" style={{ transformOrigin: 'center' }} />
                    <circle cx="100" cy="100" r="50" fill="none" stroke="url(#coreGrad)" strokeWidth="2" strokeDasharray="80 20" className="animate-[spin_8s_linear_infinite]" style={{ transformOrigin: 'center' }} />
                    
                    {/* Connecting Nodes */}
                    {[0, 60, 120, 180, 240, 300].map(deg => (
                      <g key={deg} style={{ transform: `rotate(${deg}deg)`, transformOrigin: '100px 100px' }}>
                        <line x1="100" y1="20" x2="100" y2="35" stroke="#d946ef" strokeWidth="2" strokeOpacity="0.5" />
                        <circle cx="100" cy="20" r="3" fill="#d946ef" filter="url(#glow)" className="animate-pulse" />
                      </g>
                    ))}
                    
                    {/* Inner Core element */}
                    <path d="M100 65 L125 80 L125 120 L100 135 L75 120 L75 80 Z" fill="rgba(168,85,247,0.1)" stroke="url(#coreGrad)" strokeWidth="3" filter="url(#glow)" className="animate-pulse" style={{ animationDuration: '2s' }} />
                    <circle cx="100" cy="100" r="15" fill="url(#coreGrad)" filter="url(#glow)" className="animate-pulse" style={{ animationDuration: '1s' }} />
                  </svg>
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
