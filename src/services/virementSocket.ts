import { io } from 'socket.io-client';

const socket = io('http://82.23.190.137:4300/banks');
const callbacks = new Map();

type Transaction = { from: string; to: string; amount: number };

socket.on('transaction:validated', d => {
  if (d?.id && callbacks.has(d.id)) {
    const { setTimeoutId } = callbacks.get(d.id);
    clearTimeout(setTimeoutId);

    callbacks.get(d.id).resolve();
    callbacks.delete(d.id);
  }
});

socket.on('transaction:cancelled', d => {
  if (d?.id && callbacks.has(d.id)) {
    const { setTimeoutId } = callbacks.get(d.id);
    clearTimeout(setTimeoutId);

    callbacks.get(d.id).reject(new Error('Transaction annulée'));
    callbacks.delete(d.id);
  }
});

export const bankSocketService = {
  initiateTransaction(t: Transaction) {
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      
      const setTimeoutId = setTimeout(() => {
        if (callbacks.has(id)) {
          callbacks.delete(id);
          reject(new Error('Transaction timeout'));
        }
      }, 30000);

      callbacks.set(id, { resolve, reject, setTimeoutId });
  
      socket.emit("transaction:initiate", { id, transactions: [t] });
    });
  },

  isConnected() {
    return socket.connected;
  },

  disconnect() {
    socket.disconnect();
  }
}; 


/*

transaction:initiate
---->
> stock dans la Map
> lance le setTimeout (30s)

TIMEOUT
> Au bout de 30 secondes :
- Supprimer la transaction de la Map
- Erreur

transaction:validated 
<---- (1 seconde)
> Supprimer la transaction de la Map
> Validation
> ... setTimeout va se declencher dans 29 secondes

*/ 