import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';
import React, { InputHTMLAttributes, useState } from 'react';
import { useTheme } from '@/lib/theme-provider';

export interface AuthCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
}

const AuthCheckbox = React.forwardRef<HTMLInputElement, AuthCheckboxProps>(
  ({ className, label, checked, onChange, disabled = false, error, ...props }, ref) => {
    const { isDark } = useTheme();
    const [internalChecked, setInternalChecked] = useState(checked || false);
    
    const handleClick = () => {
      if (disabled) return;
      
      const newValue = !internalChecked;
      setInternalChecked(newValue);
      
      if (onChange) {
        const event = {
          target: {
            name: props.name,
            type: 'checkbox',
            checked: newValue
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onChange(event);
      }
    };
    
    const isChecked = checked !== undefined ? checked : internalChecked;
    
    return (
      <div 
        className={cn(
          "flex items-start", 
          disabled ? "opacity-80" : "cursor-pointer"
        )} 
        onClick={disabled ? undefined : handleClick}
      >
        <div className="flex items-center h-5">
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              className="sr-only"
              ref={ref}
              checked={isChecked}
              onChange={onChange}
              disabled={disabled}
              {...props}
            />
            <div
              className={cn(
                "w-5 h-5 border rounded flex items-center justify-center transition-colors",
                isChecked 
                  ? "bg-[#F0B90B] border-[#F0B90B]" 
                  : `${isDark ? 'bg-[#1E1E1E] border-[#2A2A2A]' : 'bg-white border-[#CCCCCC]'}`,
                error ? "border-red-500 border-2" : "",
                !disabled && "cursor-pointer"
              )}
            >
              {isChecked && <CheckIcon className="h-3.5 w-3.5 text-black" />}
            </div>
          </div>
        </div>
        <div className={cn("ml-3 text-sm", !disabled && "cursor-pointer")}>
          <label className={cn(
            isDark ? 'text-white' : 'text-[#333333]', 
            disabled && "cursor-default"
          )}>
            {label}
          </label>
        </div>
      </div>
    );
  }
);

AuthCheckbox.displayName = "AuthCheckbox";

export { AuthCheckbox }; 