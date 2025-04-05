import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Settings, 
  LogOut,
  CalendarClock,
  BarChart4,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
  count?: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  label, 
  href, 
  active, 
  count 
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={href}>
            <div className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer",
              active 
                ? "bg-primary-100 text-primary-700" 
                : "text-gray-600 hover:bg-gray-100"
            )}>
              <div className={cn(
                "flex items-center justify-center w-5 h-5",
                active ? "text-primary-700" : "text-gray-500"
              )}>
                {icon}
              </div>
              <span className="flex-1">{label}</span>
              {count !== undefined && (
                <Badge variant="outline" className="ml-auto bg-primary-50 text-primary-700 border-primary-200">
                  {count}
                </Badge>
              )}
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface DoctorSidebarProps {
  waitingCount?: number;
}

const DoctorSidebar: React.FC<DoctorSidebarProps> = ({ waitingCount = 0 }) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="w-64 flex-shrink-0 border-r border-gray-200 h-full overflow-y-auto bg-white">
      {/* Doctor Profile */}
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
            <User className="w-5 h-5" />
          </div>
          <div className="ml-3">
            <div className="font-medium text-gray-900">{user?.name || user?.username}</div>
            <div className="text-xs text-gray-500">Doctor</div>
          </div>
        </div>
        <div className="flex items-center text-xs text-green-600 bg-green-50 rounded-full px-2 py-1 w-fit">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
          Available
        </div>
      </div>
      
      <Separator />
      
      {/* Navigation Links */}
      <div className="py-4 px-3 space-y-1">
        <SidebarItem 
          icon={<LayoutDashboard className="w-5 h-5" />} 
          label="Dashboard" 
          href="/doctor" 
          active={location === '/doctor'} 
        />
        
        <SidebarItem 
          icon={<Users className="w-5 h-5" />} 
          label="Patients" 
          href="/doctor/patients" 
          active={location === '/doctor/patients'} 
          count={waitingCount} 
        />
        
        <SidebarItem 
          icon={<Clock className="w-5 h-5" />} 
          label="Queue Monitor" 
          href="/doctor/queue" 
          active={location === '/doctor/queue'} 
        />
        
        <SidebarItem 
          icon={<CalendarClock className="w-5 h-5" />} 
          label="Appointments" 
          href="/doctor/appointments" 
          active={location === '/doctor/appointments'} 
        />
        
        <SidebarItem 
          icon={<BarChart4 className="w-5 h-5" />} 
          label="Statistics" 
          href="/doctor/stats" 
          active={location === '/doctor/stats'} 
        />
      </div>
      
      <Separator />
      
      {/* Settings and Logout */}
      <div className="py-4 px-3 space-y-1">
        <SidebarItem 
          icon={<Settings className="w-5 h-5" />} 
          label="Settings" 
          href="/doctor/settings" 
          active={location === '/doctor/settings'} 
        />
        
        <div 
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
          onClick={handleLogout}
        >
          <div className="flex items-center justify-center w-5 h-5 text-gray-500">
            <LogOut className="w-5 h-5" />
          </div>
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default DoctorSidebar;