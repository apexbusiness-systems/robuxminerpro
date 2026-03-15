import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Zap, Trophy, Star } from 'lucide-react';

// Import 3D assets
import chestImg from '@/assets/chest_epic_lava.png';
import coinImg from '@/assets/robux_coin_3d.png';
import multiplierImg from '@/assets/multiplier_3d.png';

interface RewardUnboxProps {
  onComplete: () => void;
  rewardType: 'XP' | 'MULTIPLIER' | 'TIER_UP' | 'ROBUX';
  rewardValue: string;
}

export const RewardUnboxing: React.FC<RewardUnboxProps> = ({ onComplete, rewardType, rewardValue }) => {
  const [stage, setStage] = useState<'IDLE' | 'SHAKING' | 'OPENED'>('IDLE');

  const handleInteract = () => {
    if (stage === 'IDLE') {
      setStage('SHAKING');
      
      // Screen shake effect for the whole document during unboxing
      document.body.classList.add('animate-shake');
      
      setTimeout(() => {
        setStage('OPENED');
        document.body.classList.remove('animate-shake');
        
        // Multi-layered visceral confetti burst
        const count = 200;
        const defaults = {
          origin: { y: 0.7 },
          spread: 80,
          ticks: 300,
          gravity: 0.8,
          decay: 0.94,
          startVelocity: 30,
        };

        const fire = (particleRatio: number, opts: confetti.Options) => {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        };

        fire(0.25, { spread: 26, startVelocity: 55, colors: ['#8b5cf6', '#ffffff'] });
        fire(0.2, { spread: 60, colors: ['#d946ef', '#facc15'] });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#f43f5e', '#8b5cf6'] });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#ffffff', '#f43f5e'] });
        fire(0.1, { spread: 120, startVelocity: 45, colors: ['#facc15', '#ffffff'] });
      }, 1500);
    } else if (stage === 'OPENED') {
      onComplete();
    }
  };

  const getRewardImage = () => {
    if (rewardType === 'MULTIPLIER') {
      return multiplierImg;
    }
    return coinImg;
  };

  const shakeVariants = {
    idle: { scale: 1 },
    shaking: {
      x: [0, -4, 4, -4, 4, -2, 2, 0],
      rotate: [0, -2, 2, -2, 2, -1, 1, 0],
      scale: [1, 1.05, 1.1, 1.15, 1.1, 1.05, 1],
      transition: { duration: 1.5, ease: "linear" as const }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl transition-all duration-500">
      <AnimatePresence>
        {stage === 'OPENED' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 overflow-hidden pointer-events-none"
          >
            <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-primary/20 via-primary-glow/10 to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(139,92,246,0.3)_0%,transparent_50%)] animate-pulse-slow" />
            
            {/* Rotating God Rays */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-30"
              style={{ 
                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(139,92,246,0.2) 10deg, transparent 20deg, rgba(217,70,239,0.2) 30deg, transparent 40deg)'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {stage === 'OPENED' ? (
          <motion.div
            key="reward"
            initial={{ scale: 0.3, opacity: 0, rotate: -20, filter: 'blur(20px)' }}
            animate={{ scale: 1, opacity: 1, rotate: 0, filter: 'blur(0px)' }}
            transition={{ type: 'spring', damping: 12, stiffness: 100, mass: 0.8 }}
            className="flex flex-col items-center text-center p-12 rounded-[2rem] bg-black/40 border border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl max-w-lg w-full relative overflow-hidden"
          >
            {/* Card Internal Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 pointer-events-none" />

            <motion.div 
              animate={{ 
                y: [0, -10, 0],
                rotate: [-2, 2, -2],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 mb-8"
            >
              <img 
                src={getRewardImage()} 
                alt="Reward" 
                className="w-48 h-48 object-contain drop-shadow-[0_10px_30px_rgba(217,70,239,0.5)]"
              />
              {/* Floating particles around item */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-64 h-64 text-primary/10 animate-spin-slow opacity-50" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-bold shadow-lg mb-6">
                <Star className="w-4 h-4 fill-white" />
                <span>EPIC LOOT SECURED</span>
                <Star className="w-4 h-4 fill-white" />
              </div>

              <h2 className="text-6xl font-black tracking-tighter mb-4 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                {rewardValue}
              </h2>
              
              <div className="flex items-center justify-center gap-3 text-xl font-bold text-primary-glow mb-10">
                {rewardType === 'XP' && <Zap className="w-6 h-6 fill-primary" />}
                {rewardType === 'MULTIPLIER' && <Trophy className="w-6 h-6 text-accent" />}
                <p>
                  {rewardType === 'XP' ? 'BONUS XP YIELD' : 'STREAK MULTIPLIER ACTIVE'}
                </p>
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(139,92,246,0.6)' }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 w-full py-5 rounded-2xl bg-gradient-to-r from-primary via-primary-glow to-primary text-white text-xl font-bold shadow-2xl transition-all duration-300"
              onClick={handleInteract}
            >
              CLAIM HARVEST
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="box"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 3, opacity: 0, filter: 'brightness(5)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} // ease-out-expo
            variants={shakeVariants}
            className="flex flex-col items-center cursor-pointer group relative"
            onClick={handleInteract}
          >
            {/* Chest Glow */}
            <div className={`absolute inset-0 blur-3xl opacity-50 bg-primary transition-all duration-500 ${stage === 'SHAKING' ? 'scale-150 brightness-150' : 'scale-100'}`} />
            
            <motion.div
              whileHover={{ scale: 1.05, filter: 'brightness(1.2)' }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10"
            >
              <img 
                src={chestImg} 
                alt="Epic Loot Chest" 
                className={`w-64 h-64 object-contain drop-shadow-[0_0_50px_rgba(139,92,246,0.6)] ${stage === 'SHAKING' ? 'animate-bounce' : ''}`}
              />
            </motion.div>

            <motion.div
              className="mt-12 text-center"
              animate={stage === 'SHAKING' ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl font-black italic tracking-tighter text-white drop-shadow-lg uppercase italic">
                {stage === 'IDLE' ? 'Unlock Epic Loot' : 'Opening...'}
              </h2>
              <p className="mt-2 text-primary-glow font-medium animate-pulse">
                Click to harvest potential
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
