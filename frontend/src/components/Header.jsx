import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import CCCLogo from './CCCLogo';

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About Us' },
    { path: '/services-solutions', label: 'Services & Solutions' },
    { path: '/portfolio', label: 'Portfolio' },
    { path: '/edg', label: 'EDG Funding (Optional)' },
    { path: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80"
      data-testid="main-header"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-1"
          data-testid="header-logo-link"
        >
          <div className="flex items-center">
            {/* Left C (Blue) */}
            <div 
              className="w-5 h-5 border-2 border-l-0 border-t-0 border-b-0 rounded-r-full"
              style={{ borderColor: '#253989', borderRightColor: '#253989' }}
            ></div>
            {/* Center C (Red) with speech bubble */}
            <div className="relative -ml-1">
              <div 
                className="w-5 h-5 border-2 border-l-0 border-r-0 border-t-0 border-b-0 rounded-full"
                style={{ borderColor: '#EE1823', borderTopColor: '#EE1823', borderBottomColor: '#EE1823' }}
              ></div>
              <div 
                className="absolute top-1 left-1 w-1.5 h-1 bg-white rounded-full"
              ></div>
            </div>
            {/* Right C (Blue) */}
            <div 
              className="w-5 h-5 border-2 border-r-0 border-t-0 border-b-0 rounded-l-full -ml-1"
              style={{ borderColor: '#253989', borderLeftColor: '#253989' }}
            ></div>
          </div>
          <span className="text-sm font-bold ml-2" style={{ color: '#253989' }}>CCC</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8" data-testid="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-[hsl(var(--secondary))] relative group ${
                isActive(link.path) 
                  ? 'text-[hsl(var(--secondary))]' 
                  : 'text-[hsl(var(--foreground))]'
              }`}
              data-testid={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {link.label}
              <span className={`absolute left-0 -bottom-1 w-full h-0.5 bg-[hsl(var(--secondary))] transform origin-left transition-transform duration-200 ${
                isActive(link.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`} />
            </Link>
          ))}
          <Button 
            asChild
            className="bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/90 text-white"
            data-testid="header-cta-button"
          >
            <Link to="/contact">Get Started</Link>
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm"
              data-testid="mobile-menu-toggle-button"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <nav className="flex flex-col gap-4 mt-8" data-testid="mobile-nav">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-base font-medium px-4 py-2 rounded-lg transition-colors ${
                    isActive(link.path)
                      ? 'bg-[hsl(var(--accent))] text-[hsl(var(--secondary))]'
                      : 'hover:bg-[hsl(var(--muted))]'
                  }`}
                  data-testid={`mobile-nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.label}
                </Link>
              ))}
              <Button 
                asChild
                className="mt-4 bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/90 text-white"
                data-testid="mobile-header-cta-button"
              >
                <Link to="/contact" onClick={() => setIsOpen(false)}>Get Started</Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;