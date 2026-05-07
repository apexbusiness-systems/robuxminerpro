import { ElementType } from 'react';
import { Home, LayoutDashboard, Target, BookOpen, Calendar, CreditCard, MessageSquare, User, Settings, Users, FileText, Shield, Activity, HelpCircle, LogIn } from 'lucide-react';

export type RouteId =
  | 'home'
  | 'features'
  | 'pricing'
  | 'privacy'
  | 'terms'
  | 'status'
  | 'health'
  | 'auth'
  | 'dashboard'
  | 'squads'
  | 'achievements'
  | 'learn'
  | 'events'
  | 'payments'
  | 'mentor'
  | 'profile'
  | 'settings';

export interface RouteMetadata {
  id: RouteId;
  path: string;
  isProtected: boolean;
  navLabel?: string;
  icon?: ElementType;
  showInNav?: boolean;
}

export const APP_ROUTES: Record<RouteId, RouteMetadata> = {
  // Public
  home: { id: 'home', path: '/', isProtected: false, navLabel: 'Home', showInNav: false },
  features: { id: 'features', path: '/features', isProtected: false, navLabel: 'Features', showInNav: true },
  pricing: { id: 'pricing', path: '/pricing', isProtected: false, navLabel: 'Pricing', showInNav: true },
  privacy: { id: 'privacy', path: '/privacy', isProtected: false },
  terms: { id: 'terms', path: '/terms', isProtected: false },
  status: { id: 'status', path: '/status', isProtected: false, navLabel: 'Status', showInNav: false },
  health: { id: 'health', path: '/health', isProtected: false },
  auth: { id: 'auth', path: '/auth', isProtected: false },
  // Protected
  dashboard: { id: 'dashboard', path: '/dashboard', isProtected: true, navLabel: 'Dashboard', icon: LayoutDashboard, showInNav: true },
  squads: { id: 'squads', path: '/squads', isProtected: true, navLabel: 'Squads', icon: Users, showInNav: import.meta.env.VITE_FEATURE_SQUADS === 'true' },
  achievements: { id: 'achievements', path: '/achievements', isProtected: true, navLabel: 'Achievements', icon: Target, showInNav: true },
  learn: { id: 'learn', path: '/learn', isProtected: true, navLabel: 'Learn', icon: BookOpen, showInNav: true },
  events: { id: 'events', path: '/events', isProtected: true, navLabel: 'Events', icon: Calendar, showInNav: true },
  payments: { id: 'payments', path: '/payments', isProtected: true, navLabel: 'Payments', icon: CreditCard, showInNav: import.meta.env.VITE_FEATURE_PAYMENTS === 'true' },
  mentor: { id: 'mentor', path: '/mentor', isProtected: true, navLabel: 'Mentor', icon: MessageSquare, showInNav: true },
  profile: { id: 'profile', path: '/profile', isProtected: true, navLabel: 'Profile', icon: User, showInNav: false },
  settings: { id: 'settings', path: '/settings', isProtected: true, navLabel: 'Settings', icon: Settings, showInNav: false }
};

export const PUBLIC_ROUTES = Object.values(APP_ROUTES).filter(r => !r.isProtected);
export const PROTECTED_ROUTES = Object.values(APP_ROUTES).filter(r => r.isProtected);
export const NAV_ROUTES = Object.values(APP_ROUTES).filter(r => r.showInNav);

export const PREFETCHABLE_ROUTES = [
  APP_ROUTES.dashboard,
  APP_ROUTES.mentor,
  APP_ROUTES.learn
];

export const routePaths: Record<RouteId, string> = Object.fromEntries(
  Object.entries(APP_ROUTES).map(([key, val]) => [key, val.path])
) as Record<RouteId, string>;
