import React from 'react';
import { motion } from 'framer-motion';

const SimulateGame: React.FC = () => {
  return (
    <div className="w-screen h-screen overflow-hidden bg-[#87CEEB] relative font-sans">
      {/* Fake Game Environment - Sky & Grass */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[#567D46] border-t-4 border-[#3a532f]" />
      
      {/* Fake Game UI Elements */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-4 py-2 rounded-lg font-bold">
        Leaderboard
        <div className="text-sm font-normal mt-2">
          1. Player123<br/>
          2. NoobSlayer99<br/>
          3. RobuxFan
        </div>
      </div>
      
      <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg font-bold flex gap-4">
        <span>Chat</span>
        <span>Menu</span>
      </div>
      
      {/* Fake Roblox Menu Icon */}
      <div className="absolute top-4 left-4 w-8 h-8 bg-black/50 rounded flex flex-col justify-center items-center gap-1 cursor-pointer hover:bg-black/70">
        <div className="w-5 h-0.5 bg-white"></div>
        <div className="w-5 h-0.5 bg-white"></div>
        <div className="w-5 h-0.5 bg-white"></div>
      </div>

      <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="w-12 h-12 bg-black/40 border-2 border-white/20 rounded flex items-center justify-center text-white/50 text-xs font-bold">
            Slot {i}
          </div>
        ))}
      </div>

      {/* Main Content / Character placeholder */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          animate={{ y: [0, -20, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-32 h-64 bg-yellow-400 rounded-lg shadow-2xl relative flex flex-col items-center justify-start border-4 border-black/10"
        >
          {/* Head */}
          <div className="w-24 h-24 bg-yellow-300 rounded-xl mt-[-30px] border-4 border-black/10 flex items-center justify-center">
            <div className="flex gap-4">
              <div className="w-3 h-3 bg-black rounded-full" />
              <div className="w-3 h-3 bg-black rounded-full" />
            </div>
          </div>
          {/* Torso */}
          <div className="w-32 h-32 bg-blue-500 mt-2" />
          {/* Legs */}
          <div className="flex gap-2 mt-2">
             <div className="w-14 h-24 bg-green-600" />
             <div className="w-14 h-24 bg-green-600" />
          </div>
        </motion.div>
      </div>
      
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-center text-white drop-shadow-md">
        <h1 className="text-4xl font-black mb-2">Simulated Game Environment</h1>
        <p className="text-lg">Open the PiP Neural Assistant on the Dashboard, then come here to test it.</p>
      </div>

    </div>
  );
};

export default SimulateGame;
