import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTheme } from '@/lib/theme-provider';
import { Search, ShoppingCart, FilterIcon, History, X, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarketItemCard } from '@/components/market/MarketItemCard';
import { MarketStatsModal } from '@/components/market/MarketStatsModal';
import { MarketItem, useMarketStore } from '@/stores/marketStore';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useUserStore } from '@/stores/userStore';
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

const ITEMS_PER_PAGE = 15;

interface CartContentProps {
  onClose: () => void;
}

function CartContent({ onClose }: CartContentProps) {
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

  if (cart.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-4">
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
              
              <div className="flex items-center">
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
                  <Trash2 size={16} className={isDark ? "text-gray-400" : "text-gray-500"} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
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
    </div>
  );
}

function PriceSlider({ min, max, value, onChange }: { min: number, max: number, value: [number, number], onChange: (v: [number, number]) => void }) {
  return (
    <div className="flex flex-col gap-3 py-2">
      <div className="flex justify-between font-medium">
        <span>Prix: {value[0]}$</span>
        <span>{value[1]}$</span>
      </div>
      <div className="relative h-4 mt-1">
        <div className="absolute w-full h-1 bg-gray-300 dark:bg-gray-700 rounded-full top-1/2 -translate-y-1/2"></div>
        <div 
          className="absolute h-1 bg-[#F0B90B] rounded-full top-1/2 -translate-y-1/2" 
          style={{ 
            left: `${((value[0] - min) / (max - min)) * 100}%`, 
            right: `${100 - ((value[1] - min) / (max - min)) * 100}%` 
          }}
        ></div>
        <input
          type="range"
          min={min}
          max={max}
          value={value[0]}
          onChange={e => {
            const newMin = Number(e.target.value);
            if (newMin <= value[1]) {
              onChange([newMin, value[1]]);
            }
          }}
          className="absolute w-full h-4 appearance-none bg-transparent pointer-events-none z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#F0B90B] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#F0B90B] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
          style={{ touchAction: 'none' }}
          step={1}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value[1]}
          onChange={e => {
            const newMax = Number(e.target.value);
            if (newMax >= value[0]) {
              onChange([value[0], newMax]);
            }
          }}
          className="absolute w-full h-4 appearance-none bg-transparent pointer-events-none z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#F0B90B] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#F0B90B] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
          style={{ touchAction: 'none' }}
          step={1}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>Min: {min}$</span>
        <span>Max: {max}$</span>
      </div>
    </div>
  );
}

