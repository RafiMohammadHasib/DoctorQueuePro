import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Notification } from '@shared/schema';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  // In a real app, we would fetch notifications from the API
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'patient_added',
      message: 'Emma Wilson was added to the queue.',
      timestamp: new Date(),
      read: false
    },
    {
      id: '2',
      type: 'consultation_completed',
      message: 'Consultation with Jane Miller has been completed.',
      timestamp: new Date(Date.now() - 15 * 60000),
      read: false
    },
    {
      id: '3',
      type: 'priority_patient',
      message: 'Linda Thompson has been marked as priority.',
      timestamp: new Date(Date.now() - 30 * 60000),
      read: false
    }
  ]);

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  // Determine notification style based on type
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'patient_added':
        return 'bg-blue-50 border-l-4 border-primary-500';
      case 'consultation_completed':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'priority_patient':
        return 'bg-amber-50 border-l-4 border-amber-500';
      case 'urgent_patient':
        return 'bg-red-50 border-l-4 border-red-500';
      default:
        return 'bg-gray-50 border-l-4 border-gray-500';
    }
  };

  return (
    <div className={`fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-800">Notifications</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`mb-4 p-3 rounded-r-md ${getNotificationStyle(notification.type)}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {notification.type.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => removeNotification(notification.id)}
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
