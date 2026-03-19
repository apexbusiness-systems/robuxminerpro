import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/i18n/I18nProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  User,
  Settings,
  LogOut,
  Crown,
  Coins,
  Home,
  Users,
  Trophy,
  BookOpen,
  Calendar,
  CreditCard
} from 'lucide-react';
import logo from '@/assets/logo.svg';

const Navigation: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const { t, locale, setLocale, availableLocales } = useI18n();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home, show: true },
    { name: 'Squads', path: '/squads', icon: Users, show: import.meta.env.VITE_FEATURE_SQUADS === 'true' },
    { name: 'Achievements', path: '/achievements', icon: Trophy, show: true },
    { name: 'Learn', path: '/learn', icon: BookOpen, show: true },
    { name: 'Events', path: '/events', icon: Calendar, show: true },
    { name: 'Payments', path: '/payments', icon: CreditCard, show: import.meta.env.VITE_FEATURE_PAYMENTS === 'true' },
  ].filter(item => item.show);

  // FIX: Removed redundant globalThis.window.location.assign('/auth') call.
  // signOut() in useAuth.tsx now handles the hard navigation internally via
  // window.location.href = '/auth', which destroys the Supabase singleton
  // in-memory session. A second assign() here would race against that redirect
  // and could cause double-navigation issues.
  const handleSignOut = async () => {
    await signOut();
    globalThis.window.location.assign('/auth');
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'pro': return 'bg-gradient-to-r from-purple-400 to-purple-600';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  if (!user) {
    const landingLinks = [
      { label: t('nav.features'), hash: '#features' },
      { label: t('nav.howItWorks'), hash: '#how-it-works' },
      { label: t('nav.pricing'), hash: '#pricing' },
      { label: t('nav.testimonials'), hash: '#testimonials' },
      { label: t('nav.faq'), hash: '#faq' },
    ];

    return (
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt={t('nav.logoAlt')} className="h-8 w-8" />
              <span className="font-bold text-sm hidden sm:inline-block">
                ROBUX MINER &nbsp;<Badge variant="outline" className="text-xs px-1 py-0">APEX PRO EDITION</Badge>
              </span>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center gap-4 text-sm hidden md:flex">
              {landingLinks.map((item) => (
                <a
                  key={item.hash}
                  href={location.pathname === '/' ? item.hash : `/${item.hash}`}
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1">
                    {t('nav.language')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {availableLocales.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setLocale(option.value)}
                    >
                      {option.label} {locale === option.value ? '\u2713' : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {location.pathname !== '/auth' && (
                <Button asChild size="sm">
                  <Link to="/auth">{t('nav.signIn')}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Logo */}
        <div className="mr-4 flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt={t('nav.logoAlt')} className="h-8 w-8" />
            <span className="font-bold text-sm hidden sm:inline-block">
              ROBUX MINER &nbsp;<Badge variant="outline" className="text-xs px-1 py-0">APEX PRO EDITION</Badge>
            </span>
          </Link>
        </div>

        {/* Centered Brand Title removed for cleaner layout as per user feedback */}
        {/* Navigation Items */}
        <div className="flex flex-1 items-center space-x-1 hidden md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
                asChild
                className="gap-1"
              >
                <Link to={item.path}>
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                {t('nav.language')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {availableLocales.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setLocale(option.value)}
                >
                  {option.label} {locale === option.value ? '\u2713' : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Robux Display */}
          {profile && (
            <div className="hidden sm:flex items-center gap-1 text-sm font-medium">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span>{profile.total_robux.toLocaleString()}</span>
            </div>
          )}
          {/* User Dropdown - APEX High-Density Polish */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.display_name ?? 'User'} />
                  <AvatarFallback>
                    {profile?.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{profile?.display_name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Crown className="h-3 w-3" />
                  <Badge
                    className={`text-xs ${getTierColor(profile?.subscription_tier || 'free')} text-white border-0`}
                  >
                    {profile?.subscription_tier || 'Free'}
                  </Badge>
                  {profile && (
                    <span className="text-xs text-muted-foreground ml-1">
                      \u26a1 {profile.mining_power}
                    </span>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 cursor-pointer"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
