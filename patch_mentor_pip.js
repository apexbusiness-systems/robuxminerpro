import fs from 'fs';

let content = fs.readFileSync('src/components/gamification/MentorPip.tsx', 'utf-8');

// Replace the Neural Orb Visualization section with an image tag
const originalOrb = `{/* Neural Orb Visualization */}
        <div className="flex-1 flex items-center justify-center relative mb-6">
           <div className="absolute inset-0 flex items-center justify-center">
             <div className={\`w-32 h-32 rounded-full border border-purple-500/20 absolute transition-all duration-1000 \${isListening ? 'scale-110 animate-spin-slow' : 'scale-100'}\`} style={{ borderStyle: 'dashed' }} />
             <div className={\`w-24 h-24 rounded-full border border-pink-500/20 absolute transition-all duration-700 \${isListening ? 'scale-125 animate-reverse-spin' : 'scale-100'}\`} />
           </div>
           <div className="relative">
             <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-full blur-xl opacity-40 animate-pulse" />
             <div className="w-16 h-16 rounded-full bg-[#0a0a0f] border border-white/10 flex items-center justify-center relative z-10 shadow-inner">
               <BrainCircuit className={\`w-7 h-7 \${isListening ? 'text-pink-400 animate-pulse' : 'text-purple-400'}\`} />
             </div>
           </div>
        </div>`;

const newAvatar = `{/* Avatar Visualization */}
        <div className="flex-1 flex items-center justify-center relative mb-6 group cursor-pointer">
           <div className="absolute inset-0 flex items-center justify-center">
             <div className={\`w-40 h-40 rounded-full border border-pink-500/20 absolute transition-all duration-1000 \${isListening ? 'scale-110 animate-spin-slow' : 'scale-100'}\`} style={{ borderStyle: 'dashed' }} />
           </div>
           <div className="relative z-10">
             <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-full blur-2xl opacity-20 animate-pulse" />
             <img
               src="/rbp-avatar-icon.png"
               alt="RBP-Agent"
               className={\`w-32 h-32 object-contain filter drop-shadow-[0_0_15px_rgba(217,70,239,0.5)] transition-transform duration-500 \${isListening ? 'scale-110 -translate-y-2' : 'scale-100'}\`}
             />
           </div>
        </div>`;

content = content.replace(originalOrb, newAvatar);

fs.writeFileSync('src/components/gamification/MentorPip.tsx', content);
