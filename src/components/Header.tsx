import { Link, useLocation } from 'react-router-dom';
import officialLogo from '@/assets/official_logo.svg';
import wordmark from '@/assets/wordmark.svg';
const Header = () => {
  const location = useLocation();
  const navItems = [{
    name: 'Home',
    path: '/'
  }, {
    name: 'Features',
    path: '/features'
  }, {
    name: 'Pricing',
    path: '/pricing'
  }, {
    name: 'Status',
    path: '/status'
  }];
  return <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center hover:scale-105 transition-transform duration-200">
          <img 
            src={officialLogo} 
            alt="RobuxMinerPro logo" 
            className="h-10 w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-6 md:space-x-8">
          {navItems.map(item => <Link key={item.path} to={item.path} className={`relative text-sm font-medium transition-all duration-200 hover:text-primary group ${location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'}`}>
              {item.name}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full ${location.pathname === item.path ? 'w-full' : ''}`} />
            </Link>)}
        </nav>

        <div className="flex items-center">
          <img 
            src={wordmark} 
            alt="RobuxMinerPro wordmark" 
            className="h-10 md:h-14 w-auto"
          />
        </div>
      </div>
    </header>;
};
export default Header;