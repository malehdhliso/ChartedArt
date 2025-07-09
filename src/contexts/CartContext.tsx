import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type CartContextType = {
  itemCount: number;
  updateItemCount: () => Promise<void>;
};

const CartContext = createContext<CartContextType>({
  itemCount: 0,
  updateItemCount: async () => {},
});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itemCount, setItemCount] = useState(0);

  const updateItemCount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setItemCount(0);
        return;
      }

      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (cart) {
        const { data: items, error } = await supabase
          .from('cart_items')
          .select('quantity')
          .eq('cart_id', cart.id);

        if (error) throw error;

        const count = items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
        setItemCount(count);
      } else {
        setItemCount(0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setItemCount(0);
    }
  };

  useEffect(() => {
    updateItemCount();

    // Subscribe to cart changes
    const cartChannel = supabase
      .channel('cart_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items'
        },
        () => {
          updateItemCount();
        }
      )
      .subscribe();

    return () => {
      cartChannel.unsubscribe();
    };
  }, []);

  return (
    <CartContext.Provider value={{ itemCount, updateItemCount }}>
      {children}
    </CartContext.Provider>
  );
}