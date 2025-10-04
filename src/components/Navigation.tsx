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

  const getTierIcon = (tier: string) => {
    return tier === 'premium' || tier === 'pro' ? Crown : User;
  };

  if (!user) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center hover:scale-105 transition-transform duration-200">
            <img 
              src={logo} 
              alt="RobuxMinerPro logo" 
              className="w-auto"
              style={{ height: '3.6rem', objectFit: 'contain' }}
            />
          </Link>

          <div className="flex items-center space-x-4">
            <Button asChild>
              <Link to="/auth">GET RICH</Link>
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center hover:scale-105 transition-transform duration-200">
          <img 
            src={logo} 
            alt="RobuxMinerPro logo" 
            className="w-auto"
            style={{ height: '3.6rem', objectFit: 'contain' }}
          />
        </Link>

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
          {/* Robux Display */}
          {profile && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 rounded-full border border-yellow-400/20">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                {profile.total_robux.toLocaleString()}
              </span>
            </div>
          )}

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={profile?.avatar_url || ''} 
                    alt={profile?.display_name || 'User'} 
                  />
                  <AvatarFallback className={getTierColor(profile?.subscription_tier || 'free')}>
                    {profile?.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
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
    </header>
  );
};

export default Navigation;