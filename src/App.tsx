import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ChatDock from '@/shared/ChatDock';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import AuthPage from '@/components/auth/AuthPage';
import { I18nProvider } from '@/i18n/I18nProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { APP_ROUTES, RouteId } from '@/config/routes';

const RouteComponents: Record<RouteId, React.LazyExoticComponent<() => JSX.Element>> = {
  home: lazy(() => import('./pages/Home')),
  features: lazy(() => import('./pages/Features')),
  pricing: lazy(() => import('./pages/Pricing')),
  privacy: lazy(() => import('./pages/Privacy')),
  terms: lazy(() => import('./pages/Terms')),
  status: lazy(() => import('./pages/Status')),
  health: lazy(() => import('./pages/HealthCheck')),
  auth: lazy(() => Promise.resolve({ default: AuthPage })),
  dashboard: lazy(() => import('./pages/Dashboard')),
  squads: lazy(() => import('./pages/Squads')),
  achievements: lazy(() => import('./pages/Achievements')),
  learn: lazy(() => import('./pages/Learn')),
  events: lazy(() => import('./pages/Events')),
  payments: lazy(() => import('./pages/Payments')),
  mentor: lazy(() => import('./pages/Mentor')),
  profile: lazy(() => import('./pages/Profile')),
  settings: lazy(() => import('./pages/Settings')),
};

const NotFound = lazy(() => import('./pages/NotFound'));
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, gcTime: 5 * 60_000, retry: 1, refetchOnWindowFocus: false, refetchOnReconnect: true }, mutations: { retry: 0 } } });
const AuthGatedChatDock = ({ open, onClose }: { open: boolean; onClose: () => void }) => { const { user, loading } = useAuth(); if (loading || !user) return null; return <ChatDock open={open} onClose={onClose} />; };
const LoadingSpinner = () => <div className="flex items-center justify-center min-h-[200px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <QueryClientProvider client={queryClient}><TooltipProvider><I18nProvider><ThemeProvider defaultTheme="dark" storageKey="rmp-theme"><ErrorBoundary><Toaster /><BrowserRouter><AuthProvider><div className="flex flex-col min-h-screen"><Navigation /><main id="main" className="flex-1" tabIndex={-1}><Suspense fallback={<LoadingSpinner />}><Routes>{Object.values(APP_ROUTES).map((route) => { const Component = route.id === 'auth' ? AuthPage : RouteComponents[route.id]; const element = route.isProtected ? <ProtectedRoute><Component /></ProtectedRoute> : route.id === 'auth' ? <ProtectedRoute requireAuth={false}><Component /></ProtectedRoute> : <Component />; return <Route key={route.id} path={route.path} element={element} />; })}<Route path="*" element={<NotFound />} /></Routes></Suspense></main><Footer />
      <AuthGatedChatDock open={isOpen} onClose={() => setIsOpen(false)} />
      </div></AuthProvider></BrowserRouter></ErrorBoundary></ThemeProvider></I18nProvider></TooltipProvider></QueryClientProvider>
  );
};
export default App;
