import { useState, useEffect } from 'react';

interface StatusItem {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  uptime: string;
}

const Status = () => {
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString());
  }, []);

  const statusItems: StatusItem[] = [
    { name: 'Mining Service', status: 'operational', uptime: '99.98%' },
    { name: 'API Gateway', status: 'operational', uptime: '99.95%' },
    { name: 'User Dashboard', status: 'operational', uptime: '99.99%' },
    { name: 'Payment Processing', status: 'operational', uptime: '99.97%' },
    { name: 'Support System', status: 'operational', uptime: '99.94%' },
    { name: 'Analytics Engine', status: 'operational', uptime: '99.96%' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-success';
      case 'degraded':
        return 'text-warning';
      case 'outage':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'degraded':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'outage':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const overallStatus = statusItems.every(item => item.status === 'operational') 
    ? 'All Systems Operational' 
    : 'Some Systems Experiencing Issues';

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            System Status
          </h1>
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-success/10 text-success animate-slide-up">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{overallStatus}</span>
          </div>
          <p className="text-muted-foreground mt-4">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {statusItems.map((item, index) => (
            <div 
              key={index}
              className="p-6 rounded-lg border border-border elegant-shadow animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{item.name}</h3>
                <div className={`flex items-center space-x-1 ${getStatusColor(item.status)}`}>
                  {getStatusIcon(item.status)}
                  <span className="text-sm font-medium capitalize">{item.status}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">30-day uptime</span>
                <span className="text-sm font-medium">{item.uptime}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Metrics Section */}
        <div className="bg-muted/50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">99.97%</div>
              <div className="text-sm text-muted-foreground">Average Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">42ms</div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">0</div>
              <div className="text-sm text-muted-foreground">Major Incidents</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Monitoring</div>
            </div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Recent Incidents</h2>
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <svg className="w-16 h-16 text-success mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">No Recent Incidents</h3>
            <p className="text-muted-foreground">
              All systems have been running smoothly. No incidents reported in the last 30 days.
            </p>
          </div>
        </div>

        {/* Subscribe for Updates */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Stay Updated</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Subscribe to receive notifications about planned maintenance and system updates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Status;