import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTheme } from '@/lib/theme-provider';
import { useUserStore } from '@/stores/userStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, ArrowRight, LineChart, User, Download, Upload, Trash2, Star } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TransferModal } from '@/components/banque/TransferModal';
import { DeleteAccountModal } from '@/components/banque/DeleteAccountModal';
import { SetDefaultAccountModal } from '@/components/banque/SetDefaultAccountModal';
import { useToast } from '@/hooks/use-toast';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';


const data = [
  { name: 'Lun', amount: 1000 },
  { name: 'Mar', amount: 1200 },
  { name: 'Mer', amount: 1100 },
  { name: 'Jeu', amount: 1300 },
  { name: 'Ven', amount: 1100 },
  { name: 'Sam', amount: 1400 },
  { name: 'Dim', amount: 1500 },
];

const transactions = [
  { id: 1, date: '2023-11-01', description: 'Virement entrant', amount: 250, type: 'credit' },
  { id: 2, date: '2023-11-03', description: 'Paiement loyer', amount: -500, type: 'debit' },
  { id: 3, date: '2023-11-05', description: 'Salaire', amount: 1800, type: 'credit' },
  { id: 4, date: '2023-11-10', description: 'Courses', amount: -120, type: 'debit' },
  { id: 5, date: '2023-11-15', description: 'Virement sortant', amount: -200, type: 'debit' },
  { id: 6, date: '2023-11-20', description: 'Remboursement', amount: 75, type: 'credit' },
  { id: 7, date: '2023-11-22', description: 'Achat en ligne', amount: -89, type: 'debit' },
  { id: 8, date: '2023-11-25', description: 'Virement familial', amount: 300, type: 'credit' },
  { id: 9, date: '2023-11-27', description: 'Facture électricité', amount: -95, type: 'debit' },
  { id: 10, date: '2023-11-28', description: 'Cashback', amount: 15, type: 'credit' },
  { id: 11, date: '2023-11-30', description: 'Restaurant', amount: -45, type: 'debit' },
  { id: 12, date: '2023-12-01', description: 'Salaire', amount: 1800, type: 'credit' },
  { id: 13, date: '2023-12-03', description: 'Assurance auto', amount: -180, type: 'debit' },
  { id: 14, date: '2023-12-05', description: 'Freelance projet', amount: 500, type: 'credit' },
  { id: 15, date: '2023-12-07', description: 'Épicerie', amount: -67, type: 'debit' },
  { id: 16, date: '2023-12-10', description: 'Virement épargne', amount: -400, type: 'debit' },
  { id: 17, date: '2023-12-12', description: 'Cadeau reçu', amount: 100, type: 'credit' },
  { id: 18, date: '2023-12-15', description: 'Abonnement streaming', amount: -12, type: 'debit' },
  { id: 19, date: '2023-12-18', description: 'Bonus travail', amount: 250, type: 'credit' },
  { id: 20, date: '2023-12-20', description: 'Pharmacie', amount: -28, type: 'debit' },
  { id: 21, date: '2023-12-22', description: 'Cadeau Noël', amount: -150, type: 'debit' },
  { id: 22, date: '2023-12-25', description: 'Étrennes', amount: 200, type: 'credit' },
  { id: 23, date: '2023-12-28', description: 'Essence', amount: -60, type: 'debit' },
  { id: 24, date: '2023-12-30', description: 'Prime fin année', amount: 800, type: 'credit' },
];

