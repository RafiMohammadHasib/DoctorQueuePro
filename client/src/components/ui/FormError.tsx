import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';

interface FormErrorProps {
  message: string;
}

const FormError: React.FC<FormErrorProps> = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Alert className="mt-3 border-red-200 bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200">
        <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 mr-2" />
        <AlertDescription className="text-sm">{message}</AlertDescription>
      </Alert>
    </motion.div>
  );
};

export default FormError;