import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@/lib/theme-provider';
import { Home, ArrowLeft } from 'lucide-react';
import { ProjectLogo } from '@/components/auth/ProjectLogo';

export default function NotFoundPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${
      isDark ? 'bg-[#121212] text-white' : 'bg-white text-[#333333]'
    }`}>
      <div className={`max-w-md w-full text-center ${
        isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-white border border-[#E9E9E9] shadow-sm'
      } rounded-xl p-8`}>
        <ProjectLogo className="mx-auto mb-6" />
        
        <h1 className="text-7xl font-bold mb-4 text-[#F0B90B]">404</h1>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#333333]'}`}>
          Page non trouvée
        </h2>
        
        <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center justify-center py-3 px-6 rounded-lg ${
              isDark 
                ? 'bg-[#242424] text-white hover:bg-[#2A2A2A]' 
                : 'bg-[#F5F5F5] text-[#333333] hover:bg-[#EBEBEB]'
            } transition-colors`}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </button>
          
          <Link
            to="/"
            className="flex items-center justify-center py-3 px-6 rounded-lg bg-[#F0B90B] hover:bg-[#E0A90A] text-black transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Accueil
          </Link>
        </div>
      </div>
      
      <div className={`mt-8 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        © {new Date().getFullYear()} Luxentis
      </div>
    </div>
  );
} 