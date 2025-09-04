import React, { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme-provider';

export interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showErrorMessage?: boolean;
}

const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, label, error, showErrorMessage = true, ...props }, ref) => {
    const { isDark } = useTheme();
    
    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-[#333333]'}`}>
            {label}
          </label>
        )}
        <input
          className={cn(
            "w-full px-4 py-3 rounded-lg border",
            isDark ? 'bg-[#1E1E1E] border-[#2A2A2A] text-white' : 'bg-white border-[#E5E5E5] text-[#333333]',
            "focus:outline-none focus:ring-2 focus:ring-[#F0B90B] focus:border-transparent transition-all",
            isDark ? 'placeholder:text-[#767676]' : 'placeholder:text-[#999999]',
            error ? "border-red-500" : "",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && showErrorMessage && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";

export { AuthInput }; 