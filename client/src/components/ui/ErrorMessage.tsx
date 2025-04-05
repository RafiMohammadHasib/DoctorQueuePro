import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ title = 'Error', message }) => {
  return (
    <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="mt-2 ml-7 text-sm">{message}</p>
    </div>
  );
};

export default ErrorMessage;