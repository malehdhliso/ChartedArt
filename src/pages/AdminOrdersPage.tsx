import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/admin-client';
import { CheckCircle, XCircle, Truck, Package, AlertTriangle } from 'lucide-react';
import type { Database } from '@/lib/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items: (Database['public']['Tables']['order_items']['Row'] & {
    products: Database['public']['Tables']['products']['Row']
  })[];
  profiles: Database['public']['Tables']['profiles']['Row'];
};

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', icon: AlertTriangle, color: 'bg-amber-100 text-amber-700' },
  { value: 'processing', label: 'Processing', icon: Package, color: 'bg-blue-100 text-blue-700' },
  { value: 'shipped', label: 'Shipped', icon: Truck, color: 'bg-green-100 text-green-700' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'bg-sage-100 text-sage-700' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-700' }
];

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminAndFetchOrders = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/auth/login');
          return;
        }

        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (adminError) {
          throw adminError;
        }

        if (!adminUser) {
          setIsAdmin(false);
          navigate('/');
          return;
        }

        setIsAdmin(true);

        const { data: ordersData, error: ordersError } = await supabaseAdmin
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              products (*)
            ),
            profiles (*)
          `)
          .order('created_at', { ascending: false });

        if (ordersError) {
          throw ordersError;
        }

        setOrders(ordersData || []);
      } catch (err) {
        console.error('Error in admin page:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetchOrders();
  }, [navigate]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrder(orderId);
      setError(null);

      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ));

    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-400"></div>
            <span className="ml-3">Loading orders...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen py-12 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            Access denied. You must be an admin to view this page.
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-12 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-charcoal-300 mb-12">
          Order Management
        </h1>

        <div className="grid gap-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Order #{order.id}</h2>
                  <p className="text-charcoal-200">
                    Placed on {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-charcoal-200">
                    Customer: {order.profiles.full_name || order.profiles.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold mb-3">R{order.total_amount.toFixed(2)}</p>
                  <div className="flex items-center gap-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      disabled={updatingOrder === order.id}
                      className={`px-3 py-1 rounded-full text-sm border ${
                        ORDER_STATUSES.find(s => s.value === order.status)?.color || ''
                      }`}
                    >
                      {ORDER_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    {updatingOrder === order.id && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sage-400"></div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-24 h-24 flex-shrink-0">
                        <img
                          src={item.image_url}
                          alt="Product preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold">
                          {item.products.size} - {item.products.frame_type} Frame
                        </p>
                        <p className="text-charcoal-200">Quantity: {item.quantity}</p>
                        <p className="text-charcoal-200">Price: R{item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t mt-6 pt-6">
                <h3 className="font-semibold mb-4">Shipping Address</h3>
                <div className="text-charcoal-300">
                  <p>{(order.shipping_address as any).street}</p>
                  <p>{(order.shipping_address as any).suburb}</p>
                  <p>
                    {(order.shipping_address as any).city},{' '}
                    {(order.shipping_address as any).province}
                  </p>
                  <p>{(order.shipping_address as any).postal_code}</p>
                </div>
              </div>

              {order.payment_reference && (
                <div className="border-t mt-6 pt-6">
                  <h3 className="font-semibold mb-2">Payment Information</h3>
                  <p className="text-charcoal-200">Reference: {order.payment_reference}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}