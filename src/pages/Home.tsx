import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Home = () => {
  const navigate = useNavigate();
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [ctaDismissed, setCtaDismissed] = useState(() => 
    sessionStorage.getItem('rmp_cta_dismissed') === '1'
  );
  const [showProviderModal, setShowProviderModal] = useState(false);
  const progressRef = useRef<HTMLDivElement | null>(null);

  // Scroll progress + sticky CTA threshold
  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const max = (doc.scrollHeight - doc.clientHeight) || 1;
      const pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
      
      if (progressRef.current) {
        progressRef.current.style.setProperty('--pct', String(pct));
      }
      
      setShowStickyCTA(!ctaDismissed && pct > 40);
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ctaDismissed]);

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

  const handleCTAClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowProviderModal(true);
  };

  const handleProviderSelect = (provider: 'google' | 'discord' | 'email') => {
    setShowProviderModal(false);
    navigate('/auth', { state: { provider } });
  };

  return (
    <>
      {/* Progress ring */}
      <div className="progress-ring" ref={progressRef} aria-hidden="true" />

      {/* HERO */}
      <section className="hero reveal">
        <h1>Level up your Robux earnings</h1>
        <p>Simple steps. Safe strategies. Real results.</p>
        <div className="cta-row">
          <button className="btn-primary big" onClick={handleCTAClick} aria-label="Get Rich">GET RICH</button>
        </div>
      </section>

      {/* QUEST 1 */}
      <section className="quest quest-1 reveal">
        <h2>Quest 1 · Connect</h2>
        <ul className="bullets">
          <li>One account, zero hassle</li>
          <li>Private by default</li>
          <li>Setup in under a minute</li>
        </ul>
      </section>

      {/* QUEST 2 */}
      <section className="quest quest-2 reveal">
        <h2>Quest 2 · Earn</h2>
        <div className="stats">
          <div className="stat">
            <span data-count="1200" className="count" aria-label="Active earners">0</span>
            <small>Active earners</small>
          </div>
          <div className="stat">
            <span data-count="98" className="count" aria-label="Success rate percent">0</span>
            <small>% success rate</small>
          </div>
          <div className="stat">
            <span data-count="7" className="count" aria-label="Days to first payout">0</span>
            <small>days to payout</small>
          </div>
        </div>
        <p className="note">No generators. Official, legit methods only.</p>
      </section>

      {/* QUEST 3 */}
      <section className="quest quest-3 reveal">
        <h2>Quest 3 · Withdraw</h2>
        <div className="steps">
          <article className="step">
            <h3>1</h3>
            <p>Pick a cash-out method</p>
          </article>
          <article className="step">
            <h3>2</h3>
            <p>Verify in-app</p>
          </article>
          <article className="step">
            <h3>3</h3>
            <p>Done—no surprises</p>
          </article>
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section className="achievements reveal" aria-label="Achievements">
        <h2>Achievements</h2>
        <div className="badges">
          <div className="badge">Starter</div>
          <div className="badge">Streak 7</div>
          <div className="badge">Top 10%</div>
          <div className="badge">Speedrunner</div>
          <div className="badge">Team Player</div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="social-proof reveal">
        <h2>Loved by players</h2>
        <div className="cards">
          <blockquote>"Clear steps—my first payout in a week."</blockquote>
          <blockquote>"No hype. Just steady gains."</blockquote>
          <blockquote>"Safer than anything I tried before."</blockquote>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq reveal">
        <h2>FAQ</h2>
        <details>
          <summary>Is this allowed?</summary>
          <p>We share safe, platform-compliant strategies only.</p>
        </details>
        <details>
          <summary>How fast do I see results?</summary>
          <p>Most users see traction within the first 7 days.</p>
        </details>
        <details>
          <summary>Is my data private?</summary>
          <p>Yes. Private by default with minimal required data.</p>
        </details>
        <details>
          <summary>Can I cancel anytime?</summary>
          <p>Absolutely. No lock-in, cancel with one click.</p>
        </details>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta reveal">
        <button className="btn-primary huge" onClick={handleCTAClick} aria-label="Get Rich">GET RICH</button>
      </section>

      {/* Sticky CTA */}
      {showStickyCTA && (
        <div className="sticky-cta" role="region" aria-label="Get Rich">
          <button className="close" aria-label="Dismiss" onClick={handleDismissCTA}>×</button>
          <button className="btn-primary" onClick={handleCTAClick}>GET RICH</button>
        </div>
      )}

      {/* Provider Modal */}
      <Dialog open={showProviderModal} onOpenChange={setShowProviderModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose your path</DialogTitle>
          </DialogHeader>
          <div className="provider-grid">
            <button 
              className="provider-btn" 
              onClick={() => handleProviderSelect('google')}
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
              aria-label="Continue with Email"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              Continue with Email
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Home;
