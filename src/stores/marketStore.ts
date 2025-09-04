import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface MarketItem {
  id: string;
  name: string;
  image: string;
  price: number;
  description?: string;
  category: string;
  stock: number;
  priceHistory: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

export interface CartItem {
  itemId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  accountId: string;
}

interface MarketState {
  items: MarketItem[];
  isLoading: boolean;
  error: string | null;
  cart: CartItem[];
  orders: Order[];
  selectedTimeframe: '1h' | '24h' | '7d' | '30d' | 'all';
  
  fetchItems: () => Promise<void>;
  addToCart: (item: MarketItem, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: (accountId: string) => Promise<Order | null>;
  setSelectedTimeframe: (timeframe: '1h' | '24h' | '7d' | '30d' | 'all') => void;
  _rehydrateOrdersImages: () => void;
}

// data
const mockItems: MarketItem[] = [
  {
    id: '1',
    name: 'Diamant',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_diamond.png',
    price: 705,
    category: 'minerais',
    stock: 64,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 690 + Math.random() * 20,
      high: 700 + Math.random() * 30,
      low: 680 + Math.random() * 15,
      close: 705 + Math.random() * 25 - 12.5,
      volume: 100 + Math.random() * 50
    }))
  },
  {
    id: '2',
    name: 'Fer',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_iron_ingot.png',
    price: 120,
    category: 'minerais',
    stock: 128,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 115 + Math.random() * 10,
      high: 125 + Math.random() * 10,
      low: 110 + Math.random() * 5,
      close: 120 + Math.random() * 10 - 5,
      volume: 300 + Math.random() * 100
    }))
  },
  {
    id: '3',
    name: 'Or',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_gold_ingot.png',
    price: 250,
    category: 'minerais',
    stock: 64,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 240 + Math.random() * 15,
      high: 255 + Math.random() * 10,
      low: 235 + Math.random() * 10,
      close: 250 + Math.random() * 20 - 10,
      volume: 150 + Math.random() * 50
    }))
  },
  {
    id: '4',
    name: 'Émeraude',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_emerald.png',
    price: 1200,
    category: 'minerais',
    stock: 32,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 1180 + Math.random() * 40,
      high: 1220 + Math.random() * 30,
      low: 1170 + Math.random() * 20,
      close: 1200 + Math.random() * 50 - 25,
      volume: 50 + Math.random() * 20
    }))
  },
  {
    id: '5',
    name: 'Blé',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_wheat.png',
    price: 15,
    category: 'agriculture',
    stock: 320,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 14 + Math.random() * 2,
      high: 16 + Math.random() * 1,
      low: 14 + Math.random() * 1,
      close: 15 + Math.random() * 2 - 1,
      volume: 500 + Math.random() * 200
    }))
  },
  {
    id: '6',
    name: 'Laine',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_white_wool.png',
    price: 30,
    category: 'ressources',
    stock: 128,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 28 + Math.random() * 3,
      high: 31 + Math.random() * 2,
      low: 27 + Math.random() * 2,
      close: 30 + Math.random() * 4 - 2,
      volume: 200 + Math.random() * 100
    }))
  },
  {
    id: '7',
    name: 'Bois de chêne',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_oak_log.png',
    price: 20,
    category: 'ressources',
    stock: 256,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 19 + Math.random() * 2,
      high: 21 + Math.random() * 1,
      low: 18 + Math.random() * 1,
      close: 20 + Math.random() * 2 - 1,
      volume: 400 + Math.random() * 150
    }))
  },
  {
    id: '8',
    name: 'Cuir',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_leather.png',
    price: 40,
    category: 'ressources',
    stock: 64,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 38 + Math.random() * 3,
      high: 42 + Math.random() * 2,
      low: 37 + Math.random() * 2,
      close: 40 + Math.random() * 4 - 2,
      volume: 150 + Math.random() * 50
    }))
  },
  {
    id: '9',
    name: 'Obsidienne',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_obsidian.png',
    price: 350,
    category: 'minerais',
    stock: 16,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 340 + Math.random() * 15,
      high: 355 + Math.random() * 10,
      low: 335 + Math.random() * 10,
      close: 350 + Math.random() * 20 - 10,
      volume: 30 + Math.random() * 15
    }))
  },
  {
    id: '10',
    name: 'Redstone',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_redstone.png',
    price: 80,
    category: 'ressources',
    stock: 128,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 78 + Math.random() * 5,
      high: 83 + Math.random() * 3,
      low: 76 + Math.random() * 3,
      close: 80 + Math.random() * 6 - 3,
      volume: 120 + Math.random() * 40
    }))
  },
  {
    id: '11',
    name: 'Charbon',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_coal.png',
    price: 35,
    category: 'minerais',
    stock: 256,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 32 + Math.random() * 4,
      high: 36 + Math.random() * 2,
      low: 30 + Math.random() * 2,
      close: 35 + Math.random() * 4 - 2,
      volume: 300 + Math.random() * 100
    }))
  },
  {
    id: '12',
    name: 'Pierre',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_stone.png',
    price: 5,
    category: 'ressources',
    stock: 512,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 4 + Math.random() * 2,
      high: 6 + Math.random() * 1,
      low: 4 + Math.random() * 1,
      close: 5 + Math.random() * 2 - 1,
      volume: 600 + Math.random() * 200
    }))
  },
  {
    id: '13',
    name: 'Brique',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_brick.png',
    price: 25,
    category: 'ressources',
    stock: 128,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 23 + Math.random() * 3,
      high: 27 + Math.random() * 2,
      low: 22 + Math.random() * 2,
      close: 25 + Math.random() * 4 - 2,
      volume: 120 + Math.random() * 40
    }))
  },
  {
    id: '14',
    name: 'Pain',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_bread.png',
    price: 18,
    category: 'agriculture',
    stock: 200,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 16 + Math.random() * 2,
      high: 19 + Math.random() * 1,
      low: 16 + Math.random() * 1,
      close: 18 + Math.random() * 2 - 1,
      volume: 400 + Math.random() * 100
    }))
  },
  {
    id: '15',
    name: 'Pomme',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_apple.png',
    price: 22,
    category: 'agriculture',
    stock: 100,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 20 + Math.random() * 2,
      high: 24 + Math.random() * 1,
      low: 20 + Math.random() * 1,
      close: 22 + Math.random() * 2 - 1,
      volume: 150 + Math.random() * 50
    }))
  },
  {
    id: '16',
    name: 'Carotte',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_carrot.png',
    price: 12,
    category: 'agriculture',
    stock: 180,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 11 + Math.random() * 2,
      high: 13 + Math.random() * 1,
      low: 11 + Math.random() * 1,
      close: 12 + Math.random() * 2 - 1,
      volume: 200 + Math.random() * 60
    }))
  },
  {
    id: '17',
    name: 'Patate',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_potato.png',
    price: 10,
    category: 'agriculture',
    stock: 220,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 9 + Math.random() * 2,
      high: 11 + Math.random() * 1,
      low: 9 + Math.random() * 1,
      close: 10 + Math.random() * 2 - 1,
      volume: 250 + Math.random() * 70
    }))
  },
  {
    id: '18',
    name: 'Oeuf',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_egg.png',
    price: 8,
    category: 'agriculture',
    stock: 300,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 7 + Math.random() * 2,
      high: 9 + Math.random() * 1,
      low: 7 + Math.random() * 1,
      close: 8 + Math.random() * 2 - 1,
      volume: 350 + Math.random() * 80
    }))
  },
  {
    id: '19',
    name: 'Bâton',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_stick.png',
    price: 3,
    category: 'ressources',
    stock: 400,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 2 + Math.random() * 1,
      high: 4 + Math.random() * 1,
      low: 2 + Math.random() * 1,
      close: 3 + Math.random() * 2 - 1,
      volume: 500 + Math.random() * 100
    }))
  },
  {
    id: '20',
    name: 'Plume',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_feather.png',
    price: 7,
    category: 'ressources',
    stock: 120,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 6 + Math.random() * 2,
      high: 8 + Math.random() * 1,
      low: 6 + Math.random() * 1,
      close: 7 + Math.random() * 2 - 1,
      volume: 100 + Math.random() * 30
    }))
  },
  {
    id: '21',
    name: 'Sable',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_sand.png',
    price: 6,
    category: 'ressources',
    stock: 300,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 5 + Math.random() * 2,
      high: 7 + Math.random() * 1,
      low: 5 + Math.random() * 1,
      close: 6 + Math.random() * 2 - 1,
      volume: 350 + Math.random() * 80
    }))
  },
  {
    id: '22',
    name: 'Verre',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_glass.png',
    price: 12,
    category: 'ressources',
    stock: 180,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 11 + Math.random() * 2,
      high: 13 + Math.random() * 1,
      low: 11 + Math.random() * 1,
      close: 12 + Math.random() * 2 - 1,
      volume: 200 + Math.random() * 60
    }))
  },
  {
    id: '23',
    name: 'Gravier',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_gravel.png',
    price: 4,
    category: 'ressources',
    stock: 250,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 3 + Math.random() * 2,
      high: 5 + Math.random() * 1,
      low: 3 + Math.random() * 1,
      close: 4 + Math.random() * 2 - 1,
      volume: 300 + Math.random() * 70
    }))
  },
  {
    id: '24',
    name: 'Silex',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_flint.png',
    price: 15,
    category: 'ressources',
    stock: 90,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 14 + Math.random() * 2,
      high: 16 + Math.random() * 1,
      low: 14 + Math.random() * 1,
      close: 15 + Math.random() * 2 - 1,
      volume: 100 + Math.random() * 30
    }))
  },
  {
    id: '25',
    name: 'Lingot de cuivre',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_copper_ingot.png',
    price: 60,
    category: 'minerais',
    stock: 100,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 58 + Math.random() * 4,
      high: 62 + Math.random() * 2,
      low: 56 + Math.random() * 2,
      close: 60 + Math.random() * 4 - 2,
      volume: 120 + Math.random() * 40
    }))
  },
  {
    id: '26',
    name: 'Lingot de netherite',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_netherite_ingot.png',
    price: 5000,
    category: 'minerais',
    stock: 8,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 4900 + Math.random() * 200,
      high: 5100 + Math.random() * 100,
      low: 4800 + Math.random() * 100,
      close: 5000 + Math.random() * 200 - 100,
      volume: 10 + Math.random() * 5
    }))
  },
  {
    id: '27',
    name: 'Quartz du Nether',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_quartz.png',
    price: 55,
    category: 'minerais',
    stock: 120,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 53 + Math.random() * 4,
      high: 57 + Math.random() * 2,
      low: 51 + Math.random() * 2,
      close: 55 + Math.random() * 4 - 2,
      volume: 100 + Math.random() * 30
    }))
  },
  {
    id: '28',
    name: 'Boule de neige',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_snowball.png',
    price: 2,
    category: 'ressources',
    stock: 300,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 1 + Math.random() * 1,
      high: 3 + Math.random() * 1,
      low: 1 + Math.random() * 1,
      close: 2 + Math.random() * 2 - 1,
      volume: 200 + Math.random() * 60
    }))
  },
  {
    id: '29',
    name: 'Brique du Nether',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_nether_brick.png',
    price: 40,
    category: 'ressources',
    stock: 80,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 38 + Math.random() * 4,
      high: 42 + Math.random() * 2,
      low: 36 + Math.random() * 2,
      close: 40 + Math.random() * 4 - 2,
      volume: 60 + Math.random() * 20
    }))
  },
  {
    id: '30',
    name: 'Bloc de slime',
    image: 'https://mc.nerothe.com/img/1.21.4/minecraft_slime_block.png',
    price: 120,
    category: 'ressources',
    stock: 30,
    priceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      open: 115 + Math.random() * 10,
      high: 125 + Math.random() * 5,
      low: 110 + Math.random() * 5,
      close: 120 + Math.random() * 10 - 5,
      volume: 20 + Math.random() * 10
    }))
  }
];

