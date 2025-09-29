import { Link, useLocation } from 'react-router-dom';
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
        <Link to="/" className="flex items-center space-x-3 hover:scale-105 transition-transform duration-200">
          <img src="/official_logo.svg" alt="RobuxMinerPro logo" width="140" height="32" className="glow-effect" style={{
            filter: 'drop-shadow(0 0 20px hsl(var(--primary) / 0.3))'
          }} />
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map(item => <Link key={item.path} to={item.path} className={`relative text-sm font-medium transition-all duration-200 hover:text-primary group ${location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'}`}>
              {item.name}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full ${location.pathname === item.path ? 'w-full' : ''}`} />
            </Link>)}
        </nav>

        <button className="relative inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:scale-105 hover:shadow-lg h-10 px-6 py-2 glow-effect group overflow-hidden">
          <span className="relative z-10">Get Started</span>
          <div className="absolute inset-0 bg-gradient-to-r from-primary-glow to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </button>
      </div>
    </header>;
};
export default Header;