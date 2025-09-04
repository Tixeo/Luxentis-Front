import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthCheckbox } from "@/components/auth/AuthCheckbox";
import { minDelay } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/stores/userStore";

interface AuthResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    username: string;
    bankAccounts: Array<{
      id: string;
      number: string;
      balance: number;
      isDefault: boolean;
    }>;
  };
}


const fakeAuth = async (username: string, password: string): Promise<AuthResult> => {
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  
  if (password === "wrong") {
    return { 
      success: false, 
      message: 'Identifiants incorrects' 
    };
  }
  
  
  const bankAccounts = [
    { id: 'acc1', number: `${username.toUpperCase()}`, balance: 1000, isDefault: true },
    { id: 'acc2', number: `${username.toUpperCase()}`, balance: 5000000, isDefault: false }
  ];
  
  return { 
    success: true, 
    user: { 
      id: Math.random().toString(36).substring(2, 9), 
      username, 
      bankAccounts 
    }, 
    message: 'Connexion réussie' 
  };
};

export default function Login() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  
  const login = useUserStore(state => state.login);
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  
  
  useEffect(() => {
    if (isAuthenticated) {
      
      const params = new URLSearchParams(location.search);
      const redirect = params.get('redirect');
      if (redirect) {
        navigate(redirect);
      } else {
        navigate('/home');
      }
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      
      const authResult = await minDelay(fakeAuth(formData.username, formData.password), 1500);
      
      if (authResult.success && authResult.user) {
        
        toast({
          variant: "success",
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté",
        });
        
        
        login(
          authResult.user.username, 
          authResult.user.id,
          authResult.user.bankAccounts
        );
        
        
        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect');
        if (redirect) {
          navigate(redirect);
        } else {
          navigate('/home');
        }
      } else {
        
        toast({
          variant: "destructive",
          title: "Échec de connexion",
          description: authResult.message,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      toast({
        variant: "destructive",
        title: "Erreur inattendue",
        description: "Une erreur s'est produite lors de la connexion",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout 
      title="Connexion"
      subtitle="Entrez vos identifiants pour accéder à votre compte"
    >
      <div className="flex flex-col h-full">
        <form className="flex flex-col flex-1" onSubmit={handleSubmit}>
          <div className="flex-1">
            <div className="space-y-6">
              <AuthInput
                id="username"
                name="username"
                type="text"
                required
                placeholder="Pseudo"
                label="Pseudo"
                value={formData.username}
                onChange={handleChange}
              />
              
              <AuthInput
                id="password"
                name="password"
                type="password"
                required
                placeholder="Mot de passe"
                label="Mot de passe"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div className="mt-4 mb-6 flex items-center justify-between">
              <AuthCheckbox
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                label="Se souvenir de moi"
              />
              
              <Link 
                to="/change-password" 
                className="text-[#F0B90B] hover:underline text-sm"
              >
                Mot de passe oublié?
              </Link>
            </div>
          </div>
          
          <div className="mt-auto">
            <div className="mb-4">
              <AuthButton 
                type="submit"
                isLoading={isSubmitting}
              >
                Connexion
              </AuthButton>
            </div>
            
            <div className="text-center">
              <p className={isDark ? 'text-white' : 'text-[#333333]'}>
                Pas encore de compte?{" "}
                <Link to="/signup" className="text-[#F0B90B] hover:underline">
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
} 