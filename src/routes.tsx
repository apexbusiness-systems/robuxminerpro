import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Mentor = lazy(() => import('./pages/Mentor'));
const Squads = lazy(() => import('./pages/Squads'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Learn = lazy(() => import('./pages/Learn'));
const Events = lazy(() => import('./pages/Events'));
const Payments = lazy(() => import('./pages/Payments'));
const NotFound = lazy(() => import('./pages/NotFound'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
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
  );
}