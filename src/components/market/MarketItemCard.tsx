import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme-provider';
import { Plus, Minus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarketItem, useMarketStore } from '@/stores/marketStore';
import { useToast } from '@/hooks/use-toast';

interface MarketItemCardProps {
  item: MarketItem;
  onClick: () => void;
}

export function MarketItemCard({ item, onClick }: MarketItemCardProps) {
  const { isDark } = useTheme();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [displayValue, setDisplayValue] = useState('1');
  const [isAdded, setIsAdded] = useState(false);
  const addToCart = useMarketStore(state => state.addToCart);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(item, quantity);
    
    
    setIsAdded(true);
    
    
    toast({
      variant: "success",
      title: "Ajouté au panier",
      description: `${quantity} × ${item.name}`,
    });
  };

  
  useEffect(() => {
    if (isAdded) {
      const timer = setTimeout(() => {
        setIsAdded(false);
      }, 800); 
      
      return () => clearTimeout(timer);
    }
  }, [isAdded]);
  
  const incrementQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newQuantity = Math.min(quantity + 1, item.stock);
    setQuantity(newQuantity);
    setDisplayValue(newQuantity.toString());
  };
  
  const decrementQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newQuantity = Math.max(quantity - 1, 1);
    setQuantity(newQuantity);
    setDisplayValue(newQuantity.toString());
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = e.target.value;
    
    
    if (value === '' || /^\d+$/.test(value)) {
      setDisplayValue(value);
      
      
      if (value !== '') {
        const numValue = parseInt(value);
        if (numValue >= 1 && numValue <= item.stock) {
          setQuantity(numValue);
        }
      }
    }
  };

  const handleQuantityBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = e.target.value;
    
    if (value === '' || parseInt(value) < 1) {
      setQuantity(1);
      setDisplayValue('1');
    } else if (parseInt(value) > item.stock) {
      setQuantity(item.stock);
      setDisplayValue(item.stock.toString());
    } else {
      const numValue = parseInt(value);
      setQuantity(numValue);
      setDisplayValue(numValue.toString());
    }
  };
  
  return (
    <div 
      className={cn(
        "relative p-4 rounded-xl transition-all cursor-pointer",
        isDark 
          ? "bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#F0B90B]/60" 
          : "bg-white border border-[#E9E9E9] hover:border-[#F0B90B]/60 shadow-sm hover:shadow-md",
        "flex flex-col items-center"
      )}
      onClick={onClick}
    >
      <div className="w-full h-32 mb-2 flex items-center justify-center">
        <div className={cn(
          "w-24 h-24 rounded-md overflow-hidden flex items-center justify-center",
          isDark ? "bg-[#242424]" : "bg-[#F8F8F8]"
        )}>
          <img
            src={item.image}
            alt={item.name}
            className="w-16 h-16 object-contain"
          />
        </div>
      </div>
      
      <div className="text-center w-full">
        <h3 className={cn(
          "font-medium truncate",
          isDark ? "text-white" : "text-[#333333]"
        )}>
          {item.name}
        </h3>
        
        <p className="text-[#F0B90B] font-bold mt-1">
          {item.price}$ / unité
        </p>
        
        <p className={cn(
          "text-xs mt-1",
          isDark ? "text-gray-400" : "text-gray-500"
        )}>
          Stock: {item.stock}
        </p>
      </div>
      
      <div className="flex items-center mt-3 w-full">
        <div className={cn(
          "flex items-center rounded-lg overflow-hidden border flex-1",
          isDark 
            ? "bg-[#242424] border-[#3A3A3A]" 
            : "bg-[#F8F8F8] border-[#E9E9E9]"
        )}>
          <button
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className={cn(
              "p-1.5 flex items-center justify-center transition-colors",
              quantity <= 1 
                ? "opacity-50 cursor-not-allowed" 
                : isDark 
                  ? "hover:bg-[#333333]" 
                  : "hover:bg-[#EBEBEB]"
            )}
          >
            <Minus size={14} className={isDark ? "text-gray-400" : "text-gray-500"} />
          </button>
          
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            min="1"
            max={item.stock}
            value={displayValue}
            onChange={handleQuantityChange}
            onBlur={handleQuantityBlur}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "flex-1 text-center text-sm py-1 bg-transparent border-none outline-none",
              isDark ? "text-white" : "text-black"
            )}
            style={{ 
              width: '100%'
            }}
          />
          
          <button
            onClick={incrementQuantity}
            disabled={quantity >= item.stock}
            className={cn(
              "p-1.5 flex items-center justify-center transition-colors",
              quantity >= item.stock 
                ? "opacity-50 cursor-not-allowed" 
                : isDark 
                  ? "hover:bg-[#333333]" 
                  : "hover:bg-[#EBEBEB]"
            )}
          >
            <Plus size={14} className={isDark ? "text-gray-400" : "text-gray-500"} />
          </button>
        </div>
        
        <button
          onClick={handleAddToCart}
          className={cn(
            "ml-2 p-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center min-w-[68px]",
            isAdded 
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-[#F0B90B] hover:bg-[#E0A90A] text-white"
          )}
        >
          {isAdded ? (
            <>
              <Check size={14} className="mr-1" />
              Ajouté !
            </>
          ) : (
            "Ajouter"
          )}
        </button>
      </div>
    </div>
  );
} 