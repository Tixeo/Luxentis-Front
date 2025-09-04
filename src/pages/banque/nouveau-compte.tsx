import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTheme } from '@/lib/theme-provider';
import { useUserStore } from '@/stores/userStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AuthCheckbox } from '@/components/auth/AuthCheckbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check, CreditCard, Wallet, BadgePercent } from 'lucide-react';
import { bankSocketService } from '@/services/virementSocket';
import { accountSocketService } from '@/services/compteSocket';


interface BankAccountOffer {
  id: string;
  name: string;
  price: number;
  maxBalance: number;
  interestRate: number;
  description: string;
  features: string[];
}


const bankAccountOffers: BankAccountOffer[] = [
  {
    id: 'basic',
    name: 'Compte Basic',
    price: 100,
    maxBalance: 2000,
    interestRate: 0.005, 
    description: 'Idéal pour débuter, avec un plafond raisonnable et un taux d\'intérêt minimal.',
    features: [
      'Plafond de 2000$',
      'Taux d\'intérêt de 0.5%',
      'ff',
      'ff'
    ]
  },
  {
    id: 'premium',
    name: 'Compte Premium',
    price: 500,
    maxBalance: 5000,
    interestRate: 0.015, 
    description: 'Pour une utilisation avancée, avec un plafond élevé et un meilleur taux d\'intérêt.',
    features: [
      'Plafond de 5000$',
      'Taux d\'intérêt de 1.5%',
      'ff',
      'ff',
      'ff'
    ]
  },
  {
    id: 'business',
    name: 'Compte Business',
    price: 1000,
    maxBalance: 10000,
    interestRate: 0.025, 
    description: 'Solution pour les entreprises ou les joueurs fortunés, avec un plafond très élevé.',
    features: [
      'Plafond de 10000$',
      'Taux d\'intérêt de 2.5%',
      'ff',
      'ff',
      'ff',
      'ff',
      'ff',
      'ff'
    ]
  }
];

