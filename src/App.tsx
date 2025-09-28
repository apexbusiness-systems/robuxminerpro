import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { lazy, Suspense, useState } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ChatDock } from "@/shared/ChatDock";
import { Button } from "@/components/ui/button";

// Lazy load existing pages
const Home = lazy(() => import("./pages/Home"));
const Features = lazy(() => import("./pages/Features"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Status = lazy(() => import("./pages/Status"));
const HealthCheck = lazy(() => import("./pages/HealthCheck"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load new feature pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Mentor = lazy(() => import("./pages/Mentor"));
const Squads = lazy(() => import("./pages/Squads"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Learn = lazy(() => import("./pages/Learn"));
const Events = lazy(() => import("./pages/Events"));
const Payments = lazy(() => import("./pages/Payments"));

const queryClient = new QueryClient();

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <Header />
              
              {/* Feature navigation bar */}
              <nav className="bg-card border-b p-4">
                <div className="container mx-auto flex items-center justify-between">
                  <div className="flex gap-4">
                    <Link to="/dashboard" className="text-foreground hover:text-primary">Dashboard</Link>
                    <Link to="/squads" className="text-foreground hover:text-primary">Squads</Link>
                    <Link to="/achievements" className="text-foreground hover:text-primary">Achievements</Link>
                    <Link to="/learn" className="text-foreground hover:text-primary">Learn</Link>
                    <Link to="/events" className="text-foreground hover:text-primary">Events</Link>
                    <Link to="/payments" className="text-foreground hover:text-primary">Payments</Link>
                  </div>
                  <Button onClick={() => setIsChatOpen(true)}>
                    Open Mentor
                  </Button>
                </div>
              </nav>
              
              <main id="main" className="flex-1">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Existing routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/status" element={<Status />} />
                    <Route path="/healthz" element={<HealthCheck />} />
                    
                    {/* New feature routes */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/mentor" element={<Mentor />} />
                    <Route path="/squads" element={<Squads />} />
                    <Route path="/achievements" element={<Achievements />} />
                    <Route path="/learn" element={<Learn />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/payments" element={<Payments />} />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
              
              {/* ChatDock Portal */}
              <ChatDock isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            </div>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
