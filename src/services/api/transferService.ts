const API_BASE_URL = 'https://jsonplaceholder.typicode.com'; 

export interface BankAccount {
  id: string;
  number: string;
  isDefault?: boolean;
  balance?: number;
}

export interface User {
  id: string;
  label: string;
  type: 'player' | 'enterprise';
  status: 'active' | 'inactive';
  isDefault?: boolean;
  bankAccounts: BankAccount[];
}

export interface TransferRecipientsResponse {
  players: User[];
  enterprises: User[];
}

class TransferService {
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  
  async getTransferRecipients(): Promise<TransferRecipientsResponse> {
    try {
      console.log('[TransferService] Récupération des destinataires de transfert...');
      
      
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/users`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
      }

      const users = await response.json();
      
      
      
      const mockPlayers: User[] = [
        {
          id: '1',
          label: 'Ethokia',
          type: 'player',
          status: 'active',
          isDefault: true,
          bankAccounts: [
            { id: 'acc1', number: 'BA000001', isDefault: true, balance: 1000 },
            { id: 'acc2', number: 'BA00A2B3', isDefault: false, balance: 500 },
            { id: 'acc3', number: 'BA01F9C4', isDefault: false, balance: 750 }
          ]
        },
        {
          id: '2',
          label: 'Audin200',
          type: 'player',
          status: 'inactive',
          bankAccounts: [
            { id: 'acc4', number: 'BA03D5C9', isDefault: true, balance: 2000 },
            { id: 'acc5', number: 'BA03D5E6', isDefault: false, balance: 300 }
          ]
        },
        {
          id: '3',
          label: 'Player3',
          type: 'player',
          status: 'active',
          bankAccounts: [
            { id: 'acc6', number: 'BA03D5F9', isDefault: true, balance: 1500 },
            { id: 'acc7', number: 'BA000001', isDefault: false, balance: 800 }
          ]
        },
        {
          id: '4',
          label: 'Player4',
          type: 'player',
          status: 'active',
          bankAccounts: [
            { id: 'acc8', number: 'BA00A2B3', isDefault: true, balance: 600 },
            { id: 'acc9', number: 'BA01F9C4', isDefault: false, balance: 400 }
          ]
        },
        {
          id: '5',
          label: 'Player5',
          type: 'player',
          status: 'active',
          bankAccounts: [
            { id: 'acc10', number: 'BA03D5C9', isDefault: true, balance: 900 },
            { id: 'acc11', number: 'BA03D5E6', isDefault: false, balance: 1200 }
          ]
        }
      ];

      const mockEnterprises: User[] = [
        {
          id: 'e1',
          label: 'Entreprise1',
          type: 'enterprise',
          status: 'active',
          bankAccounts: [
            { id: 'acc12', number: 'BA03D5F9', isDefault: true, balance: 5000 },
            { id: 'acc13', number: 'BA000001', isDefault: false, balance: 3000 }
          ]
        },
        {
          id: 'e2',
          label: 'Entreprise2',
          type: 'enterprise',
          status: 'active',
          bankAccounts: [
            { id: 'acc14', number: 'BA00A2B3', isDefault: true, balance: 8000 },
            { id: 'acc15', number: 'BA01F9C4', isDefault: false, balance: 2500 }
          ]
        },
        {
          id: 'e3',
          label: 'Entreprise3',
          type: 'enterprise',
          status: 'inactive',
          bankAccounts: [
            { id: 'acc16', number: 'BA03D5C9', isDefault: true, balance: 4000 },
            { id: 'acc17', number: 'BA03D5E6', isDefault: false, balance: 1800 }
          ]
        }
      ];

      console.log('[TransferService] Destinataires récupérés avec succès');
      
      return {
        players: mockPlayers,
        enterprises: mockEnterprises
      };

    } catch (error) {
      console.error('[TransferService] Erreur lors de la récupération des destinataires:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('La requête a expiré. Veuillez réessayer.');
        } else if (error.message.includes('Failed to fetch')) {
          throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
        }
      }
      
      throw new Error('Erreur lors de la récupération des destinataires de transfert.');
    }
  }

  
  getUserBankAccounts(userId: string, recipients: TransferRecipientsResponse): string[] {
    const allUsers = [...recipients.players, ...recipients.enterprises];
    const user = allUsers.find(u => u.id === userId);
    return user ? user.bankAccounts.map(acc => acc.number) : [];
  }

  
  findUserByBankAccount(rib: string, recipients: TransferRecipientsResponse): User | null {
    const allUsers = [...recipients.players, ...recipients.enterprises];
    return allUsers.find(user => 
      user.bankAccounts.some(acc => acc.number === rib)
    ) || null;
  }
}


export const transferService = new TransferService(); 