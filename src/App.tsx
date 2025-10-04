import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useState } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import ChatDock from "@/shared/ChatDock";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthPage from "@/components/auth/AuthPage";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Features = lazy(() => import("./pages/Features"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const HealthCheck = lazy(() => import("./pages/HealthCheck"));
const Status = lazy(() => import("./pages/Status"));

// Lazy load authenticated pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Squads = lazy(() => import("./pages/Squads"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Learn = lazy(() => import("./pages/Learn"));
const Events = lazy(() => import("./pages/Events"));
const Payments = lazy(() => import("./pages/Payments"));
const Mentor = lazy(() => import("./pages/Mentor"));

const queryClient = new QueryClient();

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <div className="flex flex-col min-h-screen">
                <Navigation />
                
                <main id="main" className="flex-1">
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/features" element={<Features />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/status" element={<Status />} />
                      <Route path="/health" element={<HealthCheck />} />
                      
                      {/* Auth route */}
                      <Route path="/auth" element={
                        <ProtectedRoute requireAuth={false}>
                          <AuthPage />
                        </ProtectedRoute>
                      } />
                      
                      {/* Protected routes */}
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/squads" element={
                        <ProtectedRoute>
                          <Squads />
                        </ProtectedRoute>
                      } />
                      <Route path="/achievements" element={
                        <ProtectedRoute>
                          <Achievements />
                        </ProtectedRoute>
                      } />
                      <Route path="/learn" element={
                        <ProtectedRoute>
                          <Learn />
                        </ProtectedRoute>
                      } />
                      <Route path="/events" element={
                        <ProtectedRoute>
                          <Events />
                        </ProtectedRoute>
                      } />
                      <Route path="/payments" element={
                        <ProtectedRoute>
                          <Payments />
                        </ProtectedRoute>
                      } />
                      <Route path="/mentor" element={
                        <ProtectedRoute>
                          <Mentor />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </main>
                
                <Footer />
                
                <ChatDock open={isOpen} onClose={() => setIsOpen(false)} />
              </div>
            </AuthProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;