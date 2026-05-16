import { motion } from 'framer-motion';
import { useStreak } from '@/hooks/useStreak';
export function StreakTracker() { const s = useStreak(); return <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-xl border p-4"><div className="text-4xl font-bold">{s.currentStreak}</div><div>{s.tierLabel}</div><div>{s.multiplier}x</div>{s.isActiveToday ? <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" /> : <div>Come back tomorrow!</div>}</motion.div>; }
