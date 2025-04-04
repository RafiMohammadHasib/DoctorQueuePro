import React from 'react';
import { QueueItemWithPatient } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { MessageCircleCode, Eye, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface QueueItemProps {
  queueItem: QueueItemWithPatient;
  position: number;
  waitTime: string;
  estimatedTime: string;
  onCallNow: () => void;
  viewMode: 'list' | 'cards';
}

const QueueItem: React.FC<QueueItemProps> = ({
  queueItem,
  position,
  waitTime,
  estimatedTime,
  onCallNow,
  viewMode
}) => {
  const patient = queueItem.patient;

  // Determine border color based on priority
  const getBorderColor = () => {
    switch (queueItem.priorityLevel) {
      case 'urgent':
        return 'bg-red-500';
      case 'priority':
        return 'bg-amber-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Determine position badge color based on priority
  const getPositionBadgeColor = () => {
    switch (queueItem.priorityLevel) {
      case 'urgent':
        return 'bg-red-500';
      case 'priority':
        return 'bg-amber-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Determine priority badge
  const getPriorityBadge = () => {
    if (queueItem.priorityLevel === 'normal') return null;
    
    return (
      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
        queueItem.priorityLevel === 'urgent'
          ? 'bg-red-100 text-red-700'
          : 'bg-amber-100 text-amber-700'
      }`}>
        {queueItem.priorityLevel.charAt(0).toUpperCase() + queueItem.priorityLevel.slice(1)}
      </span>
    );
  };

  if (viewMode === 'list') {
    return (
      <div className="relative border border-gray-200 rounded-lg overflow-hidden">
        <div className={`absolute top-0 left-0 bottom-0 w-1 ${getBorderColor()}`}></div>
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className={`flex items-center justify-center h-10 w-10 rounded-full ${getPositionBadgeColor()} text-white font-mono text-lg mr-4`}>
              {position}
            </div>
            <div>
              <div className="flex items-center">
                <h3 className="font-medium">{patient.name}</h3>
                {getPriorityBadge()}
              </div>
              <p className="text-sm text-gray-600">
                {patient.age && `${patient.age} yrs`}
                {patient.gender && ` • ${patient.gender}`}
                {` • ${queueItem.appointmentType === 'new' ? 'First Visit' : 'Follow-up'}`}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="mr-6 text-center">
              <p className="text-sm text-gray-500">Wait Time</p>
              <p className="font-mono font-medium">{waitTime}</p>
            </div>
            <div className="mr-6 text-center">
              <p className="text-sm text-gray-500">Est. Time</p>
              <p className="font-mono font-medium">{estimatedTime}</p>
            </div>
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" onClick={onCallNow} title="MessageCircleCode Now">
                <MessageCircleCode className="h-4 w-4 text-primary-500" />
              </Button>
              <Button variant="ghost" size="icon" title="View Details">
                <Eye className="h-4 w-4 text-gray-500" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" title="More Options">
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onCallNow}>MessageCircleCode Now</DropdownMenuItem>
                  <DropdownMenuItem>Edit Patient</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500">Remove from Queue</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Card view
  return (
    <div className={`border rounded-lg overflow-hidden shadow-sm ${
      queueItem.priorityLevel === 'urgent' 
        ? 'border-red-200' 
        : queueItem.priorityLevel === 'priority'
          ? 'border-amber-200'
          : 'border-gray-200'
    }`}>
      <div className={`h-2 ${getBorderColor()}`}></div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start">
            <div className={`flex items-center justify-center h-12 w-12 rounded-full ${getPositionBadgeColor()} text-white font-mono text-lg mr-3`}>
              {position}
            </div>
            <div>
              <h3 className="font-medium text-lg">{patient.name}</h3>
              <div className="flex items-center">
                <span className="text-sm text-gray-600">
                  {patient.age && `${patient.age} yrs`}
                  {patient.gender && ` • ${patient.gender}`}
                </span>
                {getPriorityBadge()}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {queueItem.appointmentType === 'new' ? 'First Visit' : 'Follow-up'}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onCallNow}>MessageCircleCode Now</DropdownMenuItem>
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit Patient</DropdownMenuItem>
              <DropdownMenuItem className="text-red-500">Remove from Queue</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4 text-center">
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">Wait Time</p>
            <p className="font-mono font-medium">{waitTime}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">Est. Time</p>
            <p className="font-mono font-medium">{estimatedTime}</p>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-2">
          <Button variant="default" size="sm" onClick={onCallNow} className="flex-1">
            <MessageCircleCode className="h-4 w-4 mr-1" />
            MessageCircleCode Now
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QueueItem;
