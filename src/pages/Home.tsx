import { useState, useEffect } from 'react';

const Home = () => {
  const [apiBase, setApiBase] = useState<string | undefined>();

  useEffect(() => {
    const envApiBase = import.meta.env.VITE_API_BASE;
    setApiBase(envApiBase);
    if (envApiBase) {
      console.log('API Base URL:', envApiBase);
    } else {
      console.log('VITE_API_BASE not set - using default configuration');
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Mine Robux with
              <span className="block text-primary-glow glow-effect">
                Unmatched Speed
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-slide-up">
              The most efficient and reliable Robux mining platform. 
              <span className="block mt-2">Fast processing, simple interface, always online.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <button className="inline-flex items-center justify-center rounded-md text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 py-3 glow-effect">
                Start Mining Now
              </button>
              <button className="inline-flex items-center justify-center rounded-md text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-white/20 text-white hover:bg-white/10 h-12 px-8 py-3">
                View Features
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose RobuxMiner?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for performance, designed for simplicity, optimized for results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-6 rounded-lg border border-border elegant-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Optimized algorithms ensure maximum mining speed and efficiency.
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-lg border border-border elegant-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">100% Reliable</h3>
              <p className="text-muted-foreground">
                99.9% uptime guarantee with redundant systems and failover protection.
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-lg border border-border elegant-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Secure & Safe</h3>
              <p className="text-muted-foreground">
                Enterprise-grade security with encrypted connections and data protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Mining?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of satisfied users who trust RobuxMiner for their mining needs.
            </p>
            <button className="inline-flex items-center justify-center rounded-md text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 py-3 glow-effect">
              Get Started Today
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;