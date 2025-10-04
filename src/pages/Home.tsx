import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LeadCaptureModal } from '@/components/LeadCaptureModal';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, Shield, TrendingUp, Users, CheckCircle2, Star, Trophy, Target, 
  Sparkles, Rocket, Crown, DollarSign, Lock, Clock
} from 'lucide-react';
import robotMiner from '@/assets/robot-miner.png';
import robuxCoins from '@/assets/robux-coins.png';
import heroSvg from '@/assets/hero.svg';

const Home = () => {
  const navigate = useNavigate();
  const [ctaDismissed, setCtaDismissed] = useState(() => 
    sessionStorage.getItem('rmp_cta_dismissed') === '1'
  );
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useFocusTrap(showProviderModal);

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const max = (doc.scrollHeight - doc.clientHeight) || 1;
      const pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
      
      if (progressRef.current) {
        progressRef.current.style.setProperty('--pct', String(pct));
      }
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reveal-on-view
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal'));
    if (!('IntersectionObserver' in window) || !els.length) return;
    
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('in');
      });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Count-up for metrics
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'));
    
    const animate = (el: HTMLElement) => {
      const target = Number(el.dataset.count || 0);
      const dur = 900;
      const start = performance.now();
      
      const step = (t: number) => {
        const p = Math.min(1, (t - start) / dur);
        el.textContent = Math.round(target * (0.08 + 0.92 * p)).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      };
      
      requestAnimationFrame(step);
    };
    
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animate(e.target as HTMLElement);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.6 });
    
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const handleDismissCTA = () => {
    setCtaDismissed(true);
    sessionStorage.setItem('rmp_cta_dismissed', '1');
  };

  const handleCTAClick = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    setShowLeadModal(true);
  };

  const handleCTAKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCTAClick();
    }
  };

  const handleProviderSelect = async (provider: 'google' | 'discord' | 'email') => {
    setShowProviderModal(false);
    
    // Capture lead
    const endpoint = import.meta.env.VITE_LEADS_ENDPOINT_URL;
    if (endpoint) {
      try {
        const params = new URLSearchParams(window.location.search);
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider,
            url: window.location.href,
            referrer: document.referrer || null,
            utm: {
              source: params.get('utm_source'),
              medium: params.get('utm_medium'),
              campaign: params.get('utm_campaign'),
            },
            ts: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.warn('Lead capture failed:', err);
      }
    }
    
    navigate('/auth', { state: { provider } });
  };

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowProviderModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        
        <div className="container relative mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8 animate-slide-up">
              <Badge className="inline-flex items-center gap-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Sparkles className="w-4 h-4" />
                Trusted by 50K+ Users
              </Badge>
              
              <img 
                src={heroSvg} 
                alt="Epic Robux" 
                className="w-full max-w-sm"
              />
              
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                  RobuxMinerPro
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl">
                Learn safe, official ways to get Robux.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 hover-lift"
                  onClick={handleCTAClick}
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  GET RICH
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-6"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-primary" data-count="50000">0</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-primary" data-count="98">0</div>
                  <div className="text-sm text-muted-foreground">% Success</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-primary" data-count="7">0</div>
                  <div className="text-sm text-muted-foreground">Days Avg</div>
                </div>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="relative lg:pl-12 animate-fade-in">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl rounded-full" />
                <img 
                  src={robotMiner} 
                  alt="RobuxMiner robot character" 
                  className="relative w-full max-w-md mx-auto drop-shadow-2xl hover-lift"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-20 lg:py-32 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge className="bg-accent/10 text-accent border-accent/20">Features</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">Everything You Need to Succeed</h2>
            <p className="text-xl text-muted-foreground">
              Professional tools and guidance for legitimate Robux earning
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "100% Safe & Compliant",
                description: "Only official, platform-approved methods. Your account stays protected.",
                color: "text-success"
              },
              {
                icon: Zap,
                title: "Quick Setup",
                description: "Get started in under 60 seconds. No technical knowledge required.",
                color: "text-primary"
              },
              {
                icon: TrendingUp,
                title: "Proven Results",
                description: "98% of users see their first payout within 7 days.",
                color: "text-accent"
              },
              {
                icon: Users,
                title: "Community Support",
                description: "Join 50K+ active members sharing strategies and tips.",
                color: "text-primary-glow"
              },
              {
                icon: Lock,
                title: "Privacy First",
                description: "Your data is encrypted and never shared. Private by default.",
                color: "text-warning"
              },
              {
                icon: Trophy,
                title: "Achievement System",
                description: "Earn badges and unlock rewards as you progress.",
                color: "text-success"
              }
            ].map((feature, idx) => (
              <Card key={idx} className="group hover-lift border-border/50 hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${feature.color} to-${feature.color}/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge className="bg-primary/10 text-primary border-primary/20">Simple Process</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">Start Earning in 3 Steps</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                title: "Connect Your Account",
                description: "Quick & secure signup. Choose your preferred method.",
                icon: Target
              },
              {
                step: "2",
                title: "Follow the Guide",
                description: "Step-by-step instructions for legitimate earning methods.",
                icon: CheckCircle2
              },
              {
                step: "3",
                title: "Get Your Robux",
                description: "Withdraw directly to your account. Fast & hassle-free.",
                icon: DollarSign
              }
            ].map((step, idx) => (
              <div key={idx} className="relative text-center space-y-4">
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-glow text-purple-300 text-3xl font-bold shadow-lg hover-lift">
                  {step.step}
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary to-transparent" />
                )}
                <step.icon className="w-12 h-12 mx-auto text-primary" />
                <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 lg:py-32 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge className="bg-accent/10 text-accent border-accent/20">Pricing</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">Choose Your Plan</h2>
            <p className="text-xl text-muted-foreground">
              Start free, upgrade when you're ready
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Starter",
                price: "Free",
                description: "Perfect for beginners",
                features: [
                  "Basic earning guides",
                  "Community access",
                  "Email support",
                  "Achievement tracking"
                ],
                cta: "Start Free",
                popular: false
              },
              {
                name: "Pro",
                price: "$9.99",
                period: "/month",
                description: "For serious earners",
                features: [
                  "All Starter features",
                  "Advanced strategies",
                  "Priority support",
                  "Squad collaboration",
                  "Analytics dashboard",
                  "Exclusive events"
                ],
                cta: "Go Pro",
                popular: true
              },
              {
                name: "Elite",
                price: "$24.99",
                period: "/month",
                description: "Maximum earning potential",
                features: [
                  "All Pro features",
                  "1-on-1 mentorship",
                  "Custom strategies",
                  "VIP Discord channel",
                  "Early feature access",
                  "Revenue optimization"
                ],
                cta: "Get Elite",
                popular: false
              }
            ].map((plan, idx) => (
              <Card key={idx} className={`relative ${plan.popular ? 'border-primary shadow-xl scale-105 hover-lift' : 'border-border/50 hover:border-primary/50'} transition-all`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground border-primary shadow-lg">
                      <Crown className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-2">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                    onClick={handleCTAClick}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge className="bg-success/10 text-success border-success/20">Testimonials</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">Loved by Thousands</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "Got my first payout in just 6 days. The guides are crystal clear and actually work!",
                author: "Alex M.",
                role: "Pro Member"
              },
              {
                quote: "Finally, a platform that doesn't feel sketchy. Everything is legitimate and transparent.",
                author: "Jordan K.",
                role: "Elite Member"
              },
              {
                quote: "The community alone is worth it. So many helpful people sharing real strategies.",
                author: "Sam R.",
                role: "Pro Member"
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="border-border/50 hover:border-primary/50 transition-all hover-lift">
                <CardHeader>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <CardDescription className="text-base text-foreground">
                    "{testimonial.quote}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-32 border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-primary/10 text-primary border-primary/20">FAQ</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">Common Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Is this allowed by Roblox?",
                a: "Yes. We only share platform-compliant, official earning methods approved by Roblox."
              },
              {
                q: "How fast can I see results?",
                a: "Most users see their first payout within 7 days of following our guides."
              },
              {
                q: "Is my account safe?",
                a: "Absolutely. We use only legitimate methods that comply with platform rules."
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. No contracts or commitments. Cancel with one click."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and cryptocurrency."
              }
            ].map((faq, idx) => (
              <details key={idx} className="group border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
                <summary className="cursor-pointer px-6 py-4 font-semibold text-lg hover:bg-muted/50 flex items-center justify-between">
                  {faq.q}
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 py-4 bg-muted/20 text-muted-foreground border-t border-border">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <Badge className="inline-flex items-center gap-2 bg-primary/20 text-primary border-primary/30">
              <Clock className="w-4 h-4" />
              Limited Time: First Month 50% Off
            </Badge>
            <h2 className="text-4xl lg:text-6xl font-bold">
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join 50,000+ users already earning legitimately with RobuxMinerPro
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                className="text-lg px-12 py-7 hover-lift shadow-xl"
                onClick={handleCTAClick}
              >
                <Rocket className="mr-2 h-6 w-6" />
                Get Started Free
              </Button>
            </div>
            <p className="text-sm text-muted-foreground pt-4">
              No credit card required • Cancel anytime • 30-day money-back guarantee
            </p>
          </div>
        </div>
      </section>

      {/* Sticky CTA - Always visible */}
      {!ctaDismissed && (
        <div className="sticky-cta" role="region" aria-label="Get Rich">
          <button 
            className="btn-primary" 
            onClick={handleCTAClick}
            onKeyDown={handleCTAKeyDown}
            aria-label="Get Rich - Open sign up options"
          >
            GET RICH
          </button>
          <button 
            className="close" 
            aria-label="Dismiss call to action" 
            onClick={handleDismissCTA}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDismissCTA();
              }
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Lead Capture Modal */}
      <LeadCaptureModal 
        open={showLeadModal} 
        onOpenChange={setShowLeadModal} 
      />

      {/* Provider Modal */}
      <Dialog open={showProviderModal} onOpenChange={setShowProviderModal}>
        <DialogContent 
          className="sm:max-w-md" 
          ref={modalRef}
          onKeyDown={handleModalKeyDown}
        >
          <DialogHeader>
            <DialogTitle>Choose your path</DialogTitle>
          </DialogHeader>
          <div className="provider-grid">
            <button 
              className="provider-btn" 
              onClick={() => handleProviderSelect('google')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleProviderSelect('google');
                }
              }}
              aria-label="Continue with Google"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <button 
              className="provider-btn" 
              onClick={() => handleProviderSelect('discord')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleProviderSelect('discord');
                }
              }}
              aria-label="Continue with Discord"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#5865F2" aria-hidden="true">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Continue with Discord
            </button>
            <button 
              className="provider-btn" 
              onClick={() => handleProviderSelect('email')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleProviderSelect('email');
                }
              }}
              aria-label="Continue with Email"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              Continue with Email
            </button>
          </div>
          <p className="trust-line">Earn Robux the right way. Official methods only.</p>
        </DialogContent>
      </Dialog>
      {/* Sticky CTA - Mobile */}
      {!ctaDismissed && (
        <div className="fixed bottom-4 right-4 z-50 sm:hidden animate-slide-up">
          <Button 
            size="lg"
            onClick={handleCTAClick}
            className="shadow-2xl hover-lift"
          >
            <Rocket className="mr-2 h-5 w-5" />
            Get Started
          </Button>
        </div>
      )}

      {/* Lead Capture Modal */}
      <LeadCaptureModal 
        open={showLeadModal} 
        onOpenChange={setShowLeadModal} 
      />

      {/* Provider Modal */}
      <Dialog open={showProviderModal} onOpenChange={setShowProviderModal}>
        <DialogContent 
          className="sm:max-w-md" 
          ref={modalRef}
          onKeyDown={handleModalKeyDown}
        >
          <DialogHeader>
            <DialogTitle>Choose your sign-in method</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Button 
              variant="outline"
              size="lg"
              onClick={() => handleProviderSelect('google')}
              className="justify-start"
            >
              <svg className="mr-3" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={() => handleProviderSelect('discord')}
              className="justify-start"
            >
              <svg className="mr-3" viewBox="0 0 24 24" width="20" height="20" fill="#5865F2" aria-hidden="true">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Continue with Discord
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={() => handleProviderSelect('email')}
              className="justify-start"
            >
              <svg className="mr-3" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              Continue with Email
            </Button>
          </div>
          <p className="text-sm text-center text-muted-foreground pt-2">
            Official, safe methods only
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
