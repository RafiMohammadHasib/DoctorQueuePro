import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Settings,
  CreditCard,
  Clock,
  LogOut,
  Bell,
  ChevronDown,
  HelpCircle,
  Menu,
  X,
  BarChart4, 
  UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface SidebarItemProps {
  icon: React.ReactElement;
  label: string;
  href: string;
  active?: boolean;
  badge?: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  label, 
  href, 
  active, 
  badge 
}) => {
  return (
    <Link href={href}>
      <a className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
        active 
          ? 'bg-primary/10 text-primary' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      } transition-colors`}>
        <div className={`flex items-center justify-center w-5 h-5 ${
          active ? 'text-primary' : 'text-gray-500'
        }`}>
          {icon}
        </div>
        <span>{label}</span>
        {badge !== undefined && badge > 0 && (
          <Badge variant={active ? "default" : "secondary"} className="ml-auto">
            {badge}
          </Badge>
        )}
      </a>
    </Link>
  );
};

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const getInitials = () => {
    if (!user || !user.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const sidebarItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", href: `/${user?.role}` },
    { icon: <Users className="w-5 h-5" />, label: "Patients", href: `/${user?.role}/patients` },
    { icon: <Clock className="w-5 h-5" />, label: "Queue Monitor", href: `/${user?.role}/queue`, badge: 12 },
    { icon: <Calendar className="w-5 h-5" />, label: "Appointments", href: `/${user?.role}/appointments` },
    { icon: <FileText className="w-5 h-5" />, label: "Records", href: `/${user?.role}/records` },
    { icon: <BarChart4 className="w-5 h-5" />, label: "Analytics", href: `/${user?.role}/analytics` },
  ];
  
  const bottomSidebarItems = [
    { icon: <Settings className="w-5 h-5" />, label: "Settings", href: `/${user?.role}/settings` },
    { icon: <HelpCircle className="w-5 h-5" />, label: "Help & Support", href: `/${user?.role}/help` },
  ];
  
  const roleSpecificClass = () => {
    if (user?.role === 'admin') return 'from-blue-50 to-blue-100';
    if (user?.role === 'doctor') return 'from-green-50 to-green-100';
    if (user?.role === 'receptionist') return 'from-purple-50 to-purple-100';
    return 'from-gray-50 to-gray-100';
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-5 left-5 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-full bg-white shadow-md"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="fixed inset-0 bg-black/20" onClick={() => setMobileMenuOpen(false)} />
            <nav className="fixed top-0 left-0 bottom-0 w-72 bg-white shadow-xl flex flex-col overflow-y-auto">
              {/* Logo and close button */}
              <div className="flex items-center justify-between px-4 py-6 border-b">
                <div className="flex items-center space-x-2">
                  <Clock className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">QueueMaster</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Mobile sidebar content - same as desktop */}
              <div className="flex-1 py-6 px-4 space-y-1">
                {sidebarItems.map((item, index) => (
                  <SidebarItem
                    key={index}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    active={location === item.href}
                    badge={item.badge}
                  />
                ))}
              </div>
              
              <Separator />
              
              <div className="py-6 px-4 space-y-1">
                {bottomSidebarItems.map((item, index) => (
                  <SidebarItem
                    key={index}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    active={location === item.href}
                  />
                ))}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium w-full
                  text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <div className="flex items-center justify-center w-5 h-5 text-gray-500">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span>Logout</span>
                </button>
              </div>
              
              {/* User info */}
              <div className="mt-auto p-4 border-t">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback className={`bg-gradient-to-br ${roleSpecificClass()}`}>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 border-r bg-white">
        <div className="flex items-center px-6 py-5 border-b">
          <Clock className="h-6 w-6 text-primary mr-2" />
          <span className="text-xl font-bold">QueueMaster</span>
        </div>
        
        <div className="flex-1 py-6 px-4 flex flex-col justify-between">
          <div className="space-y-1">
            {sidebarItems.map((item, index) => (
              <SidebarItem
                key={index}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={location === item.href}
                badge={item.badge}
              />
            ))}
          </div>
          
          <div className="space-y-1 mt-auto">
            <Separator className="my-4" />
            
            {bottomSidebarItems.map((item, index) => (
              <SidebarItem
                key={index}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={location === item.href}
              />
            ))}
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium w-full
              text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <div className="flex items-center justify-center w-5 h-5 text-gray-500">
                <LogOut className="w-5 h-5" />
              </div>
              <span>Logout</span>
            </button>
          </div>
        </div>
        
        {/* User info */}
        <div className="p-4 border-t">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarFallback className={`bg-gradient-to-br ${roleSpecificClass()}`}>{getInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation bar */}
        <header className="bg-white border-b">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex-1 flex items-center">
              <div className="w-72 lg:w-96">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    type="search" 
                    placeholder="Search..." 
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                      3
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-96 overflow-y-auto">
                    {[1, 2, 3].map((_, i) => (
                      <DropdownMenuItem key={i} className="py-3 cursor-pointer">
                        <div className="flex items-start">
                          <div className="mr-3 bg-primary/10 p-2 rounded-full">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">New patient added</p>
                            <p className="text-xs text-gray-500">
                              John Doe has been added to the queue
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              5 minutes ago
                            </p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer justify-center font-medium text-primary">
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 pl-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`bg-gradient-to-br ${roleSpecificClass()} text-sm`}>
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium hidden md:inline-block">
                        {user?.name}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <span className="mr-2 flex h-4 w-4 items-center justify-center">👤</span>
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;