import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { useTheme } from "@/lib/theme-provider";
import { minDelay } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";


const validateSecretCode = async (code: string) => {
  return new Promise<{ success: boolean, message?: string }>((resolve) => {
    setTimeout(() => {
      
      const isValidCode = /^[A-F0-9]{8}$/.test(code.toUpperCase());
      resolve({ 
        success: isValidCode,
        message: isValidCode ? undefined : "Le code secret doit contenir exactement 8 caractères hexadécimaux (0-9, A-F)"
      });
    }, 300);
  });
};


const changePassword = async (_userData: any) => {
  return new Promise<{ success: boolean, message?: string }>((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 400);
  });
};

export default function ChangePassword() {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    secretCode: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoValidated, setAutoValidated] = useState(false);
  const [inputErrors, setInputErrors] = useState<Record<string, string>>({});

  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const usernameParam = queryParams.get('pseudo');
    const codeParam = queryParams.get('code');

    console.log("Paramètres d'URL détectés:", { username: usernameParam, code: codeParam, autoValidated });

    
    if (usernameParam && !autoValidated) {
      const newFormData = { ...formData };
      let toastMessage = "";
      let targetStep = 2; 
      
      
      newFormData.username = usernameParam;
      toastMessage += `Pseudo "${usernameParam}"`;
      
      
      if (codeParam) {
        newFormData.secretCode = codeParam.toUpperCase(); 
        toastMessage += ` et code secret`;
        targetStep = 3; 
      }
      
      
      setFormData(prev => ({
        ...prev,
        ...newFormData
      }));
      
      
      setAutoValidated(true);
      
      
      setStep(targetStep);
      
      toast({
        variant: "default",
        title: "Informations pré-remplies",
        description: `${toastMessage} automatiquement rempli${toastMessage.includes('et') ? 's' : ''}.`
      });
    }
  }, [location.search, autoValidated, toast]);

  useEffect(() => {
    setInputErrors({});
  }, [step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    
    if (inputErrors[name]) {
      setInputErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep = () => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.username.trim()) {
        toast({
          variant: "destructive",
          title: "Champ requis",
          description: "Le pseudo est requis"
        });
        newErrors.username = "Le pseudo est requis";
        isValid = false;
      } else if (formData.username.trim().length < 3) {
        toast({
          variant: "destructive",
          title: "Pseudo invalide",
          description: "Le pseudo doit contenir au moins 3 caractères"
        });
        newErrors.username = "Le pseudo doit contenir au moins 3 caractères";
        isValid = false;
      }
    } else if (step === 2) {
      if (!formData.secretCode.trim()) {
        toast({
          variant: "destructive",
          title: "Champ requis",
          description: "Le code secret est requis"
        });
        newErrors.secretCode = "Le code secret est requis";
        isValid = false;
      } else if (!/^[A-F0-9]{8}$/.test(formData.secretCode.toUpperCase())) {
        toast({
          variant: "destructive",
          title: "Format invalide",
          description: "Le code secret doit contenir exactement 8 caractères hexadécimaux (0-9, A-F)"
        });
        newErrors.secretCode = "Format invalide: 8 caractères hexadécimaux requis";
        isValid = false;
      }
    } else if (step === 3) {
      if (!formData.password) {
        toast({
          variant: "destructive",
          title: "Champ requis",
          description: "Le mot de passe est requis"
        });
        newErrors.password = "Le mot de passe est requis";
        isValid = false;
      }
      if (!formData.confirmPassword) {
        toast({
          variant: "destructive",
          title: "Champ requis",
          description: "La confirmation du mot de passe est requise"
        });
        newErrors.confirmPassword = "La confirmation du mot de passe est requise";
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        toast({
          variant: "destructive",
          title: "Erreur de validation",
          description: "Les mots de passe ne correspondent pas"
        });
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
        isValid = false;
      }
    }

    setInputErrors(newErrors);
    return isValid;
  };

  const nextStep = async () => {
    if (!validateStep()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (step === 2) {
        
        const result = await minDelay(
          validateSecretCode(formData.secretCode),
          1000
        );
        
        if (!result.success) {
          throw new Error(result.message || "Code invalide");
        }
      }
      
      
      setStep(prev => prev + 1);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur de validation",
        description: (error as Error).message || "Erreur de validation"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      await nextStep();
      return;
    }
    
    if (!validateStep()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      
      const result = await minDelay(
        changePassword(formData),
        1200
      );
      
      if (result.success) {
        toast({
          variant: "success",
          title: "Mot de passe modifié",
          description: "Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter."
        });
        
        
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        throw new Error(result.message || "Erreur lors du changement de mot de passe");
      }
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: (error as Error).message || "Une erreur est survenue. Veuillez réessayer."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="mb-4">
            <AuthInput
              id="username"
              name="username"
              type="text"
              required
              placeholder="Entrez votre pseudo"
              label="Entrez votre pseudo"
              value={formData.username}
              onChange={handleChange}
              error={inputErrors.username}
              showErrorMessage={false}
            />
            <p className={`text-sm mt-1 ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
              * Ce code permettra d'être connecté à votre compte Minecraft
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
              * Vous devez être connecté au serveur Minecraft
            </p>
          </div>
        );
      case 2:
        return (
          <div className="mb-4">
            <AuthInput
              id="secretCode"
              name="secretCode"
              type="text"
              required
              placeholder="Entrez le code secret"
              label="Entrez le code secret"
              value={formData.secretCode}
              onChange={handleChange}
              error={inputErrors.secretCode}
              showErrorMessage={false}
            />
            <p className={`text-sm mt-1 ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
              * Ce code vous a été envoyé dans votre chat privé sur le serveur Minecraft
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
              * Vous devez être connecté au serveur Minecraft
            </p>
          </div>
        );
      case 3:
        return (
          <div className="mb-4">
            <AuthInput
              id="password"
              name="password"
              type="password"
              required
              placeholder="Entrez votre mot de passe"
              label="Entrez votre mot de passe"
              value={formData.password}
              onChange={handleChange}
              error={inputErrors.password}
              showErrorMessage={false}
            />
            
            <div className="my-6"></div>
            
            <AuthInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="Confirmez votre mot de passe"
              label="Confirmez votre mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={inputErrors.confirmPassword}
              showErrorMessage={false}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderStepIndicator = () => {
    const goToStep = (targetStep: number) => {
      
      if (targetStep < step) {
        setStep(targetStep);
      }
    };

    return (
      <div className="flex justify-center mb-6">
        <div className="flex items-center">
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 
                ? 'bg-[#F0B90B] text-black' 
                : `${isDark ? 'bg-[#2A2A2A] text-white' : 'bg-[#E5E5E5] text-[#666666]'}`
            } ${step > 1 ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={() => goToStep(1)}
          >
            1
          </div>
          <div className={`w-12 h-1 ${
            step >= 2 
              ? 'bg-[#F0B90B]' 
              : `${isDark ? 'bg-[#2A2A2A]' : 'bg-[#E5E5E5]'}`
          }`}></div>
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 
                ? 'bg-[#F0B90B] text-black' 
                : `${isDark ? 'bg-[#2A2A2A] text-white' : 'bg-[#E5E5E5] text-[#666666]'}`
            } ${step > 2 ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={() => goToStep(2)}
          >
            2
          </div>
          <div className={`w-12 h-1 ${
            step >= 3 
              ? 'bg-[#F0B90B]' 
              : `${isDark ? 'bg-[#2A2A2A]' : 'bg-[#E5E5E5]'}`
          }`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 3 
              ? 'bg-[#F0B90B] text-black' 
              : `${isDark ? 'bg-[#2A2A2A] text-white' : 'bg-[#E5E5E5] text-[#666666]'}`
          }`}>
            3
          </div>
        </div>
      </div>
    );
  };

  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  return (
    <AuthLayout 
      title={`Changement de mot de passe - Étape ${step}`}
    >
      <div className="flex flex-col h-[410px]">
        <div className="relative">
          {step > 1 && (
            <button 
              onClick={goToPreviousStep}
              className={`absolute left-0 top-0 p-1 rounded-full ${
                isDark ? 'hover:bg-[#2A2A2A]' : 'hover:bg-[#F5F5F5]'
              } transition-colors`}
              aria-label="Retour à l'étape précédente"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {renderStepIndicator()}
        </div>
        
        <form className="flex flex-col flex-1" onSubmit={handleSubmit}>
          <div className="flex-1">
            {renderFormStep()}
          </div>

          <div className="mt-auto">
            <div className="mb-4">
              <AuthButton 
                type="submit"
                isLoading={isSubmitting}
              >
                {step < 3 ? "Suivant" : "Changer le mot de passe"}
              </AuthButton>
            </div>

            <div className="text-center">
              <Link to="/login" className="text-[#F0B90B] hover:underline">
                Connexion
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
} 