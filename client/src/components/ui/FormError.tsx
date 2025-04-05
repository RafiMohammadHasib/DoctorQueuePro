import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface FormErrorProps {
  message: string;
}

const FormError: React.FC<FormErrorProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="bg-red-500/20 border border-red-500/30 text-red-200 rounded-md p-3 mb-4 flex items-start">
      <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};

export default FormError;