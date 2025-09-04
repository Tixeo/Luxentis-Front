import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme-provider';
import { MainLayout } from '@/components/layout/MainLayout';
import { EnterpriseCard } from '@/components/enterprises/EnterpriseCard';
import { UserEnterprisePanel } from '@/components/enterprises/UserEnterprisePanel';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEnterpriseStore } from '@/stores/enterpriseStore';

const PAGE_SIZE = 6; 

export default function EnterprisePage() {
  const { isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  
  const enterprises = useEnterpriseStore(state => state.enterprises);
  const isLoading = useEnterpriseStore(state => state.isLoading);
  const error = useEnterpriseStore(state => state.error);
  const fetchEnterprises = useEnterpriseStore(state => state.fetchEnterprises);
  
  
  const filteredEnterprises = enterprises.filter(enterprise => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      enterprise.name.toLowerCase().includes(query) ||
      enterprise.description.toLowerCase().includes(query) ||
      enterprise.sector.toLowerCase().includes(query)
    );
  });
  
  
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedEnterprises = filteredEnterprises.slice(startIndex, startIndex + PAGE_SIZE);
  const totalPages = Math.ceil(filteredEnterprises.length / PAGE_SIZE);

  
  useEffect(() => {
    
    document.documentElement.style.overflowY = 'scroll';
    document.documentElement.style.scrollbarGutter = 'stable';
    
    
    return () => {
      document.documentElement.style.overflowY = '';
      document.documentElement.style.scrollbarGutter = '';
    };
  }, []);

  
  useEffect(() => {
    fetchEnterprises();
  }, [fetchEnterprises]);

  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); 
  };

  const handleEnterpriseClick = (id: string) => {
    console.log('Entreprise cliquée:', id);
    
  };

  
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('scrollbar-dark');
    } else {
      document.body.classList.remove('scrollbar-dark');
    }
    return () => {
      document.body.classList.remove('scrollbar-dark');
    };
  }, [isDark]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-[#333333]'}`}>
          Entreprises
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
              <h2 className={`text-2xl font-bold mb-4 md:mb-0 ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                Toutes les entreprises
              </h2>
              <div className={cn(
                "relative flex items-center rounded-lg overflow-hidden border transition-all w-full md:w-auto",
                isDark 
                  ? 'bg-[#242424] text-white border-[#3A3A3A]' 
                  : 'bg-[#F8F8F8] text-gray-700 border-[#E9E9E9]',
                isFocused && (isDark
                  ? 'border-[#F0B90B]/50 ring-1 ring-[#F0B90B]/50'
                  : 'border-[#F0B90B]/50 ring-1 ring-[#F0B90B]/50')
              )}>
                <div className="px-3">
                  <Search className={cn(
                    "h-4 w-4",
                    isFocused ? "text-[#F0B90B]" : "text-gray-400"
                  )} />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher une entreprise..."
                  value={searchQuery}
                  onChange={handleSearch}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  style={{color: isDark ? '#FFFFFF' : '#333333'}}
                  className={cn(
                    "p-2 pr-3 text-sm outline-none min-w-0 flex-1",
                    isDark ? 'bg-[#242424]' : 'bg-[#F8F8F8]',
                    "[&::placeholder]:text-[#888888]"
                  )}
                  size={25}
                />
              </div>
            </div>
            

            {isLoading ? (
              
              <div className="grid grid-cols-1 gap-4 mb-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div 
                    key={index}
                    className={`rounded-xl p-6 w-full animate-subtle-pulse ${
                      isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-white border border-[#E9E9E9] shadow-sm'
                    }`}
                  >
                    <div className={`h-6 rounded w-1/3 mb-3 ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-300'}`}></div>
                    <div className={`h-4 rounded w-3/4 mb-2 ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-300'}`}></div>
                    <div className={`h-4 rounded w-1/2 ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-300'}`}></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              
              <div className={`rounded-xl p-8 flex flex-col items-center justify-center ${
                isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-white border border-[#E9E9E9]'
              }`}>
                <p className={`text-lg mb-2 text-red-500`}>
                  Une erreur est survenue
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {error}
                </p>
              </div>
            ) : paginatedEnterprises.length === 0 ? (
              
              <div className={`rounded-xl p-8 flex flex-col items-center justify-center ${
                isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-white border border-[#E9E9E9]'
              }`}>
                <p className={`text-lg mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Aucune entreprise trouvée
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {searchQuery 
                    ? "Essayez de modifier votre recherche" 
                    : "Il n'y a pas encore d'entreprises enregistrées"}
                </p>
              </div>
            ) : (
              
              <>
                <div className="grid grid-cols-1 gap-4 mb-6">
                  {paginatedEnterprises.map((enterprise) => (
                    <EnterpriseCard 
                      key={enterprise.id} 
                      enterprise={enterprise} 
                      onClick={() => handleEnterpriseClick(enterprise.id.toString())}
                    />
                  ))}
                </div>
                
                
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-md text-sm ${
                            currentPage === page
                              ? 'bg-[#F0B90B] text-white'
                              : isDark
                                ? 'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A]'
                                : 'bg-[#F5F5F5] text-gray-700 hover:bg-[#EBEBEB]'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h2 className={`text-2xl font-bold mb-4 text-center lg:text-left ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                Votre entreprise
              </h2>
              <UserEnterprisePanel />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 