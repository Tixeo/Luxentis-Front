import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthCheckbox } from "@/components/auth/AuthCheckbox";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { minDelay } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const validateSecretCode = async (code: string) => {
  return new Promise<{ success: boolean, message?: string }>((resolve) => {
    setTimeout(() => {
      const isValidCode = /^[A-F0-9]{8}$/.test(code);
      console.log("Validation du code:", code, "Résultat:", isValidCode);
      resolve({ 
        success: isValidCode,
        message: isValidCode ? undefined : "Le code secret doit contenir 8 caractères hexadécimaux (0-9, A-F)"
      });
    }, 300);
  });
};

const registerUser = async (_userData: any) => {
  return new Promise<{ success: boolean, message?: string }>((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 400);
  });
};

export default function Register() {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    secretCode: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoValidated, setAutoValidated] = useState(false);
  
  const [termsAcceptedInPreviousStep, setTermsAcceptedInPreviousStep] = useState(false);
  
  const [inputErrors, setInputErrors] = useState<Record<string, string>>({});

  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const pseudoParam = queryParams.get('pseudo');
    const codeParam = queryParams.get('code');

    console.log("Paramètres d'URL détectés:", pseudoParam, codeParam, "autoValidated:", autoValidated);

    
    if (pseudoParam && codeParam) {
      
      setFormData(prev => ({
        ...prev,
        username: pseudoParam,
        secretCode: codeParam,
        
        acceptTerms: false
      }));

      
      if (!autoValidated) {
        setAutoValidated(true); 
        
        validateAndProceed(pseudoParam, codeParam);
      }
    } 
    
    else if (pseudoParam && !autoValidated) {
      
      setFormData(prev => ({
        ...prev,
        username: pseudoParam,
        
        
        acceptTerms: false
      }));
      
      
      setAutoValidated(true);
      
      
      setStep(2);
    }
  }, [location.search, autoValidated]); 

  
  useEffect(() => {
    
    
    if (step > 1 && formData.acceptTerms) {
      setTermsAcceptedInPreviousStep(true);
    }
  }, [step, formData.acceptTerms]);

  
  useEffect(() => {
    
    setInputErrors({});
  }, [step]);

  
  const validateAndProceed = async (username: string, code: string) => {
    setIsSubmitting(true);
    
    try {
      console.log("Validation automatique avec:", username, code);
      
      
      const result = await validateSecretCode(code);
      
      if (!result.success) {
        
        setStep(2);
        return;
      }
      
      
      
      setStep(3);
    } catch (error) {
      console.error("Erreur lors de la validation automatique:", error);
      toast({
        variant: "destructive",
        title: "Erreur de validation",
        description: (error as Error).message || "Erreur de validation"
      });
      setStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    
    
    if (name === 'acceptTerms' && termsAcceptedInPreviousStep) {
      return;
    }
    
    
    if (inputErrors[name]) {
      setInputErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateStep = () => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    
    if (!formData.acceptTerms) {
      toast({
        variant: "destructive",
        title: "Conditions d'utilisation",
        description: "Vous devez accepter les conditions d'utilisation"
      });
      newErrors.acceptTerms = "Vous devez accepter les conditions d'utilisation";
      isValid = false;
    }

    if (step === 1) {
      if (!formData.username.trim()) {
        toast({
          variant: "destructive",
          title: "Champ requis",
          description: "Le pseudo est requis"
        });
        newErrors.username = "Le pseudo est requis";
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
      } else if (!/^[A-F0-9]{8}$/.test(formData.secretCode)) {
        toast({
          variant: "destructive",
          title: "Format invalide",
          description: "Le code secret doit contenir 8 caractères hexadécimaux (0-9, A-F)"
        });
        newErrors.secretCode = "Le code doit contenir 8 caractères hexadécimaux";
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
      
      
      if (formData.acceptTerms) {
        setTermsAcceptedInPreviousStep(true);
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
    
    
    if (!formData.acceptTerms) {
      toast({
        variant: "destructive",
        title: "Conditions d'utilisation",
        description: "Vous devez retourner à l'étape 1 et accepter les conditions d'utilisation"
      });
      return;
    }
    
    if (!validateStep()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      
      const result = await minDelay(
        registerUser(formData),
        1200
      );
      
      if (result.success) {
        console.log('Inscription réussie');
        
        toast({
          variant: "success",
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter."
        });
        
        
        
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        throw new Error(result.message || "Erreur d'inscription");
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: (error as Error).message || "Une erreur est survenue. Veuillez réessayer."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
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
              * Votre pseudo doit être exactement le même que celui de Minecraft
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
              * Vous devez être connecté au serveur Minecraft
            </p>

            <div className="mt-4">
              <AuthCheckbox
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                disabled={termsAcceptedInPreviousStep}
                error={inputErrors.acceptTerms}
                label={<span className={isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}>En créant un compte, j'accepte les conditions d'utilisation et la politique de confidentialité de Luxentis.</span>}
              />
            </div>
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
              pattern="^[A-F0-9]{8}$"
              placeholder="Entrez le code secret"
              label="Entrez le code secret"
              value={formData.secretCode}
              onChange={handleChange}
              error={inputErrors.secretCode}
              showErrorMessage={false}
            />
            <p className={`text-sm mt-1 ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
              * Le code secret est envoyé dans le chat privé sur le serveur Minecraft
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
              * Vous devez être connecté au serveur Minecraft
            </p>

            <div className="mt-4">
              <AuthCheckbox
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                disabled={termsAcceptedInPreviousStep}
                error={inputErrors.acceptTerms}
                label={<span className={isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}>En créant un compte, j'accepte les conditions d'utilisation et la politique de confidentialité de Luxentis.</span>}
              />
            </div>
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

            <div className="mt-4">
              <AuthCheckbox
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                disabled={termsAcceptedInPreviousStep}
                error={inputErrors.acceptTerms}
                label={<span className={isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}>En créant un compte, j'accepte les conditions d'utilisation et la politique de confidentialité de Luxentis.</span>}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AuthLayout 
      title={`Inscription - Étape ${step}`}
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
                type={step < 3 ? "button" : "submit"}
                onClick={step < 3 ? nextStep : undefined}
                isLoading={isSubmitting}
              >
                {step < 3 ? (
                  <>
                    Continuer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : "Créer mon compte"}
              </AuthButton>
            </div>

            <div className="text-center">
              <p className={isDark ? 'text-white' : 'text-[#333333]'}>
                Déjà un compte?{" "}
                <Link to="/login" className="text-[#F0B90B] hover:underline">
                  Connexion
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
} 