export default function MarketPage() {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const { 
    items: storeItems, 
    isLoading, 
    error, 
    fetchItems,
    cart
  } = useMarketStore(state => state);
  
  
  const testItems = useMemo((): MarketItem[] => {
    const categories = ['armes', 'armures', 'potions', 'matériaux', 'bijoux', 'outils', 'nourriture', 'livres'];
    const rareties = ['commun', 'rare', 'épique', 'légendaire'];
    
    return Array.from({ length: 100 }, (_, index) => {
      
      const priceBase = index * 47; 
      const price = (priceBase % 4800) + 2;
      const stockBase = index * 23;
      const stock = (stockBase % 50) + 1;
      
      return {
      id: `test-item-${index + 1}`,
      name: `TEST item ${index + 1}`,
      description: `test (${index + 1}/100)`,
        price: price,
      image: `https://mc.nerothe.com/img/1.21.4/minecraft_grass_block.png`,
      category: categories[index % categories.length],
      rarity: rareties[index % rareties.length],
        stock: stock,
        priceHistory: Array.from({ length: 30 }, (_, i) => {
          const historyBase = (index + i) * 73;
          return {
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
            open: (historyBase % 5000),
            high: ((historyBase + 100) % 5000),
            low: (Math.abs(historyBase - 100) % 5000),
            close: ((historyBase + 50) % 5000),
            volume: (historyBase % 100)
          };
        })
      };
    });
  }, []); 
  const items = [...storeItems, ...testItems];
  
  const allPrices = items.map(i => i.price);
  const minPrice = allPrices.length ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length ? Math.max(...allPrices) : 1000;
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);
  
  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);
  
  const filteredItems = items.filter(item => {
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    return matchesQuery && matchesCategory && matchesPrice;
  });
  
  
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  const categories = Array.from(new Set(items.map(item => item.category)));
  
  useEffect(() => {
    const loadItems = async () => {
      await fetchItems();
    };
    
    loadItems();
    
    const interval = setInterval(() => {
      fetchItems();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchItems]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceRange]);
  
  const handleItemClick = (item: MarketItem) => {
    setSelectedItem(item);
    setShowStatsModal(true);
  };
  
  const renderItems = () => {
    if (isLoading && currentPage === 1) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <div 
              key={index}
              className={`rounded-xl p-4 w-full animate-subtle-pulse ${
                isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-white border border-[#E9E9E9] shadow-sm'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-24 h-24 rounded-md mb-4 ${isDark ? 'bg-[#242424]' : 'bg-[#F8F8F8]'}`}></div>
                <div className={`h-5 w-3/4 rounded mb-2 ${isDark ? 'bg-[#242424]' : 'bg-[#F8F8F8]'}`}></div>
                <div className={`h-4 w-1/2 rounded mb-4 ${isDark ? 'bg-[#242424]' : 'bg-[#F8F8F8]'}`}></div>
                <div className={`h-8 w-full rounded ${isDark ? 'bg-[#242424]' : 'bg-[#F8F8F8]'}`}></div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (error) {
      return (
        <div className={`p-6 rounded-xl text-center ${
          isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-white border border-[#E9E9E9] shadow-sm'
        }`}>
          <p className="text-red-500 mb-2">Une erreur est survenue lors du chargement des items</p>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{error}</p>
          <button
            onClick={() => fetchItems()}
            className="mt-4 px-4 py-2 bg-[#F0B90B] hover:bg-[#E0A90A] text-white rounded-md"
          >
            Réessayer
          </button>
        </div>
      );
    }
    
    if (filteredItems.length === 0) {
      return (
        <div className={`p-6 rounded-xl text-center ${
          isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-white border border-[#E9E9E9] shadow-sm'
        }`}>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Aucun item ne correspond à votre recherche
          </p>
          {searchQuery || selectedCategory ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="mt-4 px-4 py-2 bg-[#F0B90B] hover:bg-[#E0A90A] text-white rounded-md"
            >
              Réinitialiser les filtres
            </button>
          ) : null}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {displayedItems.map((item) => (
            <MarketItemCard
              key={item.id}
              item={item}
              onClick={() => handleItemClick(item)}
            />
          ))}
          </div>
    );
  };
  
  const renderOrders = () => {
    const orders = useMarketStore(state => state.orders);
    
    if (orders.length === 0) {
      return (
        <div className={`p-6 rounded-xl text-center ${
          isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-white border border-[#E9E9E9] shadow-sm'
        }`}>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Vous n'avez pas encore passé de commande
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {orders.map(order => (
          <div
            key={order.id}
            className={cn(
              "p-4 rounded-xl",
              isDark ? "bg-[#1A1A1A] border border-[#2A2A2A]" : "bg-white border border-[#E9E9E9] shadow-sm"
            )}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className={isDark ? "text-white font-bold" : "text-[#333333] font-bold"}>
                  Commande #{order.id.slice(0, 8)}
                </h3>
                <p className={isDark ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>
                  {new Date(order.date).toLocaleString()}
                </p>
              </div>
              <div className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                order.status === 'completed' 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : order.status === 'pending'
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              )}>
                {order.status === 'completed' ? 'Complétée' : 
                 order.status === 'pending' ? 'En attente' : 'Annulée'}
              </div>
            </div>
            
            <div className={cn(
              "p-3 rounded-lg mb-3",
              isDark ? "bg-[#242424]" : "bg-[#F8F8F8]"
            )}>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {order.items.map(item => (
                  <li key={item.itemId} className="py-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={cn(
                        "w-8 h-8 rounded mr-2 flex items-center justify-center",
                        isDark ? "bg-[#1A1A1A]" : "bg-white"
                      )}>
                        <img src={item.image} alt={item.name} className="w-6 h-6 object-contain" />
                      </div>
                      <span className={isDark ? "text-white" : "text-[#333333]"}>
                        {item.name} x{item.quantity}
                      </span>
                    </div>
                    <span className="text-[#F0B90B] font-medium">
                      {(item.price * item.quantity).toFixed(2)}$
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex justify-end">
              <span className={isDark ? "text-white font-bold" : "text-[#333333] font-bold"}>
                Total: {order.total.toFixed(2)}$
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderFilters = () => {
    return (
      <div className="p-4 rounded-xl">
        <h3 className={isDark ? "text-white font-bold mb-4" : "text-[#333333] font-bold mb-4"}>
          Filtres
        </h3>
        <div className="space-y-4">
          <div>
            <label className={isDark ? "text-gray-300 block mb-2" : "text-gray-700 block mb-2"}>
              Catégorie
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "p-2 rounded-lg text-sm",
                  selectedCategory === null
                    ? "bg-[#F0B90B] text-white"
                    : isDark
                      ? "bg-[#242424] text-gray-300 hover:bg-[#2A2A2A]"
                      : "bg-[#F5F5F5] text-gray-700 hover:bg-[#EBEBEB]"
                )}
              >
                Toutes
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "p-2 rounded-lg text-sm truncate",
                    selectedCategory === category
                      ? "bg-[#F0B90B] text-white"
                      : isDark
                        ? "bg-[#242424] text-gray-300 hover:bg-[#2A2A2A]"
                        : "bg-[#F5F5F5] text-gray-700 hover:bg-[#EBEBEB]"
                  )}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={isDark ? "text-gray-300 block mb-2" : "text-gray-700 block mb-2"}>
              Prix
            </label>
            <PriceSlider min={minPrice} max={maxPrice} value={priceRange} onChange={setPriceRange} />
          </div>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
                setPriceRange([minPrice, maxPrice]);
              }}
              className="w-full p-2 bg-[#F0B90B] hover:bg-[#E0A90A] text-white rounded-lg transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4 md:gap-0">
          <div className="flex flex-row gap-2 md:w-auto">
            <Dialog open={showOrdersModal} onOpenChange={setShowOrdersModal}>
              <DialogTrigger asChild>
                <button
                  className={cn(
                    'flex items-center h-12 px-5 rounded-xl border transition-colors font-medium text-base w-1/2 md:w-auto',
                    isDark ? 'bg-[#242424] text-white border-[#3A3A3A] hover:bg-[#2A2A2A]' : 'bg-[#F8F8F8] text-[#333333] border-[#E9E9E9] hover:bg-[#EBEBEB]'
                  )}
                >
                  <History size={20} className="mr-2" /> Commandes
                </button>
              </DialogTrigger>
              <DialogContent className={cn("max-w-2xl p-0 overflow-hidden", isDark ? "bg-[#1A1A1A] border border-[#2A2A2A]" : "bg-white border border-[#E9E9E9]") }>
                <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                  <h2 className={isDark ? 'text-white text-lg font-bold' : 'text-[#333333] text-lg font-bold'}>
                    Historique des commandes
                  </h2>
                  <DialogClose className={cn(
                    "p-2 rounded-full",
                    isDark ? "hover:bg-[#2A2A2A]" : "hover:bg-gray-100"
                  )}>
                    <X size={20} className={isDark ? "text-gray-400" : "text-gray-500"} />
                  </DialogClose>
                </div>
                <div className="p-4">
                  <div className="max-h-[60vh] overflow-y-auto">
                    {renderOrders()}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Popover open={showFilters && window.innerWidth < 768} onOpenChange={(open) => {
              if (window.innerWidth < 768) setShowFilters(open);
            }}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    'flex items-center h-12 px-5 rounded-xl border transition-colors font-medium text-base w-1/2 md:hidden',
                    isDark ? 'bg-[#242424] text-white border-[#3A3A3A] hover:bg-[#2A2A2A]' : 'bg-[#F8F8F8] text-[#333333] border-[#E9E9E9] hover:bg-[#EBEBEB]'
                  )}
                >
                  <FilterIcon size={20} className="mr-2" /> Filtres
                </button>
              </PopoverTrigger>
              <PopoverContent className={cn("max-w-md p-0 overflow-hidden", isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-200")}> 
                {renderFilters()}
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full md:w-auto">
            <div className="w-full md:w-auto order-2 md:order-1">
              <div className={cn(
                'relative flex items-center rounded-xl overflow-hidden border transition-all w-full md:w-80 h-12',
                isDark
                  ? 'bg-[#242424] text-white border-[#3A3A3A]'
                  : 'bg-[#F8F8F8] text-gray-700 border-[#E9E9E9]',
                isFocused && (isDark
                  ? 'border-[#F0B90B]/50 ring-1 ring-[#F0B90B]/50'
                  : 'border-[#F0B90B]/50 ring-1 ring-[#F0B90B]/50')
              )}>
                <div className="px-3">
                  <Search className={cn(
                    'h-5 w-5',
                    isFocused ? 'text-[#F0B90B]' : 'text-gray-400'
                  )} />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className={cn(
                    'p-2 pr-3 text-sm outline-none min-w-0 flex-1 bg-transparent h-full',
                    '[&::placeholder]:text-[#888888]'
                  )}
                />
              </div>
            </div>
            <button
              onClick={() => setShowCartModal(true)}
              className="hidden md:flex relative items-center justify-center h-12 w-12 rounded-xl bg-[#F0B90B] hover:bg-[#E0A90A] text-white transition-colors order-3 md:order-2"
              style={{ minWidth: 48 }}
            >
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
            <Popover open={showFilters && window.innerWidth >= 768} onOpenChange={(open) => {
              if (window.innerWidth >= 768) setShowFilters(open);
            }}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    'hidden md:flex items-center h-12 px-5 rounded-xl border transition-colors font-medium text-base order-4 md:order-3',
                    isDark ? 'bg-[#242424] text-white border-[#3A3A3A] hover:bg-[#2A2A2A]' : 'bg-[#F8F8F8] text-[#333333] border-[#E9E9E9] hover:bg-[#EBEBEB]'
                  )}
                >
                  <FilterIcon size={20} className="mr-2" /> Filtres
                </button>
              </PopoverTrigger>
              <PopoverContent className={cn("max-w-md p-0 overflow-hidden", isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-200")}> 
                {renderFilters()}
              </PopoverContent>
            </Popover>
          </div>
          <button
            onClick={() => setShowCartModal(true)}
            className="block md:hidden fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full shadow-lg bg-[#F0B90B] hover:bg-[#E0A90A] flex items-center justify-center transition-colors p-0 m-0"
            style={{ minWidth: 48 }}
            title="Voir le panier"
          >
            <ShoppingCart size={22} className="text-black" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
        <div className="mb-8">
          {renderItems()}
        </div>
        
        {/* Pagination */}
        {filteredItems.length > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-8">
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
        {selectedItem && (
          <MarketStatsModal
            item={selectedItem}
            isOpen={showStatsModal}
            onClose={() => setShowStatsModal(false)}
          />
        )}
        <Dialog open={showCartModal} onOpenChange={setShowCartModal}>
          <DialogContent className={cn("max-w-xl p-0 overflow-hidden", isDark ? "bg-[#1A1A1A] border border-[#2A2A2A]" : "bg-white border border-[#E9E9E9]") }>
            <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
              <h2 className={isDark ? 'text-white text-lg font-bold' : 'text-[#333333] text-lg font-bold'}>
                Votre Panier
              </h2>
              <DialogClose className={cn(
                "p-2 rounded-full",
                isDark ? "hover:bg-[#2A2A2A]" : "hover:bg-gray-100"
              )}>
                <X size={20} className={isDark ? "text-gray-400" : "text-gray-500"} />
              </DialogClose>
            </div>
            <div className="p-4">
              <div className="max-h-[60vh] overflow-y-auto">
                <CartContent onClose={() => setShowCartModal(false)} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
} 