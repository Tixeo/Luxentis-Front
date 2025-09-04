import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/lib/theme-provider';
import { X, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthCheckbox } from '@/components/auth/AuthCheckbox';
import { useUserStore } from '@/stores/userStore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { bankSocketService } from '@/services/virementSocket';

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

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromAccount?: {
    id: string;
    number: string;
    balance: number;
  };
}

export function TransferModal({ isOpen, onClose, fromAccount }: TransferModalProps) {
  const { isDark } = useTheme();
  const { bankAccounts } = useUserStore();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'players' | 'enterprises'>('players');
  const [senderBankAccount, setSenderBankAccount] = useState<string | null>(fromAccount?.number || null);
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
  
  const senderSelectorRef = useRef<HTMLDivElement>(null);

  const myUser = {
    id: 'my-user',
    label: 'Mon compte',
    bankAccounts: bankAccounts.length > 0 ? bankAccounts : [
      { id: 'myacc1', number: 'MYACC12345', isDefault: true, balance: 1000 },
      { id: 'myacc2', number: 'MYACC67890', isDefault: false, balance: 500 },
      { id: 'myacc3', number: 'MYACC24680', isDefault: false, balance: 750 }
    ]
  };

  const mockPlayers: TabOption = {
    id: 'players',
    name: 'Joueurs',
    accounts: [
      { id: '1', label: 'Ethokia', status: 'active', isDefault: true },
      { id: '2', label: 'Audin200', status: 'inactive' },
      { id: '3', label: 'Player3', status: 'active' },
      { id: '4', label: 'Player4', status: 'active' },
      { id: '5', label: 'Player5', status: 'active' },
      { id: '6', label: 'Player6', status: 'active' },
      { id: '7', label: 'Player7', status: 'active' },
      { id: '8', label: 'Player8', status: 'inactive' },
    ]
  };

  const mockEnterprises: TabOption = {
    id: 'enterprises',
    name: 'Entreprises',
    accounts: [
      { id: 'e1', label: 'Entreprise1', status: 'active' },
      { id: 'e2', label: 'Entreprise2', status: 'active' },
      { id: 'e3', label: 'Entreprise3', status: 'inactive' },
      { id: 'e4', label: 'Entreprise4', status: 'active' },
      { id: 'e5', label: 'Entreprise5', status: 'active' },
    ]
  };

  const mockBankAccounts: Record<string, string[]> = {
    '1': ['ADOABED8', 'DALK5BQO', 'XCV43PO0'],
    '2': ['LPTZ78HY', 'OPI65TRE'],
    '3': ['HJKL0987', 'ZTYR4567'],
    '4': ['QEZD1254', 'OLKI9876'],
    '5': ['MNBV4567', 'PLOK7412'],
    '6': ['ASDF1234', 'QWER5678'],
    '7': ['ZXCV9876', 'TYUI4321'],
    '8': ['POIU8765', 'LKJH2468'],
    'e1': ['ENT12345', 'ENT67890'],
    'e2': ['CORP1234', 'CORP5678'],
    'e3': ['BIZ98765', 'BIZ54321'],
    'e4': ['COMP1111', 'COMP2222'],
    'e5': ['FIRM3333', 'FIRM4444'],
  };

  const activeTabData = activeTab === 'players' ? mockPlayers : mockEnterprises;

  
  const filteredAccounts = activeTabData.accounts.filter(account =>
    account.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const displayedAccounts = filteredAccounts.slice(
    activePage * itemsPerPage,
    (activePage + 1) * itemsPerPage
  );

  useEffect(() => {
    return () => {
      console.log('[TransferModal] Component unmounted, socket connection maintained');
    };
  }, []);

  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (senderSelectorRef.current && !senderSelectorRef.current.contains(event.target as Node)) {
        setShowSenderSelector(false);
      }
      
      const target = event.target as HTMLElement;
      const isClickOnAccountItem = target.closest('[data-account-item]');
      const isClickOnRibsMenu = target.closest('[data-ribs-menu]');
      
      if (!isClickOnAccountItem && !isClickOnRibsMenu) {
        setShowAccountRibsSelector(null);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

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
    const actualSenderRib = senderBankAccount || getDefaultSenderRib() || fromAccount?.number;
    
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
        console.warn(`[TransferModal] Socket non connecté, tentative de reconnexion...`);
        
      }
      
      console.log(`[TransferModal] Initiation du virement: 
        De: ${actualSenderRib} 
        Vers: ${manualRib} 
        Montant: ${amountValue}$`);
      
      
      const validRibs = ['MYACC12345', 'MYACC67890', 'MYACC24680', 'BA000001', 'BA00A2B3', 'BA01F9C4', 'BA03D5C9', 'BA03D5E6', 'BA03D5F9'];
      if (!validRibs.includes(actualSenderRib)) {
        console.warn(`[TransferModal] Le RIB de l'expéditeur (${actualSenderRib}) n'est pas dans la liste des RIB connus pour fonctionner`);
      }
      
      if (!validRibs.includes(manualRib)) {
        console.warn(`[TransferModal] Le RIB du destinataire (${manualRib}) n'est pas dans la liste des RIB connus pour fonctionner`);
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

      setSenderBankAccount(fromAccount?.number || null);
      setReceiverAccount(null);
      setReceiverBankAccount(null);
      setManualRib('');
      setAmount('');
      setConfirmed(false);
      onClose();
    } catch (error) {
      console.error('Erreur de transaction:', error);
      
      let errorMessage = 'Le virement n\'a pas pu être effectué.';
      
      if (error instanceof Error) {
        console.log(`[TransferModal] Type d'erreur: ${error.name}, Message: ${error.message}, Stack: ${error.stack}`);
        
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

  const handleSenderRibSelect = (ribNumber: string) => {
    setSenderBankAccount(ribNumber);
    setShowSenderSelector(false);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-5xl max-h-[85vh] p-0 overflow-hidden", isDark ? "bg-[#1A1A1A] border border-[#2A2A2A]" : "bg-white border border-[#E9E9E9]")}>
        
        {/* Header */}
        <div className={cn("p-6 flex items-center justify-between border-b", isDark ? "border-gray-700" : "border-gray-200")}>
          <h2 className={isDark ? 'text-white text-xl font-bold' : 'text-[#333333] text-xl font-bold'}>
            Effectuer un virement
          </h2>
          <DialogClose className={cn(
            "p-2 rounded-full",
            isDark ? "hover:bg-[#2A2A2A]" : "hover:bg-gray-100"
          )}>
            <X size={20} className={isDark ? "text-gray-400" : "text-gray-500"} />
          </DialogClose>
        </div>

        {/* Content */}
        <div className="flex flex-row h-[70vh] max-h-[600px]">
          {/* Left side - Form */}
          <div className={cn("w-[55%] p-6 flex flex-col border-r", isDark ? "border-gray-700" : "border-gray-200")}>
            <div className="space-y-6 flex-1">
              {/* Sender Account - Only show if no specific account is selected */}
              {!fromAccount && (
                <div className="relative" ref={senderSelectorRef}>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
                    Compte expéditeur
                  </label>
                  <div 
                    onClick={() => setShowSenderSelector(!showSenderSelector)}
                    className={`flex justify-between items-center w-full px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                      isDark ? 'bg-[#2A2A2A] border-[#3A3A3A] hover:bg-[#333333]' : 'bg-white border-[#E5E5E5] hover:bg-[#F8F8F8]'
                    }`}
                  >
                    <span>{senderBankAccount || 'RIB de l\'expéditeur'}</span>
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className={`text-xs mt-1 ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
                    * Si aucun n'est sélectionné, celui par défaut sera utilisé
                  </p>
                  
                  {/* Dropdown pour les RIB de l'expéditeur */}
                  {showSenderSelector && (
                    <div className={`absolute top-full left-0 right-0 mt-1 p-2 shadow-lg border z-10 rounded-lg ${
                      isDark ? 'bg-[#2A2A2A] border-[#3A3A3A]' : 'bg-white border-[#E5E5E5]'
                    }`}>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {myUser.bankAccounts.map((account) => (
                          <div 
                            key={account.id}
                            onClick={() => handleSenderRibSelect(account.number)}
                            className={`px-3 py-2 rounded cursor-pointer transition-colors ${
                              senderBankAccount === account.number 
                                ? isDark ? 'bg-[#F0B90B]/30' : 'bg-[#F0B90B]/20'
                                : account.isDefault 
                                  ? isDark ? 'bg-[#F0B90B]/10' : 'bg-[#F0B90B]/5'
                                  : ''
                            } ${
                              isDark 
                                ? 'hover:bg-[#F0B90B]/20' 
                                : 'hover:bg-[#F0B90B]/10'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{account.number}</span>
                              {account.isDefault && (
                                <span className="text-xs text-[#F0B90B]">Par défaut</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Compte expéditeur sélectionné - Affichage en lecture seule */}
              {fromAccount && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
                    Compte expéditeur
                  </label>
                  <div className={`flex justify-between items-center w-full px-4 py-3 rounded-lg border ${
                    isDark ? 'bg-[#2A2A2A] border-[#3A3A3A]' : 'bg-gray-50 border-[#E5E5E5]'
                  }`}>
                    <span>{fromAccount.number}</span>
                  </div>
                  <p className={`text-xs mt-1 ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
                    Solde disponible: {fromAccount.balance}$
                  </p>
                </div>
              )}

              {/* Receiver Account */}
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
                    Compte destinataire
                  </label>
                </div>
                
                    <input 
                      type="text" 
                      value={manualRib}
                      onChange={(e) => setManualRib(e.target.value)}
                  placeholder="Entrez le RIB manuellement..."
                  className={`w-full px-4 py-3 rounded-lg border text-base ${
                        isDark ? 'bg-[#2A2A2A] border-[#3A3A3A] text-white' : 'bg-white border-[#E5E5E5] text-[#333333]'
                      } focus:outline-none focus:ring-2 focus:ring-[#F0B90B]`}
                    />
                
                <p className={`text-xs mt-1 ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
                  * Saisissez un RIB ou sélectionnez un compte dans la liste à droite
                </p>
              </div>

              {/* Amount */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
                  Montant à transférer
                </label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark ? 'bg-[#2A2A2A] border-[#3A3A3A] text-white' : 'bg-white border-[#E5E5E5] text-[#333333]'
                  } focus:outline-none focus:ring-2 focus:ring-[#F0B90B]`}
                  placeholder="Montant en dollars..."
                  min="1"
                  max={fromAccount?.balance || undefined}
                />
              </div>

              {/* Confirmation */}
              <div className="flex items-center">
                <AuthCheckbox
                  id="confirm-transfer-modal"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  label={
                    <span className={`text-sm ${isDark ? 'text-[#9A9A9A]' : 'text-[#666666]'}`}>
                      Je confirme vouloir effectuer ce virement
                    </span>
                  }
                />
              </div>
            </div>

            {/* Submit button */}
            <div className={cn("pt-6 border-t", isDark ? "border-gray-700" : "border-gray-200")}>
              <button 
                onClick={handleSubmit}
                disabled={!manualRib || !amount || !confirmed || isSubmitting}
                className={`w-full py-3 px-4 bg-[#F0B90B] text-black rounded-lg font-medium ${
                  !manualRib || !amount || !confirmed || isSubmitting
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-[#F0B90B]/90'
                } transition-colors`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full mr-2"></div>
                    <span>Traitement en cours...</span>
                  </div>
                ) : (
                  "Effectuer le virement"
                )}
              </button>
            </div>
          </div>

          {/* Right side - Account selection */}
          <div className="w-[45%] flex flex-col">
            {/* Search Bar */}
            <div className={cn("p-4", "border-b", isDark ? "border-gray-700" : "border-gray-200")}>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Rechercher ${activeTab === 'players' ? 'un joueur' : 'une entreprise'}...`}
                  className={`w-full pl-10 pr-10 py-2 rounded-lg border ${
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
            <div className={cn("flex", "border-b", isDark ? "border-gray-700" : "border-gray-200")}>
              <button 
                onClick={() => setActiveTab('players')}
                className={`flex-1 py-3 text-center font-medium ${
                  activeTab === 'players' 
                    ? 'border-b-2 border-[#F0B90B] text-[#F0B90B]' 
                    : isDark ? 'text-white hover:text-[#F0B90B]' : 'text-[#666666] hover:text-[#F0B90B]'
                }`}
              >
                Joueurs
              </button>
              <button 
                onClick={() => setActiveTab('enterprises')}
                className={`flex-1 py-3 text-center font-medium ${
                  activeTab === 'enterprises' 
                    ? 'border-b-2 border-[#F0B90B] text-[#F0B90B]' 
                    : isDark ? 'text-white hover:text-[#F0B90B]' : 'text-[#666666] hover:text-[#F0B90B]'
                }`}
              >
                Entreprises
              </button>
            </div>

            {/* Account List */}
            <div className="flex-1 overflow-y-auto">
              {displayedAccounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Search className={`h-12 w-12 mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {searchQuery 
                      ? `Aucun ${activeTab === 'players' ? 'joueur' : 'entreprise'} trouvé pour "${searchQuery}"`
                      : `Aucun ${activeTab === 'players' ? 'joueur' : 'entreprise'} disponible`
                    }
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-sm text-[#F0B90B] hover:text-[#F0B90B]/80"
                    >
                      Effacer la recherche
                    </button>
                  )}
                </div>
              ) : (
                displayedAccounts.map((account) => (
                  <div 
                    key={account.id}
                    data-account-item={account.id}
                    onClick={() => handleAccountClick(account.id)}
                    className={cn(
                      "relative flex justify-between items-center px-4 py-3 cursor-pointer border-b",
                      isDark ? "border-gray-700" : "border-gray-200",
                      showAccountRibsSelector === account.id ? 'bg-[#F0B90B]/10' : 
                      receiverAccount === account.id ? 'bg-[#F0B90B]/20' : '',
                      'hover:bg-[#F0B90B]/5'
                    )}
                  >
                    <span className={`${account.isDefault ? "font-medium" : ""}`}>{account.label}</span>
                    <div className={`w-3 h-3 rounded-full ${
                      account.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    
                    {/* Bank accounts dropdown */}
                    {showAccountRibsSelector === account.id && mockBankAccounts[account.id] && (
                      <div 
                        data-ribs-menu={account.id}
                        className={`absolute top-full left-0 right-0 p-3 shadow-lg border z-10 ${
                          isDark ? 'bg-[#2A2A2A] border-[#3A3A3A]' : 'bg-white border-[#E5E5E5]'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className={`text-sm font-medium mb-2 ${
                          isDark ? 'text-[#F0B90B]' : 'text-[#333333]'
                        }`}>
                          Comptes bancaires
                        </div>
                        <div className="space-y-1">
                          {mockBankAccounts[account.id].map((bankAccount) => (
                            <div 
                              key={bankAccount}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBankAccountSelect(account.id, bankAccount);
                              }}
                              className={`px-3 py-2 rounded cursor-pointer transition-colors ${
                                receiverBankAccount === bankAccount 
                                  ? isDark ? 'bg-[#F0B90B]/30' : 'bg-[#F0B90B]/20'
                                  : ''
                              } ${
                                isDark 
                                  ? 'hover:bg-[#F0B90B]/20' 
                                  : 'hover:bg-[#F0B90B]/10'
                              }`}
                            >
                              {bankAccount}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={cn("flex justify-center items-center p-4 border-t", isDark ? "border-gray-700" : "border-gray-200")}>
                <button
                  onClick={() => setActivePage(prev => Math.max(0, prev - 1))}
                  disabled={activePage === 0}
                  className={`p-2 rounded-full ${activePage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#F0B90B]/10'}`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="mx-4">
                  {activePage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setActivePage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={activePage === totalPages - 1}
                  className={`p-2 rounded-full ${activePage === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#F0B90B]/10'}`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 