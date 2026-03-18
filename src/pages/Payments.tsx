import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Payments() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Payments</h1>
      
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💳</span>
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-600">⚠️</span>
                <span className="font-medium text-yellow-800">Security Notice</span>
              </div>
              <p className="text-yellow-700 text-sm">
                Checkout is handled server-side for security. Stripe keys are never exposed client-side.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Premium Mining Boost</h3>
                  <p className="text-sm text-muted-foreground">3x mining speed for 30 days</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">$9.99</div>
                  <Button disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Mega Mining Pack</h3>
                  <p className="text-sm text-muted-foreground">10x mining speed for 7 days</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">$4.99</div>
                  <Button disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Starter Boost</h3>
                  <p className="text-sm text-muted-foreground">2x mining speed for 7 days</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">$1.99</div>
                  <Button disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No payment history available yet.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}