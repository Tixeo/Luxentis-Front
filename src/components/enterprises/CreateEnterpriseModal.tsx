import React, { useState } from 'react';
import { useTheme } from '@/lib/theme-provider';
import { useUserStore } from '@/stores/userStore';
import { X, CreditCard, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateEnterpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (enterpriseData: { name: string; description: string; tags: string[]; paymentAccountId: string }) => void;
}


const PREDEFINED_TAGS = [
  'Technologie', 'Commerce', 'Industrie', 'Agriculture', 'Transport', 'Construction',
  'Énergie', 'Finance', 'Immobilier', 'Santé', 'Éducation', 'Divertissement',
  'Restauration', 'Mode', 'Sport', 'Tourisme', 'Artisanat', 'Services',
  'Innovation', 'Écologique', 'Luxe', 'Start-up', 'International', 'Local'
];

export const CreateEnterpriseModal: React.FC<CreateEnterpriseModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}) => {
  const { isDark } = useTheme();
  const { bankAccounts } = useUserStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [selectedPaymentAccount, setSelectedPaymentAccount] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const ENTERPRISE_CREATION_COST = 50000;
  
  
  const availableAccounts = bankAccounts.length > 0 ? bankAccounts : [
    { id: 'myacc1', number: 'MYACC12345', isDefault: true, balance: 60000 },
    { id: 'myacc2', number: 'MYACC67890', isDefault: false, balance: 30000 }
  ];
  
  
  const validPaymentAccounts = availableAccounts.filter(account => account.balance >= ENTERPRISE_CREATION_COST);

  
  const filteredTags = PREDEFINED_TAGS.filter(tag => 
    tag.toLowerCase().includes(tagSearch.toLowerCase()) && !tags.includes(tag)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      if (selectedPaymentAccount) {
        onConfirm({ name, description, tags, paymentAccountId: selectedPaymentAccount });
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setTags([]);
    setTagSearch('');
    setSelectedPaymentAccount(null);
    setStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagSearch(''); 
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div 
        className={cn(
          "relative w-full max-w-md rounded-xl p-6",
          isDark ? "bg-[#1A1A1A] border border-[#2A2A2A]" : "bg-white border border-[#E9E9E9] shadow-lg"
        )}
      >
        <button
          onClick={handleClose}
          className={cn(
            "absolute top-4 right-4 p-1.5 rounded-full",
            isDark ? "text-gray-400 hover:text-white hover:bg-[#2A2A2A]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          )}
        >
          <X className="h-5 w-5" />
        </button>

        {step === 1 ? (
          <>
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Créer une entreprise
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 15))}
                  placeholder="Nom de votre entreprise"
                  className={cn(
                    "w-full p-2 rounded-lg border",
                    isDark 
                      ? "bg-[#242424] text-white border-[#3A3A3A] focus:border-[#F0B90B] placeholder-gray-500" 
                      : "bg-white text-gray-900 border-gray-300 focus:border-[#F0B90B] placeholder-gray-400"
                  )}
                  required
                  maxLength={15}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Maximum 15 caractères ({15 - name.length} restants)
                </p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre entreprise"
                  rows={3}
                  className={cn(
                    "w-full p-2 rounded-lg border",
                    isDark 
                      ? "bg-[#242424] text-white border-[#3A3A3A] focus:border-[#F0B90B] placeholder-gray-500" 
                      : "bg-white text-gray-900 border-gray-300 focus:border-[#F0B90B] placeholder-gray-400"
                  )}
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tags
                </label>
                
                {/* Barre de recherche pour les tags */}
                <div className="relative mb-2">
                  <div className="flex items-center">
                    <Search className={`h-4 w-4 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      placeholder="Rechercher des tags..."
                      className={cn(
                        "flex-1 p-2 rounded-lg border",
                        isDark 
                          ? "bg-[#242424] text-white border-[#3A3A3A] focus:border-[#F0B90B] placeholder-gray-500" 
                          : "bg-white text-gray-900 border-gray-300 focus:border-[#F0B90B] placeholder-gray-400"
                      )}
                    />
                  </div>
                  
                  {/* Liste déroulante des tags filtrés */}
                  {tagSearch && filteredTags.length > 0 && (
                    <div className={cn(
                      "absolute z-10 w-full mt-1 max-h-40 overflow-y-auto border rounded-lg shadow-lg",
                      isDark ? "bg-[#242424] border-[#3A3A3A]" : "bg-white border-gray-300"
                    )}>
                      {filteredTags.slice(0, 8).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAddTag(tag)}
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm hover:bg-opacity-80 transition-colors",
                            isDark 
                              ? "text-white hover:bg-[#2A2A2A]" 
                              : "text-gray-900 hover:bg-gray-100"
                          )}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags populaires (si pas de recherche) */}
                {!tagSearch && (
                  <div className="mb-2">
                    <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Tags populaires :
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {PREDEFINED_TAGS.slice(0, 6).filter(tag => !tags.includes(tag)).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAddTag(tag)}
                          className={cn(
                            "px-2 py-1 text-xs rounded-full border transition-colors",
                            isDark 
                              ? "border-[#3A3A3A] text-gray-300 hover:bg-[#2A2A2A] hover:border-[#F0B90B]" 
                              : "border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-[#F0B90B]"
                          )}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Tags sélectionnés */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center px-2 py-1 text-sm rounded-full",
                          isDark ? "bg-[#2A2A2A] text-white" : "bg-gray-100 text-gray-800"
                        )}
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-gray-500 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className={cn(
                    "px-4 py-2 rounded-lg mr-2",
                    isDark 
                      ? "bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!name || !description}
                  className={cn(
                    "px-4 py-2 bg-[#F0B90B] text-white rounded-lg transition-colors",
                    (!name || !description) 
                      ? "opacity-50 cursor-not-allowed" 
                      : "hover:bg-[#E0A800]"
                  )}
                >
                  Continuer
                </button>
              </div>
            </form>
          </>
        ) : step === 2 ? (
          <>
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Sélectionner un compte de paiement
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-[#242424]' : 'bg-gray-100'}`}>
                <div className="flex items-center ">
                  <CreditCard className={`h-5 w-5 mr-2 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Coût de création:
                  </span>
                  <span className={`font-bold ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {ENTERPRISE_CREATION_COST.toLocaleString()}$
                  </span>
                </div>
              </div>
              
                            {validPaymentAccounts.length === 0 ? (                <div className={`p-3 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>                  <p className="text-sm">                    {bankAccounts.length === 0                       ? `Vous devez d'abord créer un compte bancaire réel. Les comptes de test ne peuvent pas être débités.`                      : `Aucun compte bancaire n'a suffisamment de fonds (${ENTERPRISE_CREATION_COST.toLocaleString()}$ requis).`                    }                  </p>                  {bankAccounts.length === 0 && (                    <p className="text-xs mt-2">Rendez-vous dans Ma Banque → Créer un compte bancaire</p>                  )}                </div>
              ) : (
                <div>
                  <label className={`text-sm font-medium block mb-2 ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                    Compte de paiement
                  </label>
                  <select 
                    className={`w-full p-3 pr-3 rounded-lg border ${isDark ? 'bg-[#232323] border-[#3A3A3A] text-white' : 'bg-white border-[#E5E5E5] text-[#333333]'}`}
                    value={selectedPaymentAccount || ''}
                    onChange={(e) => setSelectedPaymentAccount(e.target.value || null)}
                  >
                    <option value="">Sélectionner un compte</option>
                    {validPaymentAccounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.number} ({account.balance.toLocaleString()}$) {account.isDefault ? '(Principal)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="pt-4 flex justify-end border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={cn(
                  "px-4 py-2 rounded-lg mr-2",
                  isDark 
                    ? "bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={!selectedPaymentAccount || validPaymentAccounts.length === 0}
                onClick={handleSubmit}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors",
                  (!selectedPaymentAccount || validPaymentAccounts.length === 0)
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-[#F0B90B] text-white hover:bg-[#E0A800]"
                )}
              >
                Continuer
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Confirmer la création
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Nom de l'entreprise
                </h3>
                <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {name}
                </p>
              </div>
              
              <div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Description
                </h3>
                <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {description}
                </p>
              </div>
              
              {tags.length > 0 && (
                <div>
                  <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 text-xs rounded-full bg-[#F0B90B] text-white"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className={`p-4 rounded-lg mt-4 ${isDark ? 'bg-[#242424]' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Coût de création:
                  </span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {ENTERPRISE_CREATION_COST.toLocaleString()}$
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Compte de débit:
                  </span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {availableAccounts.find(acc => acc.id === selectedPaymentAccount)?.number}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setStep(2)}
                className={cn(
                  "px-4 py-2 rounded-lg mr-2",
                  isDark 
                    ? "bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                Retour
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-4 py-2 bg-[#F0B90B] text-white rounded-lg hover:bg-[#E0A800] transition-colors"
              >
                Payer et créer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 