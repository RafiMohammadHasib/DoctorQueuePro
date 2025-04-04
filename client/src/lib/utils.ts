import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a human-readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a time to a human-readable string
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate time difference in minutes
 */
export function getTimeDifferenceInMinutes(startDate: Date, endDate: Date): number {
  const diff = endDate.getTime() - startDate.getTime();
  return Math.floor(diff / 60000);
}

/**
 * Format minutes to a human-readable duration string (e.g., "1h 30m" or "45m")
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format a phone number for display
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Handle different phone formats, this is a simple implementation
  if (phoneNumber.length === 10) {
    return `(${phoneNumber.substring(0, 3)}) ${phoneNumber.substring(3, 6)}-${phoneNumber.substring(6)}`;
  }
  return phoneNumber;
}

/**
 * Get priority level display name
 */
export function getPriorityLevelName(level: string): string {
  switch (level) {
    case 'urgent':
      return 'Urgent';
    case 'priority':
      return 'Priority';
    default:
      return 'Normal';
  }
}

/**
 * Get appointment type display name
 */
export function getAppointmentTypeName(type: string): string {
  switch (type) {
    case 'new':
      return 'New Visit';
    case 'followup':
      return 'Follow-up';
    case 'urgent':
      return 'Urgent';
    default:
      return type;
  }
}

/**
 * Get status display name
 */
export function getStatusName(status: string): string {
  switch (status) {
    case 'waiting':
      return 'Waiting';
    case 'in-progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'no-show':
      return 'No Show';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}
