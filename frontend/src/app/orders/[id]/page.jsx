// frontend/src/app/orders/[id]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams }           from 'next/navigation';
import Navbar                  from '@/components/Navbar';
import Footer                  from '@/components/Footer';
import api                     from '@/utils/api';
import { useAuthStore }        from '@/utils/store';
import { formatPrice, formatDate, generateWhatsAppLink, generateUPILink } from '@/utils/helpers';
import toast                   from 'react-hot-toast';
import Link                    from 'next/link';
import { motion }              from 'framer-motion';
import {
  FiCheck, FiCopy, FiMessageSquare, FiArrowLeft,
  FiPackage, FiTruck, FiClock, FiMapPin, FiAlertCircle,
} from 'react-icons/fi';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered'];
const STATUS_LABELS = {
  pending:          'Order Placed',
  confirmed:        'Confirmed',
  processing:       'Being Prepared',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
};

export default function OrderDetailsPage() {
  const params       = useParams();
  const { user }     = useAuthStore();
  const [order,      setOrder]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [screenshot, setScreenshot] = useState('');
  const [txId,       setTxId]       = useState('');
  const [uploading,  setUploading]  = useState(false);
  const [copied,     setCopied]     = useState(false);

  useEffect(() => { fetchOrder(); }, [params.id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${params.id}`);
      setOrder(res.data.data);
    } catch {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPayment = async () => {
    if (!screenshot) { toast.error('Please enter screenshot URL'); return; }
    setUploading(true);
    try {
      const res = await api.post('/payments/upload-screenshot', {
        order_id: order.id,
        screenshot_url: screenshot,
        transaction_id: txId,
      });
      if (res.data.success) {
        toast.success('Payment proof uploaded! ✅');
        fetchOrder();
        setScreenshot(''); setTxId('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied!');
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
      <Footer />
    </>
  );

  if (!order) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center pt-20 text-center px-4">
        <div className="card py-16 max-w-sm mx-auto">
          <p className="text-5xl mb-4">📦</p>
          <h2 className="font-display text-xl font-bold mb-4">Order not found</h2>
          <Link href="/orders" className="btn btn-primary">My Orders</Link>
        </div>
      </div>
      <Footer />
    </>
  );

  const upiLink      = generateUPILink(order.total_amount, order.order_number);
  const whatsappLink = generateWhatsAppLink(order.order_number);
  const currentStep  = STATUS_STEPS.indexOf(order.status);
  const isPending    = order.payment_status === 'pending';
  const isVerified   = order.payment_status === 'verified';

  return (
    <>
      <Navbar />

      {/* Header */}
      <div className="pt-20 bg-organic-sky border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-primary transition mb-4">
            <FiArrowLeft size={14} /> Back to Orders
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="label-section">Order Details</p>
              <h1 className="font-display text-2xl md:text-3xl font-black">{order.order_number}</h1>
            </div>
            <div className="text-right">
              <p className="text-2xs text-gray-400 uppercase tracking-wide">Total Amount</p>
              <p className="font-display text-3xl font-black text-primary">{formatPrice(order.total_amount)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">

        {/* Status timeline */}
        {order.status !== 'cancelled' && (
          <div className="card mb-6 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[500px]">
              {STATUS_STEPS.map((step, i) => {
                const isActive    = i <= currentStep;
                const isCurrent   = i === currentStep;
                const isLast      = i === STATUS_STEPS.length - 1;
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? isCurrent
                            ? 'bg-primary text-white shadow-primary/30 shadow-md scale-110'
                            : 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isActive && !isCurrent ? <FiCheck size={14} /> : <span className="text-xs font-bold">{i + 1}</span>}
                      </div>
                      <p className={`text-[10px] font-bold text-center leading-tight max-w-[60px] ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                        {STATUS_LABELS[step]}
                      </p>
                    </div>
                    {!isLast && (
                      <div className={`flex-1 h-0.5 mx-2 mb-5 rounded ${i < currentStep ? 'bg-green-400' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Status badges row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Status',  value: order.status?.replace('_', ' '),  bg: 'bg-primary-bg',   text: 'text-primary'  },
            { label: 'Payment', value: order.payment_status,             bg: isPending ? 'bg-orange-50' : 'bg-green-50', text: isPending ? 'text-orange-600' : 'text-green-700' },
            { label: 'Date',    value: formatDate(order.created_at),     bg: 'bg-[var(--color-bg)]', text: 'text-gray-700' },
          ].map(({ label, value, bg, text }) => (
            <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
              <p className="text-2xs text-gray-400 uppercase tracking-wide font-bold">{label}</p>
              <p className={`text-sm font-black capitalize mt-0.5 ${text}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left col ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Order items */}
            <div className="card">
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <FiPackage size={17} className="text-primary" /> Order Items
              </h3>
              <div className="space-y-3">
                {order.items?.map((item, i) => (
                  <div key={item.id} className={`flex justify-between items-center py-3 ${i < order.items.length - 1 ? 'border-b border-border' : ''}`}>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.quantity_kg} kg × {formatPrice(item.unit_price)}
                      </p>
                    </div>
                    <p className="font-black text-primary font-display">{formatPrice(item.total_price)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment pending → UPI flow */}
            {isPending && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card border-2 border-orange-200">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                    <FiAlertCircle size={18} className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Payment Required</h3>
                    <p className="text-xs text-gray-500">Complete payment to confirm your order</p>
                  </div>
                </div>

                {/* UPI */}
                <div className="p-4 bg-[var(--color-earth-3)] rounded-xl mb-4 space-y-3">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Step 1 — Pay via UPI</p>
                  <p className="text-sm text-gray-600">
                    Send <strong className="text-primary">{formatPrice(order.total_amount)}</strong> to:
                  </p>
                  <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 border border-border">
                    <code className="flex-1 font-mono text-sm font-bold text-gray-900">
                      {process.env.NEXT_PUBLIC_UPI_ID}
                    </code>
                    <button onClick={() => copy(process.env.NEXT_PUBLIC_UPI_ID)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500 hover:text-primary">
                      {copied ? <FiCheck size={15} className="text-green-500" /> : <FiCopy size={15} />}
                    </button>
                  </div>
                  <a href={upiLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full text-sm py-2.5">
                    Open UPI App
                  </a>
                </div>

                {/* Upload proof */}
                <div className="p-4 bg-[var(--color-earth-1)] rounded-xl space-y-3">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Step 2 — Upload Proof</p>
                  <input type="text" value={screenshot} onChange={(e) => setScreenshot(e.target.value)}
                    placeholder="Paste screenshot URL" className="text-sm py-2" />
                  <input type="text" value={txId} onChange={(e) => setTxId(e.target.value)}
                    placeholder="Transaction ID (optional)" className="text-sm py-2" />
                  <button onClick={handleUploadPayment} disabled={uploading || !screenshot}
                    className="btn btn-accent w-full text-sm py-2.5 disabled:opacity-50">
                    {uploading ? 'Uploading…' : 'Upload Payment Proof'}
                  </button>
                </div>

                {/* WhatsApp */}
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                  className="mt-4 w-full btn bg-[#25D366] text-white hover:bg-[#22c55e] text-sm py-2.5 flex items-center justify-center gap-2">
                  <FiMessageSquare size={15} /> Confirm via WhatsApp
                </a>
              </motion.div>
            )}

            {/* Payment verified */}
            {isVerified && (
              <div className="card border-2 border-green-300 bg-green-50 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                  <FiCheck size={22} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-green-900">Payment Verified!</p>
                  <p className="text-sm text-green-700">Your payment is confirmed. Order is being processed.</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Right col ── */}
          <div className="space-y-4">

            {/* Summary */}
            <div className="card">
              <h3 className="font-display font-bold mb-4">Summary</h3>
              <div className="space-y-2.5 text-sm">
                {[
                  ['Subtotal',  formatPrice(order.subtotal)],
                  ...(order.discount_amount > 0 ? [['Discount', `-${formatPrice(order.discount_amount)}`]] : []),
                  ['Delivery', formatPrice(order.delivery_charge)],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-gray-600">
                    <span>{label}</span>
                    <span className={`font-semibold ${label === 'Discount' ? 'text-green-600' : ''}`}>{val}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2.5 flex justify-between font-black text-gray-900">
                  <span>Total</span>
                  <span className="text-primary font-display">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="card">
              <h3 className="font-display font-bold mb-3 flex items-center gap-2">
                <FiMapPin size={15} className="text-teal" /> Delivery
              </h3>
              <p className="text-sm text-gray-500">
                {order.delivery_date
                  ? `Expected: ${formatDate(order.delivery_date)}`
                  : 'Delivery date will be updated soon.'}
              </p>
            </div>

            {/* Actions */}
            <div className="card space-y-2.5">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                className="w-full btn btn-ghost text-sm py-2.5 flex items-center justify-center gap-2">
                <FiMessageSquare size={14} /> Contact Support
              </a>
              <Link href="/products" className="w-full btn btn-primary text-sm py-2.5 text-center flex items-center justify-center gap-1.5">
                Continue Shopping <FiArrowLeft size={13} className="rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
