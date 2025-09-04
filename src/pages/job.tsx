import { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTheme } from '@/lib/theme-provider';
import { useToast } from '@/hooks/use-toast';
import { 
  BriefcaseBusiness, 
  Award, 
  CheckCircle, 
  LogOut, 
  Gift, 
  ArrowRight, 
  Pickaxe, 
  Axe, 
  Wheat, 
  Sword,

  Filter,
  X
} from 'lucide-react';
import { pie, arc, PieArcDatum } from "d3";
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
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

type ItemReward = {
  name: string;
  quantity: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
};

type Objective = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  moneyReward?: number;
  itemRewards?: ItemReward[];
  completed: boolean;
  rewardClaimed: boolean;
  progress?: number; 
};

type Job = {
  id: string;
  name: string;
  icon: string;
  description: string;
  level: number;
  currentXp: number;
  requiredXp: number;
  objectives: Objective[];
};


const mockJobs: Job[] = [
  {
    id: "miner",
    name: "Mineur",
    icon: "pickaxe",
    description: "miner desc",
    level: 3,
    currentXp: 650,
    requiredXp: 1000,
    objectives: [
      { 
        id: "m1", 
        title: "Miner 100 blocs de pierre", 
        description: "Récolter 100 blocs de pierre de n'importe quel type", 
        xpReward: 50,
        moneyReward: 15,
        itemRewards: [
          { name: "Pioche en fer", quantity: 1, rarity: 'uncommon' },
          { name: "Pierre", quantity: 32, rarity: 'common' }
        ],
        completed: true, 
        rewardClaimed: true, 
        progress: 1 
      },
      { 
        id: "m2", 
        title: "Miner 20 minerais de fer", 
        description: "Trouver et extraire 20 minerais de fer", 
        xpReward: 100, 
        moneyReward: 40,
        itemRewards: [
          { name: "Lingots de fer", quantity: 15, rarity: 'common' },
          { name: "Pioche en diamant", quantity: 1, rarity: 'rare' }
        ],
        completed: true, 
        rewardClaimed: false, 
        progress: 1 
      },
      { 
        id: "m3", 
        title: "Miner 10 minerais d'or", 
        description: "Trouver et extraire 10 minerais d'or", 
        xpReward: 120, 
        itemRewards: [
          { name: "Pépites d'or", quantity: 25, rarity: 'rare' },
          { name: "Lingots d'or", quantity: 10, rarity: 'rare' }
        ],
        completed: false, 
        rewardClaimed: false, 
        progress: 0.7 
      },
      { 
        id: "m4", 
        title: "Miner 5 minerais de diamant", 
        description: "Trouver et extraire 5 minerais de diamant", 
        xpReward: 200, 
        itemRewards: [
          { name: "Pioche en diamant", quantity: 1, rarity: 'epic' },
          { name: "Lingots de diamant", quantity: 5, rarity: 'epic' }
        ],
        completed: false, 
        rewardClaimed: false, 
        progress: 0.35 
      },
      { 
        id: "m5", 
        title: "Miner 50 blocs de charbon", 
        description: "Extraire 50 minerais de charbon", 
        xpReward: 75, 
        itemRewards: [
          { name: "Charbon", quantity: 64, rarity: 'common' },
          { name: "Charbon", quantity: 16, rarity: 'common' }
        ],
        completed: true, 
        rewardClaimed: false, 
        progress: 1 
      },
      { 
        id: "m6", 
        title: "Creuser un tunnel de 100 blocs", 
        description: "Creuser un tunnel en ligne droite sur 100 blocs", 
        xpReward: 80, 
        itemRewards: [
          { name: "Torches", quantity: 32, rarity: 'common' },
          { name: "Bloc de redstone", quantity: 16, rarity: 'common' }
        ],
        completed: false, 
        rewardClaimed: false, 
        progress: 0.45 
      },
      { 
        id: "m7", 
        title: "Trouver une mine abandonnée", 
        description: "Découvrir et explorer une mine abandonnée", 
        xpReward: 150, 
        itemRewards: [
          { name: "Coffre du mineur", quantity: 1, rarity: 'legendary' },
          { name: "Échelle", quantity: 16, rarity: 'common' }
        ],
        completed: true, 
        rewardClaimed: true, 
        progress: 1 
      },
      { 
        id: "m8", 
        title: "Miner avec une pioche en diamant", 
        description: "Utiliser une pioche en diamant pour miner 25 blocs", 
        xpReward: 90, 
        itemRewards: [
          { name: "Enchantement Fortune", quantity: 1, rarity: 'epic' },
          { name: "Lingots de fer", quantity: 10, rarity: 'common' }
        ],
        completed: false, 
        rewardClaimed: false, 
        progress: 0.2 
      },
      { 
        id: "m9", 
        title: "Collecter 3 types de minerais différents", 
        description: "Miner du fer, de l'or et du charbon en une session", 
        xpReward: 110, 
        itemRewards: [
          { name: "Sac de minerais", quantity: 1, rarity: 'rare' },
          { name: "Lingots d'or", quantity: 5, rarity: 'rare' },
          { name: "Lingots de fer", quantity: 10, rarity: 'common' }
        ],
        completed: true, 
        rewardClaimed: false, 
        progress: 1 
      },
      { 
        id: "m10", 
        title: "Descendre au niveau bedrock", 
        description: "Atteindre la couche Y=5 ou moins", 
        xpReward: 60, 
        itemRewards: [
          { name: "Échelle", quantity: 16, rarity: 'common' },
          { name: "Bloc de redstone", quantity: 8, rarity: 'common' }
        ],
        completed: false, 
        rewardClaimed: false, 
        progress: 0.8 
      },
      { 
        id: "m11", 
        title: "Miner 1000 blocs au total", 
        description: "Cumuler 1000 blocs minés toutes catégories confondues", 
        xpReward: 250, 
        itemRewards: [
          { name: "Titre : Maître Mineur", quantity: 1, rarity: 'legendary' },
          { name: "Lingots de fer", quantity: 20, rarity: 'common' },
          { name: "Lingots d'or", quantity: 10, rarity: 'common' },
          { name: "Lingots de diamant", quantity: 5, rarity: 'common' }
        ],
        completed: false, 
        rewardClaimed: false, 
        progress: 0.65 
      },
      { 
        id: "m12", 
        title: "Survivre à une explosion de creeper en minant", 
        description: "Continuer à miner après avoir survécu à un creeper", 
        xpReward: 130, 
        itemRewards: [
          { name: "Armure en fer", quantity: 1, rarity: 'uncommon' },
          { name: "Échelle", quantity: 16, rarity: 'common' }
        ],
        completed: false, 
        rewardClaimed: false, 
        progress: 0 
      }
    ]
  },
  {
    id: "farmer",
    name: "Fermier",
    icon: "wheat",
    description: "farmer desc",
    level: 2,
    currentXp: 320,
    requiredXp: 800,
    objectives: [
      { 
        id: "f1", 
        title: "Récolter 200 blés", 
        description: "Faire pousser et récolter 200 plants de blé", 
        xpReward: 80, 
        itemRewards: [
          { name: "Graines de blé", quantity: 64, rarity: 'common' },
          { name: "Pain doré", quantity: 10, rarity: 'rare' }
        ],
        completed: true, 
        rewardClaimed: true 
      },
      { 
        id: "f2", 
        title: "Élever 10 vaches", 
        description: "Élever un troupeau de 10 vaches", 
        xpReward: 100, 
        itemRewards: [
          { name: "Seau de lait", quantity: 3, rarity: 'uncommon' },
          { name: "Beurre", quantity: 10, rarity: 'common' }
        ],
        completed: false, 
        rewardClaimed: false 
      },
      { 
        id: "f3", 
        title: "Produire 50 pains", 
        description: "Cuire 50 pains avec le blé récolté", 
        xpReward: 60, 
        itemRewards: [
          { name: "Pain doré", quantity: 10, rarity: 'rare' },
          { name: "Beurre", quantity: 10, rarity: 'common' }
        ],
        completed: false, 
        rewardClaimed: false 
      }
    ]
  },
  {
    id: "woodcutter",
    name: "Bûcheron",
    icon: "axe",
    description: "woodcutter desc",
    level: 1,
    currentXp: 150,
    requiredXp: 500,
    objectives: [
      { 
        id: "w1", 
        title: "Couper 100 blocs de chêne", 
        description: "Abattre des chênes et récolter 100 blocs de bois", 
        xpReward: 40, 
        itemRewards: [
          { name: "Hache en fer", quantity: 1, rarity: 'uncommon' },
          { name: "Bloc de bois", quantity: 100, rarity: 'common' }
        ],
        completed: false, 
        rewardClaimed: false 
      },
      { 
        id: "w2", 
        title: "Couper 50 blocs de bouleau", 
        description: "Abattre des bouleaux et récolter 50 blocs de bois", 
        xpReward: 30, 
        itemRewards: [
          { name: "Planches de bouleau", quantity: 32, rarity: 'common' },
          { name: "Bloc de bois", quantity: 50, rarity: 'common' }
        ],
        completed: false, 
        rewardClaimed: false 
      }
    ]
  },
  {
    id: "warrior",
    name: "Guerrier",
    icon: "sword",
    description: "warrior desc",
    level: 4,
    currentXp: 900,
    requiredXp: 1200,
    objectives: [
      { 
        id: "g1", 
        title: "Vaincre 50 zombies", 
        description: "Éliminer 50 zombies", 
        xpReward: 100, 
        itemRewards: [
          { name: "Chair putréfiée", quantity: 25, rarity: 'common' },
          { name: "Arc enchanté", quantity: 1, rarity: 'rare' }
        ],
        completed: true, 
        rewardClaimed: true 
      },
      { 
        id: "g2", 
        title: "Vaincre 30 squelettes", 
        description: "Éliminer 30 squelettes", 
        xpReward: 120, 
        itemRewards: [
          { name: "Arc enchanté", quantity: 1, rarity: 'rare' },
          { name: "Bloc de redstone", quantity: 10, rarity: 'common' }
        ],
        completed: true, 
        rewardClaimed: true 
      },
      { 
        id: "g3", 
        title: "Vaincre 10 creepers", 
        description: "Éliminer 10 creepers", 
        xpReward: 150, 
        itemRewards: [
          { name: "Poudre à canon", quantity: 15, rarity: 'uncommon' },
          { name: "Bloc de redstone", quantity: 5, rarity: 'common' }
        ],
        completed: false, 
        rewardClaimed: false 
      },
      { 
        id: "g4", 
        title: "Vaincre l'Ender Dragon", 
        description: "Vaincre l'Ender Dragon", 
        xpReward: 500, 
        itemRewards: [
          { name: "Œuf de dragon", quantity: 1, rarity: 'legendary' },
          { name: "Bloc de redstone", quantity: 10, rarity: 'common' }
        ],
        completed: false, 
        rewardClaimed: false 
      }
    ]
  }
];


