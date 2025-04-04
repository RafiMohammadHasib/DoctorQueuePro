import React, { useState } from 'react';
import { Bell, HelpCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationPanel from '@/components/NotificationPanel';

const Footer: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
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
