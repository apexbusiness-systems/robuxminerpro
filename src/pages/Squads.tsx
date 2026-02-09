import { useEffect, useState } from 'react';
import { get } from '@/shared/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Squad } from '@/types';

export default function Squads() {
  const [squads, setSquads] = useState<Squad[]>([]);

  useEffect(() => {
    get<Squad[]>('/squads').then(data => {
      const safe = Array.isArray(data) ? data : [];
      setSquads(safe);
    });
  }, []);

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Squads</h1>
      
      {squads.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">No Squads Available</h3>
            <p className="text-muted-foreground mb-4">
              Join a squad to collaborate and earn bonus Robux together!
            </p>
            <Button disabled>
              Join Squad (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {squads.map((squad, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>{squad.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{squad.description}</p>
                <Button disabled className="w-full">
                  Join (Read-only mode)
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}