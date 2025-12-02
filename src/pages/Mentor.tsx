import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Mentor() {
  return (
    <main className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Robux Strategy Assistant</h1>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Our strategy assistant is currently under development. We're building a comprehensive guide to help you learn official ways to earn Robux through:
          </p>

          <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-4">
            <li>Creating and selling UGC items on the Roblox marketplace</li>
            <li>Developing engaging games and experiences</li>
            <li>Participating in the Roblox affiliate program</li>
            <li>Understanding Roblox Premium benefits</li>
          </ul>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-6">
            <p className="text-sm font-medium">
              <strong>Official Resources:</strong>
            </p>
            <ul className="text-sm space-y-1 mt-2">
              <li>• <a href="https://help.roblox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Official Roblox Help Center</a></li>
              <li>• <a href="https://www.roblox.com/robux" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Buy Robux Safely</a></li>
              <li>• <a href="https://create.roblox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Roblox Creator Hub</a></li>
            </ul>
          </div>

          <p className="text-sm text-muted-foreground italic mt-4">
            ⚠️ Remember: We only promote official, legitimate methods. Avoid scams claiming "free Robux" or requiring personal information.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
