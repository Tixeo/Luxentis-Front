import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useTheme } from '@/lib/theme-provider';
import { QuickTransferButton } from '@/components/home/QuickTransferButton';
import { useLocation } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
  fullHeight?: boolean;
}

export function MainLayout({ children, fullHeight = false }: MainLayoutProps) {
  const { isDark } = useTheme();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className={`flex flex-col min-h-screen w-full ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-[#333333]'}`}>
      <Header />
      
      <main className={`flex-1 w-full ${fullHeight ? '' : 'py-6 px-6 md:px-8'}`}>
        {children}
      </main>
      
      <Footer />
      
      {!isLandingPage && <QuickTransferButton />}
    </div>
  );
} 