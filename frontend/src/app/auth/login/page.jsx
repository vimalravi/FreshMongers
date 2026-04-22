// frontend/src/app/auth/login/page.jsx
'use client';

import { useState }      from 'react';
import { useRouter }     from 'next/navigation';
import Link              from 'next/link';
import api               from '@/utils/api';
import { useAuthStore }  from '@/utils/store';
import toast             from 'react-hot-toast';
import { validatePhone } from '@/utils/helpers';
import { motion }        from 'framer-motion';
import { FiPhone, FiUser, FiMail, FiArrowRight, FiCheck } from 'react-icons/fi';

const PERKS = [
  { icon: '🌊', text: 'Daily fresh ocean catch' },
  { icon: '🚚', text: 'Same-day delivery in Trivandrum' },
  { icon: '💰', text: 'Best prices — no middlemen' },
  { icon: '📱', text: 'Track orders & reorder easily' },
];

export default function LoginPage() {
  const [phone,     setPhone]     = useState('');
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin,   setIsLogin]   = useState(true);
  const router       = useRouter();
  const { setUser }  = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePhone(phone)) { toast.error('Enter a valid 10-digit mobile number'); return; }
    if (!isLogin && !name.trim()) { toast.error('Name is required'); return; }
    setIsLoading(true);
    try {
      const res = await api.post('/auth/customer/register', {
        phone,
        name: name || phone,
        email,
        firebase_uid: `legacy-${phone}`,
      });
      if (res.data.success) {
        const { data } = res.data;
        setUser({ ...data, isAdmin: false }, data.token, false);
        toast.success('Welcome to FreshMongers! 🐟', {
          style: { borderRadius: '1rem', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600 },
        });
        router.push('/products');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-5/12 bg-cta-gradient relative overflow-hidden flex-col items-center justify-center p-12 text-white">
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        {/* Floating emoji */}
        {['🐟','🦐','🦑','🦀'].map((e, i) => (
          <motion.span key={i}
            className="absolute text-4xl opacity-15 select-none pointer-events-none"
            style={{ left: `${15 + i * 22}%`, top: `${20 + (i % 2) * 40}%` }}
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8 }}
          >{e}</motion.span>
        ))}

        <div className="relative z-10 text-center space-y-8">
          {/* Logo */}
          <div className="inline-flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-3xl">
              🐟
            </div>
            <div className="text-left">
              <p className="text-2xl font-black font-display">FreshMongers</p>
              <p className="text-xs text-white/60 uppercase tracking-widest font-semibold">Ocean to Door</p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-black font-display leading-tight mb-3">
              Trivandrum's<br />Freshest Seafood
            </h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs mx-auto">
              Sourced daily from local fishermen. No middlemen, no compromises — just the freshest fish at your door.
            </p>
          </div>

          {/* Perks */}
          <div className="space-y-3 text-left max-w-xs mx-auto">
            {PERKS.map((p) => (
              <div key={p.text} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5 border border-white/10">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-semibold">{p.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-[var(--color-bg)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-3xl">🐟</span>
              <span className="text-xl font-black font-display text-primary">FreshMongers</span>
            </div>
          </div>

          <div className="card space-y-6">
            {/* Header */}
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900">
                {isLogin ? 'Welcome back!' : 'Create account'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isLogin ? 'Login to shop fresh seafood' : 'Join thousands of happy customers'}
              </p>
            </div>

            {/* Toggle tabs */}
            <div className="flex gap-1 bg-[var(--color-bg)] p-1 rounded-xl">
              {[['Login', true], ['Sign Up', false]].map(([label, val]) => (
                <button
                  key={label}
                  onClick={() => setIsLogin(val)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    isLogin === val
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name (signup only) */}
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1.5">
                    Full Name
                  </label>
                  <div className="input-group">
                    <FiUser size={14} className="input-icon" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name" required />
                  </div>
                </motion.div>
              )}

              {/* Phone */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1.5">
                  Mobile Number
                </label>
                <div className="input-group">
                  <FiPhone size={14} className="input-icon" />
                  <input type="tel" value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number" required maxLength="10" />
                </div>
                <p className="text-2xs text-gray-400 mt-1 ml-1">Used for order updates via WhatsApp</p>
              </div>

              {/* Email (signup only) */}
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1.5">
                    Email <span className="text-gray-400 font-normal normal-case">(optional)</span>
                  </label>
                  <div className="input-group">
                    <FiMail size={14} className="input-icon" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com" />
                  </div>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-accent text-base py-3.5 mt-2 disabled:opacity-60"
              >
                {isLoading
                  ? <><span className="spinner" /> Please wait…</>
                  : isLogin
                    ? <>Login <FiArrowRight size={16} /></>
                    : <>Create Account <FiArrowRight size={16} /></>
                }
              </button>
            </form>

            {/* WhatsApp note */}
            <div className="p-3.5 bg-[var(--color-earth-2)] rounded-xl flex items-start gap-2.5 text-xs text-gray-600">
              <span className="text-base shrink-0">📱</span>
              <p>We'll use your phone number for order confirmations and delivery updates via WhatsApp.</p>
            </div>
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-gray-400 mt-5">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-primary font-semibold hover:underline">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-primary font-semibold hover:underline">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