export default function BankAccountPage() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { bankAccounts, updateBankAccounts } = useUserStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSetDefaultModalOpen, setIsSetDefaultModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const accounts = bankAccounts.length > 0 ? bankAccounts : [
    { id: 'myacc1', number: 'MYACC12345', isDefault: true, balance: 1000, interestRate: 0.01, owner: 'tixeo', maxBalance: 2000 },
    { id: 'myacc2', number: 'MYACC67890', isDefault: false, balance: 500, interestRate: 0.015, owner: 'tixeo', maxBalance: 5000 }
  ];
  
  const account = accounts.find(acc => acc.id === accountId || acc.number === accountId);
  
  useEffect(() => {
    if (!account) {
      navigate('/banque');
    }
  }, [account, navigate]);
  
  if (!account) {
    return null;
  }
  
  const handleTransferClose = () => {
    setIsTransferModalOpen(false);
  };

  const handleDeleteAccount = async () => {
    try {
      console.log('[BankAccountPage] Démarrage de la suppression du compte côté UI');
      
      
      const updatedAccounts = bankAccounts.filter(acc => acc.id !== account?.id);
      updateBankAccounts(updatedAccounts);
      
      toast({
        variant: 'success',
        title: 'Compte supprimé',
        description: `Le compte ${account?.number} a été supprimé avec succès.`
      });
      
      
      navigate('/banque');
    } catch (error) {
      console.error('[BankAccountPage] Erreur lors de la suppression côté UI:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la suppression du compte.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        variant: 'destructive',
        title: 'Erreur de suppression',
        description: errorMessage
      });
    }
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
  };

  const handleSetDefaultAccount = async () => {
    try {
      console.log('[BankAccountPage] Démarrage de la définition par défaut côté UI');
      
      
      const updatedAccounts = bankAccounts.map(acc => ({
        ...acc,
        isDefault: acc.id === account?.id
      }));
      updateBankAccounts(updatedAccounts);
      
      toast({
        variant: 'success',
        title: 'Compte par défaut défini',
        description: `Le compte ${account?.number} est maintenant votre compte principal.`
      });
    } catch (error) {
      console.error('[BankAccountPage] Erreur lors de la définition par défaut côté UI:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la définition du compte par défaut.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        variant: 'destructive',
        title: 'Erreur de définition',
        description: errorMessage
      });
    }
  };

  const handleSetDefaultModalClose = () => {
    setIsSetDefaultModalOpen(false);
  };

  
  const currentDefaultAccount = accounts.find(acc => acc.isDefault)?.number;

  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  
  useEffect(() => {
    if (activeTab === 'transactions') {
      setCurrentPage(1);
    }
  }, [activeTab]);

  return (
    <MainLayout>
      <div className="container mx-auto">
        <div className="mb-6">
          <Button 
              className={`bg-[#F0B90B] hover:bg-[#F0B90B]/90 ${isDark ? 'text-black' : 'text-black'} mb-8`}
              onClick={() => navigate('/banque')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />Retour aux comptes 
            </Button>
          {/* <Link 
            to="/banque" 
            className="inline-flex items-center text-sm mb-4 hover:text-[#F0B90B]"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour aux comptes
          </Link> */}
          <div className="flex justify-between items-center">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>Compte {account.isDefault ? '(Principal)' : ''}</h1>
            <div className="flex gap-3">
              {!account.isDefault && (
                <Button 
                  variant="outline"
                  className={`border-[#F0B90B] text-[#F0B90B] hover:bg-[#F0B90B] hover:text-black ${isDark ? 'border-[#F0B90B] text-[#F0B90B] hover:bg-[#F0B90B] hover:text-black' : ''}`}
                  onClick={() => setIsSetDefaultModalOpen(true)}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Définir par défaut
                </Button>
              )}
              <Button 
                variant="outline"
                className={`border-red-500 text-red-500 hover:bg-red-500 hover:text-white ${isDark ? 'border-red-400 text-red-400 hover:bg-red-500' : ''}`}
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
              <Button 
                className={`bg-[#F0B90B] hover:bg-[#F0B90B]/90 ${isDark ? 'text-black' : 'text-black'}`}
                onClick={() => setIsTransferModalOpen(true)}
              >
                Effectuer un virement <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className={isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-white border border-[#E9E9E9] shadow-sm'}>
            <CardHeader>
              <CardTitle className={`flex items-center text-lg ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                <CreditCard className="h-5 w-5 mr-2 text-[#F0B90B]" /> RIB
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-xl font-mono ${isDark ? 'text-white' : 'text-[#333333]'}`}>{account.number}</div>
            </CardContent>
          </Card>
          
          <Card className={isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-white border border-[#E9E9E9] shadow-sm'}>
            <CardHeader>
              <CardTitle className={`flex items-center text-lg ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                <User className="h-5 w-5 mr-2 text-[#F0B90B]" /> Propriétaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-xl ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                {account.owner || "Tix"}
              </div>
            </CardContent>
          </Card>
          
          <Card className={isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-white border border-[#E9E9E9] shadow-sm'}>
            <CardHeader>
              <CardTitle className={`flex items-center text-lg ${isDark ? 'text-white' : 'text-[#333333]'}`}>
                <LineChart className="h-5 w-5 mr-2 text-[#F0B90B]" /> Taux d'intérêt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-xl ${isDark ? 'text-white' : 'text-[#333333]'}`}>{((account.interestRate ?? 0) * 100).toFixed(2)}%</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={
            `grid w-full grid-cols-3 rounded-xl mb-6 transition-colors
            ${isDark ? 'bg-[#232323]' : 'bg-[#F5F5F5]'}
            border ${isDark ? 'border-[#2A2A2A]' : 'border-[#E9E9E9]'}
            `
          }>
            <TabsTrigger
              value="overview"
              className={`tab-yellow font-semibold transition-colors
                ${activeTab === 'overview'
                  ? ''
                  : (isDark ? 'text-gray-300' : 'text-[#333333]')}
                rounded-xl border-none`
              }
            >
              Aperçu
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className={`tab-yellow font-semibold transition-colors
                ${activeTab === 'transactions'
                  ? ''
                  : (isDark ? 'text-gray-300' : 'text-[#333333]')}
                rounded-xl border-none`
              }
            >
              Transactions
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className={`tab-yellow font-semibold transition-colors
                ${activeTab === 'stats'
                  ? ''
                  : (isDark ? 'text-gray-300' : 'text-[#333333]')}
                rounded-xl border-none`
              }
            >
              Statistiques
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card className={isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-white border border-[#E9E9E9] shadow-sm'}>
              <CardHeader>
                <CardTitle className={`${isDark ? 'text-white' : 'text-[#333333]'}`}>Solde actuel</CardTitle>
                <CardDescription className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Montant disponible sur votre compte</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-1">
                  <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>{account.balance}</span>
                  <span className={`text-2xl ${isDark ? 'text-white' : 'text-[#333333]'}`}>$</span>
                </div>
                <div className="h-2 w-full mt-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#F0B90B] rounded-full" 
                    style={{ width: `${Math.min(100, (account.balance / (account.maxBalance ?? 2000)) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs">0$</span>
                  <span className="text-xs">Plafond: {(account.maxBalance ?? 2000)}$</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className={isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-white border border-[#E9E9E9] shadow-sm'}>
              <CardHeader>
                <CardTitle className={`${isDark ? 'text-white' : 'text-[#333333]'}`}>Évolution du solde</CardTitle>
                <CardDescription className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Derniers 7 jours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto" style={{maxWidth: '100%'}}>
                  <div style={{ minWidth: 300, width: '100%', height: 220 }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F0B90B" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#F0B90B" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#eee'} />
                        <XAxis dataKey="name" tick={{ fill: isDark ? '#ccc' : '#333' }} />
                        <YAxis tick={{ fill: isDark ? '#ccc' : '#333' }} domain={['auto', 'auto']} />
                        <Tooltip contentStyle={{ background: isDark ? '#222' : '#fff', borderColor: isDark ? '#444' : '#ddd', color: isDark ? '#fff' : '#222' }} />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="#F0B90B"
                          fillOpacity={1}
                          fill="url(#colorAmount)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className={isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-white border border-[#E9E9E9] shadow-sm'}>
              <CardHeader>
                <CardTitle className={`${isDark ? 'text-white' : 'text-[#333333]'}`}>Transactions récentes</CardTitle>
                <CardDescription className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>3 dernières transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.slice(0, 3).map(transaction => (
                    <div key={transaction.id} className={`flex justify-between items-center p-3 rounded-lg border ${isDark ? 'border-[#2A2A2A]' : 'border-[#E9E9E9]'} bg-transparent`}>
                      <div className="flex items-center">
                        {transaction.type === 'credit' ? (
                          <Download className="h-4 w-4 mr-2 text-green-500" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2 text-red-500" />
                        )}
                        <div>
                          <div className={`font-medium ${isDark ? 'text-white' : 'text-[#333333]'}`}>{transaction.description}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{transaction.date}</div>
                        </div>
                      </div>
                      <div className={transaction.type === 'credit' ? 'text-green-500' : 'text-red-500'}>
                        {transaction.type === 'credit' ? '+' : ''}{transaction.amount}$
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`${isDark ? 'bg-[#181818] text-white' : 'bg-white text-[#333333]'} w-full font-semibold rounded-xl border ${isDark ? 'border-[#2A2A2A]' : 'border-[#E9E9E9]'} mt-2`}
                    onClick={() => setActiveTab('transactions')}
                  >
                    Voir toutes les transactions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="mt-6">
            <Card className={isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-white border border-[#E9E9E9] shadow-sm'}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className={`${isDark ? 'text-white' : 'text-[#333333]'}`}>Historique des transactions</CardTitle>
                    <CardDescription className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {transactions.length} transaction{transactions.length > 1 ? 's' : ''} au total
                    </CardDescription>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Page {currentPage} sur {totalPages}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paginatedTransactions.map(transaction => (
                    <div key={transaction.id} className={`flex justify-between items-center p-3 rounded-lg border ${isDark ? 'border-[#2A2A2A]' : 'border-[#E9E9E9]'} bg-transparent`}>
                      <div className="flex items-center">
                        {transaction.type === 'credit' ? (
                          <Download className="h-4 w-4 mr-2 text-green-500" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2 text-red-500" />
                        )}
                        <div>
                          <div className={`font-medium ${isDark ? 'text-white' : 'text-[#333333]'}`}>{transaction.description}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{transaction.date}</div>
                        </div>
                      </div>
                      <div className={transaction.type === 'credit' ? 'text-green-500' : 'text-red-500'}>
                        {transaction.type === 'credit' ? '+' : ''}{transaction.amount}$
                      </div>
                    </div>
                  ))}
                  
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) setCurrentPage(currentPage - 1);
                              }}
                              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>
                          
                          {/* Première page */}
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(1);
                              }}
                              isActive={currentPage === 1}
                            >
                              1
                            </PaginationLink>
                          </PaginationItem>

                          {/* Ellipsis de début si nécessaire */}
                          {currentPage > 3 && totalPages > 5 && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}

                          {/* Pages autour de la page courante */}
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => {
                              if (totalPages <= 5) return page !== 1 && page !== totalPages;
                              if (page === 1 || page === totalPages) return false;
                              return Math.abs(page - currentPage) <= 1;
                            })
                            .map((page) => (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(page);
                                  }}
                                  isActive={currentPage === page}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            ))}

                          {/* Ellipsis de fin si nécessaire */}
                          {currentPage < totalPages - 2 && totalPages > 5 && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}

                          {/* Dernière page */}
                          {totalPages > 1 && (
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(totalPages);
                                }}
                                isActive={currentPage === totalPages}
                              >
                                {totalPages}
                              </PaginationLink>
                            </PaginationItem>
                          )}

                          <PaginationItem>
                            <PaginationNext 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                              }}
                              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="mt-6">
            <Card className={isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-white border border-[#E9E9E9] shadow-sm'}>
              <CardHeader>
                <CardTitle className={`${isDark ? 'text-white' : 'text-[#333333]'}`}>Statistiques du compte</CardTitle>
                <CardDescription className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Activité et mouvement des fonds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-[#333333]'}`}>Entrées vs Sorties</h3>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#eee'} />
                          <XAxis dataKey="name" tick={{ fill: isDark ? '#ccc' : '#333' }} />
                          <YAxis tick={{ fill: isDark ? '#ccc' : '#333' }} domain={['auto', 'auto']} />
                          <Tooltip contentStyle={{ background: isDark ? '#222' : '#fff', borderColor: isDark ? '#444' : '#ddd', color: isDark ? '#fff' : '#222' }} />
                          <Area type="monotone" dataKey="amount" stroke="#F0B90B" fill="#F0B90B" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-[#333333]'}`}>Statistiques générales</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className={`text-gray-500 dark:text-gray-400 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Solde moyen</span>
                        <span className="font-medium">1.250$</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-gray-500 dark:text-gray-400 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Transaction la plus élevée</span>
                        <span className="font-medium">1.800$</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-gray-500 dark:text-gray-400 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Transaction la plus basse</span>
                        <span className="font-medium">-500$</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-gray-500 dark:text-gray-400 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total des entrées</span>
                        <span className="font-medium text-green-500">+2.125$</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-gray-500 dark:text-gray-400 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total des sorties</span>
                        <span className="font-medium text-red-500">-820$</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={handleTransferClose}
        fromAccount={{
          id: account.id,
          number: account.number,
          balance: account.balance
        }}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteAccount}
        accountId={account.id}
        accountNumber={account.number}
        accountBalance={account.balance}
      />

      <SetDefaultAccountModal
        isOpen={isSetDefaultModalOpen}
        onClose={handleSetDefaultModalClose}
        onConfirm={handleSetDefaultAccount}
        accountId={account.id}
        accountNumber={account.number}
        currentDefaultAccount={currentDefaultAccount}
      />
    </MainLayout>
  );
} 