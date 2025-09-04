import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTheme } from '@/lib/theme-provider';
import { useUserStore } from '@/stores/userStore';
import { useToast } from '@/hooks/use-toast';
import { cn, minDelay } from '@/lib/utils';
import { User, Trash2, AlertTriangle } from 'lucide-react';

type TabType = 'info' | 'delete';

const updateUserProfile = async () => {
  return new Promise<{ success: boolean, message?: string }>((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 800);
  });
};

const deleteUserAccount = async () => {
  return new Promise<{ success: boolean, message?: string }>((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1200);
  });
};

export default function ProfilePage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useUserStore(state => state);
  const logout = useUserStore(state => state.logout);
  
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const profileData = {
    username: user.username || '',
    minecraftUUID: '550e8400-e29b-41d4-a716-446655440000',
    email: 'exemple@luxentis.com',
    registeredDate: new Date().toISOString().slice(0, 10),
  };
  
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  useEffect(() => {
    if (!user.isAuthenticated) {
      navigate('/login');
    }
  }, [user.isAuthenticated, navigate]);


  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      const result = await minDelay(
        updateUserProfile(),
        1000
      );
      
      if (result.success) {
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour avec succès",
          variant: "success"
        });
      } else {
        throw new Error(result.message || "Erreur lors de la mise à jour du profil");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast({
        title: "Erreur",
        description: (error as Error).message || "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== user.username) {
      toast({
        title: "Confirmation incorrecte",
        description: "Veuillez saisir votre pseudo exact pour supprimer votre compte",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await minDelay(
        deleteUserAccount(),
        1500
      );
      
      if (result.success) {
        toast({
          title: "Compte supprimé",
          description: "Votre compte et toutes vos données ont été supprimées avec succès",
          variant: "success"
        });
        setTimeout(() => {
          logout();
          navigate('/');
        }, 1500);
      } else {
        throw new Error(result.message || "Erreur lors de la suppression du compte");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du compte:", error);
      toast({
        title: "Erreur",
        description: (error as Error).message || "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getMinecraftAvatarUrl = (username: string) => {
    return `https://mc-heads.net/avatar/${username}/100`;
  };
  
  const renderProfileTab = () => {
    return (
      <div>
        <form onSubmit={handleProfileSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1">
              <div className={cn(
                "p-5 rounded-xl flex flex-col items-center",
                isDark ? "bg-[#1A1A1A] border border-[#2A2A2A]" : "bg-white border border-[#E9E9E9] shadow-sm"
              )}>
                <div className="mb-4">
                  <img 
                    src={getMinecraftAvatarUrl(profileData.username)} 
                    alt="Avatar Minecraft" 
                    className="w-32 h-32 rounded-xl"
                  />
                </div>
                
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                  {profileData.username}
                </h3>
                
                <div className="mt-2 text-center">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Membre depuis {new Date(profileData.registeredDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className={cn(
                "p-5 rounded-xl",
                isDark ? "bg-[#1A1A1A] border border-[#2A2A2A]" : "bg-white border border-[#E9E9E9] shadow-sm"
              )}>
                <div className="mb-6">
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                    Informations du profil
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Pseudo Minecraft
                    </label>
                                        <input                      type="text"                      name="username"                      value={profileData.username}                      disabled                      className={cn(                        "w-full p-2.5 rounded-lg text-sm outline-none transition-colors",                        isDark                           ? 'bg-[#1D1D1D] text-gray-400 border border-[#3A3A3A]'                           : 'bg-[#F0F0F0] text-gray-500 border border-[#E9E9E9]'                      )}                    />
                    
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Votre pseudo Minecraft est utilisé pour afficher votre skin
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </label>
                                        <input                      type="email"                      name="email"                      value={profileData.email}                      disabled                      className={cn(                        "w-full p-2.5 rounded-lg text-sm outline-none transition-colors",                        isDark                           ? 'bg-[#1D1D1D] text-gray-400 border border-[#3A3A3A]'                           : 'bg-[#F0F0F0] text-gray-500 border border-[#E9E9E9]'                      )}                    />
                    
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      UUID Minecraft
                    </label>
                    <input
                      type="text"
                      name="minecraftUUID"
                      value={profileData.minecraftUUID}
                      disabled
                      className={cn(
                        "w-full p-2.5 rounded-lg text-sm outline-none transition-colors",
                        isDark 
                          ? 'bg-[#1D1D1D] text-gray-400 border border-[#3A3A3A]' 
                          : 'bg-[#F0F0F0] text-gray-500 border border-[#E9E9E9]'
                      )}
                    />
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      L'UUID ne peut pas être modifié manuellement
                    </p>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  };
  
  const renderDeleteTab = () => {
    return (
      <div className={cn(
        "p-5 rounded-xl",
        isDark ? "bg-[#1A1A1A] border border-[#2A2A2A]" : "bg-white border border-[#E9E9E9] shadow-sm"
      )}>
        <div className="flex items-center mb-4">
          <div className="bg-red-100 p-2 rounded-full mr-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-red-500">
            Supprimer votre compte
          </h3>
        </div>
        <div className={cn(
          "p-4 rounded-lg mb-6",
          "bg-red-500/10 border border-red-500/20"
        )}>
          <p className={`text-sm mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <strong>Attention :</strong> La suppression de votre compte est permanente et irréversible.
          </p>
          <ul className={`list-disc list-inside text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>Toutes vos données personnelles seront supprimées</li>
            <li>Vos entreprises et transactions seront anonymisées</li>
            <li>Vous n'aurez plus accès à votre compte Luxentis</li>
            <li>Cette action est définitive et ne peut pas être annulée</li>
          </ul>
        </div>
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Pour confirmer, tapez votre pseudo : <span className={`font-mono px-1.5 py-0.5 rounded ${isDark ? 'bg-[#2A2A2A] text-[#F0B90B]' : 'bg-gray-200 text-gray-800'}`}>
              {user.username}
            </span>
          </label>
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
            placeholder={user.username || ''}
          />
        </div>
        <div>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isSubmitting || deleteConfirmation !== user.username}
            className={cn(
              "py-2.5 px-4 rounded-lg text-sm flex items-center",
              deleteConfirmation === user.username
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-red-300 text-white cursor-not-allowed",
              "transition-colors",
              isSubmitting && "opacity-70 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-2" />
                Supprimer définitivement mon compte
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-[#333333]'}`}>
          Mon Profil
        </h1>
        <div className="flex border-b mb-6 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveTab('info')}
            className={cn(
              "py-2 px-4 flex items-center text-sm font-medium whitespace-nowrap",
              activeTab === 'info' 
                ? isDark 
                  ? 'text-[#F0B90B] border-b-2 border-[#F0B90B]'
                  : 'text-[#F0B90B] border-b-2 border-[#F0B90B]'
                : isDark
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <User size={16} className="mr-2" />
            Informations
          </button>
          <button
            onClick={() => setActiveTab('delete')}
            className={cn(
              "py-2 px-4 flex items-center text-sm font-medium whitespace-nowrap",
              activeTab === 'delete' 
                ? isDark 
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-red-500 border-b-2 border-red-500'
                : isDark
                  ? 'text-gray-400 hover:text-red-400'
                  : 'text-gray-500 hover:text-red-500'
            )}
          >
            <Trash2 size={16} className="mr-2" />
            Supprimer le compte
          </button>
        </div>
        {activeTab === 'info' && renderProfileTab()}
        {activeTab === 'delete' && renderDeleteTab()}
      </div>
    </MainLayout>
  );
} 