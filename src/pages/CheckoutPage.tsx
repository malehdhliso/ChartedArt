import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { CreditCard, Wallet } from 'lucide-react';
import type { Database } from '@/lib/supabase/types';

type CartItem = Database['public']['Tables']['cart_items']['Row'] & {
  products: Database['public']['Tables']['products']['Row']
};

type ShippingAddress = {
  street: string;
  suburb: string;
  city: string;
  province: string;
  postal_code: string;
};

type PaymentMethod = 'cash' | 'card' | 'ozow';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState<ShippingAddress>({
    street: '',
    suburb: '',
    city: '',
    province: '',
    postal_code: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth/login');
          return;
        }

        setEmail(session.user.email || '');

        const { data: cart, error: cartError } = await supabase
          .from('carts')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (cartError) throw cartError;

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

  const totalAmount = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  const handleCashPayment = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (!address.street || !address.suburb || !address.city || !address.province || !address.postal_code) {
        throw new Error('Please fill in all address fields');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth/login');
        return;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: session.user.id,
          status: 'pending',
          shipping_address: address,
          total_amount: totalAmount,
          payment_reference: `CASH-${Date.now()}`
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        image_url: item.image_url,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (cart) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cart.id);
      }

      navigate('/order-confirmation');
    } catch (err) {
      console.error('Error processing order:', err);
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddressSelect = (selectedAddress: ShippingAddress) => {
    setAddress(selectedAddress);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-cream-50">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-charcoal-300 mb-12">
            Loading...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-cream-50">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-charcoal-300 mb-12">
          Checkout
        </h1>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-6">Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-300 mb-1">
                  Address
                </label>
                <AddressAutocomplete
                  onAddressSelect={handleAddressSelect}
                  defaultValue={address.street}
                />
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                <div className="space-y-3">
                  <label className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'cash' 
                      ? 'border-sage-400 bg-sage-50' 
                      : 'border-gray-300 hover:border-sage-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-sage-400" />
                      <div>
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-charcoal-200">Pay when you receive your order</div>
                      </div>
                    </div>
                  </label>

                  <label className={`block p-4 border rounded-lg cursor-pointer transition-colors opacity-50`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      disabled
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5" />
                      <div>
                        <div className="font-medium">Card Payment</div>
                        <div className="text-sm text-charcoal-200">Coming soon</div>
                      </div>
                    </div>
                  </label>

                  <label className={`block p-4 border rounded-lg cursor-pointer transition-colors opacity-50`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ozow"
                      disabled
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5" />
                      <div>
                        <div className="font-medium">Ozow</div>
                        <div className="text-sm text-charcoal-200">Coming soon</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-semibold">
                        {item.products.size} - {item.products.frame_type} Frame
                      </p>
                      <p className="text-sm text-charcoal-200">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      R{(item.price * (item.quantity || 1)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-semibold">R{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span>R{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCashPayment}
                disabled={submitting || !address.street}
                className="w-full bg-sage-400 text-white py-4 rounded-lg text-lg font-semibold hover:bg-sage-500 transition-colors mt-6 disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}