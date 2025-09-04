import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme-provider';
import { MainLayout } from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';
import { ArrowLeft, Building2, Users, MapPin, Store, Shield, Pencil, Tags, UserMinus, AlertTriangle, X, Check, Settings, Trash2 } from 'lucide-react';
import { useEnterpriseStore } from '@/stores/enterpriseStore';
import { CreateEnterpriseModal } from '@/components/enterprises/CreateEnterpriseModal';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";


interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'general' | 'employees' | 'finances' | 'lands' | 'shops';
}

interface Role {
  id: number;
  name: string;
  memberCount: number;
  permissions: string[]; 
}


const AVAILABLE_PERMISSIONS: Permission[] = [
  
  { id: 'view_info', name: 'Voir les informations', description: 'Consulter les informations générales de l\'entreprise', category: 'general' },
  { id: 'edit_info', name: 'Modifier les informations', description: 'Modifier le nom, description et autres infos de l\'entreprise', category: 'general' },
  { id: 'manage_settings', name: 'Gérer les paramètres', description: 'Accéder aux paramètres avancés de l\'entreprise', category: 'general' },
  
  
  { id: 'view_employees', name: 'Voir les employés', description: 'Consulter la liste des employés', category: 'employees' },
  { id: 'hire_employees', name: 'Recruter des employés', description: 'Embaucher de nouveaux employés', category: 'employees' },
  { id: 'fire_employees', name: 'Licencier des employés', description: 'Licencier des employés existants', category: 'employees' },
  { id: 'manage_roles', name: 'Gérer les rôles', description: 'Créer, modifier et supprimer des rôles', category: 'employees' },
  { id: 'assign_roles', name: 'Assigner des rôles', description: 'Changer le rôle des employés', category: 'employees' },
  { id: 'manage_salaries', name: 'Gérer les salaires', description: 'Modifier les salaires des employés', category: 'employees' },
  
  
  { id: 'view_finances', name: 'Voir les finances', description: 'Consulter les finances de l\'entreprise', category: 'finances' },
  { id: 'manage_budget', name: 'Gérer le budget', description: 'Définir et modifier les budgets', category: 'finances' },
  { id: 'approve_expenses', name: 'Approuver les dépenses', description: 'Valider les dépenses importantes', category: 'finances' },
  
  
  { id: 'view_lands', name: 'Voir les terrains', description: 'Consulter les terrains de l\'entreprise', category: 'lands' },
  { id: 'buy_lands', name: 'Acheter des terrains', description: 'Acquérir de nouveaux terrains', category: 'lands' },
  { id: 'sell_lands', name: 'Vendre des terrains', description: 'Vendre des terrains existants', category: 'lands' },
  { id: 'manage_lands', name: 'Gérer les terrains', description: 'Modifier et configurer les terrains', category: 'lands' },
  
  
  { id: 'view_shops', name: 'Voir les magasins', description: 'Consulter les magasins de l\'entreprise', category: 'shops' },
  { id: 'create_shops', name: 'Créer des magasins', description: 'Ouvrir de nouveaux magasins', category: 'shops' },
  { id: 'manage_shops', name: 'Gérer les magasins', description: 'Modifier la configuration des magasins', category: 'shops' },
  { id: 'manage_inventory', name: 'Gérer les stocks', description: 'Gérer l\'inventaire des magasins', category: 'shops' },
  { id: 'set_prices', name: 'Définir les prix', description: 'Modifier les prix dans les magasins', category: 'shops' }
];

const PERMISSION_CATEGORIES = {
  general: { name: 'Général', icon: '⚙️' },
  employees: { name: 'Employés', icon: '👥' },
  finances: { name: 'Finances', icon: '💰' },
  lands: { name: 'Terrains', icon: '🏞️' },
  shops: { name: 'Magasins', icon: '🏪' }
};

type ManagementSection = 'info' | 'roles' | 'employees' | 'lands' | 'shops';

