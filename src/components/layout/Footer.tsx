import { Link } from 'react-router-dom';
import { SiDiscord, SiGithub } from 'react-icons/si';
import { FaXTwitter } from 'react-icons/fa6';
import { useTheme } from '@/lib/theme-provider';

export function Footer() {
  const { isDark } = useTheme();

  return (
    <footer className={`w-full py-6 px-6 md:px-12 lg:px-16 ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-[#333333]'} border-t ${isDark ? 'border-[#2A2A2A]' : 'border-[#E5E5E5]'}`}>
      <div className="w-full flex flex-col items-center">
        <div className="flex justify-center space-x-4 mb-6 mt-6">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isDark ? 'border-[#2A2A2A] hover:bg-[#2A2A2A]' : 'border-[#E5E5E5] hover:bg-[#F5F5F5]'} transition-colors`}
          >
            <SiGithub className="h-5 w-5" />
          </a>
          <a 
            href="https://discord.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isDark ? 'border-[#2A2A2A] hover:bg-[#2A2A2A]' : 'border-[#E5E5E5] hover:bg-[#F5F5F5]'} transition-colors`}
          >
            <SiDiscord className="h-5 w-5" />
          </a>
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isDark ? 'border-[#2A2A2A] hover:bg-[#2A2A2A]' : 'border-[#E5E5E5] hover:bg-[#F5F5F5]'} transition-colors`}
          >
            <FaXTwitter className="h-5 w-5" />
          </a>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm mb-6">
          <Link to="/a-propos" className={`hover:text-[#F0B90B] transition-colors ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
            À propos
          </Link>
          <Link to="/cgu" className={`hover:text-[#F0B90B] transition-colors ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
            Conditions Générales d'Utilisation (CGU)
          </Link>
          <Link to="/cgv" className={`hover:text-[#F0B90B] transition-colors ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
            Conditions Générales de Vente (CGV)
          </Link>
          <Link to="/rgpd" className={`hover:text-[#F0B90B] transition-colors ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
            Politique de confidentialité (RGPD)
          </Link>
          <Link to="/mentions-legales" className={`hover:text-[#F0B90B] transition-colors ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
            Mentions légales
          </Link>
          <Link to="/cookies" className={`hover:text-[#F0B90B] transition-colors ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
            Politique des cookies
          </Link>
        </div>

        <div className="text-center text-sm">
          <p className={`${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
            Copyright © 2025 Luxentis. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
} 