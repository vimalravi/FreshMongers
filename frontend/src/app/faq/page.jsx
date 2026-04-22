'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const faqs = [
  { q: 'How fresh is the fish?', a: 'Most products are sourced the same day and delivered quickly.' },
  { q: 'How do payments work?', a: 'You can pay via UPI/GPay/Bank Transfer and upload proof for verification.' },
  { q: 'Do you deliver across Trivandrum?', a: 'Yes, we currently serve major areas within Trivandrum city.' },
];

export default function FaqPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-black mb-8">Frequently Asked Questions</h1>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="card">
              <h2 className="font-bold text-lg mb-2">{faq.q}</h2>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
