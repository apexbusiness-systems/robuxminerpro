import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LeadCaptureModal } from '@/components/LeadCaptureModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, Shield, TrendingUp, Users, CheckCircle, CheckCircle2, Star, Trophy,
  Rocket, Clock, Sparkles, Target, Crown, DollarSign, Lock
} from 'lucide-react';

import robuxCoins from '@/assets/robux-coins.png';
import { HeroTitle } from '@/components/HeroTitle';
import heroPng from '@/assets/hero.png';
import { useI18n } from '@/i18n/I18nProvider';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const Home = () => {

  const revealRefs = useRef<HTMLElement[]>([]);
  const countRefs = useRef<HTMLElement[]>([]);

  const setRevealRef = useCallback((el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  }, []);

  const setCountRef = useCallback((el: HTMLElement | null) => {
    if (el && !countRefs.current.includes(el)) {
      countRefs.current.push(el);
    }
  }, []);

  const { t } = useI18n();
  const { toast } = useToast();
  const [ctaDismissed, setCtaDismissed] = useState(() => 
    sessionStorage.getItem('rmp_cta_dismissed') === '1'
  );
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

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
    const els = revealRefs.current;
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
    const els = countRefs.current;
    
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

  const handleDismissCTA = useCallback(() => {
    setCtaDismissed(true);
    sessionStorage.setItem('rmp_cta_dismissed', '1');
  }, []);

  const handleCTAClick = useCallback((e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    setShowLeadModal(true);
  }, []);

  const handleCTAKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCTAClick();
    }
  }, [handleCTAClick]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      toast({
        title: 'App installed',
        description: 'RobuxMinerPro is now available from your device home screen.',
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleInstallClick = useCallback(async () => {
    if (!installPrompt) {
      toast({
        title: 'Install unavailable',
        description: 'If the install prompt does not appear automatically, open your browser menu and choose Install App.',
      });
      return;
    }

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }, [installPrompt, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        
        <div className="container relative mx-auto px-4 py-24 lg:py-40 flex justify-center">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 w-full max-w-[1100px]">
            {/* Hero Content */}
            <div className="space-y-8 animate-slide-up flex-1 w-full max-w-2xl">
              <Badge className="inline-flex items-center gap-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Sparkles className="w-4 h-4" />
                {t('home.badge.trusted')}
              </Badge>
              
              <HeroTitle />
              
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                {t('home.hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 hover-lift"
                  onClick={handleCTAClick}
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  {t('home.hero.ctaPrimary')}
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-6 hover-lift"
                  onClick={() => void handleInstallClick()}
                >
                  Download App
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-12 border-t border-border mt-8">
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-primary" data-count="50000" ref={setCountRef}>0</div>
                  <div className="text-sm text-muted-foreground">{t('home.stats.activeUsers')}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-primary" data-count="98" ref={setCountRef}>0</div>
                  <div className="text-sm text-muted-foreground">{t('home.stats.successRate')}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-primary" data-count="7" ref={setCountRef}>0</div>
                  <div className="text-sm text-muted-foreground">{t('home.stats.avgDays')}</div>
                </div>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="relative animate-fade-in flex-1 w-full flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md lg:max-w-[450px]">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl rounded-full" />
                <video 
                  src="/hero-video.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-label={t('home.hero.robotAlt')}
                  className="relative w-full h-auto drop-shadow-2xl hover-lift object-cover rounded-3xl border border-white/10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-24 lg:py-40 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
            <Badge className="bg-accent/10 text-accent-high-contrast border-accent/20">{t('home.features.badge')}</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">{t('home.features.title')}</h2>
            <p className="text-xl text-muted-foreground">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                icon: Shield,
                title: t('home.features.safe.title'),
                description: t('home.features.safe.description'),
                color: "text-emerald-500",
                bg: "bg-emerald-500/10"
              },
              {
                icon: Zap,
                title: t('home.features.setup.title'),
                description: t('home.features.setup.description'),
                color: "text-blue-500",
                bg: "bg-blue-500/10"
              },
              {
                icon: TrendingUp,
                title: t('home.features.results.title'),
                description: t('home.features.results.description'),
                color: "text-purple-500",
                bg: "bg-purple-500/10"
              },
              {
                icon: Users,
                title: t('home.features.community.title'),
                description: t('home.features.community.description'),
                color: "text-pink-500",
                bg: "bg-pink-500/10"
              },
              {
                icon: Lock,
                title: t('home.features.privacy.title'),
                description: t('home.features.privacy.description'),
                color: "text-amber-500",
                bg: "bg-amber-500/10"
              },
              {
                icon: Trophy,
                title: t('home.features.achievements.title'),
                description: t('home.features.achievements.description'),
                color: "text-emerald-500",
                bg: "bg-emerald-500/10"
              }
            ].map((feature, idx) => (
              <Card key={idx} className="group hover-lift transition-all bg-card border-border/50 shadow-lg relative overflow-hidden">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl text-card-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 lg:py-40 bg-gradient-to-b from-background to-muted/20 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
            <Badge className="bg-primary/10 text-primary border-primary/20">{t('home.howItWorks.badge')}</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">{t('home.howItWorks.title')}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                title: t('home.howItWorks.step1.title'),
                description: t('home.howItWorks.step1.description'),
                icon: Target
              },
              {
                step: "2",
                title: t('home.howItWorks.step2.title'),
                description: t('home.howItWorks.step2.description'),
                icon: CheckCircle2
              },
              {
                step: "3",
                title: t('home.howItWorks.step3.title'),
                description: t('home.howItWorks.step3.description'),
                icon: DollarSign
              }
            ].map((step, idx) => (
              <div key={idx} className="relative text-center space-y-6">
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
      <section id="pricing" className="py-24 lg:py-40 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
            <Badge className="bg-accent/10 text-accent-high-contrast border-accent/20">{t('home.pricing.badge')}</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">{t('home.pricing.title')}</h2>
            <p className="text-xl text-muted-foreground">
              {t('home.pricing.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {[
              {
                name: t('home.pricing.starter.name'),
                price: "Free",
                description: t('home.pricing.starter.description'),
                features: [
                  t('home.pricing.starter.features.0'),
                  t('home.pricing.starter.features.1'),
                  t('home.pricing.starter.features.2'),
                  t('home.pricing.starter.features.3')
                ],
                cta: t('home.pricing.starter.cta'),
                popular: false
              },
              {
                name: t('home.pricing.pro.name'),
                price: "$9.99",
                period: "/month",
                description: t('home.pricing.pro.description'),
                features: [
                  t('home.pricing.pro.features.0'),
                  t('home.pricing.pro.features.1'),
                  t('home.pricing.pro.features.2'),
                  t('home.pricing.pro.features.3'),
                  t('home.pricing.pro.features.4'),
                  t('home.pricing.pro.features.5')
                ],
                cta: t('home.pricing.pro.cta'),
                popular: true
              },
              {
                name: t('home.pricing.elite.name'),
                price: "$24.99",
                period: "/month",
                description: t('home.pricing.elite.description'),
                features: [
                  t('home.pricing.elite.features.0'),
                  t('home.pricing.elite.features.1'),
                  t('home.pricing.elite.features.2'),
                  t('home.pricing.elite.features.3'),
                  t('home.pricing.elite.features.4'),
                  t('home.pricing.elite.features.5')
                ],
                cta: t('home.pricing.elite.cta'),
                popular: false
              }
            ].map((plan, idx) => (
              <Card key={idx} className={`relative ${plan.popular ? 'border-primary shadow-xl scale-105 hover-lift bg-card' : 'bg-card border-border/50 hover:border-primary/50'} transition-all`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground border-primary shadow-lg">
                      <Crown className="w-3 h-3 mr-1" />
                      {t('home.pricing.popular')}
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
      <section id="testimonials" className="py-24 lg:py-40 bg-gradient-to-b from-background to-muted/20 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
            <Badge className="bg-success/10 text-success-high-contrast border-success/20">{t('home.testimonials.badge')}</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">{t('home.testimonials.title')}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: t('home.testimonials.quote1'),
                author: t('home.testimonials.author1'),
                role: t('home.testimonials.role1')
              },
              {
                quote: t('home.testimonials.quote2'),
                author: t('home.testimonials.author2'),
                role: t('home.testimonials.role2')
              },
              {
                quote: t('home.testimonials.quote3'),
                author: t('home.testimonials.author3'),
                role: t('home.testimonials.role3')
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="bg-card border-border/50 hover:border-primary/50 transition-all hover-lift shadow-sm">
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
      <section id="faq" className="py-20 lg:py-32 border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-primary/10 text-primary border-primary/20">{t('home.faq.badge')}</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">{t('home.faq.title')}</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: t('home.faq.q1'),
                a: t('home.faq.a1')
              },
              {
                q: t('home.faq.q2'),
                a: t('home.faq.a2')
              },
              {
                q: t('home.faq.q3'),
                a: t('home.faq.a3')
              },
              {
                q: t('home.faq.q4'),
                a: t('home.faq.a4')
              },
              {
                q: t('home.faq.q5'),
                a: t('home.faq.a5')
              }
            ].map((faq, idx) => (
              <details key={idx} className="group border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
                <summary className="cursor-pointer px-6 py-4 font-semibold text-lg hover:bg-muted/50 flex items-center justify-between">
                  {faq.q}
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">â–¼</span>
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
              {t('home.finalCta.badge')}
            </Badge>
            <h2 className="text-4xl lg:text-6xl font-bold">
              {t('home.finalCta.title')}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('home.finalCta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                className="text-lg px-12 py-7 hover-lift shadow-xl"
                onClick={handleCTAClick}
              >
                <Rocket className="mr-2 h-6 w-6" />
                {t('home.finalCta.cta')}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground pt-4">
              {t('home.finalCta.note')}
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
            aria-label={t('home.stickyCta.aria')}
          >
            {t('home.stickyCta.label')}
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
            Ã—
          </button>
        </div>
      )}

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

    </div>
  );
};

export default Home;
