import { cn } from '@/lib/utils';
import React, { ButtonHTMLAttributes } from 'react';
import { useTheme } from '@/lib/theme-provider';
import { Loader2 } from 'lucide-react';

export interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

const AuthButton = React.forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ className, variant = 'primary', children, isLoading, ...props }, ref) => {
    const { isDark } = useTheme();
    
    return (
      <button
        className={cn(
          "w-full py-3 px-4 rounded-lg font-medium text-base transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 flex justify-center items-center relative overflow-hidden",
          {
            "bg-[#F0B90B] text-black hover:bg-[#F0B90B]/90 focus:ring-[#F0B90B]/50": variant === 'primary',
            
            "border border-[#F0B90B] focus:ring-[#F0B90B]/50": variant === 'outline',
            
            "focus:ring-[#1E1E1E]/50": variant === 'secondary',
          },
          variant !== 'primary' && cn(
            isDark ? 'bg-[#1E1E1E] text-white hover:bg-[#2A2A2A]' : 'bg-[#F5F5F5] text-[#333333] hover:bg-[#E5E5E5]'
          ),
          isLoading && "cursor-not-allowed",
          className
        )}
        disabled={isLoading || props.disabled}
        ref={ref}
        {...props}
      >
        <div className={`flex items-center justify-center transition-transform duration-200 ${isLoading ? '-translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
          {children}
        </div>
        
        <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-200 ${isLoading ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </button>
    );
  }
);

AuthButton.displayName = "AuthButton";

export { AuthButton }; 