import { useEffect, useState } from 'react';
import { get } from '@/shared/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Achievement } from '@/types';

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    get<Achievement[]>('/achievements').then(data => setAchievements(data || []));
  }, []);

  const defaultAchievements: Achievement[] = [
    { title: 'First Steps', description: 'Complete your first mining session', progress: 100, maxProgress: 100, earned: true },
    { title: 'Streak Master', description: 'Maintain a 7-day login streak', progress: 3, maxProgress: 7, earned: false },
    { title: 'Robux Collector', description: 'Earn 1,000 total Robux', progress: 250, maxProgress: 1000, earned: false }
  ];

  const displayAchievements = achievements.length > 0 ? achievements : defaultAchievements;

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Achievements</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayAchievements.map((achievement, i) => (
          <Card key={i} className={`${achievement.earned ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300' : ''}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${achievement.earned ? 'bg-yellow-500 text-white' : 'bg-muted'}`}>
                  {achievement.earned ? '🏆' : '🔒'}
                </div>
                <div>
                  <CardTitle className="text-lg">{achievement.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{achievement.progress}/{achievement.maxProgress}</span>
                </div>
                <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}