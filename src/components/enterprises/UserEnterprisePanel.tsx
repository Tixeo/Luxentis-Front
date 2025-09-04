import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme-provider';
import { useUserStore } from '@/stores/userStore';
import { Enterprise } from '@/types/enterprise';
import { UsersRound, Briefcase, UserRound, X, Check, Building2, Plus, Settings } from 'lucide-react';
import { AuthButton } from '@/components/auth/AuthButton';
import { cn } from '@/lib/utils';
import { useEnterpriseStore } from '@/stores/enterpriseStore';
import { CreateEnterpriseModal } from '@/components/enterprises/CreateEnterpriseModal';
import { useToast } from '@/hooks/use-toast';

interface UserEnterprisePanelProps {
  enterprise?: Enterprise | null;
  isLoading?: boolean;
}

interface EnterpriseInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  variant?: 'default' | 'number';
  as?: 'input' | 'textarea';
  rows?: number;
}

const EnterpriseInput = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, EnterpriseInputProps>(
  ({ className, variant = 'default', as = 'input', rows = 3, ...props }, ref) => {
    const { isDark } = useTheme();
    
    const baseClasses = cn(
      "w-full outline-none transition-all rounded-lg",
      isDark ? 'bg-[#242424] text-white border border-[#3A3A3A] focus:border-[#F0B90B]/50 focus:ring-1 focus:ring-[#F0B90B]/50' : 'bg-[#F8F8F8] text-[#333333] border border-[#E9E9E9] focus:border-[#F0B90B]/50 focus:ring-1 focus:ring-[#F0B90B]/50',
      variant === 'number' ? 'text-sm px-2 py-1' : 'text-sm px-3 py-2',
      className
    );
    
    if (as === 'textarea') {
      return (
        <textarea
          className={cn(baseClasses, "resize-none")}
          rows={rows}
          ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
          {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
        />
      );
    }
    
    return (
      <input
        className={baseClasses}
        ref={ref as React.ForwardedRef<HTMLInputElement>}
        {...props as React.InputHTMLAttributes<HTMLInputElement>}
      />
    );
  }
);

EnterpriseInput.displayName = "EnterpriseInput";

const useRouter = () => {
  return {
    push: (path: string) => {
      console.log(`Navigation vers: ${path}`);
      window.location.href = path;
    }
  };
};

export function UserEnterprisePanel({ enterprise: propEnterprise, isLoading: propIsLoading = false }: UserEnterprisePanelProps) {
  const { isDark } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Enterprise>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const userEnterprise = useEnterpriseStore(state => state.userEnterprise);
  const storeIsLoading = useEnterpriseStore(state => state.isLoading);
  const updateEnterprise = useEnterpriseStore(state => state.updateEnterprise);
  const fetchUserEnterprise = useEnterpriseStore(state => state.fetchUserEnterprise);
  const createEnterprise = useEnterpriseStore(state => state.createEnterprise);
  
  const { bankAccounts, updateBankAccounts } = useUserStore();
  
  const enterprise = propEnterprise !== undefined ? propEnterprise : userEnterprise;
  const isLoading = propIsLoading || storeIsLoading;
  
  useEffect(() => {
    if (propEnterprise === undefined && !userEnterprise) {
      fetchUserEnterprise();
    }
  }, [propEnterprise, userEnterprise, fetchUserEnterprise]);
  
  const baseClasses = `rounded-xl p-6 w-full relative ${
    isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-white border border-[#E9E9E9] shadow-sm'
  }`;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };
  
  const saveChanges = async () => {
    if (enterprise && Object.keys(editData).length > 0) {
      await updateEnterprise(enterprise.id, editData);
      setIsEditing(false);
      setEditData({});
    }
  };
  
  const cancelEditing = () => {
    setIsEditing(false);
    setEditData({});
  };
  
  const handleManageEnterprise = () => {
    router.push('/manage-enterprise');
  };
  
  const handleCreateEnterprise = async (enterpriseData: { name: string; description: string; tags: string[]; paymentAccountId: string }) => {
    console.log('Création d\'entreprise avec les données:', enterpriseData);
    
    const ENTERPRISE_CREATION_COST = 50000;
    
    
    const availableAccounts = bankAccounts.length > 0 ? bankAccounts : [
      { id: 'myacc1', number: 'MYACC12345', isDefault: true, balance: 60000 },
      { id: 'myacc2', number: 'MYACC67890', isDefault: false, balance: 30000 }
    ];
    
    const paymentAccount = availableAccounts.find(acc => acc.id === enterpriseData.paymentAccountId);
    
    if (!paymentAccount || paymentAccount.balance < ENTERPRISE_CREATION_COST) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Fonds insuffisants sur le compte sélectionné.'
      });
      return;
    }
    
    try {
      
      await createEnterprise({
        name: enterpriseData.name,
        description: enterpriseData.description,
        sector: enterpriseData.tags.length > 0 ? enterpriseData.tags[0] : 'Général',
        employeeCount: 1,
        ownerName: 'Tix', 
        ownerUUID: '6a6887fe-dd7c-4f04-98b1-e358ce75c377',
        createdAt: new Date().toISOString().split('T')[0]
      });

      
      if (bankAccounts.length === 0) {
        
        console.log(`Simulation: ${ENTERPRISE_CREATION_COST}$ débités du compte de test ${paymentAccount.number}`);
        toast({
          variant: 'destructive',
          title: 'Simulation seulement',
          description: 'Les comptes de test ne peuvent pas être débités. Créez un vrai compte bancaire d\'abord.'
        });
        return;
      } else {
        
        const updatedAccounts = bankAccounts.map(account => {
          if (account.id === enterpriseData.paymentAccountId) {
            return {
              ...account,
              balance: account.balance - ENTERPRISE_CREATION_COST
            };
          }
          return account;
        });
        
        
        updateBankAccounts(updatedAccounts);
        console.log('Comptes mis à jour:', updatedAccounts);
      }

      toast({
        variant: 'success',
        title: 'Entreprise créée avec succès',
        description: `L'entreprise "${enterpriseData.name}" a été créée ! ${ENTERPRISE_CREATION_COST.toLocaleString()}$ ont été débités du compte ${paymentAccount.number}.`
      });
      
      setIsCreateModalOpen(false);
      setTimeout(() => {
        window.location.href = '/manage-enterprise';
      }, 1000);
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création de l\'entreprise.'
      });
    }
  };
  

  
  if (isLoading) {
    return (
      <div className={`${baseClasses} animate-subtle-pulse`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`h-7 rounded w-1/2 ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-300'}`}></div>
          <div className={`h-12 w-12 rounded-full ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-300'}`}></div>
        </div>
        <div className="space-y-3">
          <div className={`h-4 rounded w-3/4 ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-300'}`}></div>
          <div className={`h-4 rounded w-1/2 ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-300'}`}></div>
          <div className={`h-4 rounded w-2/3 ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-300'}`}></div>
        </div>
      </div>
    );
  }
  
  if (!enterprise) {
    return (
      <div className={baseClasses}>
        <div className="flex flex-col items-center justify-center min-h-[180px] py-8">
          <Building2 className={`h-16 w-16 mb-4 opacity-50 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className="text-center mb-4 max-w-xs mx-auto">Vous ne possédez pas encore d'entreprise</p>
          <div className="mt-2 w-full flex justify-center flex-col items-center gap-3">
            <AuthButton
              onClick={() => window.location.href = '/manage-enterprise'}
              className="h-auto py-2.5 px-6 text-sm font-medium w-auto"
            >
              <div className="flex items-center justify-center">
                <Plus className="h-4 w-4 mr-2" />
                Créer une entreprise
              </div>
            </AuthButton>
            {/* <button 
              onClick={handleCreateEnterpriseLocally}
              className={`text-xs underline ${isDark ? 'text-gray-400' : 'text-gray-500'} hover:text-[#F0B90B] transition-colors mt-2`}
            >
              Testttt
            </button> */}
          </div>
        </div>
      </div>
    );
  }
  
  const avatarUrl = `https://mc-heads.net/avatar/${enterprise.ownerUUID}/100`;
  
  return (
    <>
      <div className={baseClasses}>
        <div className="absolute top-6 right-6">
          <img 
            src={avatarUrl} 
            alt={`${enterprise.ownerName}'s avatar`} 
            className="h-16 w-16 rounded-lg" 
          />
        </div>
        <div className="mb-5 pr-20">
          <div className="mb-4">
            {isEditing ? (
              <EnterpriseInput
                type="text"
                name="name"
                value={editData.name || ''}
                onChange={handleChange}
                className="text-xl font-bold"
              />
            ) : (
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}> 
                {enterprise.name}
              </h2>
            )}
          </div>
          <div className="mb-4">
            {isEditing ? (
              <EnterpriseInput
                as="textarea"
                name="description"
                value={editData.description || ''}
                onChange={handleChange}
                rows={3}
              />
            ) : (
              <p className={`text-sm ${isDark ? 'text-[#AAAAAA]' : 'text-[#666666]'}`}> 
                {enterprise.description}
              </p>
            )}
          </div>
          <div className="flex flex-col space-y-2 mb-4">
            <div className="flex items-center">
              <div className="flex items-center min-w-[100px]">
                <Briefcase className="h-4 w-4 mr-2 text-[#F0B90B]" />
                <span className={`text-sm font-medium ${isDark ? 'text-[#999999]' : 'text-[#777777]'}`}>Secteur:</span>
              </div>
              {isEditing ? (
                <EnterpriseInput
                  type="text"
                  name="sector"
                  value={editData.sector || ''}
                  onChange={handleChange}
                  className="ml-2 flex-1"
                  variant="number"
                />
              ) : (
                <span className={`ml-2 text-sm ${isDark ? 'text-[#AAAAAA]' : 'text-[#666666]'}`}>{enterprise.sector}</span>
              )}
            </div>
            <div className="flex items-center">
              <div className="flex items-center min-w-[100px]">
                <UsersRound className="h-4 w-4 mr-2 text-[#F0B90B]" />
                <span className={`text-sm font-medium ${isDark ? 'text-[#999999]' : 'text-[#777777]'}`}>Employés:</span>
              </div>
              {isEditing ? (
                <EnterpriseInput
                  type="number"
                  name="employeeCount"
                  value={editData.employeeCount?.toString() || ''}
                  onChange={handleChange}
                  min="0"
                  className="ml-2 w-20"
                  variant="number"
                />
              ) : (
                <span className={`ml-2 text-sm ${isDark ? 'text-[#AAAAAA]' : 'text-[#666666]'}`}>{enterprise.employeeCount}</span>
              )}
            </div>
            <div className="flex items-center">
              <div className="flex items-center min-w-[100px]">
                <UserRound className="h-4 w-4 mr-2 text-[#F0B90B]" />
                <span className={`text-sm font-medium ${isDark ? 'text-[#999999]' : 'text-[#777777]'}`}>Propriétaire:</span>
              </div>
              <span className={`ml-2 text-sm ${isDark ? 'text-[#AAAAAA]' : 'text-[#666666]'}`}>{enterprise.ownerName}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          {isEditing ? (
            <div className="flex space-x-2">
              <AuthButton 
                variant="secondary" 
                onClick={cancelEditing} 
                className="h-auto py-1.5 px-3 text-sm"
              >
                <div className="flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  Annuler
                </div>
              </AuthButton>
              <AuthButton 
                onClick={saveChanges}
                className="h-auto py-1.5 px-3 text-sm"
              >
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  Sauvegarder
                </div>
              </AuthButton>
            </div>
          ) : (
            <AuthButton
              onClick={handleManageEnterprise}
              className="h-auto py-1.5 px-4 text-sm w-auto"
            >
              <div className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Gérer
              </div>
            </AuthButton>
          )}
        </div>
      </div>
      <CreateEnterpriseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreateEnterprise}
      />
    </>
  );
} 