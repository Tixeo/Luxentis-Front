import { create } from 'zustand';
import { persist } from 'zustand/middleware';


interface UserBankAccount {
  id: string;
  number: string;
  balance: number;
  isDefault: boolean;
  interestRate?: number;
  maxBalance?: number;
  owner?: string;
}


interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  senderAccount?: string;
  receiverAccount?: string;
}

interface UserState {
  isAuthenticated: boolean;
  username: string | null;
  id: string | null;
  bankAccounts: UserBankAccount[];
  transactions: Transaction[];
}

interface UserActions {
  login: (username: string, id: string, bankAccounts: UserBankAccount[]) => void;
  logout: () => void;
  updateBankAccounts: (bankAccounts: UserBankAccount[]) => void;
  updateDefaultBankAccount: (accountId: string) => void;
  transferMoney: (fromRib: string, toRib: string, amount: number) => boolean;
  createBankAccount: (accountDetails: Omit<UserBankAccount, 'id'>) => string;
  getAccountTransactions: (accountNumber: string) => Transaction[];
}


const generateId = () => Math.random().toString(36).substring(2, 9);


export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      
      isAuthenticated: false,
      username: null,
      id: null,
      bankAccounts: [],
      transactions: [],

      
      login: (username, id, bankAccounts) => set({ 
        isAuthenticated: true, 
        username, 
        id, 
        bankAccounts 
      }),
      
      logout: () => set({ 
        isAuthenticated: false, 
        username: null, 
        id: null, 
        bankAccounts: [],
        transactions: []
      }),
      
      updateBankAccounts: (bankAccounts) => set({ 
        bankAccounts 
      }),
      
      updateDefaultBankAccount: (accountId) => set((state) => ({
        bankAccounts: state.bankAccounts.map(account => ({
          ...account,
          isDefault: account.id === accountId
        }))
      })),
      
      transferMoney: (fromRib, toRib, amount) => {
        const state = get();
        const parsedAmount = parseFloat(amount.toString());
        
        if (isNaN(parsedAmount) || parsedAmount <= 0) return false;
        
        
        const senderAccount = state.bankAccounts.find(acc => acc.number === fromRib);
        if (!senderAccount || senderAccount.balance < parsedAmount) return false;
        
        
        const receiverAccount = state.bankAccounts.find(acc => acc.number === toRib);
        
        
        const updatedAccounts = state.bankAccounts.map(account => {
          if (account.number === fromRib) {
            return { ...account, balance: account.balance - parsedAmount };
          }
          if (account.number === toRib) {
            return { ...account, balance: account.balance + parsedAmount };
          }
          return account;
        });
        
        
        const newTransaction: Transaction = {
          id: generateId(),
          date: new Date().toISOString(),
          description: receiverAccount ? 'Virement interne' : 'Virement sortant',
          amount: parsedAmount,
          type: 'debit',
          senderAccount: fromRib,
          receiverAccount: toRib
        };
        
        
        let transactions = [...state.transactions, newTransaction];
        
        if (receiverAccount) {
          transactions.push({
            id: generateId(),
            date: new Date().toISOString(),
            description: 'Virement reçu',
            amount: parsedAmount,
            type: 'credit',
            senderAccount: fromRib,
            receiverAccount: toRib
          });
        }
        
        set({ 
          bankAccounts: updatedAccounts,
          transactions: transactions
        });
        
        return true;
      },
      
      createBankAccount: (accountDetails) => {
        const newId = generateId();
        
        set((state) => ({
          bankAccounts: [
            ...state.bankAccounts,
            {
              id: newId,
              ...accountDetails,
              isDefault: state.bankAccounts.length === 0 
            }
          ]
        }));
        
        return newId;
      },
      
      getAccountTransactions: (accountNumber) => {
        const state = get();
        return state.transactions.filter(
          tx => tx.senderAccount === accountNumber || tx.receiverAccount === accountNumber
        );
      }
    }),
    {
      name: 'user-storage', 
    }
  )
); 