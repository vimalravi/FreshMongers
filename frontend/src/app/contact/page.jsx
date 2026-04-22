// frontend/src/app/contact/page.jsx
'use client';

import { useState } from 'react';
import Navbar  from '@/components/Navbar';
import Footer  from '@/components/Footer';
import { motion } from 'framer-motion';
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CONTACT_METHODS = [
  { icon: FiPhone,   label: 'Call Us',      value: '+91 99999 99999',         href: 'tel:+919999999999',            color: 'from-primary to-primary-light', desc: 'Mon–Sat, 6 AM–7 PM' },
  { icon: FiMail,    label: 'Email Us',     value: 'support@freshmongers.com', href: 'mailto:support@freshmongers.com', color: 'from-teal to-teal-dark',     desc: 'We reply within 24h' },
  { icon: FiMapPin,  label: 'Find Us',      value: 'Trivandrum, Kerala',       href: null,                           color: 'from-coral to-coral-light',     desc: 'Kerala, India' },
  { icon: FiClock,   label: 'Working Hours',value: 'Mon–Sat: 6AM–7PM',        href: null,                           color: 'from-accent to-accent-dark',    desc: 'Sun: 6AM–2PM' },
];

export default function ContactPage() {
  const [form, setForm]   = useState({ name: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate form submission
    await new Promise(r => setTimeout(r, 800));
    toast.success('Message sent! We\'ll get back to you soon 📬', {
      style: { borderRadius: '1rem', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600 },
    });
    setForm({ name: '', phone: '', message: '' });
    setSending(false);
  };

  return (
    <>
      <Navbar />

      {/* Header */}
      <div className="pt-20 bg-hero-gradient border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <p className="label-section">Get in Touch</p>
          <h1 className="font-display text-4xl md:text-5xl font-black mb-4">Contact Us</h1>
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
            Questions about an order? Want to know today's catch? We're always here to help.
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 pb-20">

        {/* Contact method cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {CONTACT_METHODS.map((m, i) => {
            const Icon = m.icon;
            const content = (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="feature-card group cursor-pointer"
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                  <Icon size={20} className="text-white" />
                </div>
                <p className="text-2xs text-gray-400 uppercase tracking-wide font-bold">{m.label}</p>
                <p className="font-bold text-gray-900 text-sm mt-1 font-display">{m.value}</p>
                <p className="text-2xs text-gray-400 mt-0.5">{m.desc}</p>
              </motion.div>
            );
            return m.href
              ? <a href={m.href} key={i} className="no-underline">{content}</a>
              : <div key={i}>{content}</div>;
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card"
          >
            <h3 className="font-display text-xl font-bold mb-5">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1.5">Your Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="John Doe" required />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1.5">Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g,'').slice(0,10)})}
                  placeholder="10-digit mobile number" required />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1.5">Message</label>
                <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                  placeholder="How can we help you?" rows={4} required className="resize-none" />
              </div>
              <button type="submit" disabled={sending}
                className="w-full btn btn-primary py-3 text-sm disabled:opacity-60">
                {sending
                  ? <><span className="spinner" /> Sending…</>
                  : <><FiSend size={14} /> Send Message</>
                }
              </button>
            </form>
          </motion.div>

          {/* WhatsApp CTA + info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-5"
          >
            {/* WhatsApp quick order */}
            <div className="rounded-card p-6 bg-gradient-to-br from-[#e7fdf0] to-[#d4f5e4] border border-green-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center shadow-md">
                  <FiMessageSquare size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-gray-900">Order via WhatsApp</h3>
                  <p className="text-xs text-gray-500">Fastest way to order fresh fish</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Join our WhatsApp group to see daily fresh catches with photos and prices. Place orders directly via chat!
              </p>
              <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer"
                className="w-full btn bg-[#25D366] text-white hover:bg-[#22c55e] text-sm py-3 flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>

            {/* FAQ teaser */}
            <div className="card">
              <h3 className="font-display font-bold mb-3">Common Questions</h3>
              <div className="space-y-3">
                {[
                  ['How fresh is the fish?',         'Caught that morning, delivered same day.'],
                  ['When is the delivery cutoff?',   'Order before 10 AM for same-day delivery.'],
                  ['What payment methods do you accept?', 'UPI, WhatsApp confirmation, and more.'],
                ].map(([q, a]) => (
                  <div key={q} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-bold text-gray-900">{q}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
}
