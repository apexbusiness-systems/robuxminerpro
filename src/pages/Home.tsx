import { useState, useEffect, useRef } from 'react';
import '../styles/landing.css';

const Home = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [ctaDismissed, setCtaDismissed] = useState(false);
  const [earningStat, setEarningStat] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('cta-dismissed');
    if (dismissed) setCtaDismissed(true);

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / docHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
      setShowStickyCTA(scrolled > window.innerHeight * 0.4);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.quest, .achievement-badge, .testimonial-card, .faq-item').forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    const target = 2547;
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setEarningStat(target);
        clearInterval(timer);
      } else {
        setEarningStat(Math.floor(current));
      }
    }, 30);
    return () => clearInterval(timer);
  }, []);

  const handleDismissCTA = () => {
    setCtaDismissed(true);
    sessionStorage.setItem('cta-dismissed', 'true');
  };

  return (
    <div className="scrollytelling-container">
      {/* Scroll Progress */}
      <div className="scroll-progress-container" aria-label="Reading progress">
        <svg className="scroll-progress-ring" width="40" height="40">
          <circle
            className="scroll-progress-bg"
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            opacity="0.2"
          />
          <circle
            className="scroll-progress-bar"
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 16}`}
            strokeDashoffset={`${2 * Math.PI * 16 * (1 - scrollProgress / 100)}`}
            transform="rotate(-90 20 20)"
            aria-valuenow={Math.round(scrollProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </svg>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="container mx-auto px-4 text-center">
          <h1 className="hero-headline">Your Quest to Earn Robux Begins Here</h1>
          <p className="hero-subhead">
            Fast, simple, ready to launch. Join thousands mining safely every day.
          </p>
          <button className="cta-primary">Start Quest</button>
        </div>
      </section>

      {/* Quest 1: Connect Account */}
      <section className="quest quest-1">
        <div className="container mx-auto px-4">
          <div className="quest-content">
            <span className="quest-number">Quest 1</span>
            <h2 className="quest-title">Connect Your Account</h2>
            <ul className="quest-benefits">
              <li>
                <svg className="benefit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Instant setup in under 60 seconds</span>
              </li>
              <li>
                <svg className="benefit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Bank-grade encryption protects your data</span>
              </li>
              <li>
                <svg className="benefit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Full control—disconnect anytime</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Quest 2: Earn While You Play */}
      <section className="quest quest-2">
        <div className="container mx-auto px-4">
          <div className="quest-content">
            <span className="quest-number">Quest 2</span>
            <h2 className="quest-title">Earn While You Play</h2>
            <div className="stat-showcase" data-animate>
              <div className="stat-number">{earningStat.toLocaleString()}</div>
              <div className="stat-label">Robux earned today by our community</div>
            </div>
            <p className="quest-description">
              Our automated system runs 24/7, so you earn even when you're offline.
            </p>
          </div>
        </div>
      </section>

      {/* Quest 3: Withdraw Safely */}
      <section className="quest quest-3">
        <div className="container mx-auto px-4">
          <div className="quest-content">
            <span className="quest-number">Quest 3</span>
            <h2 className="quest-title">Withdraw Safely</h2>
            <div className="step-cards">
              <div className="step-card">
                <div className="step-number">1</div>
                <h3 className="step-title">Request Withdrawal</h3>
                <p className="step-description">Choose your amount and confirm</p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <h3 className="step-title">Instant Processing</h3>
                <p className="step-description">Our system verifies in seconds</p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <h3 className="step-title">Receive Robux</h3>
                <p className="step-description">Delivered to your account securely</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="achievements">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Unlock Achievements</h2>
          <div className="achievement-scroller">
            <div className="achievement-badge">🏆 First Quest</div>
            <div className="achievement-badge">⚡ Speed Miner</div>
            <div className="achievement-badge">💎 Diamond Tier</div>
            <div className="achievement-badge">🔥 Streak Master</div>
            <div className="achievement-badge">🌟 Elite Member</div>
            <div className="achievement-badge">🎯 Perfect Score</div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="social-proof">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Trusted by Thousands</h2>
          <div className="testimonials">
            <div className="testimonial-card">
              <p className="testimonial-text">"Made 5,000 Robux in my first week. Amazing!"</p>
              <div className="testimonial-author">— Alex M.</div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">"Super easy to use. Withdrawals are instant."</p>
              <div className="testimonial-author">— Jamie L.</div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">"Finally a platform that actually works."</p>
              <div className="testimonial-author">— Taylor R.</div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">"Been using for 3 months, never had issues."</p>
              <div className="testimonial-author">— Morgan K.</div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">"Customer support is top-notch!"</p>
              <div className="testimonial-author">— Casey P.</div>
            </div>
            <div className="testimonial-card">
              <p className="testimonial-text">"My friends all use it now too."</p>
              <div className="testimonial-author">— River S.</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            <details className="faq-item">
              <summary className="faq-question">Is RobuxMinerPro safe to use?</summary>
              <p className="faq-answer">
                Yes, we use bank-grade encryption and never store your password. Your account stays secure.
              </p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">How long does it take to earn Robux?</summary>
              <p className="faq-answer">
                Most users see their first earnings within 24 hours. The system runs automatically.
              </p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">Are there any hidden fees?</summary>
              <p className="faq-answer">
                No hidden fees. What you earn is what you get. Check our pricing page for plan details.
              </p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">Can I use this on mobile?</summary>
              <p className="faq-answer">
                Absolutely! Our platform works perfectly on phones, tablets, and desktops.
              </p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">What if I want to stop using the service?</summary>
              <p className="faq-answer">
                You can disconnect your account anytime with one click. No questions asked.
              </p>
            </details>
            <details className="faq-item">
              <summary className="faq-question">How do I contact support?</summary>
              <p className="faq-answer">
                Our support team is available 24/7 via chat, email, or the help center.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="container mx-auto px-4 text-center">
          <h2 className="final-cta-headline">Ready to Start Your Quest?</h2>
          <p className="final-cta-subhead">
            Join thousands earning Robux safely. Your adventure begins now.
          </p>
          <button className="cta-primary cta-large">Start Quest</button>
        </div>
      </section>

      {/* Sticky CTA */}
      {showStickyCTA && !ctaDismissed && (
        <button id="sticky-cta" className="sticky-cta">
          <span>Start Quest</span>
          <button
            className="sticky-cta-dismiss"
            onClick={handleDismissCTA}
            aria-label="Dismiss"
          >
            ×
          </button>
        </button>
      )}
    </div>
  );
};

export default Home;
