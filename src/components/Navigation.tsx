import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { t, locale, setLocale, availableLocales } = useI18n();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Squads', path: '/squads', icon: Users },
    { name: 'Achievements', path: '/achievements', icon: Trophy },
    { name: 'Learn', path: '/learn', icon: BookOpen },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Payments', path: '/payments', icon: CreditCard },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
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
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container relative h-20 px-4 overflow-visible">
          <div className="flex h-full items-center justify-between">
            <Link to="/" className="flex items-center gap-4 hover:scale-[1.02] transition-all duration-300 group">
              <div className="relative">
                <img 
                  src={logo} 
                  alt={t('nav.logoAlt')}
                  className="h-[140px] w-auto drop-shadow-[0_0_25px_rgba(139,92,246,0.5)] group-hover:rotate-[360deg] transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-3xl sm:text-4xl font-black tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                  ROBUX<span className="text-primary-glow">MINER</span>
                </span>
                <span className="text-[8px] sm:text-[10px] font-black tracking-[0.4em] text-primary-glow uppercase mt-1">APEX PRO EDITION</span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
              {landingLinks.map((item) => (
                <a
                  key={item.hash}
                  href={location.pathname === '/' ? item.hash : `/${item.hash}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {t('nav.language')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {availableLocales.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setLocale(option.value)}
                    >
                      <span className="flex w-full items-center justify-between gap-3">
                        {option.label}
                        {locale === option.value ? '✓' : null}
                      </span>
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
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container relative h-16 px-4">
        <div className="flex h-full items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 hover:scale-[1.02] transition-all duration-300 group">
            <div className="relative">
              <img 
                src={logo} 
                alt={t('nav.logoAlt')}
                className="h-16 w-auto drop-shadow-[0_0_25px_rgba(139,92,246,0.5)] group-hover:rotate-[360deg] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-4xl font-black tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                ROBUX<span className="text-primary-glow">MINER</span>
              </span>
              <span className="text-[10px] font-black tracking-[0.4em] text-primary-glow uppercase mt-1">APEX PRO EDITION</span>
            </div>
          </Link>

          {/* Centered Brand Title removed for cleaner layout as per user feedback */}

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 text-sm font-medium transition-all duration-200 hover:text-primary group ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full ${
                    isActive ? 'w-full' : ''
                  }`} />
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {t('nav.language')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {availableLocales.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setLocale(option.value)}
                  >
                    <span className="flex w-full items-center justify-between gap-3">
                      {option.label}
                      {locale === option.value ? '✓' : null}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Robux Display */}
            {profile && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 rounded-full border border-yellow-400/20">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                  {profile.total_robux.toLocaleString()}
                </span>
              </div>
            )}

            {/* User Dropdown - APEX High-Density Polish */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-14 w-14 rounded-2xl p-0 overflow-hidden border-2 border-white/10 hover:border-primary-glow/50 transition-all shadow-2xl group active:scale-95">
                  <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/20 transition-colors" />
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage 
                      src={profile?.avatar_url || ''} 
                      alt={profile?.display_name || 'User'} 
                      className="object-cover"
                    />
                    <AvatarFallback className={`${getTierColor(profile?.subscription_tier || 'free')} text-white font-black text-xl rounded-none w-full h-full flex items-center justify-center`}>
                      {profile?.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-1">
                    <div className="w-8 h-[2px] bg-primary-glow shadow-[0_0_10px_rgba(139,92,246,1)] rounded-full" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{profile?.display_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        {profile?.subscription_tier || 'Free'}
                      </Badge>
                      {profile && (
                        <Badge variant="outline" className="text-xs">
                          ⚡ {profile.mining_power}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
