import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { PackageOpen, Sparkles, Zap } from 'lucide-react';

interface RewardUnboxProps {
  onComplete: () => void;
  rewardType: 'XP' | 'MULTIPLIER' | 'TIER_UP';
  rewardValue: string;
}

export const RewardUnboxing: React.FC<RewardUnboxProps> = ({ onComplete, rewardType, rewardValue }) => {
  const [stage, setStage] = useState<'IDLE' | 'SHAKING' | 'OPENED'>('IDLE');

  const handleInteract = () => {
    if (stage === 'IDLE') {
      setStage('SHAKING');
      setTimeout(() => {
        setStage('OPENED');
        // Visceral Confetti Celebration
        const colors = ['#8b5cf6', '#d946ef', '#f43f5e', '#facc15']; // Accent colors
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: colors,
          disableForReducedMotion: true
        });
      }, 1200);
    } else if (stage === 'OPENED') {
      onComplete();
    }
  };

  const shakeVariants = {
    idle: { scale: 1 },
    shaking: {
      rotate: [0, -10, 10, -10, 10, -5, 5, 0],
      scale: [1, 1.1, 1.1, 1.1, 1.1, 1.05, 1.05, 1],
      transition: { duration: 0.8, ease: "easeInOut" }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {stage !== 'OPENED' ? (
          <motion.div
            key="box"
            initial="idle"
            animate={stage === 'SHAKING' ? 'shaking' : 'idle'}
            variants={shakeVariants}
            className="flex flex-col items-center cursor-pointer group"
            onClick={handleInteract}
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative w-48 h-48 flex items-center justify-center rounded-3xl bg-gradient-to-br from-primary via-primary-glow to-accent shadow-2xl overflow-hidden">
               <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
               <PackageOpen className="w-24 h-24 text-white/90 drop-shadow-md z-10" />
            </div>
            <motion.p 
              className="mt-6 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {stage === 'IDLE' ? 'Tap to Unbox' : 'Unlocking...'}
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="reward"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="flex flex-col items-center text-center p-8 rounded-3xl bg-card border border-border/50 shadow-2xl max-w-sm w-full mx-4"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-success/50 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(var(--success),0.4)]">
              {rewardType === 'XP' && <Zap className="w-12 h-12 text-success-foreground" />}
              {rewardType === 'MULTIPLIER' && <Sparkles className="w-12 h-12 text-success-foreground" />}
            </div>
            
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              EPIC LOOT
            </Badge>

            <h2 className="text-4xl font-black tracking-tight mb-2 text-foreground">
              {rewardValue}
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              {rewardType === 'XP' && 'Bonus XP Secured'}
              {rewardType === 'MULTIPLIER' && 'Streak Multiplier Active'}
            </p>

            <Button size="lg" className="w-full text-lg shadow-xl hover-lift" onClick={handleInteract}>
              Collect Reward
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Generic Badge and Button stubs for standalone compilation (in a real app, import from UI)
const Badge = ({ children, className }: any) => <span className={`px-3 py-1 text-xs font-bold rounded-full border ${className}`}>{children}</span>;
const Button = ({ children, onClick, className, size }: any) => <button onClick={onClick} className={`bg-primary text-primary-foreground font-semibold rounded-lg ${className}`}>{children}</button>;
