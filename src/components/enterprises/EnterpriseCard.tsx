import { useTheme } from '@/lib/theme-provider';
import { Enterprise } from '@/types/enterprise';
import { Users, Briefcase } from 'lucide-react';

interface EnterpriseCardProps {
  enterprise: Enterprise;
  onClick?: () => void;
}

export function EnterpriseCard({ enterprise, onClick }: EnterpriseCardProps) {
  const { isDark } = useTheme();
  
  return (
    <div 
      className={`rounded-xl p-4 transition-all duration-200 cursor-pointer ${
        isDark 
          ? 'bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A]' 
          : 'bg-white border border-[#E9E9E9] hover:border-[#D9D9D9] hover:shadow-md'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className={`text-lg font-semibold transition-colors duration-200 ${isDark ? 'text-white' : 'text-[#333333]'}`}>
            {enterprise.name}
          </h3>
          <div className="flex items-center mt-1">
            <Briefcase className="h-4 w-4 mr-1 text-[#F0B90B]" />
            <span className={`text-sm transition-colors duration-200 ${isDark ? 'text-[#999999]' : 'text-[#777777]'}`}>
              {enterprise.sector}
            </span>
          </div>
        </div>
        
        <div className="flex items-center bg-[#F0B90B] bg-opacity-10 px-2 py-1 rounded-full">
          <Users className="h-4 w-4 mr-1 text-[#F0B90B]" />
          <span className="text-sm font-medium text-[#F0B90B]">{enterprise.employeeCount}</span>
        </div>
      </div>
      
      <p className={`mt-3 text-sm line-clamp-2 transition-colors duration-200 ${isDark ? 'text-[#AAAAAA]' : 'text-[#666666]'}`}>
        {enterprise.description}
      </p>
      
      <div className={`flex justify-between items-center mt-4 text-xs transition-colors duration-200 ${isDark ? 'text-[#999999]' : 'text-[#777777]'}`}>
        <span>Propriétaire: {enterprise.ownerName}</span>
        <span>Créée le: {new Date(enterprise.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
} 