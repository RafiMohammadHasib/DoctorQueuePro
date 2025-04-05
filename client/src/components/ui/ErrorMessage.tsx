import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Error',
  message,
  onDismiss
}) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-6 right-6 z-50 max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <Alert className="border-red-400 bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-200 shadow-lg">
          <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
          <div className="ml-3 flex-1">
            <AlertTitle className="font-semibold">{title}</AlertTitle>
            <AlertDescription className="mt-1 text-sm">{message}</AlertDescription>
          </div>
          {onDismiss && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full p-0 text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-800"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          )}
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
};

export default ErrorMessage;