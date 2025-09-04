import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme-provider';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChevronDown, ChevronUp, Shield, Book, Award, AlertTriangle, Gavel, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';


interface Law {
  id: number;
  title: string;
  description: string;
  consequences: string;
  icon: 'shield' | 'book' | 'award' | 'alert' | 'gavel';
}

interface Subcategory {
  id: string;
  name: string;
  description: string;
  icon: 'shield' | 'book' | 'award' | 'alert' | 'gavel';
  laws: Law[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  subcategories: Subcategory[];
}


const categories: Category[] = [
  {
    id: 'rp',
    name: 'Règles de jeu (RP)',
    description: 'Ces règles concernent le jeu de rôle, l\'économie et les interactions dans l\'univers Minecraft de Luxentis.',
    subcategories: [
      {
        id: 'griefing',
        name: 'Griefing et Destructions',
        description: 'Règles concernant la destruction et la modification des constructions.',
        icon: 'shield',
        laws: [
          {
            id: 1,
            title: "Griefing de constructions",
            description: "Il est interdit de détruire, modifier ou vandaliser les constructions d'autres joueurs sans leur autorisation explicite.",
            consequences: "Avertissement, bannissement temporaire (1-7 jours), réparation obligatoire des dégâts ou bannissement permanent en cas de récidive.",
            icon: 'shield'
          },
          {
            id: 2,
            title: "Destruction de zones protégées",
            description: "Les zones protégées ou administratives doivent être respectées. Il est interdit d'y construire ou de les modifier sans autorisation.",
            consequences: "Avertissement, annulation des modifications et bannissement temporaire en cas de récidive.",
            icon: 'shield'
          },
          {
            id: 3,
            title: "Vandalisme de bâtiments publics",
            description: "La dégradation intentionnelle de bâtiments publics, monuments ou infrastructures communes est interdite.",
            consequences: "Réparation obligatoire, amende virtuelle et bannissement temporaire (2-5 jours).",
            icon: 'shield'
          }
        ]
      },
      {
        id: 'economy',
        name: 'Lois Économiques',
        description: 'Règles régissant l\'économie, le commerce et les transactions.',
        icon: 'award',
        laws: [
          {
            id: 4,
            title: "Vol de ressources",
            description: "Le vol de ressources, d'objets ou de monnaie appartenant à d'autres joueurs ou à des entreprises est formellement interdit.",
            consequences: "Remboursement des biens volés, bannissement temporaire (1-5 jours) ou bannissement permanent en cas de récidive multiple.",
            icon: 'gavel'
          },
          {
            id: 5,
            title: "Monopole économique abusif",
            description: "Les pratiques visant à créer un monopole destructeur pour l'économie du serveur ou à manipuler artificiellement les prix du marché sont interdites.",
            consequences: "Avertissement, sanctions économiques, dissolution forcée de l'entreprise ou bannissement temporaire.",
            icon: 'award'
          },
          {
            id: 6,
            title: "Transactions hors-serveur",
            description: "Les transactions impliquant de l'argent réel pour des biens virtuels du serveur sont interdites.",
            consequences: "Bannissement permanent des comptes impliqués et confiscation des biens virtuels concernés.",
            icon: 'gavel'
          },
          {
            id: 7,
            title: "Fraude économique",
            description: "Toute tentative de fraude, d'escroquerie ou de manipulation des systèmes économiques du serveur est interdite.",
            consequences: "Confiscation des biens frauduleux, bannissement temporaire (7-30 jours) ou permanent selon la gravité.",
            icon: 'alert'
          }
        ]
      },
      {
        id: 'cheating',
        name: 'Triche et Exploits',
        description: 'Règles concernant la triche, les bugs et les avantages déloyaux.',
        icon: 'alert',
        laws: [
          {
            id: 8,
            title: "Utilisation de mods interdits",
            description: "L'utilisation de mods non autorisés, de clients hackés ou de logiciels tiers pour obtenir un avantage est interdite.",
            consequences: "Bannissement temporaire (7-30 jours) ou permanent selon la gravité et l'impact sur l'économie du serveur.",
            icon: 'alert'
          },
          {
            id: 9,
            title: "Exploitation de bugs",
            description: "L'exploitation intentionnelle de bugs ou de failles du serveur pour obtenir un avantage unfair est interdite.",
            consequences: "Confiscation des gains obtenus, bannissement temporaire (3-14 jours) ou permanent en cas de récidive.",
            icon: 'alert'
          },
          {
            id: 10,
            title: "Duplication d'objets",
            description: "Toute tentative de duplication d'objets, de ressources ou de monnaie par l'exploitation de bugs est strictement interdite.",
            consequences: "Suppression des objets dupliqués, bannissement temporaire (14-30 jours) ou permanent.",
            icon: 'alert'
          }
        ]
      }
    ]
  },
  {
    id: 'server',
    name: 'Règles du serveur',
    description: 'Ces règles concernent le comportement général, le respect, la sécurité et l\'utilisation du serveur Luxentis.',
    subcategories: [
      {
        id: 'respect',
        name: 'Respect et Comportement',
        description: 'Règles concernant le respect entre joueurs et le comportement général.',
        icon: 'book',
        laws: [
          {
            id: 11,
            title: "Respect entre joueurs",
            description: "Tout comportement toxique, discours haineux, harcèlement ou discrimination envers d'autres joueurs est interdit.",
            consequences: "Avertissement, mute temporaire ou bannissement selon la gravité et la récurrence.",
            icon: 'book'
          },
          {
            id: 12,
            title: "Langage inapproprié",
            description: "L'utilisation d'un langage vulgaire, offensant ou inapproprié dans le chat public est interdite.",
            consequences: "Avertissement, mute temporaire (1-12h) ou bannissement temporaire en cas de récidive.",
            icon: 'book'
          },
          {
            id: 13,
            title: "Harcèlement et menaces",
            description: "Le harcèlement, les menaces ou l'intimidation d'autres joueurs sont strictement interdits.",
            consequences: "Bannissement temporaire (3-30 jours) ou permanent selon la gravité des actes.",
            icon: 'book'
          }
        ]
      },
      {
        id: 'communication',
        name: 'Communication et Chat',
        description: 'Règles concernant l\'utilisation du chat et des moyens de communication.',
        icon: 'book',
        laws: [
          {
            id: 14,
            title: "Spam et flood",
            description: "Le spam dans le chat, la répétition excessive de messages ou le flood sont interdits.",
            consequences: "Avertissement, mute temporaire (1-24h) ou bannissement en cas de récidive.",
            icon: 'book'
          },
          {
            id: 15,
            title: "Publicité non autorisée",
            description: "La publicité pour d'autres serveurs, sites web ou services externes non liés à Luxentis est interdite.",
            consequences: "Avertissement, mute temporaire (6-48h) ou bannissement selon la récurrence.",
            icon: 'book'
          },
          {
            id: 16,
            title: "Partage d'informations personnelles",
            description: "Le partage d'informations personnelles (coordonnées, adresses, etc.) dans le chat public est déconseillé et peut être sanctionné.",
            consequences: "Avertissement et suppression du message pour la sécurité du joueur.",
            icon: 'book'
          }
        ]
      },
      {
        id: 'security',
        name: 'Sécurité et Sanctions',
        description: 'Règles concernant la sécurité du serveur et le contournement des sanctions.',
        icon: 'shield',
        laws: [
          {
            id: 17,
            title: "Usurpation d'identité",
            description: "Se faire passer pour un membre du staff ou pour un autre joueur est strictement interdit.",
            consequences: "Bannissement temporaire (3-14 jours) ou permanent selon la gravité et l'intention.",
            icon: 'shield'
          },
          {
            id: 18,
            title: "Contournement des sanctions",
            description: "Tenter de contourner un bannissement ou une sanction via un compte alternatif est interdit.",
            consequences: "Bannissement permanent de tous les comptes associés.",
            icon: 'alert'
          },
          {
            id: 19,
            title: "Tentative de piratage",
            description: "Toute tentative de piratage, d'intrusion ou d'attaque contre le serveur ou ses systèmes est interdite.",
            consequences: "Bannissement permanent immédiat et signalement aux autorités compétentes si nécessaire.",
            icon: 'alert'
          }
        ]
      }
    ]
  }
];


const generateTestLaws = (baseSubcategory: Subcategory): Subcategory => {
  const testLaws: Law[] = [];
  
  testLaws.push(...baseSubcategory.laws);
  
  
  const lastId = baseSubcategory.laws.length > 0 
    ? Math.max(...baseSubcategory.laws.map(law => law.id)) 
    : 0;
  
  for (let i = 1; i <= 20; i++) {
    testLaws.push({
      id: lastId + i,
      title: `Test loi ${i} (${baseSubcategory.name})`,
      description: `Description de test pour la loi ${i} dans la catégorie ${baseSubcategory.name}.`,
      consequences: `Conséquences de test pour la loi ${i}.`,
      icon: baseSubcategory.icon as 'shield' | 'book' | 'award' | 'alert' | 'gavel'
    });
  }
  
  return {
    ...baseSubcategory,
    laws: testLaws
  };
};


const enrichedCategories = categories.map(category => ({
  ...category,
  subcategories: category.subcategories.map(subcategory => 
    generateTestLaws(subcategory)
  )
}));

export default function LawsPage() {
  const { isDark } = useTheme();
  const [expandedLaw, setExpandedLaw] = useState<number | null>(null);
  const [expandedSubcategory, setExpandedSubcategory] = useState<string | null>(null);
  const [subcategoryPages, setSubcategoryPages] = useState<Record<string, number>>({});
  
  const lawsPerPage = 10;
  
  const toggleLaw = (id: number) => {
    
    
    setExpandedLaw(expandedLaw === id ? null : id);
  };

  const toggleSubcategory = (id: string) => {
    
    
    setExpandedSubcategory(expandedSubcategory === id ? null : id);
  };

  const getSubcategoryPage = (subcategoryId: string) => {
    return subcategoryPages[subcategoryId] || 0;
  };

  const setSubcategoryPage = (subcategoryId: string, page: number) => {
    setSubcategoryPages(prev => ({
      ...prev,
      [subcategoryId]: page
    }));
  };

  const getPaginatedLaws = (laws: Law[], subcategoryId: string) => {
    const currentPage = getSubcategoryPage(subcategoryId);
    const startIndex = currentPage * lawsPerPage;
    const endIndex = startIndex + lawsPerPage;
    return laws.slice(startIndex, endIndex);
  };

  const getTotalPages = (laws: Law[]) => {
    return Math.ceil(laws.length / lawsPerPage);
  };

  
  const renderIcon = (icon: string) => {
    switch(icon) {
      case 'shield': return <Shield className="h-5 w-5 text-[#F0B90B]" />;
      case 'book': return <Book className="h-5 w-5 text-[#F0B90B]" />;
      case 'award': return <Award className="h-5 w-5 text-[#F0B90B]" />;
      case 'alert': return <AlertTriangle className="h-5 w-5 text-[#F0B90B]" />;
      case 'gavel': return <Gavel className="h-5 w-5 text-[#F0B90B]" />;
      default: return <Book className="h-5 w-5 text-[#F0B90B]" />;
    }
  };

  
  useEffect(() => {
    document.documentElement.style.overflowY = 'scroll';
    document.documentElement.style.scrollbarGutter = 'stable';
    
    return () => {
      document.documentElement.style.overflowY = '';
      document.documentElement.style.scrollbarGutter = '';
    };
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-start mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>
            Lois et Règlements
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Découvrez les règles à respecter sur le serveur Luxentis pour une expérience de jeu harmonieuse.
          </p>
        </div>
        
        {/* Rendu des catégories */}
        {enrichedCategories.map((category) => (
          <div key={category.id} className="mb-10 w-full">
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-[#F0B90B]' : 'text-[#D09000]'}`}>
              {category.name}
            </h2>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {category.description}
            </p>
            
            {/* Rendu des sous-catégories */}
            <div className="space-y-6">
              {category.subcategories.map((subcategory) => {
                const currentPage = getSubcategoryPage(subcategory.id);
                const totalPages = getTotalPages(subcategory.laws);
                const paginatedLaws = getPaginatedLaws(subcategory.laws, subcategory.id);
                
                return (
                  <div
                    key={subcategory.id}
                    className={cn(
                      "rounded-xl overflow-hidden border transition-all",
                      isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-white border-[#E9E9E9] shadow-sm',
                      "hover:border-[#F0B90B]/30"
                    )}
                  >
                    {/* Header de la sous-catégorie */}
                    <div 
                      className="p-4 cursor-pointer flex items-center justify-between border-b border-[#2A2A2A]"
                      onClick={() => toggleSubcategory(subcategory.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          isDark ? 'bg-[#242424]' : 'bg-[#F8F8F8]'
                        )}>
                          {renderIcon(subcategory.icon)}
                        </div>
                        <div>
                          <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                            {subcategory.name}
                          </h3>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {subcategory.description} ({subcategory.laws.length} règle{subcategory.laws.length > 1 ? 's' : ''})
                          </p>
                        </div>
                      </div>
                      {expandedSubcategory === subcategory.id ? (
                        <ChevronUp className="h-5 w-5 text-[#F0B90B]" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-[#F0B90B]" />
                      )}
                    </div>
                    
                    {/* Contenu de la sous-catégorie */}
                    {expandedSubcategory === subcategory.id && (
                      <div className="p-4">
                        {/* Liste des règles paginées */}
                        <div className="space-y-4 mb-4">
                          {paginatedLaws.map((law) => (
                            <div
                              key={law.id}
                              className={cn(
                                "rounded-lg overflow-hidden border transition-all",
                                isDark ? 'bg-[#0F0F0F] border-[#333333]' : 'bg-[#FAFAFA] border-[#E0E0E0]',
                                "hover:border-[#F0B90B]/30"
                              )}
                            >
                              <div 
                                className="p-3 cursor-pointer flex items-center justify-between"
                                onClick={() => toggleLaw(law.id)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className={cn(
                                    "p-1.5 rounded",
                                    isDark ? 'bg-[#1A1A1A]' : 'bg-[#F0F0F0]'
                                  )}>
                                    {renderIcon(law.icon)}
                                  </div>
                                  <div>
                                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                                      {law.title}
                                    </h4>
                                  </div>
                                </div>
                                {expandedLaw === law.id ? (
                                  <ChevronUp className="h-4 w-4 text-[#F0B90B]" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-[#F0B90B]" />
                                )}
                              </div>
                              
                              {expandedLaw === law.id && (
                                <div className={cn(
                                  "p-3 border-t",
                                  isDark ? 'border-[#333333] bg-[#0A0A0A]' : 'border-[#E0E0E0] bg-[#F5F5F5]'
                                )}>
                                  <div className="space-y-3">
                                    <div>
                                      <h5 className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Description
                                      </h5>
                                      <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                                        {law.description}
                                      </p>
                                    </div>
                                    <div>
                                      <h5 className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Conséquences
                                      </h5>
                                      <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                                        {law.consequences}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Pagination style market.tsx */}
                        {totalPages > 1 && (
                          <div className="flex justify-center mt-8">
                            <Pagination>
                              <PaginationContent>
                                <PaginationItem>
                                  <PaginationPrevious 
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (currentPage > 0) setSubcategoryPage(subcategory.id, currentPage - 1);
                                    }}
                                    className={currentPage === 0 ? 'pointer-events-none opacity-50' : ''}
                                  />
                                </PaginationItem>
                                
                                {/* Première page */}
                                <PaginationItem>
                                  <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setSubcategoryPage(subcategory.id, 0);
                                    }}
                                    isActive={currentPage === 0}
                                  >
                                    1
                                  </PaginationLink>
                                </PaginationItem>

                                {/* Ellipsis de début si nécessaire */}
                                {currentPage > 2 && totalPages > 5 && (
                                  <PaginationItem>
                                    <PaginationEllipsis />
                                  </PaginationItem>
                                )}

                                {/* Pages autour de la page courante */}
                                {Array.from({ length: totalPages }, (_, i) => i)
                                  .filter(page => {
                                    if (totalPages <= 5) return page !== 0 && page !== totalPages - 1;
                                    if (page === 0 || page === totalPages - 1) return false;
                                    return Math.abs(page - currentPage) <= 1;
                                  })
                                  .map((page) => (
                                    <PaginationItem key={page}>
                                      <PaginationLink
                                        href="#"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setSubcategoryPage(subcategory.id, page);
                                        }}
                                        isActive={currentPage === page}
                                      >
                                        {page + 1}
                                      </PaginationLink>
                                    </PaginationItem>
                                  ))}

                                {/* Ellipsis de fin si nécessaire */}
                                {currentPage < totalPages - 3 && totalPages > 5 && (
                                  <PaginationItem>
                                    <PaginationEllipsis />
                                  </PaginationItem>
                                )}

                                {/* Dernière page */}
                                {totalPages > 1 && (
                                  <PaginationItem>
                                    <PaginationLink
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setSubcategoryPage(subcategory.id, totalPages - 1);
                                      }}
                                      isActive={currentPage === totalPages - 1}
                                    >
                                      {totalPages}
                                    </PaginationLink>
                                  </PaginationItem>
                                )}

                                <PaginationItem>
                                  <PaginationNext 
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (currentPage < totalPages - 1) setSubcategoryPage(subcategory.id, currentPage + 1);
                                    }}
                                    className={currentPage === totalPages - 1 ? 'pointer-events-none opacity-50' : ''}
                                  />
                                </PaginationItem>
                              </PaginationContent>
                            </Pagination>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className={cn(
          "mt-8 p-4 rounded-xl border",
          isDark ? 'bg-[#F0B90B]/10 border-[#F0B90B]/20 text-[#F0B90B]' : 'bg-[#F0B90B]/5 border-[#F0B90B]/10 text-[#D09000]'
        )}>
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Note importante</p>
              <p className="text-sm mt-1">
                Cette liste n'est pas exhaustive. L'équipe de modération se réserve le droit d'appliquer des sanctions pour tout comportement jugé inapproprié, même s'il n'est pas explicitement mentionné ici.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 