function DonutChartFillable({ filled, total, label, color = "violet" }: { filled: number; total: number; label: string; color?: string }) {
  const { isDark } = useTheme();
  const radius = 420; 

  
  const percentage = Math.max(1, Math.min(100, Math.round((filled / total) * 100)));
  
  
  const data = [
    { name: "Filled", value: percentage },
    { name: "Empty", value: 100 - percentage },
  ];

  
  const pieLayout = pie<{ name: string; value: number }>()
    .value((d) => d.value)
    .startAngle(0) 
    .endAngle(2 * Math.PI) 
    .sort(null) 
    .padAngle(0); 

  
  const innerRadius = radius / 1.625;
  const arcGenerator = arc<PieArcDatum<{ name: string; value: number }>>()
    .innerRadius(innerRadius)
    .outerRadius(radius)
    .padAngle(0)
    .cornerRadius(0);

  const arcs = pieLayout(data);

  
  const getColorFill = (colorName: string, isBackground: boolean) => {
    if (isBackground) {
      return isDark ? "#232326" : "#e0e0e0"; 
    }
    
    switch(colorName) {
      case "violet": return isDark ? "#8B5CF6" : "#7C3AED"; 
      case "blue":
      case "emerald": return isDark ? "#10B981" : "#059669"; 
      case "amber": return isDark ? "#F59E0B" : "#D97706"; 
      default: return isDark ? "#8B5CF6" : "#7C3AED"; 
    }
  };

  return (
    <div className="relative">
      <svg
        viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
        className="max-w-[16rem] mx-auto overflow-visible"
      >
        <g>
          {arcs.map((d, i) => (
            <path
              key={i}
              d={arcGenerator(d) || undefined}
              style={{
                fill: i === 0 ? getColorFill(color, false) : getColorFill("gray", true),
                stroke: "none"
              }}
            />
          ))}
        </g>
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold leading-5">{label}</span>
        <div className="text-xl font-bold">
          <span style={{color: getColorFill(color, false)}}>
            {filled}
          </span>
          <span className={isDark ? "text-zinc-600" : "text-zinc-400"}> / {total}</span>
        </div>
      </div>
    </div>
  );
}


