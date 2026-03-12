import React, { useState } from 'react';
import { PipAgent } from './PipAgent';
import { RewardUnboxing } from '../gamification/RewardUnboxing';
import { Button } from '@/components/ui/button';
import { Zap, X } from 'lucide-react';

/**
 * A floating control panel that can be popped out into a persistent PiP window.
 * Acts as the "AI Companion" for the RobuxMinerPro experience.
 */
export const PipCompanionDemo: React.FC = () => {
  const [isPipActive, setIsPipActive] = useState(false);
  const [showReward, setShowReward] = useState(false);

  // The actual UI of the companion agent
  const CompanionUI = () => (
    <div className="w-full h-full bg-background/95 backdrop-blur border border-border/50 text-foreground flex flex-col p-4 rounded-xl shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-border/30 pb-2">
            <div className="flex items-center gap-2">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                </div>
                <h3 className="font-bold text-sm text-muted-foreground">Algo-Forge Agent</h3>
            </div>
            {isPipActive && (
               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsPipActive(false)}>
                  <X className="w-4 h-4" />
               </Button>
            )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex flex-col items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                <Zap className="w-8 h-8 text-primary animate-pulse" />
            </div>
            
            <div className="text-center space-y-1">
                <p className="text-sm font-semibold">Active Streak: <span className="text-primary-glow">5 Days</span></p>
                <p className="text-xs text-muted-foreground">Multiplier: 1.5x (Silver Tier)</p>
            </div>

            <Button 
                onClick={() => setShowReward(true)} 
                className="w-full mt-2 bg-gradient-to-r from-accent to-primary text-primary-foreground hover:shadow-lg transition-all"
            >
                Simulate Reward Drop
            </Button>
        </div>

        {showReward && (
            <div className="absolute inset-0 z-50">
               <RewardUnboxing 
                  rewardType="XP" 
                  rewardValue="+500 XP" 
                  onComplete={() => setShowReward(false)} 
               />
            </div>
        )}
    </div>
  );

  return (
    <>
      <div className="mt-8 flex items-center justify-center">
        {!isPipActive && (
          <Button 
            onClick={() => setIsPipActive(true)}
            size="lg"
            className="group relative overflow-hidden bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary hover:text-primary transition-all duration-300 shadow-[0_0_20px_rgba(var(--primary),0.1)] hover:shadow-[0_0_30px_rgba(var(--primary),0.2)]"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
            Launch APEX PiP Companion
           <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
          </Button>
        )}
      </div>

      {isPipActive && (
        <PipAgent width={320} height={400}>
          <div className="h-screen w-screen bg-background overflow-hidden p-2">
             <CompanionUI />
          </div>
        </PipAgent>
      )}
    </>
  );
};
