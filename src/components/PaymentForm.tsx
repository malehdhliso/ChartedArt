import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51OxKHqKDfQVHkTp0nPxPtGZqKzHfDGVZtfQZqhA5RzMBPQdkjY8zH2qWYZH7vKjJ3q4X9Y6X8Y6X8Y6X8Y6X8Y6X8');

interface PaymentFormProps {
  onSuccess: (paymentIntent: Stripe.PaymentIntent) => void;
}

function PaymentForm({ onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (submitError) {
        throw submitError;
      }

      if (paymentIntent) {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing your payment.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-sage-400 text-white py-4 rounded-lg text-lg font-semibold hover:bg-sage-500 transition-colors disabled:opacity-50"
      >
        {processing ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

export function PaymentFormWrapper({ amount, onSuccess }: { amount: number; onSuccess: (paymentIntent: Stripe.PaymentIntent) => void }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ amount }),
          }
        );

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      }
    };

    initializePayment();
  }, [amount]);

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-400 mx-auto"></div>
        <p className="mt-2 text-charcoal-300">Initializing payment...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm onSuccess={onSuccess} />
    </Elements>
  );
}