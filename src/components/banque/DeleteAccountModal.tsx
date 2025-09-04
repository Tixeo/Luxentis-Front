import { useState } from 'react';
import { useTheme } from '@/lib/theme-provider';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthButton } from '@/components/auth/AuthButton';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { accountSocketService } from '@/services/compteSocket';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  accountId: string;
  accountNumber: string;
  accountBalance: number;
}

export function DeleteAccountModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  accountId,
  accountNumber, 
  accountBalance 
}: DeleteAccountModalProps) {
  const { isDark } = useTheme();
  const [confirmRib, setConfirmRib] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (confirmRib !== accountNumber) {
      return;
    }
    
    setIsDeleting(true);
    try {
      
      if (!accountSocketService.isConnected()) {
        console.warn(`[DeleteAccountModal] Socket non connecté, tentative de reconnexion...`);
      }
      
      console.log(`[DeleteAccountModal] Suppression du compte: RIB=${accountNumber}`);
      
      
      await accountSocketService.deleteAccount({
        id: accountId,
        rib: accountNumber
      });
      
      console.log(`[DeleteAccountModal] Compte supprimé avec succès`);
      
      
      await onConfirm();
      handleClose();
    } catch (error) {
      console.error('[DeleteAccountModal] Erreur lors de la suppression:', error);
      
      let errorMessage = 'La suppression du compte a échoué.';
      
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
      
      
      
      console.error('[DeleteAccountModal] Message d\'erreur:', errorMessage);
      throw error; 
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirmRib('');
    setIsDeleting(false);
    onClose();
  };

  const isValidRib = confirmRib === accountNumber;
  const canDelete = isValidRib && !isDeleting;

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
            <AlertTriangle className="h-6 w-6 mr-3 text-red-500" />
            <h2 className={cn(
              "text-xl font-bold",
              isDark ? 'text-white' : 'text-[#333333]'
            )}>
              Supprimer le compte
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
            "p-4 rounded-lg border-l-4 border-red-500",
            isDark ? "bg-red-500/10" : "bg-red-50"
          )}>
            <p className={cn(
              "text-sm font-medium mb-2",
              isDark ? "text-red-400" : "text-red-700"
            )}>
              ⚠️ Action irréversible
            </p>
            <p className={cn(
              "text-sm",
              isDark ? "text-red-300" : "text-red-600"
            )}>
              Cette action supprimera définitivement votre compte bancaire. 
              Toutes les données associées seront perdues.
            </p>
          </div>

          <div className="space-y-2">
            <div className={cn(
              "text-sm",
              isDark ? "text-gray-300" : "text-gray-600"
            )}>
              <strong>Compte à supprimer:</strong> {accountNumber}
            </div>
            <div className={cn(
              "text-sm",
              isDark ? "text-gray-300" : "text-gray-600"
            )}>
              <strong>Solde actuel:</strong> {accountBalance}$
            </div>
          </div>

          {accountBalance > 0 && (
            <div className={cn(
              "p-3 rounded-lg border",
              isDark ? "bg-yellow-500/10 border-yellow-500/30" : "bg-yellow-50 border-yellow-200"
            )}>
              <p className={cn(
                "text-sm",
                isDark ? "text-yellow-300" : "text-yellow-700"
              )}>
                💰 Attention: Ce compte contient encore {accountBalance}$. 
                Assurez-vous de transférer vos fonds avant la suppression.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className={cn(
              "block text-sm font-medium",
              isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'
            )}>
              Pour confirmer, retapez le RIB du compte:
            </label>
            <input
              type="text"
              value={confirmRib}
              onChange={(e) => setConfirmRib(e.target.value)}
              placeholder={accountNumber}
              className={cn(
                "w-full px-3 py-2 rounded-lg border text-sm font-mono",
                isDark 
                  ? 'bg-[#2A2A2A] border-[#3A3A3A] text-white placeholder:text-gray-500' 
                  : 'bg-white border-[#E5E5E5] text-[#333333] placeholder:text-gray-400',
                "focus:outline-none focus:ring-2",
                isValidRib 
                  ? "focus:ring-green-500 border-green-500" 
                  : "focus:ring-red-500"
              )}
            />
            {confirmRib && !isValidRib && (
              <p className="text-xs text-red-500 mt-1">
                Le RIB ne correspond pas
              </p>
            )}
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
            disabled={isDeleting}
            className="px-4 py-2"
          >
            Annuler
          </AuthButton>
          <AuthButton
            onClick={handleConfirm}
            disabled={!canDelete}
            className={cn(
              "px-4 py-2",
              !canDelete ? "opacity-50 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
            )}
          >
            {isDeleting ? (
              <div className="flex items-center">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Suppression...
              </div>
            ) : (
              "Supprimer définitivement"
            )}
          </AuthButton>
        </div>
      </DialogContent>
    </Dialog>
  );
} 