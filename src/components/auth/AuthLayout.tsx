import React from 'react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useTheme } from '@/lib/theme-provider';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { isDark } = useTheme();
  
  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-4 relative ${
      isDark ? 'bg-[#121212]' : 'bg-white'
    }`}>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className={`max-w-md w-full space-y-8 p-8 rounded-lg border ${
        isDark 
          ? 'bg-[#1E1E1E] border-[#2A2A2A]' 
          : 'bg-white border-[#E5E5E5]'
      }`}>
        <div className="flex flex-col items-center">
          <div className="mb-6">
            <img src="/images/logo_hd.png" alt="Luxentis" className="h-28 w-auto" />
          </div>
          <h2 className={`mt-2 text-center text-3xl font-bold ${
            isDark ? 'text-white' : 'text-[#333333]'
          }`}>{title}</h2>
          {subtitle && (
            <p className={`mt-2 text-center text-sm ${
              isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'
            }`}>{subtitle}</p>
          )}
        </div>
        
        {children}
      </div>
      
      <div className="mt-8 flex space-x-4 text-sm">
        <a href="#" className={`hover:text-[#F0B90B] transition-colors ${
          isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'
        }`}>Cookies</a>
        <a href="#" className={`hover:text-[#F0B90B] transition-colors ${
          isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'
        }`}>CGU</a>
      </div>
    </div>
  );
} 