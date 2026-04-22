'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/utils/api';

export default function SupportPage() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');

  const submitTicket = async (e) => {
    e.preventDefault();
    try {
      await api.post('/support', { subject, description, category: 'other' });
      setStatus('Ticket submitted. Our team will contact you shortly.');
      setSubject('');
      setDescription('');
    } catch (error) {
      setStatus(error?.response?.data?.message || 'Unable to submit ticket.');
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card">
          <h1 className="text-4xl font-black mb-2">Support</h1>
          <p className="text-gray-600 mb-6">Raise a ticket for delivery, payment, or product issues.</p>
          <form className="space-y-4" onSubmit={submitTicket}>
            <input
              className="input"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <textarea
              className="input min-h-36"
              placeholder="Describe your issue"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">Submit Ticket</button>
          </form>
          {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
        </div>
      </main>
      <Footer />
    </>
  );
}
