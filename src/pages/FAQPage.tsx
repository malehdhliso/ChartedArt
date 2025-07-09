import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "How does ChartedArt's paint by numbers work?",
    answer: "Upload your photo, choose your size and frame, and we'll transform it into a custom paint by numbers kit. Each kit comes with a pre-printed canvas, numbered acrylic paints, brushes, and detailed instructions."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards, Instant EFT, and secure payment platforms like PayFast and Ozow. All transactions are processed in ZAR (South African Rand)."
  },
  {
    question: "How long does shipping take?",
    answer: "Delivery times vary by location: 2-3 business days for major cities (Johannesburg, Cape Town, Durban, Pretoria), 3-5 business days for other urban areas, and 5-7 business days for rural areas."
  },
  {
    question: "What if my kit arrives damaged?",
    answer: "We have a comprehensive 30-day return policy. If your kit arrives damaged or defective, simply contact our customer service team with photos of the damage, and we'll arrange a replacement at no additional cost."
  },
  {
    question: "Can I track my order?",
    answer: "Yes! Once your order ships, you'll receive a tracking number via email and SMS. You can track your package's journey through our website or directly with the courier service."
  },
  {
    question: "What size should I choose?",
    answer: "Our sizes range from A4 to A0. A4 is perfect for beginners or smaller spaces, while larger sizes offer more detail and make stunning statement pieces. Consider your available time and wall space when choosing."
  },
  {
    question: "How long does it take to complete a painting?",
    answer: "Completion time varies based on size and complexity: A4 typically takes 8-12 hours, A3 12-20 hours, A2 20-30 hours, and larger sizes can take 30+ hours. It's meant to be enjoyed at your own pace!"
  },
  {
    question: "Do you offer bulk discounts for events or groups?",
    answer: "Yes! We offer special rates for orders of 5 or more kits, perfect for team building events, art classes, or group activities. Contact us for custom quotes."
  },
  {
    question: "What frame options do you offer?",
    answer: "We offer three options: no frame (canvas only), standard frame (classic black or white), and premium frame (solid wood in various finishes). All frames are locally crafted and include mounting hardware."
  },
  {
    question: "Can I get help if I'm stuck?",
    answer: "Absolutely! We offer support via WhatsApp, email, and phone. Plus, check out our blog for helpful tips and tutorials. We also host regular workshops in major South African cities."
  }
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(current =>
      current.includes(index)
        ? current.filter(i => i !== index)
        : [...current, index]
    );
  };

  return (
    <div className="min-h-screen py-12 bg-cream-50">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-charcoal-300 mb-12">
          Frequently Asked Questions
        </h1>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-cream-50"
                onClick={() => toggleItem(index)}
              >
                <span className="font-semibold text-charcoal-300">{faq.question}</span>
                {openItems.includes(index) ? (
                  <ChevronUp className="w-5 h-5 text-sage-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-sage-400" />
                )}
              </button>
              {openItems.includes(index) && (
                <div className="px-6 py-4 border-t border-cream-100">
                  <p className="text-charcoal-300">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-charcoal-300">
            Still have questions?{" "}
            <a href="mailto:support@chartedart.co.za" className="text-sage-400 hover:text-sage-500 font-semibold">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}