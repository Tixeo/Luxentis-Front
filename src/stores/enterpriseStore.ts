import { create } from 'zustand';
import { Enterprise, mockEnterprises } from '@/types/enterprise';

interface EnterpriseState {
  enterprises: Enterprise[];
  userEnterprise: Enterprise | null;
  isLoading: boolean;
  error: string | null;
}

interface EnterpriseActions {
  fetchEnterprises: () => Promise<void>;
  fetchUserEnterprise: () => Promise<void>;
  createEnterprise: (enterprise: Omit<Enterprise, 'id'>) => Promise<void>;
  updateEnterprise: (id: string, data: Partial<Enterprise>) => Promise<void>;
  resetUserEnterprise: () => void;
  setUserHasNoEnterprise: () => void;
}


const fetchEnterprisesApi = async (): Promise<Enterprise[]> => {
  
  return new Promise((resolve) => {
    setTimeout(() => {
      
      resolve(mockEnterprises);
    }, 500);
  });
};


const fetchUserEnterpriseApi = async (): Promise<Enterprise | null> => {
  
  return new Promise((resolve) => {
    setTimeout(() => {
      
      
      resolve(null);
    }, 300);
  });
};

export const useEnterpriseStore = create<EnterpriseState & EnterpriseActions>((set) => ({
  enterprises: [],
  userEnterprise: null,
  isLoading: false,
  error: null,

  fetchEnterprises: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const enterprises = await fetchEnterprisesApi();
      set({ enterprises, isLoading: false });
    } catch (error) {
      set({ error: "Impossible de charger les entreprises", isLoading: false });
    }
  },

  fetchUserEnterprise: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const userEnterprise = await fetchUserEnterpriseApi();
      set({ userEnterprise, isLoading: false });
    } catch (error) {
      set({ error: "Impossible de charger votre entreprise", isLoading: false });
    }
  },

  createEnterprise: async (enterprise) => {
    set({ isLoading: true, error: null });
    
    try {
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      
      const newEnterprise = {
        ...enterprise,
        id: Date.now().toString(),
        isUserOwner: true,
        createdAt: new Date().toISOString().split('T')[0],
        employeeCount: 1, 
        ownerName: "Vous", 
        ownerUUID: "6a6887fe-dd7c-4f04-98b1-e358ce75c377", 
      } as Enterprise;
      
      set(state => ({ 
        enterprises: [...state.enterprises, newEnterprise],
        userEnterprise: newEnterprise,
        isLoading: false 
      }));
    } catch (error) {
      set({ error: "Impossible de créer l'entreprise", isLoading: false });
    }
  },

  updateEnterprise: async (id, data) => {
    set({ isLoading: true, error: null });
    
    try {
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => {
        const updatedEnterprises = state.enterprises.map(enterprise => 
          enterprise.id === id ? { ...enterprise, ...data } : enterprise
        );
        
        const updatedUserEnterprise = state.userEnterprise?.id === id 
          ? { ...state.userEnterprise, ...data } 
          : state.userEnterprise;
        
        return { 
          enterprises: updatedEnterprises,
          userEnterprise: updatedUserEnterprise,
          isLoading: false 
        };
      });
    } catch (error) {
      set({ error: "Impossible de mettre à jour l'entreprise", isLoading: false });
    }
  },

  
  resetUserEnterprise: () => {
    set({ userEnterprise: null });
  },

  
  setUserHasNoEnterprise: () => {
    set({ userEnterprise: null, isLoading: false });
  }
})); 