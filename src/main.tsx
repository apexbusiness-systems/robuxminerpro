import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, NavLink, Link } from "react-router-dom";
import { Suspense, useEffect, useState, lazy } from "react";
import "./index.css";
import "./styles/tokens.css";
import { ChatDock } from "./shared/ChatDock";
import Footer from "./components/Footer";

// Dev guardrails
if (import.meta.env.DEV) {
  import('./dev/guardrails').then(m => m.runGuardrails());
}

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Squads = lazy(() => import("./pages/Squads"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Learn = lazy(() => import("./pages/Learn"));
const Events = lazy(() => import("./pages/Events"));
const Payments = lazy(() => import("./pages/Payments"));

function AppShell(){
  const [open,setOpen]=useState(false);

  // Keyboard shortcut: press "m" to open Mentor; "Esc" to close
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if((e.key==='m' || e.key==='M') && !e.metaKey && !e.ctrlKey){ e.preventDefault(); setOpen(true); }
      if(e.key==='Escape'){ setOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[]);

  const navClass = ({isActive}:{isActive:boolean}) => "nav-link"+(isActive?" active":"");

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      
      <header className="app-header">
        <div className="app-header__inner">
          <Link to="/" className="brand">RobuxMinerPro</Link>

          <nav className="nav" aria-label="Main navigation">
            <NavLink to="/" className={navClass} end>Dashboard</NavLink>
            <NavLink to="/squads" className={navClass}>Squads</NavLink>
            <NavLink to="/achievements" className={navClass}>Achievements</NavLink>
            <NavLink to="/learn" className={navClass}>Learn</NavLink>
            <NavLink to="/events" className={navClass}>Events</NavLink>
            <NavLink to="/payments" className={navClass}>Payments</NavLink>
          </nav>

          <button className="cta-mentor primary-button" onClick={()=>setOpen(true)} aria-label="Ask Robux Mentor" title="Ask Robux Mentor (M)">
            {/* sparkle icon (inline SVG, no deps) */}
            <svg className="sparkle" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3l2.2 4.6L19 9.8l-4.3 2.1L12 17l-2.7-5.1L5 9.8l4.8-.2L12 3z" fill="currentColor" opacity=".95"/>
            </svg>
            <span>Ask Robux Mentor</span>
          </button>
        </div>
      </header>

      <main id="main" className="surface" style={{padding:16}}>
        <Suspense fallback={<p className="muted">Loading…</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/squads" element={<Squads />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/events" element={<Events />} />
            <Route path="/payments" element={<Payments />} />
          </Routes>
        </Suspense>
      </main>

      {/* Mobile FAB (optional; keep both) */}
      <button className="mentor-fab primary-button" aria-label="Ask Robux Mentor" onClick={()=>setOpen(true)}>
        {/* chat bubble icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-5 5V5z" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      <Footer />

      <ChatDock isOpen={open} onClose={()=>setOpen(false)} />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);
