'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card space-y-4">
          <h1 className="text-4xl font-black">Privacy Policy</h1>
          <p className="text-gray-600">
            We collect contact, delivery, and order information only for fulfillment, support, and legal
            compliance.
          </p>
          <p className="text-gray-600">
            Payment screenshots are used strictly for manual verification and are retained securely.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