const renderJobIcon = (icon: string, className?: string) => {
  const iconClass = `h-6 w-6 ${className || ""}`;
  switch (icon) {
    case "pickaxe":
      return <Pickaxe className={iconClass} />;
    case "wheat":
      return <Wheat className={iconClass} />;
    case "axe":
      return <Axe className={iconClass} />;
    case "sword":
      return <Sword className={iconClass} />;
    default:
      return <BriefcaseBusiness className={iconClass} />;
  }
};

function MinecraftTooltip({ items, children }: { items: ItemReward[]; children: React.ReactNode }) {
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  const getRarityColor = (rarity: ItemReward['rarity']) => {
    switch (rarity) {
      case 'common': return '#FFFFFF';
      case 'uncommon': return '#55FF55';
      case 'rare': return '#5555FF';
      case 'epic': return '#AA00AA';
      case 'legendary': return '#FFAA00';
      default: return '#FFFFFF';
    }
  };

  const getItemImageUrl = (itemName: string): string => {
    const formatName = itemName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[àáâã]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõ]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9_]/g, '');
    
    return `https://mc.nerothe.com/img/1.21.4/minecraft_${formatName}.png`;
  };

  const handleMouseEnter = () => {
    setShouldRender(true);
    setTimeout(() => {
      setIsVisible(true);
    }, 10);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShouldRender(false);
    }, 200);
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {shouldRender && (
        <div 
          className={`absolute left-0 -translate-x-full z-[9999] pointer-events-none transition-all duration-200 ease-out ${
            isVisible 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
          style={{
            top: '-50%'
          }}
        >
          <div 
            className={`px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg min-w-[240px] max-w-[320px] transition-all duration-200 ease-out ${
              isDark 
                ? 'bg-[#1A1A1A]/95 border-[#2A2A2A]' 
                : 'bg-white/95 border-[#E9E9E9]'
            } ${
              isVisible ? 'animate-in' : 'animate-out'
            }`}
            style={{
              boxShadow: `0 0 0 2px ${items.length > 0 ? getRarityColor(items[0].rarity) : '#FFFFFF'}40, 0 8px 32px rgba(0, 0, 0, 0.3)`,
              animationDuration: '200ms',
              animationFillMode: 'both',
              animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <h3 className={`text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Récompenses
            </h3>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {items.map((item, index) => (
                <div key={`${item.name}-${index}`} className={`flex items-center gap-3 p-1 rounded ${
                  isDark ? 'hover:bg-[#242424]' : 'hover:bg-gray-50'
                }`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    isDark ? 'bg-[#242424]' : 'bg-[#F8F8F8]'
                  } ${
                    isVisible ? 'scale-100' : 'scale-90'
                  }`}>
                    <img
                      src={getItemImageUrl(item.name)}
                      alt={item.name}
                      className={`w-8 h-8 object-contain transition-all duration-200 ${
                        isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-70'
                      }`}
                      onError={(e) => {
                        e.currentTarget.src = 'https://mc.nerothe.com/img/1.21.4/minecraft_grass_block.png';
                      }}
                    />
                  </div>
                  <div className={`flex-1 transition-all duration-200 delay-75 ${
                    isVisible ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'
                  }`}>
                    <div 
                      className="font-bold text-sm transition-colors duration-200"
                      style={{ color: getRarityColor(item.rarity) }}
                    >
                      {item.name}
                    </div>
                    {item.quantity > 1 && (
                      <div className={`text-xs transition-all duration-200 delay-100 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      } ${
                        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
                      }`}>
                        Quantité: x{item.quantity}
                      </div>
                    )}
                    
                    <span 
                      className={`inline-block mt-1 px-1.5 py-0.5 rounded-md text-xs font-medium transition-all duration-200 ${
                        isVisible ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{ 
                        backgroundColor: `${getRarityColor(item.rarity)}20`,
                        color: getRarityColor(item.rarity),
                        border: `1px solid ${getRarityColor(item.rarity)}40`
                      }}
                    >
                      {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobPage() {
  const { isDark } = useTheme();
  const { toast } = useToast();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'claimable'>('all');
  const [showQuitConfirmation, setShowQuitConfirmation] = useState(false);
  
  
  const totalObjectives = selectedJob?.objectives.length || 0;
  const completedObjectives = selectedJob?.objectives.filter(obj => obj.completed).length || 0;

  
  const handleSelectJob = (job: Job) => {
    
    setTimeout(() => {
      setSelectedJob(job);
      toast({
        title: "Métier rejoint",
        description: `Vous avez rejoint le métier de ${job.name}`,
        variant: "success",
      });
    }, 500);
  };

  
  const handleClaimReward = (objectiveId: string) => {
    if (!selectedJob) return;
    
    setSelectedJob({
      ...selectedJob,
      objectives: selectedJob.objectives.map(obj => 
        obj.id === objectiveId ? { ...obj, rewardClaimed: true } : obj
      )
    });
    
    toast({
      title: "Récompense réclamée",
      description: `Vous avez reçu votre récompense d'XP`,
      variant: "success",
    });
  };

  const handleShowQuitConfirmation = () => {
    setShowQuitConfirmation(true);
  };

  const handleConfirmQuitJob = () => {
    setSelectedJob(null);
    setShowQuitConfirmation(false);
    toast({
      title: "Métier quitté",
      description: "Vous avez quitté votre métier actuel",
      variant: "default",
    });
  };

  const handleCancelQuitJob = () => {
    setShowQuitConfirmation(false);
  };

  
  useEffect(() => {
    document.documentElement.style.overflowY = 'scroll';
    document.documentElement.style.scrollbarGutter = 'stable';
    
    return () => {
      document.documentElement.style.overflowY = '';
      document.documentElement.style.scrollbarGutter = '';
    };
  }, []);

  const getFilteredObjectives = () => {
    if (!selectedJob) return [];
    
    let filtered = [...selectedJob.objectives];
    
    switch (filterStatus) {
      case 'completed':
        filtered = filtered.filter(obj => obj.completed && obj.rewardClaimed);
        break;
      case 'pending':
        filtered = filtered.filter(obj => !obj.completed);
        break;
      case 'claimable':
        filtered = filtered.filter(obj => obj.completed && !obj.rewardClaimed);
        break;
      default:
        break;
    }
    
    return filtered.sort((a, b) => {
      if (a.completed && !a.rewardClaimed && !(b.completed && !b.rewardClaimed)) return -1;
      if (b.completed && !b.rewardClaimed && !(a.completed && !a.rewardClaimed)) return 1;
      if (!a.completed && !(!b.completed)) return -1;
      if (!b.completed && !(!a.completed)) return 1;
      if (a.rewardClaimed && !b.rewardClaimed) return 1;
      if (b.rewardClaimed && !a.rewardClaimed) return -1;
      return b.xpReward - a.xpReward;
    });
  };

  const filteredObjectives = getFilteredObjectives();
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredObjectives.length / itemsPerPage);
  const paginatedObjectives = filteredObjectives.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  useEffect(() => {
    setCurrentPage(1);
    setFilterStatus('all');
  }, [selectedJob]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className={`text-3xl font-bold mb-8 flex items-center ${isDark ? 'text-white' : 'text-[#333333]'}`}>
          <BriefcaseBusiness className="mr-2 h-8 w-8 text-[#F0B90B]" />
          Métiers
        </h1>

        {selectedJob ? (
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-white border border-[#E9E9E9] shadow-sm'}`}>
                <div className={`p-6 ${isDark ? 'bg-[#242424]' : 'bg-gray-50'} border-b ${isDark ? 'border-[#2A2A2A]' : 'border-gray-200'}`}>
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full ${isDark ? 'bg-[#1E1E1E]' : 'bg-[#F0F0F0]'} mr-4`}>
                      {renderJobIcon(selectedJob.icon, "text-[#F0B90B]")}
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                        {selectedJob.name}
                      </h2>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Niveau {selectedJob.level}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedJob.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <DonutChartFillable 
                        filled={selectedJob.currentXp} 
                        total={selectedJob.requiredXp} 
                        label="XP" 
                        color="emerald"
                      />
                    </div>
                    
                    <div>
                      <DonutChartFillable 
                        filled={completedObjectives} 
                        total={totalObjectives} 
                        label="Objectifs" 
                        color="amber"
                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <button 
                      onClick={handleShowQuitConfirmation}
                      className={`flex items-center justify-center w-full py-3 px-4 rounded-lg text-red-500 border ${
                        isDark ? 'border-red-900/30 hover:bg-red-900/20' : 'border-red-200 hover:bg-red-50'
                      } transition-colors`}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Quitter ce métier
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-white border border-[#E9E9E9] shadow-sm'}`}>
                <div className={`p-6 ${isDark ? 'bg-[#242424]' : 'bg-gray-50'} border-b ${isDark ? 'border-[#2A2A2A]' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                        Objectifs
                      </h2>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Complétez des objectifs pour gagner de l'XP et monter en niveau
                      </p>
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {filteredObjectives.length} objectif{filteredObjectives.length > 1 ? 's' : ''}
                      {filterStatus !== 'all' && ` (${selectedJob?.objectives.length} au total)`}
                    </div>
                  </div>

                  {/* Filtres */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterStatus('all')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        filterStatus === 'all'
                          ? 'bg-[#F0B90B] text-black'
                          : isDark
                            ? 'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A]'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Tous ({selectedJob?.objectives.length || 0})
                    </button>
                    <button
                      onClick={() => setFilterStatus('claimable')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        filterStatus === 'claimable'
                          ? 'bg-[#F0B90B] text-black'
                          : isDark
                            ? 'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A]'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      À réclamer ({selectedJob?.objectives.filter(obj => obj.completed && !obj.rewardClaimed).length || 0})
                    </button>
                    <button
                      onClick={() => setFilterStatus('pending')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        filterStatus === 'pending'
                          ? 'bg-[#F0B90B] text-black'
                          : isDark
                            ? 'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A]'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      En cours ({selectedJob?.objectives.filter(obj => !obj.completed).length || 0})
                    </button>
                    <button
                      onClick={() => setFilterStatus('completed')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        filterStatus === 'completed'
                          ? 'bg-[#F0B90B] text-black'
                          : isDark
                            ? 'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A]'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Terminés ({selectedJob?.objectives.filter(obj => obj.completed && obj.rewardClaimed).length || 0})
                    </button>
                  </div>
                </div>

                <div className="p-2">
                  {filteredObjectives.length === 0 ? (
                    <div className="py-8 text-center">
                      <Filter className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {filterStatus === 'all' 
                          ? 'Aucun objectif disponible pour le moment'
                          : `Aucun objectif ${
                              filterStatus === 'claimable' ? 'à réclamer' :
                              filterStatus === 'pending' ? 'en cours' :
                              filterStatus === 'completed' ? 'terminé' : ''
                            } pour le moment`
                        }
                      </p>
                    </div>
                  ) : (
                    <>
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedObjectives.map((objective) => (
                          <li key={objective.id} className={`p-4 ${
                            objective.completed && !objective.rewardClaimed 
                              ? (isDark ? 'bg-amber-900/10' : 'bg-amber-50')
                              : objective.completed && objective.rewardClaimed
                                ? (isDark ? 'bg-zinc-800/30' : 'bg-zinc-100')
                                : ''
                          }`}>
                            <div className="flex items-start gap-4">
                              <div className={`mt-1 flex-shrink-0 ${
                                objective.completed && !objective.rewardClaimed
                                  ? 'text-amber-500'
                                  : objective.completed && objective.rewardClaimed
                                    ? (isDark ? 'text-gray-500' : 'text-gray-400') 
                                    : (isDark ? 'text-gray-500' : 'text-gray-400')
                              }`}>
                                {objective.completed && !objective.rewardClaimed ? <Gift className="h-5 w-5" /> : 
                                 objective.completed && objective.rewardClaimed ? <CheckCircle className="h-5 w-5" /> : 
                                 <Award className="h-5 w-5" />}
                              </div>
                              <div className="flex-1">
                                <h3 className={`text-lg font-medium ${
                                  objective.completed && !objective.rewardClaimed
                                    ? (isDark ? 'text-amber-400' : 'text-amber-700')
                                    : objective.completed && objective.rewardClaimed
                                      ? (isDark ? 'text-gray-400' : 'text-gray-500')
                                      : (isDark ? 'text-white' : 'text-gray-900')
                                }`}>
                                  {objective.title}
                                </h3>
                                <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {objective.description}
                                </p>
                                
                                {!objective.rewardClaimed && (
                                  <div className="mt-2 w-full rounded-full h-2.5 overflow-hidden" style={{ background: isDark ? '#232326' : '#e5e7eb' }}>
                                    <div 
                                      className={`h-2.5 rounded-full ${
                                        objective.completed 
                                          ? 'bg-amber-500 dark:bg-amber-600' 
                                          : 'bg-emerald-500 dark:bg-emerald-600'
                                      }`}
                                      style={{ width: `${Math.round((objective.progress ?? (objective.completed ? 1 : 0)) * 100)}%` }}
                                    ></div>
                                  </div>
                                )}
                                
                                <div className="mt-2 flex items-center text-sm">
                                  <div className="flex items-center gap-2">
                                    {objective.xpReward > 0 && (
                                      <div className={`${
                                        objective.rewardClaimed 
                                          ? (isDark ? 'text-gray-500' : 'text-gray-500') 
                                          : (isDark ? 'text-emerald-400' : 'text-emerald-600')
                                      }`}>
                                        <span className="font-medium">+{objective.xpReward} XP</span>
                                      </div>
                                    )}
                                    
                                    {objective.moneyReward && objective.moneyReward > 0 && (
                                      <div className={`${
                                        objective.rewardClaimed 
                                          ? (isDark ? 'text-gray-500' : 'text-gray-500') 
                                          : (isDark ? 'text-amber-400' : 'text-amber-600')
                                      }`}>
                                        <span className="font-medium">+{objective.moneyReward} $</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex-1"></div>

                                  {objective.completed && !objective.rewardClaimed && objective.itemRewards && objective.itemRewards.length > 0 && (
                                    <MinecraftTooltip items={objective.itemRewards}>
                                      <button 
                                        onClick={() => handleClaimReward(objective.id)}
                                        className={`flex items-center py-1 px-3 rounded-md ${
                                          isDark 
                                            ? 'bg-[#F0B90B] hover:bg-[#E0A90A] text-black' 
                                            : 'bg-[#F0B90B] hover:bg-[#E0A90A] text-black'
                                        } transition-colors`}
                                      >
                                        <Gift className="h-4 w-4 mr-1" />
                                        Réclamer
                                      </button>
                                    </MinecraftTooltip>
                                  )}

                                  {objective.completed && !objective.rewardClaimed && (!objective.itemRewards || objective.itemRewards.length === 0) && (
                                    <button 
                                      onClick={() => handleClaimReward(objective.id)}
                                      className={`flex items-center py-1 px-3 rounded-md ${
                                        isDark 
                                          ? 'bg-[#F0B90B] hover:bg-[#E0A90A] text-black' 
                                          : 'bg-[#F0B90B] hover:bg-[#E0A90A] text-black'
                                      } transition-colors`}
                                    >
                                      <Gift className="h-4 w-4 mr-1" />
                                      Réclamer
                                    </button>
                                  )}

                                  {objective.completed && objective.rewardClaimed && (
                                    <span className={`flex items-center ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Récompense réclamée
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                      
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious 
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                                  }}
                                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                />
                              </PaginationItem>
                              
                              {/* Première page */}
                              <PaginationItem>
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(1);
                                  }}
                                  isActive={currentPage === 1}
                                >
                                  1
                                </PaginationLink>
                              </PaginationItem>

                              {/* Ellipsis de début si nécessaire */}
                              {currentPage > 3 && totalPages > 5 && (
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              )}

                              {/* Pages autour de la page courante */}
                              {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                  if (totalPages <= 5) return page !== 1 && page !== totalPages;
                                  if (page === 1 || page === totalPages) return false;
                                  return Math.abs(page - currentPage) <= 1;
                                })
                                .map((page) => (
                                  <PaginationItem key={page}>
                                    <PaginationLink
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentPage(page);
                                      }}
                                      isActive={currentPage === page}
                                    >
                                      {page}
                                    </PaginationLink>
                                  </PaginationItem>
                                ))}

                              {/* Ellipsis de fin si nécessaire */}
                              {currentPage < totalPages - 2 && totalPages > 5 && (
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
                                      setCurrentPage(totalPages);
                                    }}
                                    isActive={currentPage === totalPages}
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
                                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                                  }}
                                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          
          <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-white border border-[#E9E9E9] shadow-sm'}`}>
            <div className={`p-6 ${isDark ? 'bg-[#242424]' : 'bg-gray-50'} border-b ${isDark ? 'border-[#2A2A2A]' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                Choisir un métier
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Sélectionnez un métier qui correspond à votre style de jeu
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockJobs.map((job) => (
                  <div 
                    key={job.id}
                    className={`rounded-lg overflow-hidden border ${
                      isDark 
                        ? 'border-[#2A2A2A] hover:border-[#3A3A3A] bg-[#1E1E1E]' 
                        : 'border-[#E9E9E9] hover:border-[#D9D9D9] bg-white'
                    } transition-colors`}
                  >
                    <div className="p-5">
                      <div className="flex items-center mb-3">
                        <div className={`p-2 rounded-full ${isDark ? 'bg-[#242424]' : 'bg-[#F0F0F0]'} mr-3`}>
                          {renderJobIcon(job.icon, "text-[#F0B90B]")}
                        </div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                          {job.name}
                        </h3>
                      </div>

                      <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {job.description.length > 120 
                          ? job.description.substring(0, 120) + '...' 
                          : job.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span className="font-medium">{job.objectives.length}</span> objectifs
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectJob(job)}
                        className={`
                          mt-4 flex items-center justify-center w-full py-2 px-4 rounded-lg 
                          ${isDark 
                            ? 'bg-[#F0B90B] hover:bg-[#E0A90A] text-black' 
                            : 'bg-[#F0B90B] hover:bg-[#E0A90A] text-black'
                          } transition-colors
                        `}
                      >
                        Choisir ce métier
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmation pour quitter le métier */}
      <Dialog open={showQuitConfirmation} onOpenChange={setShowQuitConfirmation}>
        <DialogContent className={cn(
          "max-w-md p-0 overflow-hidden",
          isDark ? "bg-[#1A1A1A] border border-[#2A2A2A]" : "bg-white border border-[#E9E9E9]"
        )}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                Quitter le métier
              </h2>
              <DialogClose className={cn(
                "p-2 rounded-full",
                isDark ? "hover:bg-[#2A2A2A]" : "hover:bg-gray-100"
              )}>
                <X size={20} className={isDark ? "text-gray-400" : "text-gray-500"} />
              </DialogClose>
            </div>
            
            <div className="mb-6">
              <p className={`text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Êtes-vous sûr de vouloir quitter le métier de{' '}
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                  {selectedJob?.name}
                </span>
                ?
              </p>
              <p className={`text-center text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Vous perdrez votre progression actuelle et devrez recommencer.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCancelQuitJob}
                className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-[#242424] text-white border-[#3A3A3A] hover:bg-[#2A2A2A]' 
                    : 'bg-white text-[#333333] border-[#E9E9E9] hover:bg-gray-50'
                }`}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmQuitJob}
                className="flex-1 py-2 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Quitter le métier
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
} 