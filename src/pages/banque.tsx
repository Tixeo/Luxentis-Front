import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTheme } from '@/lib/theme-provider';
import { useUserStore } from '@/stores/userStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus, ArrowRight, Wallet } from 'lucide-react';
import { TransferModal } from '@/components/banque/TransferModal';


const VerifiedBadge = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" className="fill-blue-500">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function BankPage() {
  const { isDark } = useTheme();
  const { bankAccounts } = useUserStore();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedAccountForTransfer, setSelectedAccountForTransfer] = useState<{id: string, number: string, balance: number} | undefined>(undefined);
  
  
  const accounts = bankAccounts.length > 0 ? bankAccounts : [
    { id: 'myacc1', number: 'MYACC12345', isDefault: true, balance: 1000 },
    { id: 'myacc2', number: 'MYACC67890', isDefault: false, balance: 500 }
  ];

  const handleTransferClick = (accountNumber: string) => {
    const account = accounts.find(acc => acc.number === accountNumber);
    if (account) {
      setSelectedAccountForTransfer({
        id: account.id,
        number: account.number,
        balance: account.balance
      });
      setIsTransferModalOpen(true);
    }
  };

  const handleTransferClose = () => {
    setIsTransferModalOpen(false);
    setSelectedAccountForTransfer(undefined);
  };

  return (
    <MainLayout>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>Ma Banque</h1>
          <Link to="/banque/nouveau-compte">
            <Button className="bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-black">
              <Plus className="mr-2 h-4 w-4" /> Créer un compte bancaire
            </Button>
          </Link>
        </div>

        <Card className={isDark ? 'mb-6 bg-[#1A1A1A] border border-[#2A2A2A]' : 'mb-6 bg-white border border-[#E9E9E9] shadow-sm'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 mr-4 text-[#F0B90B]" />
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-[#333333]'}`}>Effectuer un virement</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Transférez de l'argent rapidement</p>
                </div>
              </div>
              <Button 
                className={`bg-[#F0B90B] hover:bg-[#F0B90B]/90 ${isDark ? 'text-black' : 'text-black'}`}
                onClick={() => setIsTransferModalOpen(true)}
              >
                Virement rapide
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-[#333333]'}`}>Mes comptes bancaires</h2>
          
          {accounts.map(account => (
            <Card key={account.id} className={isDark ? 'overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A]' : 'overflow-hidden bg-white border border-[#E9E9E9] shadow-sm'}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className={isDark ? 'text-white' : 'text-[#333333]'}>Compte</CardTitle>
                      {account.isDefault && (
                        <VerifiedBadge />
                      )}
                    </div>
                    <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>RIB: {account.number}</CardDescription>
                  </div>
                  <Button
                    className={`bg-[#F0B90B] hover:bg-[#F0B90B]/90 ${isDark ? 'text-black' : 'text-black'}`}
                    onClick={() => handleTransferClick(account.number)}
                  >
                    Virement <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-1">
                  <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>{account.balance}</span>
                  <span className={`text-xl ${isDark ? 'text-white' : 'text-[#333333]'}`}>$</span>
                </div>
                <div className="h-1 w-full mt-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#F0B90B] rounded-full" 
                    style={{ width: `${Math.min(100, (account.balance / 2000) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs"></span>
                  <span className="text-xs">Plafond: 2000$</span>
                </div>
              </CardContent>
              <CardFooter className={isDark ? 'border-t border-[#2A2A2A] pt-4 flex justify-between' : 'border-t border-[#E9E9E9] pt-4 flex justify-between'}>
                <Link to={`/banque/compte/${account.id}`} className="w-full">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={isDark ? 'w-full text-white' : 'w-full text-[#333333]'}
                  >
                    Voir les détails
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
          
          {accounts.length === 0 && (
            <div className="text-center py-10">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">Aucun compte bancaire</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Vous n'avez pas encore de compte bancaire.
              </p>
              <Link to="/banque/nouveau-compte">
                <Button className="bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-black">
                  <Plus className="mr-2 h-4 w-4" /> Créer mon premier compte
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={handleTransferClose}
        fromAccount={selectedAccountForTransfer}
      />
    </MainLayout>
  );
}