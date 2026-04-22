// frontend/src/app/cart/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter }           from 'next/navigation';
import Navbar                  from '@/components/Navbar';
import Footer                  from '@/components/Footer';
import { useCartStore, useAuthStore } from '@/utils/store';
import { formatPrice }         from '@/utils/helpers';
import api                     from '@/utils/api';
import toast                   from 'react-hot-toast';
import Link                    from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTrash2, FiPlus, FiMinus, FiShoppingBag,
  FiTag, FiMapPin, FiArrowRight, FiCheck,
} from 'react-icons/fi';

const SEAFOOD_EMOJIS = ['🐟', '🦐', '🦑', '🦀', '🐙', '🍤'];

export default function CartPage() {
  const router = useRouter();
  const { user }                                              = useAuthStore();
  const { cart, removeItem, updateQuantity, getTotal, coupon, setCoupon } = useCartStore();
  const [couponCode,          setCouponCode]          = useState('');
  const [applyCouponLoading,  setApplyCouponLoading]  = useState(false);
  const [checkoutLoading,     setCheckoutLoading]     = useState(false);
  const [addresses,           setAddresses]           = useState([]);
  const [selectedAddressId,   setSelectedAddressId]   = useState(null);
  const [couponApplied,       setCouponApplied]       = useState(false);

  useEffect(() => { if (!user) router.push('/auth/login'); }, [user, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await api.get('/customers/addresses');
        const list = res.data.data || [];
        setAddresses(list);
        const def = list.find(a => a.is_default);
        setSelectedAddressId(def?.id || list[0]?.id || null);
      } catch { setAddresses([]); }
    })();
  }, [user]);

  const totals = getTotal();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { toast.error('Enter a coupon code'); return; }
    setApplyCouponLoading(true);
    try {
      const res = await api.post('/cart/validate-coupon', {
        coupon_code: couponCode,
        subtotal: totals.subtotal,
      });
      if (res.data.success) {
        setCoupon(res.data.data);
        setCouponApplied(true);
        toast.success('Coupon applied! 🎉');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setApplyCouponLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!user) { router.push('/auth/login'); return; }
    if (!selectedAddressId) { toast.error('Please select a delivery address'); return; }
    setCheckoutLoading(true);
    try {
      const res = await api.post('/orders', {
        address_id: selectedAddressId,
        items: cart.map(item => ({ product_id: item.id, quantity_kg: item.quantity })),
        coupon_code: couponCode || undefined,
        payment_method: 'upi',
      });
      if (res.data.success) {
        toast.success('Order created! 🎉');
        router.push(`/orders/${res.data.data.orderId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  /* ── Empty state ── */
  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-20 pb-16 px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center card max-w-sm mx-auto py-16 px-8">
            <p className="text-6xl mb-4">🛒</p>
            <h2 className="font-display text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 text-sm mb-8">Add some fresh seafood to get started!</p>
            <Link href="/products" className="btn btn-primary">
              Browse Products <FiArrowRight size={15} />
            </Link>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Header */}
      <div className="pt-20 bg-organic-sky border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="label-section">Checkout</p>
          <h1 className="font-display text-3xl md:text-4xl font-black">Your Cart</h1>
          <p className="text-gray-500 text-sm mt-1">{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Cart items ── */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="card flex items-center gap-4"
                >
                  {/* Emoji thumb */}
                  <div className="w-16 h-16 shrink-0 rounded-xl bg-gradient-to-br from-primary-bg to-teal-bg flex items-center justify-center text-3xl">
                    {SEAFOOD_EMOJIS[item.id % SEAFOOD_EMOJIS.length]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 font-display text-sm truncate">{item.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{formatPrice(item.price_per_kg)} / kg</p>
                  </div>

                  {/* Qty stepper */}
                  <div className="flex items-center gap-1 border-2 border-border rounded-xl overflow-hidden shrink-0">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(0.25, +(item.quantity - 0.25).toFixed(2)))}
                      className="w-9 h-9 flex items-center justify-center hover:bg-primary-bg hover:text-primary transition text-gray-500"
                    >
                      <FiMinus size={12} />
                    </button>
                    <span className="w-14 text-center font-bold text-sm text-gray-900">
                      {item.quantity.toFixed(2)}<span className="text-[10px] text-gray-400"> kg</span>
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, +(item.quantity + 0.25).toFixed(2))}
                      className="w-9 h-9 flex items-center justify-center hover:bg-primary-bg hover:text-primary transition text-gray-500"
                    >
                      <FiPlus size={12} />
                    </button>
                  </div>

                  {/* Line total */}
                  <div className="text-right shrink-0 min-w-[60px]">
                    <p className="font-black text-primary font-display text-sm">
                      {formatPrice(item.price_per_kg * item.quantity)}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-coral hover:bg-coral-bg transition shrink-0"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-3 transition-all mt-2">
              <FiShoppingBag size={14} /> Continue Shopping
            </Link>
          </div>

          {/* ── Order summary ── */}
          <div className="space-y-4">
            <div className="card sticky top-24 space-y-5">
              <h3 className="font-display font-bold text-lg">Order Summary</h3>

              {/* Line items */}
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="font-semibold">{formatPrice(totals.subtotal)}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({coupon.code})</span>
                    <span className="font-semibold">-{formatPrice(coupon.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery fee</span>
                  <span className="font-semibold">
                    {totals.deliveryCharge === 0
                      ? <span className="text-green-600 font-bold">FREE</span>
                      : formatPrice(totals.deliveryCharge)}
                  </span>
                </div>
                {totals.subtotal < 500 && (
                  <p className="text-xs text-teal bg-teal-bg rounded-lg px-3 py-2">
                    Add ₹{(500 - totals.subtotal).toFixed(0)} more for free delivery!
                  </p>
                )}
                <div className="border-t border-border pt-3 flex justify-between font-black text-gray-900 text-base">
                  <span>Total</span>
                  <span className="text-primary font-display">{formatPrice(totals.total)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="p-4 bg-[var(--color-earth-1)] rounded-xl space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                  <FiTag size={12} /> Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="FRESHCODE"
                    disabled={applyCouponLoading || couponApplied}
                    className="flex-1 text-sm py-2"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={applyCouponLoading || couponApplied}
                    className={clsx(
                      'btn text-sm py-2 px-4 shrink-0 disabled:opacity-60',
                      couponApplied ? 'bg-green-500 text-white' : 'btn-ghost'
                    )}
                  >
                    {couponApplied ? <FiCheck size={14} /> : applyCouponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              </div>

              {/* Address */}
              <div className="p-4 bg-[var(--color-earth-2)] rounded-xl space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                  <FiMapPin size={12} /> Delivery Address
                </label>
                {addresses.length ? (
                  <select
                    value={selectedAddressId || ''}
                    onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                    className="text-sm py-2"
                  >
                    {addresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.type?.toUpperCase() || 'ADDRESS'} — {a.street}, {a.city}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">No saved addresses.</p>
                    <Link href="/profile" className="btn btn-ghost text-sm py-2 w-full text-center">
                      Add Address in Profile
                    </Link>
                  </div>
                )}
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading || !selectedAddressId}
                className="w-full btn btn-accent text-base py-3.5 font-bold disabled:opacity-50"
              >
                {checkoutLoading
                  ? <><span className="spinner" /> Processing…</>
                  : <>Proceed to Checkout <FiArrowRight size={16} /></>
                }
              </button>

              <p className="text-2xs text-center text-gray-400 flex items-center justify-center gap-1">
                🔒 Secure checkout · UPI & WhatsApp payment
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

function clsx(...args) {
  return args.filter(Boolean).join(' ');
}
