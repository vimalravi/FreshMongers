// frontend/src/app/orders/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Link      from 'next/link';
import Navbar    from '@/components/Navbar';
import Footer    from '@/components/Footer';
import api       from '@/utils/api';
import { motion } from 'framer-motion';
import { FiPackage, FiArrowRight, FiClock, FiCheckCircle, FiAlertCircle, FiTruck } from 'react-icons/fi';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',     badge: 'badge-orange',  icon: FiClock,        color: 'text-orange-500' },
  confirmed:  { label: 'Confirmed',   badge: 'badge-blue',    icon: FiCheckCircle,  color: 'text-primary' },
  processing: { label: 'Processing',  badge: 'badge-teal',    icon: FiPackage,      color: 'text-teal' },
  out_for_delivery: { label: 'Out for Delivery', badge: 'badge-teal', icon: FiTruck, color: 'text-teal' },
  delivered:  { label: 'Delivered',   badge: 'badge-green',   icon: FiCheckCircle,  color: 'text-green-600' },
  cancelled:  { label: 'Cancelled',   badge: 'badge-coral',   icon: FiAlertCircle,  color: 'text-coral' },
};

const PAYMENT_CONFIG = {
  pending:  { label: 'Unpaid',   cls: 'text-orange-500 bg-orange-50' },
  verified: { label: 'Paid',     cls: 'text-green-600 bg-green-50'   },
  failed:   { label: 'Failed',   cls: 'text-coral bg-coral-bg'       },
};

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load orders');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Navbar />

      <div className="pt-20 bg-organic-sky border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="label-section">Account</p>
          <h1 className="font-display text-3xl md:text-4xl font-black">My Orders</h1>
          {orders.length > 0 && (
            <p className="text-gray-500 text-sm mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
          )}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 min-h-screen">

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card flex items-center gap-4">
                <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/3 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
                <div className="skeleton h-8 w-24 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card text-center py-12">
            <p className="text-coral font-semibold mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-ghost text-sm">Try Again</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="card text-center py-16 max-w-sm mx-auto">
            <p className="text-5xl mb-4">📦</p>
            <h3 className="font-display font-bold text-xl text-gray-900 mb-2">No orders yet</h3>
            <p className="text-sm text-gray-500 mb-8">Start shopping to place your first order!</p>
            <Link href="/products" className="btn btn-primary">
              Browse Products <FiArrowRight size={15} />
            </Link>
          </div>
        )}

        {/* Order list */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const statusCfg  = STATUS_CONFIG[order.status]  || STATUS_CONFIG.pending;
              const paymentCfg = PAYMENT_CONFIG[order.payment_status] || PAYMENT_CONFIG.pending;
              const StatusIcon = statusCfg.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="card hover:shadow-card-hover transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-[var(--color-bg)] flex items-center justify-center shrink-0 ${statusCfg.color}`}>
                      <StatusIcon size={20} />
                    </div>

                    {/* Order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black font-display text-gray-900">{order.order_number}</p>
                        <span className={`badge ${statusCfg.badge}`}>{statusCfg.label}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                      </p>
                    </div>

                    {/* Amount + payment */}
                    <div className="text-right shrink-0">
                      <p className="font-black text-primary font-display">₹{Number(order.total_amount).toFixed(0)}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${paymentCfg.cls}`}>
                        {paymentCfg.label}
                      </span>
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/orders/${order.id}`}
                      className="btn btn-ghost text-sm py-2 px-4 shrink-0"
                    >
                      Details <FiArrowRight size={13} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
