import { useState } from 'react';
import { useTheme } from '@/lib/theme-provider';
import { X, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthButton } from '@/components/auth/AuthButton';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { accountSocketService } from '@/services/compteSocket';

interface SetDefaultAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  accountId: string;
  accountNumber: string;
  currentDefaultAccount?: string;
}

export function SetDefaultAccountModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  accountId,
  accountNumber,
  currentDefaultAccount
}: SetDefaultAccountModalProps) {
  const { isDark } = useTheme();
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  const handleConfirm = async () => {
    setIsSettingDefault(true);
    try {
      
      if (!accountSocketService.isConnected()) {
        console.warn(`[SetDefaultAccountModal] Socket non connecté, tentative de reconnexion...`);
      }
      
      console.log(`[SetDefaultAccountModal] Définition du compte par défaut: RIB=${accountNumber}`);
      
      
      await accountSocketService.setDefaultAccount({
        id: accountId,
        rib: accountNumber
      });
      
      console.log(`[SetDefaultAccountModal] Compte défini par défaut avec succès`);
      
      
      await onConfirm();
      handleClose();
    } catch (error) {
      console.error('[SetDefaultAccountModal] Erreur lors de la définition par défaut:', error);
      
      let errorMessage = 'La définition du compte par défaut a échoué.';
      
      if (error instanceof Error) {
        if (error.message.includes('Timeout')) {
          errorMessage = 'Le serveur n\'a pas répondu à temps. Veuillez réessayer.';
        } else if (error.message.includes('connect')) {
          errorMessage = 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion.';
        } else if (error.message.includes('Données invalides')) {
          errorMessage = 'Les données du compte sont invalides.';
        } else {
          errorMessage = `Erreur: ${error.message}`;
        }
      }
      
      
      
      console.error('[SetDefaultAccountModal] Message d\'erreur:', errorMessage);
      throw error; 
    } finally {
      setIsSettingDefault(false);
    }
  };

  const handleClose = () => {
    setIsSettingDefault(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={cn(
        "max-w-md p-0 overflow-hidden",
        isDark ? "bg-[#1A1A1A] border border-[#2A2A2A]" : "bg-white border border-[#E9E9E9]"
      )}>
        {/* Header */}
        <div className={cn(
          "p-6 flex items-center justify-between border-b",
          isDark ? "border-gray-700" : "border-gray-200"
        )}>
          <div className="flex items-center">
            <Star className="h-6 w-6 mr-3 text-[#F0B90B]" />
            <h2 className={cn(
              "text-xl font-bold",
              isDark ? 'text-white' : 'text-[#333333]'
            )}>
              Compte par défaut
            </h2>
          </div>
          <DialogClose className={cn(
            "p-2 rounded-full",
            isDark ? "hover:bg-[#2A2A2A]" : "hover:bg-gray-100"
          )}>
            <X size={20} className={isDark ? "text-gray-400" : "text-gray-500"} />
          </DialogClose>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className={cn(
            "p-4 rounded-lg border-l-4 border-[#F0B90B]",
            isDark ? "bg-[#F0B90B]/10" : "bg-orange-50"
          )}>
            <p className={cn(
              "text-sm font-medium mb-2",
              isDark ? "text-[#F0B90B]" : "text-orange-700"
            )}>
              Définir comme compte par défaut
            </p>
            <p className={cn(
              "text-sm",
              isDark ? "text-orange-200" : "text-orange-600"
            )}>
              Ce compte sera utilisé par défaut pour les virements et transactions automatiques.
              <br />
              <br />
              Vous pourrez toujours changer le compte par défaut plus tard depuis n'importe quel autre compte.
            </p>
          </div>

          <div className="space-y-3">
            <div className={cn(
              "text-sm",
              isDark ? "text-gray-300" : "text-gray-600"
            )}>
              <strong>Nouveau compte par défaut:</strong> {accountNumber}
            </div>
            
            {currentDefaultAccount && currentDefaultAccount !== accountNumber && (
              <div className={cn(
                "text-sm",
                isDark ? "text-gray-400" : "text-gray-500"
              )}>
                <strong>Ancien compte par défaut:</strong> {currentDefaultAccount}
              </div>
            )}
          </div>

          <div className={cn(
            "p-3 rounded-lg border",
            isDark ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-50 border-blue-200"
          )}>
            <p className={cn(
              "text-sm",
              isDark ? "text-blue-300" : "text-blue-700"
            )}>
              Vous pourrez toujours changer le compte par défaut plus tard depuis n'importe quel autre compte.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={cn(
          "p-6 border-t flex justify-end space-x-3",
          isDark ? "border-gray-700" : "border-gray-200"
        )}>
          <AuthButton
            variant="secondary"
            onClick={handleClose}
            disabled={isSettingDefault}
            className="px-4 py-2"
          >
            Annuler
          </AuthButton>
          <AuthButton
            onClick={handleConfirm}
            disabled={isSettingDefault}
            className={cn(
              "px-4 py-2 bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-black",
              isSettingDefault ? "opacity-50 cursor-not-allowed" : ""
            )}
          >
            {isSettingDefault ? (
              <div className="flex items-center">
                <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full mr-2"></div>
                Définition en cours...
              </div>
            ) : (
              "Définir par défaut"
            )}
          </AuthButton>
        </div>
      </DialogContent>
    </Dialog>
  );
} 