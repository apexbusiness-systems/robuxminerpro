import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Menu, X, Rocket, LogOut, ChevronDown } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useI18n } from '@/i18n/I18nProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NAV_ROUTES, PUBLIC_ROUTES, APP_ROUTES, PREFETCHABLE_ROUTES } from '@/config/routes';
import { useQueryClient } from '@tanstack/react-query';
import { prefetchRouteData } from '@/shared/prefetch';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { session, profile, signOut } = useAuth();
  const location = useLocation();
  const { t, locale, setLocale } = useI18n();
  const queryClient = useQueryClient();

  const handlePrefetch = (path: string) => {
    // Only prefetch if we are authenticated and the route is in the prefetchable list
    if (session && PREFETCHABLE_ROUTES.some(r => r.path === path)) {
      prefetchRouteData(queryClient, path);
    }
  };

  const navLinks = session
    ? NAV_ROUTES.filter(r => r.isProtected)
    : NAV_ROUTES.filter(r => !r.isProtected);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2" aria-label={t('nav.logoAlt')}>
            <Rocket className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="font-bold hidden sm:inline-block">RobuxMinerPro</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.id}
                  to={link.path}
                  onMouseEnter={() => handlePrefetch(link.path)}
                  onFocus={() => handlePrefetch(link.path)}
                  onTouchStart={() => handlePrefetch(link.path)}
                  className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${
                    location.pathname === link.path
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {link.navLabel}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 border-r pr-4 mr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
              className="text-xs uppercase"
            >
              {locale}
            </Button>
            <ThemeToggle />
          </div>

          {session ? (
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.username || 'User avatar'} />
                      <AvatarFallback>{getInitials(profile?.username)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {profile?.username && (
                        <p className="font-medium">{profile.username}</p>
                      )}
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to={APP_ROUTES.profile.path} className="w-full cursor-pointer">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={APP_ROUTES.settings.path} className="w-full cursor-pointer">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to={APP_ROUTES.auth.path}>{t('nav.signIn')}</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            className="md:hidden"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t p-4 space-y-4 bg-background">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.id}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 text-sm font-medium p-2 rounded-md ${
                  location.pathname === link.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {link.navLabel}
              </Link>
            );
          })}
          {!session && (
            <Button className="w-full" asChild onClick={() => setIsOpen(false)}>
              <Link to={APP_ROUTES.auth.path}>{t('nav.signIn')}</Link>
            </Button>
          )}
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm font-medium">{t('nav.language')}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLocale(locale === 'en' ? 'es' : 'en');
                setIsOpen(false);
              }}
              className="uppercase"
            >
              {locale}
            </Button>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
