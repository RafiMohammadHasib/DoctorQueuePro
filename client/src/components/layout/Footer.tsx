import React, { useState } from 'react';
import { Bell, HelpCircle, Settings, Info, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationPanel from '@/components/NotificationPanel';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

const Footer: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Upper footer with links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/monitor"><a className="text-sm text-gray-600 hover:text-primary-500">Queue Monitor</a></Link></li>
                {user?.role === 'admin' && (
                  <>
                    <li><Link href="/admin"><a className="text-sm text-gray-600 hover:text-primary-500">Admin Dashboard</a></Link></li>
                    <li><Link href="/reception"><a className="text-sm text-gray-600 hover:text-primary-500">Reception Kiosk</a></Link></li>
                  </>
                )}
                {(user?.role === 'doctor' || user?.role === 'admin') && (
                  <li><Link href="/doctor"><a className="text-sm text-gray-600 hover:text-primary-500">Doctor Dashboard</a></Link></li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary-500">Help Center</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary-500">FAQs</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-primary-500">Contact Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">support@mediqueue.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Lower footer with copyright and icons */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} MediQueue. All rights reserved.
            </div>
            <div className="flex space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-400 hover:text-gray-600"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-400 hover:text-gray-600"
              >
                <Info className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-400 hover:text-gray-600"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};

export default Footer;
