import { useTheme } from '@/lib/theme-provider';
import { Moon, Sun, Monitor, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, isDark } = useTheme();
  const [open, setOpen] = useState(false);

  const getButtonIcon = () => {
    if (theme === 'system') {
      return isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />;
    }
    return theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'p-2 rounded-full transition-colors',
            isDark 
              ? 'bg-[#1E1E1E] text-[#F0B90B] hover:bg-[#2A2A2A]' 
              : 'bg-white text-[#F0B90B] hover:bg-gray-100',
            className
          )}
          aria-label="Changer le thème"
        >
          {getButtonIcon()}
        </button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-56 p-0", isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-200")}>
        <div className="py-2">
          <h3 className={cn("px-4 py-2 text-sm font-medium", isDark ? "text-gray-300" : "text-gray-600")}>
            Apparence
          </h3>
          <div className="mt-1">
            <button
              onClick={() => { setTheme('light'); setOpen(false); }}
              className={cn(
                "flex items-center w-full px-4 py-2 text-sm",
                isDark ? "hover:bg-[#2A2A2A] text-white" : "hover:bg-gray-100 text-gray-700"
              )}
            >
              <Sun className="h-4 w-4 mr-2" />
              <span>Clair</span>
              {theme === 'light' && (
                <CheckCircle2 className="h-4 w-4 ml-auto text-[#F0B90B]" />
              )}
            </button>
            <button
              onClick={() => { setTheme('dark'); setOpen(false); }}
              className={cn(
                "flex items-center w-full px-4 py-2 text-sm",
                isDark ? "hover:bg-[#2A2A2A] text-white" : "hover:bg-gray-100 text-gray-700"
              )}
            >
              <Moon className="h-4 w-4 mr-2" />
              <span>Sombre</span>
              {theme === 'dark' && (
                <CheckCircle2 className="h-4 w-4 ml-auto text-[#F0B90B]" />
              )}
            </button>
            <button
              onClick={() => { setTheme('system'); setOpen(false); }}
              className={cn(
                "flex items-center w-full px-4 py-2 text-sm",
                isDark ? "hover:bg-[#2A2A2A] text-white" : "hover:bg-gray-100 text-gray-700"
              )}
            >
              <Monitor className="h-4 w-4 mr-2" />
              <span>Système</span>
              {theme === 'system' && (
                <CheckCircle2 className="h-4 w-4 ml-auto text-[#F0B90B]" />
              )}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 