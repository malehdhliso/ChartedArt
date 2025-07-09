import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { CheckCircle, Download, Share2, Package, Truck, AlertTriangle, XCircle } from 'lucide-react';
import type { Database } from '@/lib/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items: (Database['public']['Tables']['order_items']['Row'] & {
    products: Database['public']['Tables']['products']['Row']
  })[];
};

const ORDER_STATUS_INFO = {
  pending: {
    icon: AlertTriangle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100',
    message: 'Your order has been received and is being reviewed'
  },
  processing: {
    icon: Package,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    message: 'Your order is being prepared for shipping'
  },
  shipped: {
    icon: Truck,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    message: 'Your order is on its way'
  },
  delivered: {
    icon: CheckCircle,
    color: 'text-sage-500',
    bgColor: 'bg-sage-100',
    message: 'Your order has been delivered'
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    message: 'This order has been cancelled'
  }
};

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestOrder = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/auth/login');
          return;
        }

        const { data: orders, error: orderError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              products (*)
            )
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (orderError) throw orderError;
        setOrder(orders);

        // Set up real-time subscription for order status updates
        const orderSubscription = supabase
          .channel('order_status_changes')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'orders',
              filter: `id=eq.${orders.id}`
            },
            (payload) => {
              setOrder(currentOrder => 
                currentOrder ? { ...currentOrder, ...payload.new } : null
              );
            }
          )
          .subscribe();

        return () => {
          orderSubscription.unsubscribe();
        };
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestOrder();
  }, [navigate]);

  const handleDownloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'chartedart-reference.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading image:', err);
      setError('Failed to download image. Please try again.');
    }
  };

  const handleShare = async (imageUrl: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My ChartedArt Creation',
          text: 'Check out my custom paint by numbers kit from ChartedArt!',
          url: imageUrl
        });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        alert('Image URL copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      setError('Failed to share. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-cream-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-400"></div>
            <span className="ml-3">Loading order details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen py-12 bg-cream-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 text-red-500 p-4 rounded-lg">
            {error || 'Order not found'}
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = ORDER_STATUS_INFO[order.status as keyof typeof ORDER_STATUS_INFO];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen py-12 bg-cream-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sage-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-sage-400" />
          </div>
          <h1 className="text-4xl font-bold text-charcoal-300 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-charcoal-200">
            Thank you for your order. We'll start processing it right away.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className={`flex items-center gap-3 p-4 rounded-lg ${statusInfo.bgColor} mb-6`}>
            <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
            <p className={`font-medium ${statusInfo.color}`}>
              {statusInfo.message}
            </p>
          </div>

          <h2 className="text-2xl font-semibold mb-6">Order Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between text-charcoal-300">
              <span>Order Number:</span>
              <span className="font-semibold">{order.id}</span>
            </div>
            <div className="flex justify-between text-charcoal-300">
              <span>Order Date:</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-charcoal-300">
              <span>Total Amount:</span>
              <span className="font-semibold">R{order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Shipping Address</h2>
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

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold mb-6">Your Artworks</h2>
          <div className="grid gap-8">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <div className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={item.image_url}
                      alt="Artwork reference"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {item.products.size} - {item.products.frame_type} Frame
                  </h3>
                  <p className="text-charcoal-200 mb-4">
                    Quantity: {item.quantity}
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleDownloadImage(item.image_url)}
                      className="flex items-center gap-2 text-sage-400 hover:text-sage-500"
                    >
                      <Download className="w-5 h-5" />
                      Download Reference
                    </button>
                    <button
                      onClick={() => handleShare(item.image_url)}
                      className="flex items-center gap-2 text-sage-400 hover:text-sage-500"
                    >
                      <Share2 className="w-5 h-5" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sage-400 hover:text-sage-500 font-semibold"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}