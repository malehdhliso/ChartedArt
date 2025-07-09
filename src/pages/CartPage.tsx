import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Trash2 } from 'lucide-react';
import type { Database } from '@/lib/supabase/types';

type CartItem = Database['public']['Tables']['cart_items']['Row'] & {
  products: Database['public']['Tables']['products']['Row']
};

export default function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth/login');
          return;
        }

        // Use maybeSingle() instead of single() to handle the case where no cart exists
        const { data: cart, error: cartError } = await supabase
          .from('carts')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (cartError) {
          throw cartError;
        }

        if (cart) {
          const { data: cartItems, error: itemsError } = await supabase
            .from('cart_items')
            .select(`
              *,
              products (*)
            `)
            .eq('cart_id', cart.id);

          if (itemsError) throw itemsError;
          setItems(cartItems || []);
        } else {
          // No cart exists yet, which is a valid state
          setItems([]);
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  const handleRemoveItem = async (itemId: string) => {
    try {
      setDeletingItems(prev => new Set(prev).add(itemId));
      setError(null);

      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (deleteError) throw deleteError;

      setItems(items.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error removing item:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove item');
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-cream-50">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-charcoal-300 mb-12">
            Loading Cart...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-cream-50">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-charcoal-300 mb-12">
          Your Cart
        </h1>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-charcoal-300 mb-6">Your cart is empty</p>
            <button
              onClick={() => navigate('/create')}
              className="bg-sage-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sage-500 transition-colors"
            >
              Create Your First Kit
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt="Product preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold mb-1">
                            {item.products.size} - {item.products.frame_type} Frame
                          </h3>
                          <p className="text-charcoal-200">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">R{item.price.toFixed(2)}</p>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={deletingItems.has(item.id)}
                            className="text-red-500 hover:text-red-600 mt-2 disabled:opacity-50"
                          >
                            {deletingItems.has(item.id) ? (
                              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Total</h2>
                <div className="text-3xl font-bold text-sage-500">
                  R{totalAmount.toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-sage-400 text-white py-4 rounded-lg text-lg font-semibold hover:bg-sage-500 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}