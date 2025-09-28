import { Link } from 'react-router-dom';
import roboLogo from '@/assets/robominer-logo.png';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src={roboLogo} 
                alt="RobuxMiner.Pro" 
                className="w-8 h-8 rounded-lg"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  RobuxMiner.Pro
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              The most advanced and reliable Robux mining platform. Fast processing, simple interface, always online.
            </p>
            <div className="flex space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full pulse-glow"></div>
              <span className="text-xs text-muted-foreground">99.9% Uptime</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Platform</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/features" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/status" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">
                  Status
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">
                  API Docs
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2024 RobuxMiner.Pro. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110">
                  <span className="sr-only">Discord</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.942 8.487a12.047 12.047 0 0 0-2.966-0.920 0.05 0.05 0 0 0-0.053 0.025c-0.128 0.228-0.270 0.525-0.369 0.760a11.142 11.142 0 0 0-3.335 0 7.702 7.702 0 0 0-0.375-0.760 0.052 0.052 0 0 0-0.053-0.025 12.018 12.018 0 0 0-2.966 0.920 0.047 0.047 0 0 0-0.022 0.019c-1.879 2.809-2.393 5.549-2.141 8.251a0.056 0.056 0 0 0 0.021 0.037 12.098 12.098 0 0 0 3.645 1.844 0.052 0.052 0 0 0 0.056-0.019 8.668 8.668 0 0 0 0.746-1.213 0.051 0.051 0 0 0-0.028-0.070 7.958 7.958 0 0 1-1.137-0.542 0.051 0.051 0 0 1-0.005-0.085 6.108 6.108 0 0 0 0.227-0.178 0.05 0.05 0 0 1 0.051-0.007c2.383 1.088 4.963 1.088 7.314 0a0.05 0.05 0 0 1 0.052 0.006 6.117 6.117 0 0 0 0.227 0.179 0.051 0.051 0 0 1-0.004 0.085 7.466 7.466 0 0 1-1.138 0.541 0.051 0.051 0 0 0-0.027 0.070 9.721 9.721 0 0 0 0.746 1.213 0.051 0.051 0 0 0 0.056 0.019 12.063 12.063 0 0 0 3.651-1.844 0.055 0.055 0 0 0 0.021-0.037c0.302-3.109-0.506-5.812-2.141-8.251a0.041 0.041 0 0 0-0.022-0.019zM6.678 13.482c-0.712 0-1.297-0.654-1.297-1.456s0.572-1.456 1.297-1.456c0.731 0 1.310 0.660 1.297 1.456 0 0.802-0.572 1.456-1.297 1.456zm6.644 0c-0.712 0-1.297-0.654-1.297-1.456s0.572-1.456 1.297-1.456c0.731 0 1.310 0.660 1.297 1.456 0 0.802-0.566 1.456-1.297 1.456z"/>
                  </svg>
                </a>
              </div>
              <div className="text-xs text-muted-foreground">
                v2.1.0
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;