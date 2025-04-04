import React from 'react';
import { Link, useLocation } from 'wouter';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  const [location] = useLocation();

  // Determine which navigation item is active
  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-primary-500 shadow-md z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <Link href="/">
              <div className="ml-3 text-xl font-semibold text-white cursor-pointer">MediQueue</div>
            </Link>
          </div>
          <nav className="flex space-x-4">
            <NavItem href="/monitor" isActive={isActive('/monitor')} label="Queue Monitor" />
            <NavItem href="/doctor" isActive={isActive('/doctor')} label="Doctor Dashboard" />
            <NavItem href="/reception" isActive={isActive('/reception')} label="Reception" />
            <NavItem href="/admin" isActive={isActive('/admin')} label="Admin" />
          </nav>
        </div>
      </div>
    </header>
  );
};

interface NavItemProps {
  href: string;
  isActive: boolean;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, isActive, label }) => {
  return (
    <Link href={href}>
      <div className={`px-3 py-2 rounded-md text-sm font-medium text-white cursor-pointer ${
        isActive ? 'bg-primary-600' : 'hover:bg-primary-600'
      }`}>
        {label}
      </div>
    </Link>
  );
};

export default Header;