export default function ManageEnterprisePage() {
  const { isDark } = useTheme();
  const [activeSection, setActiveSection] = useState<ManagementSection>('info');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  
  const userEnterprise = useEnterpriseStore(state => state.userEnterprise);
  const isLoading = useEnterpriseStore(state => state.isLoading);
  const fetchUserEnterprise = useEnterpriseStore(state => state.fetchUserEnterprise);
  const createEnterprise = useEnterpriseStore(state => state.createEnterprise);
  
  
  const hasEnterprise = !!userEnterprise;
  
  
  useEffect(() => {
    fetchUserEnterprise();
  }, [fetchUserEnterprise]);

  
  const handleBackToEnterprises = () => {
    window.location.href = '/entreprise';
  };
  
  
  const handleCreateEnterprise = async (enterpriseData: { name: string; description: string; tags: string[] }) => {
    try {
      await createEnterprise({
        name: enterpriseData.name,
        description: enterpriseData.description,
        sector: enterpriseData.tags[0] || "Divers", 
        employeeCount: 1, 
        ownerName: "Vous",
        ownerUUID: "6a6887fe-dd7c-4f04-98b1-e358ce75c377", 
        createdAt: new Date().toISOString().split('T')[0]
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de la création de l'entreprise:", error);
    }
  };
  
  const renderContent = () => {
    
    if (!hasEnterprise) {
      return (
        <div className={cn(
          "rounded-xl p-8 flex flex-col items-center justify-center text-center",
          isDark ? "bg-[#1A1A1A] border border-[#2A2A2A]" : "bg-white border border-[#E9E9E9] shadow-sm"
        )}>
          <Building2 className={cn("h-16 w-16 mb-4", isDark ? "text-[#3A3A3A]" : "text-[#E0E0E0]")} />
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#333333]'}`}>
            Vous n'avez pas encore d'entreprise
          </h2>
          <p className={`text-base mb-6 max-w-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Créez votre propre entreprise pour commencer à gérer vos employés, vos terrains et vos magasins.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-[#F0B90B] text-white rounded-lg hover:bg-[#E0A800] transition-colors font-medium"
          >
            Créer une entreprise
          </button>
        </div>
      );
    }

    
    switch (activeSection) {
      case 'info':
        return userEnterprise ? <EnterpriseInfoSection enterprise={userEnterprise} /> : null;
      case 'roles':
        return <RolesSection />;
      case 'employees':
        return <EmployeesSection />;
      case 'lands':
        return <LandsSection />;
      case 'shops':
        return <ShopsSection />;
      default:
        return userEnterprise ? <EnterpriseInfoSection enterprise={userEnterprise} /> : null;
    }
  };

  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className={cn(
            "rounded-xl p-8 flex items-center justify-center",
            isDark ? "bg-[#1A1A1A] border border-[#2A2A2A]" : "bg-white border border-[#E9E9E9] shadow-sm"
          )}>
            <p className={isDark ? 'text-white' : 'text-[#333333]'}>Chargement...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <div 
            onClick={handleBackToEnterprises}
            className={cn(
              "p-2 rounded-full mr-3 cursor-pointer",
              isDark ? "hover:bg-[#2A2A2A]" : "hover:bg-[#F5F5F5]"
            )}
          >
            <ArrowLeft className={cn("h-5 w-5", isDark ? "text-white" : "text-[#333333]")} />
          </div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>
            {hasEnterprise ? "Gestion de l'entreprise" : "Création d'entreprise"}
          </h1>
        </div>
        
        {hasEnterprise ? (
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <div className={cn(
                "rounded-xl p-4 sticky top-20",
                isDark ? "bg-[#1A1A1A] border border-[#2A2A2A]" : "bg-white border border-[#E9E9E9] shadow-sm"
              )}>
                <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                  {userEnterprise?.name || "Mon entreprise"}
                </h2>
                <nav className="space-y-1">
                  <SidebarButton 
                    label="Informations générales" 
                    icon={<Building2 className="h-4 w-4" />} 
                    active={activeSection === 'info'} 
                    onClick={() => setActiveSection('info')} 
                    isDark={isDark} 
                  />
                  <SidebarButton 
                    label="Rôles" 
                    icon={<Shield className="h-4 w-4" />} 
                    active={activeSection === 'roles'} 
                    onClick={() => setActiveSection('roles')} 
                    isDark={isDark} 
                  />
                  <SidebarButton 
                    label="Employés" 
                    icon={<Users className="h-4 w-4" />} 
                    active={activeSection === 'employees'} 
                    onClick={() => setActiveSection('employees')}
                    isDark={isDark} 
                  />
                  <SidebarButton 
                    label="Terrains" 
                    icon={<MapPin className="h-4 w-4" />} 
                    active={activeSection === 'lands'} 
                    onClick={() => setActiveSection('lands')}
                    isDark={isDark} 
                  />
                  <SidebarButton 
                    label="Magasins" 
                    icon={<Store className="h-4 w-4" />} 
                    active={activeSection === 'shops'} 
                    onClick={() => setActiveSection('shops')}
                    isDark={isDark} 
                  />
                </nav>
              </div>
            </div>
            
            <div className="md:col-span-3">
              {renderContent()}
            </div>
          </div>
        ) : (
          
          <div>
            {renderContent()}
          </div>
        )}
      </div>
      
      <CreateEnterpriseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreateEnterprise}
      />
    </MainLayout>
  );
}


interface SidebarButtonProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  isDark: boolean;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ label, icon, active, onClick, isDark }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center w-full px-3 py-2 rounded-lg text-left transition-colors",
        active
          ? "bg-[#F0B90B] text-white"
          : isDark
            ? "text-gray-300 hover:bg-[#2A2A2A]"
            : "text-gray-700 hover:bg-[#F5F5F5]"
      )}
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </button>
  );
};


interface EnterpriseData {
  id: number | string;
  name: string;
  description: string;
  tags?: string[];
  sector?: string;
  employeeCount?: number;
  ownerName?: string;
  ownerUUID?: string;
  createdAt?: string;
}

const EnterpriseInfoSection: React.FC<{ enterprise: EnterpriseData }> = ({ enterprise }) => {
  const { isDark } = useTheme();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  
  const [enterpriseData, setEnterpriseData] = useState<EnterpriseData>({
    id: enterprise.id,
    name: enterprise.name,
    description: enterprise.description,
    tags: enterprise.sector ? [enterprise.sector] : []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Données mises à jour:', enterpriseData);
    setIsEditing(false);
  };
  
  const handleDeleteEnterprise = async () => {
    if (deleteConfirmation !== enterpriseData.name) {
      toast({
        title: "Confirmation incorrecte",
        description: "Veuillez saisir le nom exact de l'entreprise pour confirmer la suppression",
        variant: "destructive"
      });
      return;
    }
    
    setIsDeleting(true);
    
    try {
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Entreprise supprimée",
        description: "Votre entreprise a été supprimée avec succès",
        variant: "success"
      });
      
      setTimeout(() => {
        navigate('/entreprise');
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'entreprise:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'entreprise",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
    <div className={cn(
      "rounded-xl p-6",
      isDark ? "bg-[#1A1A1A] border border-[#2A2A2A]" : "bg-white border border-[#E9E9E9] shadow-sm"
    )}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>
          Informations générales
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={cn(
            "flex items-center px-3 py-2 rounded-lg text-sm font-medium",
            isDark ? "bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]" : "bg-[#F5F5F5] text-gray-700 hover:bg-[#EBEBEB]"
          )}
        >
          <Pencil className="h-4 w-4 mr-2" />
          {isEditing ? "Annuler" : "Modifier"}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Nom de l'entreprise
            </label>
            <input
              type="text"
              value={enterpriseData.name}
              onChange={(e) => setEnterpriseData({...enterpriseData, name: e.target.value})}
              maxLength={15}
              className={cn(
                "w-full p-2 rounded-lg border",
                isDark 
                  ? "bg-[#242424] text-white border-[#3A3A3A] focus:border-[#F0B90B]" 
                  : "bg-white text-gray-900 border-gray-300 focus:border-[#F0B90B]"
              )}
            />
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Maximum 15 caractères ({15 - enterpriseData.name.length} restants)
            </p>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              value={enterpriseData.description}
              onChange={(e) => setEnterpriseData({...enterpriseData, description: e.target.value})}
              rows={4}
              className={cn(
                "w-full p-2 rounded-lg border",
                isDark 
                  ? "bg-[#242424] text-white border-[#3A3A3A] focus:border-[#F0B90B]" 
                  : "bg-white text-gray-900 border-gray-300 focus:border-[#F0B90B]"
              )}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Tags (séparés par une virgule)
            </label>
            <div className="flex items-center">
              <Tags className={`h-5 w-5 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                value={enterpriseData.tags?.join(', ')}
                onChange={(e) => {
                  const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
                  setEnterpriseData({...enterpriseData, tags: tagsArray});
                }}
                className={cn(
                  "flex-1 p-2 rounded-lg border",
                  isDark 
                    ? "bg-[#242424] text-white border-[#3A3A3A] focus:border-[#F0B90B]" 
                    : "bg-white text-gray-900 border-gray-300 focus:border-[#F0B90B]"
                )}
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-[#F0B90B] text-white rounded-lg hover:bg-[#E0A800] transition-colors"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Nom de l'entreprise
            </h3>
            <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {enterpriseData.name}
            </p>
          </div>
          
          <div>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Description
            </h3>
            <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
              {enterpriseData.description}
            </p>
          </div>
          
          <div>
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Tags
            </h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {enterpriseData.tags?.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 text-xs rounded-full bg-[#F0B90B] text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
      
      {/* Section de suppression d'entreprise */}
      <div className={cn(
        "rounded-xl p-6 mt-6",
        isDark ? "bg-[#1A1A1A] border border-[#2A2A2A]" : "bg-white border border-[#E9E9E9] shadow-sm"
      )}>
        <div className="flex items-center mb-4">
          <div className="bg-red-100 p-2 rounded-full mr-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-red-500">
            Supprimer votre entreprise
          </h3>
        </div>
        <div className={cn(
          "p-4 rounded-lg mb-6",
          "bg-red-500/10 border border-red-500/20"
        )}>
          <p className={`text-sm mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <strong>Attention :</strong> La suppression de votre entreprise est permanente et irréversible.
          </p>
          <ul className={`list-disc list-inside text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>Tous les terrains et magasins seront libérés</li>
            <li>Tous les employés seront automatiquement retirés</li>
            <li>Les fonds de l'entreprise seront perdus</li>
            <li>Cette action est définitive et ne peut pas être annulée</li>
          </ul>
        </div>
        <div>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className={cn(
              "py-2.5 px-4 rounded-lg text-sm flex items-center",
              "bg-red-600 hover:bg-red-700 text-white transition-colors"
            )}
          >
            <Trash2 size={16} className="mr-2" />
            Supprimer définitivement l'entreprise
          </button>
        </div>
      </div>
      
      {/* Modal de confirmation de suppression */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className={cn(
          isDark 
            ? "bg-[#1A1A1A] text-white border-[#3A3A3A]" 
            : "bg-white text-gray-900 border-gray-300"
        )}>
          <DialogHeader>
            <DialogTitle className={isDark ? "text-white" : "text-gray-900"}>
              Confirmer la suppression de l'entreprise
            </DialogTitle>
            <DialogDescription className={isDark ? "text-gray-400" : "text-gray-500"}>
              Cette action est irréversible. Toutes les données liées à votre entreprise seront supprimées.
            </DialogDescription>
          </DialogHeader>
          
          <div className={cn(
            "flex items-center p-4 rounded-lg my-2",
            isDark ? "bg-[#242424] border border-[#3A3A3A]" : "bg-gray-100"
          )}>
            <AlertTriangle className="h-6 w-6 text-amber-500 mr-3 flex-shrink-0" />
            <div>
              <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                Pour confirmer la suppression, veuillez saisir le nom exact de votre entreprise : <span className={`font-mono px-1.5 py-0.5 rounded ${isDark ? 'bg-[#2A2A2A] text-[#F0B90B]' : 'bg-gray-200 text-gray-800'}`}>
                  {enterpriseData.name}
                </span>
              </p>
            </div>
          </div>
          
          <input
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            className={cn(
              "w-full p-2.5 rounded-lg text-sm outline-none transition-colors",
              isDark 
                ? 'bg-[#242424] text-white border border-[#3A3A3A] focus:border-red-500' 
                : 'bg-[#F8F8F8] text-gray-700 border border-[#E9E9E9] focus:border-red-500'
            )}
            placeholder={enterpriseData.name}
          />

          <DialogFooter className="flex justify-between sm:justify-between mt-4">
            <DialogClose asChild>
              <button className={cn(
                "px-4 py-2 rounded-lg",
                isDark 
                  ? "bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}>
                Annuler
              </button>
            </DialogClose>
            <button
              onClick={handleDeleteEnterprise}
              disabled={isDeleting || deleteConfirmation !== enterpriseData.name}
              className={cn(
                "py-2.5 px-4 rounded-lg text-sm flex items-center",
                deleteConfirmation === enterpriseData.name
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-red-300 text-white cursor-not-allowed",
                "transition-colors",
                isDeleting && "opacity-70 cursor-not-allowed"
              )}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 size={16} className="mr-2" />
                  Supprimer définitivement
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const RolesSection: React.FC = () => {
  const { isDark } = useTheme();
  const [roles, setRoles] = useState<Role[]>([
    { 
      id: 1, 
      name: "Administrateur", 
      memberCount: 2,
      permissions: [
        'view_info', 'edit_info', 'manage_settings',
        'view_employees', 'hire_employees', 'fire_employees', 'manage_roles', 'assign_roles', 'manage_salaries',
        'view_finances', 'manage_budget', 'approve_expenses',
        'view_lands', 'buy_lands', 'sell_lands', 'manage_lands',
        'view_shops', 'create_shops', 'manage_shops', 'manage_inventory', 'set_prices'
      ]
    },
    { 
      id: 2, 
      name: "Manager", 
      memberCount: 3,
      permissions: [
        'view_info', 'view_employees', 'hire_employees', 'assign_roles', 'manage_salaries',
        'view_finances', 'view_lands', 'manage_lands', 'view_shops', 'manage_shops', 'manage_inventory', 'set_prices'
      ]
    },
    { 
      id: 3, 
      name: "Employé", 
      memberCount: 8,
      permissions: ['view_info', 'view_employees', 'view_lands', 'view_shops']
    }
  ]);
  
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [managingPermissionsId, setManagingPermissionsId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);

  const handleAddRole = () => {
    if (newRoleName.trim()) {
      const newRole: Role = {
        id: Math.max(...roles.map(r => r.id), 0) + 1,
        name: newRoleName.trim(),
        memberCount: 0,
        permissions: ['view_info'] 
      };
      setRoles([...roles, newRole]);
      setNewRoleName('');
      setIsAddingRole(false);
    }
  };

  const handleUpdateRole = (id: number, newName: string) => {
    setRoles(roles.map(role => 
      role.id === id ? { ...role, name: newName } : role
    ));
    setEditingRoleId(null);
  };

  const handleTogglePermission = (roleId: number, permissionId: string) => {
   
  };

  const handleSelectAllInCategory = (roleId: number, category: string) => {
   
  };

  const openDeleteDialog = (id: number) => {
    setRoleToDelete(id);
    setIsDialogOpen(true);
  };

  const handleDeleteRole = () => {
    if (roleToDelete !== null) {
      setRoles(roles.filter(role => role.id !== roleToDelete));
      setIsDialogOpen(false);
      setRoleToDelete(null);
    }
  };



  return (
    <div className={cn(
      "rounded-xl p-6",
      isDark ? "bg-[#1A1A1A] border border-[#2A2A2A]" : "bg-white border border-[#E9E9E9] shadow-sm"
    )}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>
          Gestion des rôles et permissions
        </h2>
        <button
          onClick={() => setIsAddingRole(true)}
          className="px-4 py-2 bg-[#F0B90B] text-white rounded-lg hover:bg-[#E0A800] transition-colors"
        >
          Ajouter un rôle
        </button>
      </div>

      {/* Formulaire ajout rôle */}
      {isAddingRole && (
        <div className={cn(
          "mb-6 p-4 rounded-lg border",
          isDark ? "bg-[#242424] border-[#3A3A3A]" : "bg-[#F8F8F8] border-[#E9E9E9]"
        )}>
          <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-[#333333]'}`}>
            Nouveau rôle
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Nom du rôle"
              className={cn(
                "flex-1 p-2 rounded-lg border",
                isDark 
                  ? "bg-[#1A1A1A] text-white border-[#3A3A3A] focus:border-[#F0B90B]" 
                  : "bg-white text-gray-900 border-gray-300 focus:border-[#F0B90B]"
              )}
            />
            <button
              onClick={handleAddRole}
              className="px-4 py-2 bg-[#F0B90B] text-white rounded-lg hover:bg-[#E0A800] transition-colors"
            >
              Ajouter
            </button>
            <button
              onClick={() => setIsAddingRole(false)}
              className={cn(
                "px-4 py-2 rounded-lg",
                isDark 
                  ? "bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]" 
                  : "bg-[#F5F5F5] text-gray-700 hover:bg-[#EBEBEB]"
              )}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des rôles */}
      <div className="space-y-4">
        {roles.map(role => (
          <div 
            key={role.id}
            className={cn(
              "rounded-lg border",
              isDark ? "bg-[#242424] border-[#3A3A3A]" : "bg-white border-[#E9E9E9]"
            )}
          >
            {/* En-tête du rôle */}
            <div className="p-4 flex items-center justify-between">
              {editingRoleId === role.id ? (
                <input
                  type="text"
                  value={role.name}
                  onChange={(e) => handleUpdateRole(role.id, e.target.value)}
                  autoFocus
                  onBlur={() => setEditingRoleId(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingRoleId(null)}
                  className={cn(
                    "p-2 rounded-lg border",
                    isDark 
                      ? "bg-[#1A1A1A] text-white border-[#3A3A3A] focus:border-[#F0B90B]" 
                      : "bg-white text-gray-900 border-gray-300 focus:border-[#F0B90B]"
                  )}
                />
              ) : (
                <div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {role.name}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {role.memberCount} membre{role.memberCount !== 1 ? 's' : ''} • {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                {/* Bouton de gestion des permissions commenté
                <button
                  onClick={() => setManagingPermissionsId(managingPermissionsId === role.id ? null : role.id)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    managingPermissionsId === role.id
                      ? "bg-[#F0B90B] text-white"
                      : isDark 
                        ? "bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]" 
                        : "bg-[#F5F5F5] text-gray-700 hover:bg-[#EBEBEB]"
                  )}
                  title="Gérer les permissions"
                >
                  <Settings className="h-4 w-4" />
                </button>
                */}
                <button
                  onClick={() => setEditingRoleId(role.id)}
                  className={cn(
                    "p-2 rounded-lg",
                    isDark 
                      ? "bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]" 
                      : "bg-[#F5F5F5] text-gray-700 hover:bg-[#EBEBEB]"
                  )}
                  title="Modifier le nom"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openDeleteDialog(role.id)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  title="Supprimer le rôle"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Panneau de gestion des permissions commenté
            {managingPermissionsId === role.id && (
              <div className={cn(
                "border-t p-4",
                isDark ? "border-[#3A3A3A] bg-[#1A1A1A]" : "border-[#E9E9E9] bg-[#F8F8F8]"
              )}>
                <h4 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                  Permissions pour {role.name}
                </h4>
                
                {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, categoryInfo]) => {
                  const categoryPermissions = AVAILABLE_PERMISSIONS.filter(p => p.category === categoryKey);
                  const grantedInCategory = categoryPermissions.filter(p => role.permissions.includes(p.id)).length;
                  const allGrantedInCategory = grantedInCategory === categoryPermissions.length;
                  
                  return (
                    <div key={categoryKey} className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{categoryInfo.icon}</span>
                          <h5 className={`font-medium ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                            {categoryInfo.name}
                          </h5>
                          <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            ({grantedInCategory}/{categoryPermissions.length})
                          </span>
                        </div>
                        <button
                          onClick={() => handleSelectAllInCategory(role.id, categoryKey)}
                          className={cn(
                            "text-xs px-2 py-1 rounded transition-colors",
                            allGrantedInCategory
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-[#F0B90B] text-white hover:bg-[#E0A800]"
                          )}
                        >
                          {allGrantedInCategory ? 'Tout désélectionner' : 'Tout sélectionner'}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {categoryPermissions.map(permission => (
                          <label
                            key={permission.id}
                            className={cn(
                              "flex items-start p-3 rounded-lg border cursor-pointer transition-colors",
                              role.permissions.includes(permission.id)
                                ? isDark
                                  ? "bg-[#2A2A2A] border-[#F0B90B] shadow-sm"
                                  : "bg-[#FFF9E6] border-[#F0B90B] shadow-sm"
                                : isDark
                                  ? "bg-[#242424] border-[#3A3A3A] hover:border-[#4A4A4A]"
                                  : "bg-white border-[#E9E9E9] hover:border-[#D0D0D0]"
                            )}
                          >
                            <div className="relative mt-1">
                              <input
                                type="checkbox"
                                checked={role.permissions.includes(permission.id)}
                                onChange={() => handleTogglePermission(role.id, permission.id)}
                                className="sr-only"
                              />
                              <div className={cn(
                                "w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center",
                                role.permissions.includes(permission.id)
                                  ? "bg-[#F0B90B] border-[#F0B90B]"
                                  : isDark
                                    ? "bg-[#1A1A1A] border-[#4A4A4A] hover:border-[#6A6A6A]"
                                    : "bg-white border-gray-300 hover:border-gray-400"
                              )}>
                                {role.permissions.includes(permission.id) && (
                                  <Check className="w-3 h-3 text-white stroke-[3]" />
                                )}
                              </div>
                            </div>
                            <div className="ml-3 flex-1">
                              <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                                {permission.name}
                              </div>
                              <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {permission.description}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setManagingPermissionsId(null)}
                    className="px-4 py-2 bg-[#F0B90B] text-white rounded-lg hover:bg-[#E0A800] transition-colors"
                  >
                    Terminer
                  </button>
                </div>
              </div>
            )}
            */}
          </div>
        ))}
      </div>

      {/* Dialog de confirmation suppression */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={cn(
          isDark 
            ? "bg-[#1A1A1A] text-white border-[#3A3A3A]" 
            : "bg-white text-gray-900 border-gray-300"
        )}>
          <DialogHeader>
            <DialogTitle className={isDark ? "text-white" : "text-gray-900"}>
              Confirmer la suppression du rôle
            </DialogTitle>
            <DialogDescription className={isDark ? "text-gray-400" : "text-gray-500"}>
              Êtes-vous sûr de vouloir supprimer ce rôle ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <div className={cn(
            "flex items-center p-4 rounded-lg mt-2 mb-2",
            isDark ? "bg-[#242424] border border-[#3A3A3A]" : "bg-gray-100"
          )}>
            <AlertTriangle className="h-6 w-6 text-amber-500 mr-3" />
            <div>
              <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                La suppression d'un rôle affectera tous les employés qui y sont assignés.
              </p>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between mt-4">
            <DialogClose asChild>
              <button className={cn(
                "px-4 py-2 rounded-lg",
                isDark 
                  ? "bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}>
                Annuler
              </button>
            </DialogClose>
            <button
              onClick={handleDeleteRole}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Confirmer la suppression
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const EmployeesSection: React.FC = () => {
  const { isDark } = useTheme();
  const [employees, setEmployees] = useState([
    { 
      id: 101,
      name: "etert", 
      role: "Administrateur", 
      salary: 5000,
      joinedDate: "2023-05-15",
      permissions: [
        'view_info', 'edit_info', 'manage_settings',
        'view_employees', 'hire_employees', 'fire_employees', 'manage_roles', 'assign_roles', 'manage_salaries',
        'view_finances', 'manage_budget', 'approve_expenses',
        'view_lands', 'buy_lands', 'sell_lands', 'manage_lands',
        'view_shops', 'create_shops', 'manage_shops', 'manage_inventory', 'set_prices'
      ]
    },
    { 
      id: 102,
      name: "MarieMart", 
      role: "Manager", 
      salary: 3500,
      joinedDate: "2023-06-20",
      permissions: [
        'view_info', 'view_employees', 'hire_employees', 'assign_roles', 'manage_salaries',
        'view_finances', 'view_lands', 'manage_lands', 'view_shops', 'manage_shops', 'manage_inventory', 'set_prices'
      ]
    },
    { 
      id: 103,
      name: "PierreDur", 
      role: "Employé", 
      salary: 2500,
      joinedDate: "2023-07-10",
      permissions: ['view_info', 'view_employees', 'view_lands', 'view_shops']
    }
  ]);
  
  
  const [availableRoles] = useState<string[]>(["Administrateur", "Manager", "Employé", "Stagiaire", "Consultant"]);
  
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [employeeToFire, setEmployeeToFire] = useState<number | null>(null);
  const [editingPermissions, setEditingPermissions] = useState(false);

  const handleRoleChange = (employeeId: number, newRole: string) => {
    setEmployees(employees.map(emp => 
      emp.id === employeeId ? { ...emp, role: newRole } : emp
    ));
  };

  const handleSalaryChange = (employeeId: number, newSalary: number) => {
    setEmployees(employees.map(emp => 
      emp.id === employeeId ? { ...emp, salary: newSalary } : emp
    ));
  };
  
  const openFireDialog = (employeeId: number) => {
    setEmployeeToFire(employeeId);
    setIsDialogOpen(true);
  };
  
  const handleFireEmployee = () => {
    if (employeeToFire !== null) {
      setEmployees(employees.filter(emp => emp.id !== employeeToFire));
      if (selectedEmployee === employeeToFire) {
        setSelectedEmployee(null);
      }
      setIsDialogOpen(false);
      setEmployeeToFire(null);
    }
  };

  const handleTogglePermission = (employeeId: number, permissionId: string) => {
    setEmployees(employees.map(emp => {
      if (emp.id === employeeId) {
        const hasPermission = emp.permissions.includes(permissionId);
        const newPermissions = hasPermission
          ? emp.permissions.filter(p => p !== permissionId)
          : [...emp.permissions, permissionId];
        return { ...emp, permissions: newPermissions };
      }
      return emp;
    }));
  };

  const handleSelectAllInCategory = (employeeId: number, category: string) => {
    const categoryPermissions = AVAILABLE_PERMISSIONS
      .filter(p => p.category === category)
      .map(p => p.id);
    
    setEmployees(employees.map(emp => {
      if (emp.id === employeeId) {
        const hasAllInCategory = categoryPermissions.every(p => emp.permissions.includes(p));
        const otherPermissions = emp.permissions.filter(p => 
          !categoryPermissions.includes(p)
        );
        
        const newPermissions = hasAllInCategory 
          ? otherPermissions 
          : [...otherPermissions, ...categoryPermissions];
        
        return { ...emp, permissions: newPermissions };
      }
      return emp;
    }));
  };

  return (
    <div className={cn(
      "rounded-xl p-6",
      isDark ? "bg-[#1A1A1A] border border-[#2A2A2A]" : "bg-white border border-[#E9E9E9] shadow-sm"
    )}>
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-[#333333]'}`}>
        Gestion des employés
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {employees.map(employee => (
          <div 
            key={employee.id}
            className={cn(
              "p-4 rounded-lg border cursor-pointer transition-all",
              isDark 
                ? "bg-[#242424] border-[#3A3A3A] hover:border-[#F0B90B]" 
                : "bg-white border-[#E9E9E9] hover:border-[#F0B90B] hover:shadow-md",
              selectedEmployee === employee.id && (
                isDark 
                  ? "border-[#F0B90B] ring-1 ring-[#F0B90B]/50" 
                  : "border-[#F0B90B] ring-1 ring-[#F0B90B]/50"
              )
            )}
            onClick={() => setSelectedEmployee(selectedEmployee === employee.id ? null : employee.id)}
          >
            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {employee.name}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {employee.role} · {employee.salary}$
            </div>
            <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {employee.permissions.length} permission{employee.permissions.length > 1 ? 's' : ''}
            </div>
          </div>
        ))}
      </div>

      {selectedEmployee && (
        <div className={cn(
          "mt-6 p-4 rounded-lg border",
          isDark ? "bg-[#242424] border-[#3A3A3A]" : "bg-[#F8F8F8] border-[#E9E9E9]"
        )}>
          {(() => {
            const employee = employees.find(emp => emp.id === selectedEmployee);
            if (!employee) return null;
            
            return (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                  Détails de l'employé
                </h3>
                  <button
                    onClick={() => setEditingPermissions(!editingPermissions)}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm font-medium",
                      editingPermissions
                        ? "bg-[#F0B90B] text-white"
                        : isDark 
                            ? "bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]" 
                            : "bg-[#F5F5F5] text-gray-700 hover:bg-[#EBEBEB]"
                    )}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {editingPermissions ? "Terminer" : "Gérer les permissions"}
                  </button>
                </div>
                
                {!editingPermissions ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Pseudo
                      </h4>
                      <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {employee.name}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Date d'embauche
                      </h4>
                      <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(employee.joinedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Rôle
                      </h4>
                      <Select 
                        value={employee.role}
                        onValueChange={(value) => handleRoleChange(employee.id, value)}
                      >
                        <SelectTrigger className={cn(
                          "w-full",
                          isDark 
                            ? "bg-[#1A1A1A] text-white border-[#3A3A3A] focus:ring-[#F0B90B]/50 focus:border-[#F0B90B]" 
                            : "bg-white text-gray-900 border-gray-300 focus:ring-[#F0B90B]/50 focus:border-[#F0B90B]"
                        )}>
                          <SelectValue placeholder="Sélectionner un rôle" />
                        </SelectTrigger>
                        <SelectContent className={cn(
                          isDark 
                            ? "bg-[#242424] text-white border-[#3A3A3A]" 
                            : "bg-white text-gray-900 border-gray-300"
                        )}>
                            {availableRoles.map(role => (
                            <SelectItem 
                              key={role} 
                              value={role}
                              className={cn(
                                isDark 
                                  ? "text-white focus:bg-[#3A3A3A] focus:text-white" 
                                  : "text-gray-900 focus:bg-gray-100"
                              )}
                            >
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Le rôle est uniquement un libellé affiché en jeu et n'affecte pas les permissions
                        </p>
                    </div>
                    
                    <div>
                      <h4 className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Salaire ($)
                      </h4>
                      <input
                        type="number"
                        value={employee.salary}
                        onChange={(e) => handleSalaryChange(employee.id, parseInt(e.target.value) || 0)}
                        min="0"
                        step="100"
                        className={cn(
                          "w-full p-2 rounded-lg border",
                          isDark 
                            ? "bg-[#1A1A1A] text-white border-[#3A3A3A] focus:ring-[#F0B90B]/50 focus:border-[#F0B90B]" 
                            : "bg-white text-gray-900 border-gray-300 focus:ring-[#F0B90B]/50 focus:border-[#F0B90B]"
                        )}
                      />
                    </div>
                  </div>
                </div>
                ) : (
                  <div className="mb-6">
                    <h4 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                      Permissions pour {employee.name}
                    </h4>
                    
                    {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, categoryInfo]) => {
                      const categoryPermissions = AVAILABLE_PERMISSIONS.filter(p => p.category === categoryKey);
                      const grantedInCategory = categoryPermissions.filter(p => employee.permissions.includes(p.id)).length;
                      const allGrantedInCategory = grantedInCategory === categoryPermissions.length;
                      
                      return (
                        <div key={categoryKey} className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <span className="text-lg mr-2">{categoryInfo.icon}</span>
                              <h5 className={`font-medium ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                                {categoryInfo.name}
                              </h5>
                              <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                ({grantedInCategory}/{categoryPermissions.length})
                              </span>
                            </div>
                            <button
                              onClick={() => handleSelectAllInCategory(employee.id, categoryKey)}
                              className={cn(
                                "text-xs px-2 py-1 rounded transition-colors",
                                allGrantedInCategory
                                  ? "bg-red-500 text-white hover:bg-red-600"
                                  : "bg-[#F0B90B] text-white hover:bg-[#E0A800]"
                              )}
                            >
                              {allGrantedInCategory ? 'Tout désélectionner' : 'Tout sélectionner'}
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {categoryPermissions.map(permission => (
                              <label
                                key={permission.id}
                                className={cn(
                                  "flex items-start p-3 rounded-lg border cursor-pointer transition-colors",
                                  employee.permissions.includes(permission.id)
                                    ? isDark
                                      ? "bg-[#2A2A2A] border-[#F0B90B] shadow-sm"
                                      : "bg-[#FFF9E6] border-[#F0B90B] shadow-sm"
                                    : isDark
                                      ? "bg-[#242424] border-[#3A3A3A] hover:border-[#4A4A4A]"
                                      : "bg-white border-[#E9E9E9] hover:border-[#D0D0D0]"
                                )}
                              >
                                <div className="relative mt-1">
                                  <input
                                    type="checkbox"
                                    checked={employee.permissions.includes(permission.id)}
                                    onChange={() => handleTogglePermission(employee.id, permission.id)}
                                    className="sr-only"
                                  />
                                  <div className={cn(
                                    "w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center",
                                    employee.permissions.includes(permission.id)
                                      ? "bg-[#F0B90B] border-[#F0B90B]"
                                      : isDark
                                        ? "bg-[#1A1A1A] border-[#4A4A4A] hover:border-[#6A6A6A]"
                                        : "bg-white border-gray-300 hover:border-gray-400"
                                  )}>
                                    {employee.permissions.includes(permission.id) && (
                                      <Check className="w-3 h-3 text-white stroke-[3]" />
                                    )}
                                  </div>
                                </div>
                                <div className="ml-3 flex-1">
                                  <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                                    {permission.name}
                                  </div>
                                  <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {permission.description}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => openFireDialog(employee.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Retirer de l'entreprise
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={cn(
          isDark 
            ? "bg-[#1A1A1A] text-white border-[#3A3A3A]" 
            : "bg-white text-gray-900 border-gray-300"
        )}>
          <DialogHeader>
            <DialogTitle className={isDark ? "text-white" : "text-gray-900"}>
              Confirmer le retrait de l'employé
            </DialogTitle>
            <DialogDescription className={isDark ? "text-gray-400" : "text-gray-500"}>
              Êtes-vous sûr de vouloir retirer cet employé de votre entreprise ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <div className={cn(
            "flex items-center p-4 rounded-lg mt-2 mb-2",
            isDark ? "bg-[#242424] border border-[#3A3A3A]" : "bg-gray-100"
          )}>
            <AlertTriangle className="h-6 w-6 text-amber-500 mr-3" />
            <div>
              <p className={isDark ? "text-gray-300" : "text-gray-700"}>
                Le retrait d'un employé supprimera tous ses accès à votre entreprise et ses permissions.
              </p>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between mt-4">
            <DialogClose asChild>
              <button className={cn(
                "px-4 py-2 rounded-lg",
                isDark 
                  ? "bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}>
                Annuler
              </button>
            </DialogClose>
            <button
              onClick={handleFireEmployee}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Confirmer le retrait
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const LandsSection: React.FC = () => {
  const { isDark } = useTheme();
  const [lands] = useState([
    { 
      id: 1, 
      type: "Terrain agricole", 
      location: "Zone rurale", 
      coordinates: "X: 250, Y: 120", 
      price: 25000,
      isOwned: true,
      purchaseDate: "2023-08-12"
    },
    { 
      id: 2, 
      type: "Terrain urbain", 
      location: "Centre-ville", 
      coordinates: "X: 120, Y: 80", 
      price: 50000,
      isOwned: true,
      purchaseDate: "2023-09-05"
    },
    { 
      id: 3, 
      type: "Terrain industriel", 
      location: "Zone industrielle", 
      coordinates: "X: 420, Y: 210", 
      price: 35000,
      isOwned: false,
      rentalCost: 2000,
      rentalPeriod: "Mensuel"
    }
  ]);

  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Date inconnue";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "Date invalide";
    }
  };

  return (
    <div className={cn(
      "rounded-xl p-6",
      isDark ? "bg-[#1A1A1A] border border-[#2A2A2A]" : "bg-white border border-[#E9E9E9] shadow-sm"
    )}>
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-[#333333]'}`}>
        Terrains de l'entreprise
      </h2>

      <div className="space-y-4">
        {lands.map(land => (
          <div 
            key={land.id}
            className={cn(
              "p-4 rounded-lg border",
              isDark ? "bg-[#242424] border-[#3A3A3A]" : "bg-white border-[#E9E9E9]"
            )}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {land.type} · {land.location}
                </div>
                <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {land.coordinates}
                </div>
              </div>
              
              <div className={`mt-2 md:mt-0 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {land.isOwned ? (
                  <div className="flex flex-col items-end">
                    <span className="text-[#F0B90B] font-medium">Propriété</span>
                    <span className="text-sm">
                      {land.price}$ · Acheté le {formatDate(land.purchaseDate)}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-end">
                    <span className="text-blue-500 font-medium">Location</span>
                    <span className="text-sm">
                      {land.rentalCost}$ ({land.rentalPeriod})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ShopsSection: React.FC = () => {
  const { isDark } = useTheme();
  const [shops] = useState([
    { 
      id: 1, 
      name: "Boutique Centrale", 
      type: "Magasin de détail", 
      location: "Centre-ville", 
      coordinates: "X: 110, Y: 75", 
      price: 75000,
      isOwned: true,
      purchaseDate: "2023-10-20",
      size: "Grand"
    },
    { 
      id: 2, 
      name: "Dépôt TechCorp", 
      type: "Entrepôt", 
      location: "Zone industrielle", 
      coordinates: "X: 430, Y: 225", 
      price: 60000,
      isOwned: false,
      rentalCost: 3500,
      rentalPeriod: "Mensuel",
      size: "Moyen"
    }
  ]);

  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Date inconnue";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "Date invalide";
    }
  };

  return (
    <div className={cn(
      "rounded-xl p-6",
      isDark ? "bg-[#1A1A1A] border border-[#2A2A2A]" : "bg-white border border-[#E9E9E9] shadow-sm"
    )}>
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-[#333333]'}`}>
        Magasins de l'entreprise
      </h2>

      <div className="space-y-4">
        {shops.map(shop => (
          <div 
            key={shop.id}
            className={cn(
              "p-4 rounded-lg border",
              isDark ? "bg-[#242424] border-[#3A3A3A]" : "bg-white border-[#E9E9E9]"
            )}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {shop.name} · {shop.size}
                </div>
                <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {shop.type} · {shop.location} · {shop.coordinates}
                </div>
              </div>
              
              <div className={`mt-2 md:mt-0 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {shop.isOwned ? (
                  <div className="flex flex-col items-end">
                    <span className="text-[#F0B90B] font-medium">Propriété</span>
                    <span className="text-sm">
                      {shop.price}$ · Acheté le {formatDate(shop.purchaseDate)}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-end">
                    <span className="text-blue-500 font-medium">Location</span>
                    <span className="text-sm">
                      {shop.rentalCost}$ ({shop.rentalPeriod})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 