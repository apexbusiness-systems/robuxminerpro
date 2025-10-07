import { useEffect, useState } from 'react';
import { get } from '@/shared/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    get('/events').then(setEvents);
  }, []);

  const defaultEvents = [
    { title: 'Double Robux Weekend', description: 'Earn 2x Robux on all mining activities', status: 'live', endsIn: '2 days', participants: 1234 },
    { title: 'Referral Bonus', description: 'Invite friends and earn bonus rewards', status: 'ongoing', reward: '50 Robux per referral', participants: 567 }
  ];

  const displayEvents = events.length > 0 ? events : defaultEvents;

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Events & Leaderboards</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {displayEvents.map((event: any, i) => (
          <Card key={i} className={event.status === 'live' ? 'border-green-500 bg-green-50' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🎉</span>
                  {event.title}
                </CardTitle>
                {event.status === 'live' && (
                  <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                    LIVE
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">{event.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {event.endsIn && (
                  <div className="text-sm">
                    <span className="font-medium">Ends in:</span> {event.endsIn}
                  </div>
                )}
                {event.reward && (
                  <div className="text-sm">
                    <span className="font-medium">Reward:</span> {event.reward}
                  </div>
                )}
                <div className="text-sm">
                  <span className="font-medium">Participants:</span> {event.participants}
                </div>
                <Button disabled className="w-full">
                  Participate (Read-only mode)
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { rank: 1, username: 'MinerPro123', score: '15,420' },
              { rank: 2, username: 'RobuxMaster', score: '12,890' },
              { rank: 3, username: 'CryptoKing', score: '11,234' }
            ].map((user, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {user.rank}
                  </span>
                  <span className="font-medium">{user.username}</span>
                </div>
                <span className="font-bold text-primary">{user.score} Robux</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}