export default function NewBankAccountPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { toast } = useToast();
  const { bankAccounts, createBankAccount, updateBankAccounts } = useUserStore();
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [selectedPaymentAccount, setSelectedPaymentAccount] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const selectedOffer = selectedOfferId 
    ? bankAccountOffers.find(offer => offer.id === selectedOfferId) 
    : null;
  
  
  const availableAccounts = bankAccounts.length > 0 ? bankAccounts : [
    { id: 'myacc1', number: 'MYACC12345', isDefault: true, balance: 1000 },
    { id: 'myacc2', number: 'MYACC67890', isDefault: false, balance: 500 }
  ];
  
  
  const validPaymentAccounts = selectedOffer 
    ? availableAccounts.filter(account => account.balance >= selectedOffer.price)
    : availableAccounts;
  
  const handleOfferSelect = (offerId: string) => {
    setSelectedOfferId(offerId);
    setSelectedPaymentAccount(null); 
    setConfirmed(false); 
    setIsConfirmModalOpen(true);
  };
  
  const handleConfirmPurchase = async () => {
    if (!selectedOffer || !selectedPaymentAccount || !confirmed) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez sélectionner un compte de paiement et confirmer la création.'
      });
      return;
    }
    
    const paymentAccount = availableAccounts.find(acc => acc.id === selectedPaymentAccount);
    if (!paymentAccount || paymentAccount.balance < selectedOffer.price) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Fonds insuffisants sur le compte sélectionné.'
      });
      return;
    }

    setIsCreating(true);

    try {
      console.log('[CreateBankAccount] Démarrage du processus de création');
      
      
      console.log('[CreateBankAccount] Étape 1: Paiement des frais de création');
      
      
      if (bankSocketService.isConnected()) {
        
        bankSocketService.initiateTransaction({
          from: paymentAccount.number,
          to: "", 
          amount: selectedOffer.price
        }).catch(paymentError => {
          console.error('[CreateBankAccount] Erreur lors du paiement (ignorée):', paymentError);
        });
      }
      
      console.log('[CreateBankAccount] Transaction de paiement envoyée, passage à l\'étape suivante');
      
      
      console.log('[CreateBankAccount] Étape 2: Création du compte bancaire');
      await accountSocketService.createBankAccount({
        balance: 1 
      });
      
      console.log('[CreateBankAccount] Compte créé avec succès via socket');
      
      
      const newAccountNumber = `MCCP${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      createBankAccount({
        number: newAccountNumber,
        balance: 0,
        isDefault: false,
        interestRate: selectedOffer.interestRate,
        maxBalance: selectedOffer.maxBalance,
        owner: 'Tix' 
      });

      
      if (bankAccounts.length === 0) {
        console.log(`Simulation: ${selectedOffer.price}$ débités du compte de test ${paymentAccount.number}`);
      } else {
        const updatedAccounts = bankAccounts.map(account => {
          if (account.id === selectedPaymentAccount) {
            return {
              ...account,
              balance: account.balance - selectedOffer.price
            };
          }
          return account;
        });
        updateBankAccounts(updatedAccounts);
      }

      toast({
        variant: 'success',
        title: 'Compte créé avec succès',
        description: `Le compte "${selectedOffer.name}" (${newAccountNumber}) a été créé ! ${selectedOffer.price}$ ont été débités du compte ${paymentAccount.number}.`
      });
      
      setIsConfirmModalOpen(false);
      navigate('/banque');
    } catch (error) {
      console.error('[CreateBankAccount] Erreur lors de la création:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la création du compte.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        variant: 'destructive',
        title: 'Erreur de création',
        description: errorMessage
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto">
        <div className="mb-6">
          <Link 
            to="/banque" 
            className="inline-flex items-center text-sm mb-4 hover:text-[#F0B90B]"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour aux comptes
          </Link>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>Créer un nouveau compte bancaire</h1>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Choisissez l'offre qui correspond le mieux à vos besoins
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {bankAccountOffers.map(offer => (
            <Card 
              key={offer.id}
              className={`overflow-hidden transition-all duration-200 flex flex-col h-full ${
                isDark
                  ? 'bg-[#1A1A1A] border border-[#2A2A2A]'
                  : 'bg-white border border-[#E9E9E9] shadow-sm'
              } ${
                selectedOfferId === offer.id 
                  ? 'ring-2 ring-[#F0B90B] shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleOfferSelect(offer.id)}
            >
              <CardHeader className={selectedOfferId === offer.id ? (isDark ? 'bg-[#232323]' : 'bg-[#FFFBEA]') : ''}>
                <CardTitle className={`flex items-center text-lg ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                  {offer.name}
                  {selectedOfferId === offer.id && (
                    <Check className="h-5 w-5 ml-2 text-[#F0B90B]" />
                  )}
                </CardTitle>
                <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>{offer.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex-1 flex flex-col">
                <div className="flex items-baseline justify-center mb-6">
                  <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>{offer.price}</span>
                  <span className={`text-xl ml-1 ${isDark ? 'text-white' : 'text-[#333333]'}`}>$</span>
                </div>
                <div className="space-y-3">
                  <div className={`flex items-center ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                    <Wallet className="h-4 w-4 mr-2 text-[#F0B90B]" />
                    <span>Plafond: {offer.maxBalance}$</span>
                  </div>
                  <div className={`flex items-center ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                    <BadgePercent className="h-4 w-4 mr-2 text-[#F0B90B]" />
                    <span>Taux d'intérêt: {(offer.interestRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className={`flex items-center ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                    <CreditCard className="h-4 w-4 mr-2 text-[#F0B90B]" />
                    <span>Virements illimités</span>
                  </div>
                </div>
                <div className={`flex-1 ${isDark ? 'mt-6 pt-6 border-t border-[#2A2A2A]' : 'mt-6 pt-6 border-t border-[#E9E9E9]'}`}>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-[#333333]'}`}>Fonctionnalités:</h4>
                  <ul className="space-y-2">
                    {offer.features.map((feature, index) => (
                      <li key={index} className={`flex items-center ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                        <Check className="h-4 w-4 mr-2 text-[#F0B90B]" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button 
                  onClick={() => handleOfferSelect(offer.id)}
                  className={`w-full ${
                    selectedOfferId === offer.id
                      ? 'bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-black'
                      : isDark
                        ? 'bg-[#1A1A1A] border-[#F0B90B] text-[#F0B90B] hover:bg-[#F0B90B]/10'
                        : 'bg-white border-[#F0B90B] text-[#F0B90B] hover:bg-[#F0B90B]/10'
                  }`}
                  variant={selectedOfferId === offer.id ? 'default' : 'outline'}
                >
                  {selectedOfferId === offer.id ? 'Sélectionné' : 'Sélectionner'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

      </div>

      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent
          className={`sm:max-w-[500px] p-6 rounded-2xl
            ${isDark
              ? 'dark bg-[#181818] text-white border-[#2A2A2A]'
              : 'bg-white text-[#333333] border-[#E9E9E9]'
            }`
          }
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold dark:text-white text-[#333333]">Confirmer la création du compte</DialogTitle>
            <DialogDescription className="dark:text-gray-400 text-gray-600">
              Veuillez vérifier les détails de votre nouveau compte bancaire.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOffer && (
            <div className="py-4">
              <div className="rounded-lg p-4 mb-4 bg-[#F5F5F5] dark:bg-[#232323]">
                <h3 className="font-medium text-lg mb-2 text-[#333333] dark:text-white">{selectedOffer.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Prix</span>
                    <span className="font-bold text-[#333333] dark:text-white">{selectedOffer.price}$</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Plafond</span>
                    <span className="font-bold text-[#333333] dark:text-white">{selectedOffer.maxBalance}$</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Taux d'intérêt</span>
                    <span className="font-bold text-[#333333] dark:text-white">{(selectedOffer.interestRate * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className={`text-sm font-medium block mb-2 ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                  Compte de paiement
                </label>
                {validPaymentAccounts.length === 0 ? (
                  <div className={`p-3 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    <p className="text-sm">Aucun compte bancaire n'a suffisamment de fonds ({selectedOffer.price}$ requis).</p>
                  </div>
                ) : (
                  <select 
                    className={`w-full p-3 rounded-lg border ${isDark ? 'bg-[#232323] border-[#3A3A3A] text-white' : 'bg-white border-[#E5E5E5] text-[#333333]'}`}
                    value={selectedPaymentAccount || ''}
                    onChange={(e) => setSelectedPaymentAccount(e.target.value || null)}
                  >
                    <option value="">Sélectionner un compte</option>
                    {validPaymentAccounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.number} ({account.balance}$) {account.isDefault ? '(Principal)' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div className="text-sm mb-4 dark:text-gray-300 text-gray-600">
                <p>En confirmant, un montant de <strong>{selectedOffer.price}$</strong> sera débité du compte sélectionné pour créer ce compte bancaire.</p>
              </div>
              <AuthCheckbox
                id="confirm-purchase"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                label="Je confirme vouloir créer ce compte bancaire et payer le montant indiqué"
                className="dark:text-white text-[#333333]"
              />
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              className="bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-black"
              onClick={handleConfirmPurchase}
              disabled={!confirmed || !selectedPaymentAccount || validPaymentAccounts.length === 0 || isCreating}
            >
              {isCreating ? (
                <div className="flex items-center">
                  <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full mr-2"></div>
                  Création en cours...
                </div>
              ) : (
                `Confirmer et payer ${selectedOffer?.price}$`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
} 