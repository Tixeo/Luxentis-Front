import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/lib/theme-provider';
import { CreditCard, X, ChevronLeft, ChevronDown, ChevronRight, PlusCircle, Edit, Search, Loader2 } from 'lucide-react';
import { AuthCheckbox } from '@/components/auth/AuthCheckbox';
import { useUserStore } from '@/stores/userStore';
import { useToast } from '@/hooks/use-toast';
import { bankSocketService } from '@/services/virementSocket';
import { transferService, type User, type TransferRecipientsResponse } from '@/services/api/transferService';

interface AccountOption {
  id: string;
  label: string;
  isDefault?: boolean;
  status?: 'active' | 'inactive';
}

interface TabOption {
  id: string;
  name: string;
  accounts: AccountOption[];
}

interface QuickTransferButtonProps {
  className?: string;
}

export function QuickTransferButton({ className = '' }: QuickTransferButtonProps) {
  const { isDark } = useTheme();
  const { bankAccounts } = useUserStore();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'players' | 'enterprises'>('players');
  const [senderBankAccount, setSenderBankAccount] = useState<string | null>(null);
  const [receiverAccount, setReceiverAccount] = useState<string | null>(null);
  const [receiverBankAccount, setReceiverBankAccount] = useState<string | null>(null);
  const [manualRib, setManualRib] = useState('');
  const [showSenderSelector, setShowSenderSelector] = useState(false);
  const [showAccountRibsSelector, setShowAccountRibsSelector] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [recipients, setRecipients] = useState<TransferRecipientsResponse | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const myUser = {
    id: 'my-user',
    label: 'Mon compte',
    bankAccounts: bankAccounts.length > 0 ? bankAccounts : [
      { id: 'myacc1', number: 'BA000001', isDefault: true, balance: 1000 },
      { id: 'myacc2', number: 'BA00A2B3', isDefault: false, balance: 500 },
      { id: 'myacc3', number: 'BA01F9C4', isDefault: false, balance: 750 }
    ]
  };

  
  const convertUsersToTabOptions = (users: User[]): TabOption => {
    return {
      id: users[0]?.type === 'player' ? 'players' : 'enterprises',
      name: users[0]?.type === 'player' ? 'Joueurs' : 'Entreprises',
      accounts: users.map(user => ({
        id: user.id,
        label: user.label,
        status: user.status,
        isDefault: user.isDefault
      }))
    };
  };

  const activeTabData = recipients ? 
    convertUsersToTabOptions(activeTab === 'players' ? recipients.players : recipients.enterprises) :
    { id: activeTab, name: activeTab === 'players' ? 'Joueurs' : 'Entreprises', accounts: [] };

  
  const filteredAccounts = activeTabData.accounts.filter(account =>
    account.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const displayedAccounts = filteredAccounts.slice(
    activePage * itemsPerPage,
    (activePage + 1) * itemsPerPage
  );

  
  const loadTransferRecipients = async () => {
    setIsLoadingRecipients(true);
    try {
      console.log('[QuickTransfer] Chargement des destinataires...');
      const data = await transferService.getTransferRecipients();
      setRecipients(data);
      console.log('[QuickTransfer] Destinataires chargés avec succès');
    } catch (error) {
      console.error('[QuickTransfer] Erreur lors du chargement des destinataires:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de chargement',
        description: error instanceof Error ? error.message : 'Impossible de charger les destinataires.'
      });
    } finally {
      setIsLoadingRecipients(false);
    }
  };

  useEffect(() => {
    
    if (isOpen && !recipients) {
      loadTransferRecipients();
    }
    
    return () => {
      console.log('[QuickTransfer] Component unmounted, socket connection maintained');
    };
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      
      const target = event.target as HTMLElement;
      const isClickOnAccountItem = target.closest('[data-account-item]');
      const isClickOnRibsMenu = target.closest('[data-ribs-menu]');
      
      if (!isClickOnAccountItem && !isClickOnRibsMenu) {
        setShowAccountRibsSelector(null);
      }
      
      if (!target.closest('[data-sender-selector]')) {
        setShowSenderSelector(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setShowAccountRibsSelector(null);
    setActivePage(0); 
  }, [activeTab]);

  useEffect(() => {
    setShowAccountRibsSelector(null);
  }, [activePage]);

  useEffect(() => {
    setActivePage(0); 
  }, [searchQuery]);

  const getDefaultSenderRib = () => {
    return myUser.bankAccounts.find(acc => acc.isDefault)?.number || myUser.bankAccounts[0]?.number || null;
  };

  const handleSubmit = async () => {
    const actualSenderRib = senderBankAccount || getDefaultSenderRib();
    
    if (!actualSenderRib || !manualRib || !amount || !confirmed) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs et confirmer le virement.'
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Le montant doit être un nombre positif.'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      
      if (!bankSocketService.isConnected()) {
        console.warn(`[QuickTransfer] Socket non connecté, tentative de reconnexion...`);
        
      }
      
      console.log(`[QuickTransfer] Initiation du virement: 
        De: ${actualSenderRib} 
        Vers: ${manualRib} 
        Montant: ${amountValue}$`);
      
      
      const validRibs = ['BA000001', 'BA00A2B3', 'BA01F9C4', 'BA03D5C9', 'BA03D5E6', 'BA03D5F9'];
      if (!validRibs.includes(actualSenderRib)) {
        console.warn(`[QuickTransfer] Le RIB de l'expéditeur (${actualSenderRib}) n'est pas dans la liste des RIB connus pour fonctionner`);
      }
      
      if (!validRibs.includes(manualRib)) {
        console.warn(`[QuickTransfer] Le RIB du destinataire (${manualRib}) n'est pas dans la liste des RIB connus pour fonctionner`);
      }
      
      await bankSocketService.initiateTransaction({
        from: actualSenderRib,
        to: manualRib,
        amount: amountValue
      });

      toast({
        variant: 'success',
        title: 'Virement effectué',
        description: `Le virement de ${amount}$ a été envoyé avec succès.`
      });

      setSenderBankAccount(null);
      setReceiverAccount(null);
      setReceiverBankAccount(null);
      setManualRib('');
      setAmount('');
      setConfirmed(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur de transaction:', error);
      
      let errorMessage = 'Le virement n\'a pas pu être effectué.';
      
      if (error instanceof Error) {
        console.log(`[QuickTransfer] Type d'erreur: ${error.name}, Message: ${error.message}, Stack: ${error.stack}`);
        
        if (error.message.includes('timeout')) {
          errorMessage = 'Le serveur n\'a pas répondu à temps. Veuillez réessayer.';
        } else if (error.message.includes('connect')) {
          errorMessage = 'Impossible de se connecter au serveur bancaire. Veuillez vérifier votre connexion.';
        } else if (error.message.includes('cancelled')) {
          errorMessage = 'Le virement a été refusé par le serveur bancaire.';
        } else {
          
          errorMessage = `Erreur: ${error.message}`;
        }
      }
      
      toast({
        variant: 'destructive',
        title: 'Échec du virement',
        description: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (receiverBankAccount) {
      setManualRib(receiverBankAccount);
    }
  }, [receiverBankAccount]);

  const handleAccountClick = (accountId: string) => {
    if (showAccountRibsSelector === accountId) {
      setShowAccountRibsSelector(null);
    } else {
      setShowAccountRibsSelector(accountId);
    }
  };

  const handleBankAccountSelect = (accountId: string, bankAccount: string) => {
    setReceiverAccount(accountId);
    setReceiverBankAccount(bankAccount);
    setManualRib(bankAccount);
    setShowAccountRibsSelector(null);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {isOpen && (
        <div 
          ref={popupRef}
          className={`absolute bottom-16 right-0 w-[90vw] max-w-[580px] rounded-lg shadow-lg overflow-hidden ${
            isDark ? 'bg-[#1E1E1E] border border-[#2A2A2A] text-white' : 'bg-white border border-[#E5E5E5] text-[#333333]'
          }`}
        >
          <div className="flex flex-col md:flex-row">
            {/* Left side - Form */}
            <div className="w-full md:w-[55%] p-4 md:p-6 border-b md:border-b-0 md:border-r border-gray-700 min-h-[460px] md:min-h-[500px]">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="font-bold text-lg md:text-xl">
                  Virement rapide
                  {recipients && (
                    <span className="ml-2 text-xs text-green-500">
                      (API connectée)
                    </span>
                  )}
                </h3>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-1 rounded-full hover:bg-[#F0B90B]/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 md:space-y-6">
                {/* Sender Account */}
                <div className="relative">
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
                    Compte envoyeur
                  </label>
                  <div 
                    onClick={() => setShowSenderSelector(true)}
                    className={`flex justify-between items-center w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border cursor-pointer ${
                      isDark ? 'bg-[#2A2A2A] border-[#3A3A3A]' : 'bg-white border-[#E5E5E5]'
                    }`}
                  >
                    <span className="text-sm md:text-base">{senderBankAccount || 'RIB de l\'envoyeur'}</span>
                    <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                  </div>
                  <p className={`text-xs mt-1 ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
                    * Si aucun n'est sélectionné, celui par défaut sera utilisé
                  </p>
                </div>

                {/* Receiver Account */}
                <div className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <label className={`block text-sm font-medium ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
                      Compte receveur
                    </label>
                  </div>
                  
                  <div className="h-[42px] md:h-[48px]">
                    <input 
                      type="text" 
                      value={manualRib}
                      onChange={(e) => setManualRib(e.target.value)}
                      placeholder="Entrez le RIB manuellement..."
                      className={`w-full h-full px-3 md:px-4 rounded-lg border text-sm md:text-base ${
                        isDark ? 'bg-[#2A2A2A] border-[#3A3A3A] text-white' : 'bg-white border-[#E5E5E5] text-[#333333]'
                      } focus:outline-none focus:ring-2 focus:ring-[#F0B90B]`}
                    />
                  </div>
                  
                  <div className="h-8 mt-1">
                    <p className={`text-xs ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'} leading-4`}>
                      * Saisissez un RIB ou sélectionnez un compte dans la liste à droite
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
                    Montant
                  </label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full px-3 md:px-4 py-2 md:py-3 rounded-lg border text-sm md:text-base ${
                      isDark ? 'bg-[#2A2A2A] border-[#3A3A3A] text-white' : 'bg-white border-[#E5E5E5] text-[#333333]'
                    } focus:outline-none focus:ring-2 focus:ring-[#F0B90B]`}
                    placeholder="Montant..."
                    min="1"
                  />
                </div>

                {/* checkbox de comfirmation */}
                <div className="h-10 flex items-center">
                  <AuthCheckbox
                    id="confirm-transfer"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    label={
                      <span className={`text-xs md:text-sm ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
                        Je confirme vouloir envoyer cette somme d'argent
                      </span>
                    }
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button 
                    onClick={handleSubmit}
                    disabled={!amount || !confirmed || isSubmitting}
                    className={`w-full py-2 md:py-3 px-4 bg-[#F0B90B] text-black rounded-lg font-medium text-sm md:text-base ${
                      !amount || !confirmed || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#F0B90B]/90'
                    } transition-colors`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full mr-2"></div>
                        <span>Traitement en cours...</span>
                      </div>
                    ) : (
                      "Envoyer"
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full md:w-[45%] flex flex-col">
              {/* Search Bar */}
              <div className="p-3 md:p-4 border-b border-gray-700">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Rechercher ${activeTab === 'players' ? 'un joueur' : 'une entreprise'}...`}
                    className={`w-full pl-10 pr-3 py-2 rounded-lg border text-sm ${
                      isDark 
                        ? 'bg-[#2A2A2A] border-[#3A3A3A] text-white placeholder:text-gray-400' 
                        : 'bg-white border-[#E5E5E5] text-[#333333] placeholder:text-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#F0B90B]`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-700">
                <button 
                  onClick={() => setActiveTab('players')}
                  className={`flex-1 py-2 md:py-3 text-center font-medium text-xs md:text-sm ${
                    activeTab === 'players' 
                      ? 'border-b-2 border-[#F0B90B] text-[#F0B90B]' 
                      : isDark ? 'text-white' : 'text-[#666666]'
                  }`}
                >
                  Joueurs
                </button>
                <button 
                  onClick={() => setActiveTab('enterprises')}
                  className={`flex-1 py-2 md:py-3 text-center font-medium text-xs md:text-sm ${
                    activeTab === 'enterprises' 
                      ? 'border-b-2 border-[#F0B90B] text-[#F0B90B]' 
                      : isDark ? 'text-white' : 'text-[#666666]'
                  }`}
                >
                  Entreprises
                </button>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[300px] md:max-h-none">
                {isLoadingRecipients ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4">
                    <Loader2 className={`h-8 w-8 mb-2 animate-spin ${isDark ? 'text-[#F0B90B]' : 'text-[#F0B90B]'}`} />
                    <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Chargement des destinataires...
                    </p>
                  </div>
                ) : displayedAccounts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4">
                    <Search className={`h-8 w-8 mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {searchQuery 
                        ? `Aucun ${activeTab === 'players' ? 'joueur' : 'entreprise'} trouvé pour "${searchQuery}"`
                        : !recipients ? 'Impossible de charger les destinataires' : `Aucun ${activeTab === 'players' ? 'joueur' : 'entreprise'} disponible`
                      }
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="mt-2 text-xs text-[#F0B90B] hover:text-[#F0B90B]/80"
                      >
                        Effacer la recherche
                      </button>
                    )}
                    {!recipients && !searchQuery && (
                      <button
                        onClick={loadTransferRecipients}
                        className="mt-2 text-xs text-[#F0B90B] hover:text-[#F0B90B]/80"
                      >
                        Réessayer
                      </button>
                    )}
                  </div>
                ) : (
                  displayedAccounts.map((account) => (
                  <div 
                    key={account.id}
                    data-account-item={account.id}
                    onClick={() => handleAccountClick(account.id)}
                    className={`relative flex justify-between items-center px-3 md:px-4 py-2 md:py-3 cursor-pointer ${
                      showAccountRibsSelector === account.id ? 'bg-[#F0B90B]/10' : 
                      receiverAccount === account.id ? 'bg-[#F0B90B]/20' : ''
                    } hover:bg-[#F0B90B]/5`}
                  >
                    <span className={`text-sm md:text-base ${account.isDefault ? "font-medium" : ""}`}>{account.label}</span>
                    <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${
                      account.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    
                    {/* Liste ribs */}
                    {showAccountRibsSelector === account.id && recipients && (() => {
                      const allUsers = [...recipients.players, ...recipients.enterprises];
                      const user = allUsers.find(u => u.id === account.id);
                      return user && user.bankAccounts.length > 0;
                    })() && (
                      <div 
                        data-ribs-menu={account.id}
                        className={`absolute top-full left-0 w-full p-2 md:p-3 shadow-lg border z-10 ${
                          isDark ? 'bg-[#2A2A2A] border-[#3A3A3A]' : 'bg-white border-[#E5E5E5]'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className={`text-xs md:text-sm font-medium mb-2 ${
                          isDark ? 'text-[#F0B90B]' : 'text-[#333333]'
                        }`}>
                          Comptes bancaires
                        </div>
                        <div className="space-y-1">
                          {(() => {
                            const allUsers = [...recipients.players, ...recipients.enterprises];
                            const user = allUsers.find(u => u.id === account.id);
                            return user ? user.bankAccounts.map((bankAccount) => (
                              <div 
                                key={bankAccount.number}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBankAccountSelect(account.id, bankAccount.number);
                                }}
                                className={`px-2 md:px-3 py-1.5 md:py-2 rounded text-xs md:text-sm ${
                                  receiverBankAccount === bankAccount.number 
                                    ? isDark ? 'bg-[#F0B90B]/30' : 'bg-[#F0B90B]/20'
                                    : ''
                                } ${
                                  isDark 
                                    ? 'hover:bg-[#F0B90B]/20' 
                                    : 'hover:bg-[#F0B90B]/10'
                                } cursor-pointer`}
                              >
                                {bankAccount.number}
                                {bankAccount.isDefault && (
                                  <span className="ml-2 text-xs text-[#F0B90B]">(défaut)</span>
                                )}
                              </div>
                            )) : [];
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                  ))
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center p-2 md:p-3 border-t border-gray-700">
                  <button
                    onClick={() => setActivePage(prev => Math.max(0, prev - 1))}
                    disabled={activePage === 0}
                    className={`p-1 md:p-2 rounded-full ${activePage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#F0B90B]/10'}`}
                  >
                    <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                  <span className="mx-2 text-sm md:text-base">
                    {activePage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setActivePage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={activePage === totalPages - 1}
                    className={`p-1 md:p-2 rounded-full ${activePage === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#F0B90B]/10'}`}
                  >
                    <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {showSenderSelector && (
            <div 
              data-sender-selector="true"
              className={`absolute inset-0 rounded-lg shadow-lg z-20 ${
                isDark ? 'bg-[#1E1E1E] border border-[#2A2A2A]' : 'bg-white border border-[#E5E5E5]'
              }`}
            >
              <div className="p-4 flex justify-between items-center border-b border-gray-700">
                <button 
                  onClick={() => setShowSenderSelector(false)}
                  className="p-1 rounded-full hover:bg-[#F0B90B]/10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h3 className="font-medium">Mes comptes bancaires</h3>
                <div className="w-5"></div>
              </div>
              
              <div className="p-2 max-h-[300px] overflow-y-auto">
                {myUser.bankAccounts.map((account) => (
                  <div 
                    key={account.id}
                    onClick={() => {
                      setSenderBankAccount(account.number);
                      setShowSenderSelector(false);
                    }}
                    className={`px-4 py-3 rounded cursor-pointer flex justify-between items-center hover:bg-[#F0B90B]/5 ${
                      senderBankAccount === account.number ? 'bg-[#F0B90B]/20' :
                      account.isDefault ? 'bg-[#F0B90B]/10' : ''
                    }`}
                  >
                    <span>{account.number}</span>
                    {account.isDefault && (
                      <span className="text-xs text-[#F0B90B]">Par défaut</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Bouton principal */}
      <button 
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center ${
          isDark ? 'bg-[#F0B90B]' : 'bg-[#F0B90B]'
        } text-black hover:bg-[#F0B90B]/90 transition-colors`}
        aria-label="Virement rapide"
      >
        <CreditCard className="h-5 w-5 md:h-6 md:w-6" />
      </button>
    </div>
  );
} 