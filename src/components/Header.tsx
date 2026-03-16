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
        <Link to="/" className="flex items-center gap-4 hover:scale-[1.02] transition-all duration-300 group">
          <div className="relative">
            <img
              src="/official_logo.png"
              alt="RobuxMinerPro logo"
              className="h-10 sm:h-14 w-auto drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-purple-500/10 blur-xl animate-pulse rounded-full" />
          </div>
          <div className="flex flex-col leading-none justify-center">
            <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              ROBUX<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">MINER</span>
            </span>
            <span className="text-[8px] sm:text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase mt-1 opacity-90 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
              APEX PRO EDITION
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 md:space-x-8">
          {navItems.map(item => <Link key={item.path} to={item.path} className={`relative text-sm font-medium transition-all duration-200 hover:text-primary group ${location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'}`}>
              {item.name}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full ${location.pathname === item.path ? 'w-full' : ''}`} />
            </Link>)}
        </nav>


      </div>
    </header>;
};
export default Header;