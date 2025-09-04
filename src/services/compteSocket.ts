import { io } from 'socket.io-client';


const generateUUID = (): string => {
  
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const socket = io('http://82.23.190.137:4300/banks');

type DeleteAccountData = { id: string; rib: string };
type SetDefaultAccountData = { id: string; rib: string };
type CreateBankAccountData = { balance: number };
type SocketResponse = { success?: boolean; message?: string; [key: string]: any };

socket.on("connect", () => {
  console.log("connected to banks socket");
});

socket.on("connect_error", (err) => {
  console.error("banks socket connection error:", err.message);
});

export const accountSocketService = {
  deleteAccount(data: DeleteAccountData) {
    return new Promise((resolve, reject) => {
      const deleteAccountData = {
        id: generateUUID(),
        rib: data.rib
      };

      console.log("suppression de compte :", deleteAccountData);
      
      socket.emit("account:delete", deleteAccountData, (response: SocketResponse) => {
        console.log("réponse suppression compte", response);
        if (response?.success) {
          resolve(response);
        } else {
          reject(new Error(response?.message || 'Suppression du compte annulée'));
        }
      });

      
      setTimeout(() => {
        reject(new Error('Account deletion timeout'));
      }, 30000);
    });
  },

  setDefaultAccount(data: SetDefaultAccountData) {
    return new Promise((resolve, reject) => {
      const setDefaultAccountData = {
        id: generateUUID(),
        rib: data.rib
      };

      console.log("définition compte par défaut :", setDefaultAccountData);
      
      socket.emit("account:setdefault", setDefaultAccountData, (response: SocketResponse) => {
        console.log("réponse compte par défaut", response);
        if (response?.success) {
          resolve(response);
        } else {
          reject(new Error(response?.message || 'Définition du compte par défaut annulée'));
        }
      });

      
      setTimeout(() => {
        reject(new Error('Set default account timeout'));
      }, 30000);
    });
  },

  createBankAccount(data: CreateBankAccountData) {
    return new Promise((resolve, reject) => {
      const createAccountData = {
        id: generateUUID(),
        balance: data.balance
      };

      console.log("création de compte :", createAccountData);
      
      socket.emit("account:create", createAccountData, (response: SocketResponse) => {
        console.log("réponse création compte", response);
        if (response?.success) {
          resolve(response);
        } else {
          reject(new Error(response?.message || 'Création du compte annulée'));
        }
      });

      
      setTimeout(() => {
        reject(new Error('Account creation timeout'));
      }, 30000);
    });
  },

  isConnected() {
    return socket.connected;
  },

  disconnect() {
    socket.disconnect();
  }
}; 