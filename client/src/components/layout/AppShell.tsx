import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useRoute } from 'wouter';

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isVerifyRoute] = useRoute('/verify-email/:token');
  const [isAuthRoute] = useRoute('/auth');
  
  // Don't show header/footer on verify email page or auth page
  const showHeaderFooter = !isVerifyRoute && !isAuthRoute;
  
  return (
    <div className="flex flex-col min-h-screen">
      {showHeaderFooter && <Header />}
      <main className={`flex-1 overflow-auto ${showHeaderFooter ? 'bg-gray-50' : ''}`}>
        {children}
      </main>
      {showHeaderFooter && <Footer />}
    </div>
  );
};

export default AppShell;