export const useMarketStore = create<MarketState>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        isLoading: false,
        error: null,
        cart: [],
        orders: [],
        selectedTimeframe: '24h',
        
        _rehydrateOrdersImages: () => {
          const items = get().items.length > 0 ? get().items : mockItems;
          set(state => ({
            orders: state.orders.map(order => ({
              ...order,
              items: order.items.map(cartItem => {
                const found = items.find(i => i.id === cartItem.itemId);
                return found ? { ...cartItem, image: found.image } : cartItem;
              })
            }))
          }));
        },
        
        fetchItems: async () => {
          set({ isLoading: true, error: null });
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            

            const updatedItems = mockItems.map(item => {
              const randomFactor = 0.95 + Math.random() * 0.1;
              return {
                ...item,
                price: Math.round(item.price * randomFactor)
              };
            });
            
            set({ items: updatedItems, isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : "Une erreur est survenue", 
              isLoading: false 
            });
          }
        },
        
        addToCart: (item, quantity) => {
          const cart = get().cart;
          const existingItem = cart.find(cartItem => cartItem.itemId === item.id);
          
          if (existingItem) {
            set({
              cart: cart.map(cartItem => 
                cartItem.itemId === item.id 
                  ? { ...cartItem, quantity: cartItem.quantity + quantity } 
                  : cartItem
              )
            });
          } else {
            set({
              cart: [
                ...cart,
                {
                  itemId: item.id,
                  name: item.name,
                  price: item.price,
                  quantity,
                  image: item.image
                }
              ]
            });
          }
        },
        
        removeFromCart: (itemId) => {
          const cart = get().cart;
          set({
            cart: cart.filter(item => item.itemId !== itemId)
          });
        },
        
        updateCartItemQuantity: (itemId, quantity) => {
          const cart = get().cart;
          if (quantity <= 0) {
            set({
              cart: cart.filter(item => item.itemId !== itemId)
            });
          } else {
            set({
              cart: cart.map(item => 
                item.itemId === itemId ? { ...item, quantity } : item
              )
            });
          }
        },
        
        clearCart: () => {
          set({ cart: [] });
        },
        
        checkout: async (accountId) => {
          const cart = get().cart;
          const orders = get().orders;
          
          if (cart.length === 0) {
            return null;
          }
          
          const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          const newOrder: Order = {
            id: `order-${Date.now()}`,
            items: [...cart],
            total,
            date: new Date().toISOString(),
            status: 'completed',
            accountId
          };
          
          set({
            orders: [newOrder, ...orders],
            cart: []
          });
          
          return newOrder;
        },
        
        setSelectedTimeframe: (timeframe) => {
          set({ selectedTimeframe: timeframe });
        }
      }),
      {
        name: 'market-storage',
        partialize: (state) => ({ 
          cart: state.cart,
          orders: state.orders,
          selectedTimeframe: state.selectedTimeframe
        }),
        onRehydrateStorage: () => (state) => {
          setTimeout(() => {
            if (state && typeof state._rehydrateOrdersImages === 'function') {
              state._rehydrateOrdersImages();
            }
          }, 0);
        }
      }
    )
  )
); 