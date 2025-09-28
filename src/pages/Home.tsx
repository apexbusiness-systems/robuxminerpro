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
      <section style={{padding:"min(6vh,48px) 0"}}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="hero-title">RobuxMinerPro</h1>
          <p className="hero-tagline">
            Fast, minimal, launch-ready.
          </p>
        </div>
      </section>

      {/* Features Preview */}
      <section className="bg-background defer" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-6)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center" style={{ marginBottom: 'var(--space-6)' }}>
            <h2 className="font-bold" style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-4)' }}>Why Choose RobuxMinerPro?</h2>
            <p className="muted max-w-2xl mx-auto" style={{ fontSize: 'var(--font-size-md)' }}>
              Built for performance, designed for simplicity, optimized for results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center surface elegant-shadow" style={{ padding: 'var(--space-6)', gap: 'var(--space-4)', display: 'flex', flexDirection: 'column' }}>
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

            <div className="text-center surface elegant-shadow" style={{ padding: 'var(--space-6)', gap: 'var(--space-4)', display: 'flex', flexDirection: 'column' }}>
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

            <div className="text-center surface elegant-shadow" style={{ padding: 'var(--space-6)', gap: 'var(--space-4)', display: 'flex', flexDirection: 'column' }}>
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
      <section className="bg-muted/50 defer" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-6)' }}>
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-bold" style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-6)' }}>
              Ready to Start Mining?
            </h2>
            <p className="muted" style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-6)' }}>
              Join thousands of satisfied users who trust RobuxMinerPro for their mining needs.
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