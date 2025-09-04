import { useState } from 'react';
import { useTheme } from '@/lib/theme-provider';
import { X, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMarketStore } from '@/stores/marketStore';
import { useUserStore } from '@/stores/userStore';
import { useToast } from '@/hooks/use-toast';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { isDark } = useTheme();
  const { toast } = useToast();
  
  const cart = useMarketStore(state => state.cart);
  const items = useMarketStore(state => state.items);
  const removeFromCart = useMarketStore(state => state.removeFromCart);
  const updateCartItemQuantity = useMarketStore(state => state.updateCartItemQuantity);
  const checkout = useMarketStore(state => state.checkout);
  
  const user = useUserStore(state => state);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    user.bankAccounts.find(account => account.isDefault)?.id || 
    (user.bankAccounts.length > 0 ? user.bankAccounts[0].id : null)
  );
  
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [tempQuantities, setTempQuantities] = useState<Record<string, string>>({});
  
  if (!isOpen) return null;
  
  
  const getItemStock = (itemId: string): number => {
    const marketItem = items.find(item => item.id === itemId);
    if (marketItem) {
      return marketItem.stock;
    }
    
    
    return 999;
  };
  
  const handleCheckout = async () => {
    if (!selectedAccountId) {
      toast({
        variant: "destructive",
        title: "Compte bancaire non sélectionné",
        description: "Veuillez sélectionner un compte bancaire pour finaliser l'achat."
      });
      return;
    }
    
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Panier vide",
        description: "Votre panier est vide. Ajoutez des articles avant de passer commande."
      });
      return;
    }
    
    try {
      if (!showConfirmation) {
        setShowConfirmation(true);
        return;
      }
      
      const order = await checkout(selectedAccountId);
      if (order) {
        toast({
          variant: "success",
          title: "Commande validée",
          description: `Votre commande #${order.id.slice(0, 8)} a été traitée avec succès.`
        });
        onClose();
        setShowConfirmation(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors du traitement de votre commande."
      });
    }
  };

  const getDisplayValue = (itemId: string, quantity: number) => {
    return tempQuantities[itemId] !== undefined ? tempQuantities[itemId] : quantity.toString();
  };

  const handleQuantityChange = (itemId: string, value: string) => {
    
    if (value === '' || /^\d+$/.test(value)) {
      setTempQuantities(prev => ({ ...prev, [itemId]: value }));
      
      
      if (value !== '') {
        const numValue = parseInt(value);
        const maxStock = getItemStock(itemId);
        const clampedValue = Math.max(1, Math.min(numValue, maxStock));
        
        if (numValue >= 1) {
          updateCartItemQuantity(itemId, clampedValue);
        }
      }
    }
  };

  const handleQuantityBlur = (itemId: string, value: string) => {
    const maxStock = getItemStock(itemId);
    
    if (value === '' || parseInt(value) < 1) {
      updateCartItemQuantity(itemId, 1);
      setTempQuantities(prev => ({ ...prev, [itemId]: '1' }));
    } else if (parseInt(value) > maxStock) {
      updateCartItemQuantity(itemId, maxStock);
      setTempQuantities(prev => ({ ...prev, [itemId]: maxStock.toString() }));
    } else {
      
      setTempQuantities(prev => {
        const newTemp = { ...prev };
        delete newTemp[itemId];
        return newTemp;
      });
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className={cn(
          "w-full max-w-xl max-h-[90vh] overflow-hidden rounded-xl flex flex-col",
          isDark ? "bg-[#1A1A1A] border border-[#2A2A2A]" : "bg-white border border-[#E9E9E9]"
        )}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <h2 className={isDark ? "text-white text-lg font-bold" : "text-[#333333] text-lg font-bold"}>
            Votre Panier
          </h2>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-full",
              isDark ? "hover:bg-[#2A2A2A]" : "hover:bg-gray-100"
            )}
          >
            <X size={20} className={isDark ? "text-gray-400" : "text-gray-500"} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                Votre panier est vide
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-[#F0B90B] hover:bg-[#E0A90A] text-white rounded-lg transition-colors"
              >
                Continuer vos achats
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => {
                const itemStock = getItemStock(item.itemId);
                return (
                <div 
                  key={item.itemId}
                  className={cn(
                    "p-3 rounded-lg flex items-center",
                    isDark ? "bg-[#242424] border border-[#3A3A3A]" : "bg-[#F8F8F8] border border-[#E9E9E9]"
                  )}
                >
                  <div className={cn(
                    "w-16 h-16 rounded overflow-hidden flex items-center justify-center mr-3",
                    isDark ? "bg-[#1A1A1A]" : "bg-white"
                  )}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={isDark ? "text-white font-medium" : "text-[#333333] font-medium"}>
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-[#F0B90B]">
                        {item.price}$ / unité
                      </p>
                      <p className={cn(
                        "font-bold",
                        isDark ? "text-white" : "text-[#333333]"
                      )}>
                        Prix total: {(item.price * item.quantity).toFixed(2)}$
                      </p>
                    </div>
                    <p className={cn(
                      "text-xs mt-1",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>
                      Stock disponible: {itemStock}
                    </p>
                  </div>
                  
                  <div className="flex items-center ml-3">
                    <div className={cn(
                      "flex items-center border rounded-lg overflow-hidden mr-2",
                      isDark ? "border-[#3A3A3A] bg-[#1A1A1A]" : "border-[#E9E9E9] bg-white"
                    )}>
                      <button
                        onClick={() => {
                          const newQuantity = Math.max(1, item.quantity - 1);
                          updateCartItemQuantity(item.itemId, newQuantity);
                          setTempQuantities(prev => ({ ...prev, [item.itemId]: newQuantity.toString() }));
                        }}
                        disabled={item.quantity <= 1}
                        className={cn(
                          "p-1 transition-colors",
                          item.quantity <= 1 
                            ? "opacity-50 cursor-not-allowed" 
                            : isDark 
                              ? "hover:bg-[#333333]" 
                              : "hover:bg-gray-100"
                        )}
                      >
                        <ChevronDown size={12} className={isDark ? "text-gray-400" : "text-gray-500"} />
                      </button>
                      
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="1"
                        max={itemStock}
                        value={getDisplayValue(item.itemId, item.quantity)}
                        onChange={(e) => handleQuantityChange(item.itemId, e.target.value)}
                        onBlur={(e) => handleQuantityBlur(item.itemId, e.target.value)}
                        className={cn(
                          "w-12 px-1 py-1 text-center text-sm bg-transparent border-none outline-none",
                          isDark ? "text-white" : "text-black"
                        )}
                      />
                      
                      <button
                        onClick={() => {
                          const newQuantity = Math.min(item.quantity + 1, itemStock);
                          updateCartItemQuantity(item.itemId, newQuantity);
                          setTempQuantities(prev => ({ ...prev, [item.itemId]: newQuantity.toString() }));
                        }}
                        disabled={item.quantity >= itemStock}
                        className={cn(
                          "p-1 transition-colors",
                          item.quantity >= itemStock
                            ? "opacity-50 cursor-not-allowed" 
                            : isDark 
                              ? "hover:bg-[#333333]" 
                              : "hover:bg-gray-100"
                        )}
                      >
                        <ChevronUp size={12} className={isDark ? "text-gray-400" : "text-gray-500"} />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.itemId)}
                      className={cn(
                        "p-2 rounded transition-colors",
                        isDark ? "hover:bg-[#333333]" : "hover:bg-gray-100"
                      )}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <label className={isDark ? "text-white" : "text-[#333333]"}>
                Choix du compte bancaire :
              </label>
              
              <select
                value={selectedAccountId || ''}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className={cn(
                  "p-2 rounded-lg border",
                  isDark 
                    ? "bg-[#242424] text-white border-[#3A3A3A]" 
                    : "bg-[#F8F8F8] text-[#333333] border-[#E9E9E9]"
                )}
              >
                {user.bankAccounts.length === 0 ? (
                  <option value="">Aucun compte disponible</option>
                ) : (
                  user.bankAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.number} ({account.balance}$)
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className={isDark ? "text-white font-bold" : "text-[#333333] font-bold"}>
                  Total : {totalAmount.toFixed(2)}$
                </span>
              </div>
              
              <button
                onClick={handleCheckout}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors",
                  showConfirmation 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "bg-[#F0B90B] hover:bg-[#E0A90A] text-white"
                )}
              >
                {showConfirmation ? 'Confirmer la commande' : 'Valider ma commande'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 