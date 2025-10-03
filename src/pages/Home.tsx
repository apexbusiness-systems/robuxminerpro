import { useState, useEffect, useRef } from 'react';
import '../styles/landing.css';

const Home = () => {
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [ctaDismissed, setCtaDismissed] = useState(() => 
    sessionStorage.getItem('rmp_cta_dismissed') === '1'
  );
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

  return (
    <>
      {/* Progress ring */}
      <div className="progress-ring" ref={progressRef} aria-hidden="true" />

      {/* HERO */}
      <section className="hero reveal">
        <h1>Level up your Robux earnings</h1>
        <p>Simple steps. Safe strategies. Real results.</p>
        <div className="cta-row">
          <a className="btn-primary big" href="/auth" aria-label="Start Quest">Start Quest</a>
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
        <a className="btn-primary huge" href="/auth" aria-label="Start Quest">Start Quest</a>
      </section>

      {/* Sticky CTA */}
      {showStickyCTA && (
        <div className="sticky-cta" role="region" aria-label="Start Quest">
          <button className="close" aria-label="Dismiss" onClick={handleDismissCTA}>×</button>
          <a className="btn-primary" href="/auth">Start Quest</a>
        </div>
      )}
    </>
  );
};

export default Home;
