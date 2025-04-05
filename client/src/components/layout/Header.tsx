import React from 'react';
import { Link, useLocation } from 'wouter';
import { Clock, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const Header: React.FC = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  // Determine which navigation item is active
  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  // Filter navigation items based on user role
  const getNavItems = () => {
    // Always show Queue Monitor
    const items = [
      { href: '/monitor', label: 'Queue Monitor' }
    ];

    // Add role-specific items
    if (user) {
      if (user.role === 'admin') {
        items.push(
          { href: '/doctor', label: 'Doctor Dashboard' },
          { href: '/reception', label: 'Reception' },
          { href: '/admin', label: 'Admin Dashboard' }
        );
      } else if (user.role === 'doctor') {
        items.push({ href: '/doctor', label: 'Doctor Dashboard' });
      } else if (user.role === 'receptionist') {
        items.push({ href: '/reception', label: 'Reception' });
      }
    }

    return items;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
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
          
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-3">
              {getNavItems().map((item) => (
                <NavItem 
                  key={item.href}
                  href={item.href} 
                  isActive={isActive(item.href)} 
                  label={item.label} 
                />
              ))}
            </nav>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-primary-600"
                  >
                    <UserCircle className="h-5 w-5 mr-2" />
                    {user.name || user.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button variant="secondary" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>
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
