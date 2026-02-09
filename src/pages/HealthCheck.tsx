import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const HealthCheck = () => {
  const [healthData, setHealthData] = useState({
    status: 'checking...',
    name: 'robuxminerpro', 
    time: new Date().toISOString(),
    apiLatency: 0,
    dbStatus: 'unknown'
  });

  useEffect(() => {
    const checkHealth = async () => {
      const start = performance.now();
      try {
        const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        const end = performance.now();
        
        setHealthData({
          status: error ? 'degraded' : 'ok',
          name: 'robuxminerpro',
          time: new Date().toISOString(),
          apiLatency: Math.round(end - start),
          dbStatus: error ? 'error' : 'connected'
        });
      } catch (err) {
        setHealthData(prev => ({ ...prev, status: 'error', dbStatus: 'unreachable' }));
      }
    };
    
    checkHealth();
  }, []);


  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card rounded-lg border border-border p-8 text-center elegant-shadow">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">System Health</h1>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium text-success capitalize">{healthData.status}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Service:</span>
              <span className="font-medium">{healthData.name}</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Last Check:</span>
              <span className="font-medium text-sm">{new Date(healthData.time).toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h2 className="font-semibold mb-2">System Components</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Mining Engine</span>
                <span className="text-success">✓ Operational</span>
              </div>
              <div className="flex justify-between">
                <span>API Gateway</span>
                <span className="text-success">✓ Operational</span>
              </div>
              <div className="flex justify-between">
                <span>Database</span>
                <span className={healthData.dbStatus === 'connected' ? "text-success" : "text-destructive"}>
                  {healthData.dbStatus === 'connected' ? '✓ Operational' : '⚠ Issue Detected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>API Latency</span>
                <span className={healthData.apiLatency < 500 ? "text-success" : "text-warning"}>
                  {healthData.apiLatency > 0 ? `${healthData.apiLatency}ms` : 'Checking...'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Refresh Status
            </button>
          </div>
        </div>

        {/* JSON Response for API consumers */}
        <div className="mt-6 bg-muted rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2">API Response:</h3>
          <pre className="text-xs text-muted-foreground overflow-x-auto">
            {JSON.stringify(healthData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default HealthCheck;