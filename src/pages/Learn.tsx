import { useEffect, useState } from 'react';
import { get } from '@/shared/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export default function Learn() {
  type LearningPath = {
    title: string;
    description: string;
    progress: number;
    modules: number;
    completed: number;
  };

  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);

  useEffect(() => {
    get<LearningPath[]>('/learning-paths').then((data) => {
      if (Array.isArray(data)) setLearningPaths(data);
    });
  }, []);

  const defaultPaths: LearningPath[] = [
    { title: 'Mining Basics', description: 'Learn the fundamentals of efficient mining', progress: 75, modules: 4, completed: 3 },
    { title: 'Advanced Strategies', description: 'Master advanced techniques for maximum earnings', progress: 25, modules: 6, completed: 1 },
    { title: 'Safety & Security', description: 'Protect your account and avoid scams', progress: 100, modules: 3, completed: 3 }
  ];

  const displayPaths = learningPaths.length > 0 ? learningPaths : defaultPaths;

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Learning Paths</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPaths.map((path, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                {path.title}
              </CardTitle>
              <p className="text-muted-foreground">{path.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{path.completed}/{path.modules} modules</span>
                  </div>
                  <Progress value={path.progress} />
                </div>
                <Button disabled className="w-full">
                  Continue Learning (Read-only mode)
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}