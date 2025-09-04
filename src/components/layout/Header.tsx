import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, User, LogOut, Menu, X, Plus, ShoppingCart } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useTheme } from '@/lib/theme-provider';
import { ProjectLogo } from '@/components/auth/ProjectLogo';
import { useUserStore } from '@/stores/userStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const serverStatus = {
  online: true,
  players: 156,
  maxPlayers: 200
};

export function Header() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showEconomyMenu, setShowEconomyMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  const username = useUserStore(state => state.username);
  const logout = useUserStore(state => state.logout);
  
  const economyMenuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      
      if (target.closest('a')) {
        return;
      }
      
      if (economyMenuRef.current && !economyMenuRef.current.contains(target)) {
        setShowEconomyMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.2);
          opacity: 0.7;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
      
      .status-indicator {
        animation: pulse 2s infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      const redirectParam = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${redirectParam}`);
    }
  }, [isAuthenticated, navigate, location]);

  return (
    <header className={`w-full py-4 px-6 md:px-12 lg:px-16 ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-[#333333]'} border-b ${isDark ? 'border-[#2A2A2A]' : 'border-[#E5E5E5]'}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Link to={isAuthenticated ? '/home' : '/'} className="mr-10">
            <ProjectLogo />
          </Link>
          
          {isAuthenticated && (
            <nav className="hidden md:flex space-x-6">
              <Link to="/home" className="hover:text-[#F0B90B] transition-colors">
                Accueil
              </Link>
              
              <Popover open={showEconomyMenu} onOpenChange={setShowEconomyMenu}>
                <PopoverTrigger asChild>
                  <button 
                    className="flex items-center hover:text-[#F0B90B] transition-colors"
                  >
                    Économie
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className={cn("w-48 p-0", isDark ? "bg-[#1E1E1E] border-[#2A2A2A]" : "bg-white border-[#E5E5E5]")}>
                  <div className="py-1">
                    <Link to="/market" className={cn(
                      "flex items-center w-full px-4 py-2 text-sm",
                      isDark ? "hover:bg-[#2A2A2A] text-white" : "hover:bg-gray-100 text-gray-700"
                    )}>
                      Marchés
                    </Link>
                    <Link to="/banque" className={cn(
                      "flex items-center w-full px-4 py-2 text-sm",
                      isDark ? "hover:bg-[#2A2A2A] text-white" : "hover:bg-gray-100 text-gray-700"
                    )}>
                      Banque
                    </Link>
                    <Link to="/entreprises" className={cn(
                      "flex items-center w-full px-4 py-2 text-sm",
                      isDark ? "hover:bg-[#2A2A2A] text-white" : "hover:bg-gray-100 text-gray-700"
                    )}>
                      Entreprises
                    </Link>
                    <Link to="/job" className={cn(
                      "flex items-center w-full px-4 py-2 text-sm",
                      isDark ? "hover:bg-[#2A2A2A] text-white" : "hover:bg-gray-100 text-gray-700"
                    )}>
                      Métiers
                    </Link>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Link to="/lois" className="hover:text-[#F0B90B] transition-colors">
                Lois
              </Link>
              
              <Link to="/map" className="hover:text-[#F0B90B] transition-colors">
                Carte
              </Link>
              
              {/* <a 
                href="https://luxentis.tebex.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#F0B90B] transition-colors"
              >
                Boutique
              </a> */}
            </nav>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
        <Button className="bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-black" onClick={() => window.open('https://luxentis.tebex.io', '_blank')}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Boutique
            </Button>
          {/* Status du serveur */}
          <div className={`hidden sm:flex items-center p-2.5 rounded-lg ${isDark ? 'bg-[#1E1E1E]' : 'bg-[#F5F5F5]'}`}>
            <div className="mr-2 relative">
              <div className={`h-2.5 w-2.5 rounded-full ${serverStatus.online ? 'bg-green-500' : 'bg-red-500'} status-indicator`}></div>
            </div>
            <span className={`text-xs ${isDark ? 'text-[#AAAAAA]' : 'text-[#777777]'}`}>
              {serverStatus.players}/{serverStatus.maxPlayers}
            </span>
          </div>
          
          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          
          {isAuthenticated && (
            <Popover open={showProfileMenu} onOpenChange={setShowProfileMenu}>
              <PopoverTrigger asChild>
                <button 
                  className={`flex items-center justify-center w-10 h-10 rounded-full border ${isDark ? 'border-[#2A2A2A]' : 'border-[#E5E5E5]'} hover:border-[#F0B90B] transition-colors`}
                >
                  <User className="h-5 w-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className={cn("w-56 p-0", isDark ? "bg-[#1E1E1E] border-[#2A2A2A]" : "bg-white border-[#E5E5E5]")}>
                <div className="py-1">
                  {username && (
                    <div className={`px-4 py-2 ${isDark ? 'text-[#AAAAAA]' : 'text-[#666666]'} border-b ${isDark ? 'border-[#2A2A2A]' : 'border-[#E5E5E5]'} text-sm`}>
                      Connecté en tant que <span className="font-medium">{username}</span>
                    </div>
                  )}
                  <Link to="/profile" className={cn(
                    "flex items-center w-full px-4 py-2 text-sm",
                    isDark ? "hover:bg-[#2A2A2A] text-white" : "hover:bg-gray-100 text-gray-700"
                  )}>
                    <User className="h-4 w-4 mr-2" />
                    Profil
                  </Link>
                  <Link to="/change-password" className={cn(
                    "flex items-center w-full px-4 py-2 text-sm",
                    isDark ? "hover:bg-[#2A2A2A] text-white" : "hover:bg-gray-100 text-gray-700"
                  )}>
                    <User className="h-4 w-4 mr-2" />
                    Changer mot de passe
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className={cn(
                      "flex items-center w-full px-4 py-2 text-sm text-left",
                      isDark ? "hover:bg-[#2A2A2A] text-white" : "hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          <ThemeToggle className="md:block" />
          
          {mobileMenuOpen && (
            <div className={`fixed inset-0 z-50 ${isDark ? 'bg-[#121212]/95' : 'bg-white/95'}`}>
              <div className="w-full h-screen flex flex-col">
                <div className="flex justify-between items-center p-6">
                  <ProjectLogo />
                  <button onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <nav className="flex-1 overflow-y-auto p-6 space-y-6">
                  <Link to="/home" className="block text-xl font-medium">
                    Accueil
                  </Link>
                  
                  <div className="space-y-2">
                    <h3 className={`font-medium mb-2 ${isDark ? 'text-[#AAAAAA]' : 'text-[#666666]'}`}>Économie</h3>
                    <Link to="/market" className="block pl-4 py-2 hover:bg-[#F0B90B] hover:text-black">
                      Marchés
                    </Link>
                    <Link to="/banque" className="block pl-4 py-2 hover:bg-[#F0B90B] hover:text-black">
                      Banque
                    </Link>
                    <Link to="/entreprises" className="block pl-4 py-2 hover:bg-[#F0B90B] hover:text-black">
                      Entreprises
                    </Link>
                    <Link to="/job" className="block pl-4 py-2 hover:bg-[#F0B90B] hover:text-black">
                      Métiers
                    </Link>
                  </div>
                  
                  <Link to="/lois" className="block text-xl font-medium">
                    Lois
                  </Link>
                  
                  <Link to="/map" className="block text-xl font-medium">
                    Carte
                  </Link>
                  
                  <a 
                    href="https://luxentis.tebex.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-xl font-medium"
                  >
                    Boutique
                  </a>
                  
                  <div className="border-t border-gray-700 my-2"></div>
                  
                  <Link to="/profile" className="block font-medium flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Profil
                  </Link>
                  
                  <Link to="/change-password" className="block font-medium flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Changer mot de passe
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left font-medium flex items-center"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Déconnexion
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 