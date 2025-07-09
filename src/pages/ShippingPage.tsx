import { Truck, Package, Clock, Shield } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="min-h-screen py-12 bg-cream-50">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-charcoal-300 mb-12">
          Shipping Information
        </h1>

        {/* Delivery Times */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-sage-400" />
            Delivery Times
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Major Cities (2-3 business days)</h3>
              <ul className="list-disc list-inside text-charcoal-300 space-y-1">
                <li>Johannesburg & Pretoria</li>
                <li>Cape Town</li>
                <li>Durban</li>
                <li>Port Elizabeth</li>
                <li>East London</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Other Areas</h3>
              <ul className="list-disc list-inside text-charcoal-300 space-y-1">
                <li>Other urban areas: 3-5 business days</li>
                <li>Rural areas: 5-7 business days</li>
                <li>Remote locations: 7-10 business days</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Shipping Partners */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Truck className="w-6 h-6 text-sage-400" />
            Shipping Partners
          </h2>
          <p className="text-charcoal-300 mb-4">
            We work with South Africa's most reliable courier services to ensure your art kit arrives safely:
          </p>
          <ul className="list-disc list-inside text-charcoal-300 space-y-2">
            <li>The Courier Guy (Primary partner)</li>
            <li>Dawn Wing (Express delivery option)</li>
            <li>Aramex (Alternative carrier)</li>
          </ul>
        </section>

        {/* Packaging */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Package className="w-6 h-6 text-sage-400" />
            Packaging
          </h2>
          <p className="text-charcoal-300 mb-4">
            Your ChartedArt kit is carefully packaged to prevent any damage during transit:
          </p>
          <ul className="list-disc list-inside text-charcoal-300 space-y-2">
            <li>Sturdy cardboard tubes for canvases</li>
            <li>Bubble-wrapped paint sets</li>
            <li>Shock-resistant packaging for framed pieces</li>
            <li>Weather-resistant outer packaging</li>
          </ul>
        </section>

        {/* Shipping Protection */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-sage-400" />
            Shipping Protection
          </h2>
          <div className="space-y-4">
            <p className="text-charcoal-300">
              All shipments include basic insurance coverage up to R1000. Additional coverage can be purchased during checkout for valuable items.
            </p>
            <p className="text-charcoal-300">
              In the rare event of damage or loss:
            </p>
            <ul className="list-disc list-inside text-charcoal-300 space-y-2">
              <li>Document any damage with photos</li>
              <li>Contact our support team within 48 hours</li>
              <li>Replacement or refund will be processed within 3-5 business days</li>
            </ul>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
          <p className="text-charcoal-300 mb-4">
            Our shipping support team is available Monday to Friday, 8:00 - 17:00 SAST:
          </p>
          <ul className="space-y-2 text-charcoal-300">
            <li>📧 Email: info@chartedart.co.za</li>
            <li>📱 WhatsApp: +27 81 333 5458</li>
            <li>☎️ Phone: 081 333 5458</li>
          </ul>
        </section>
      </div>
    </div>
  );
}