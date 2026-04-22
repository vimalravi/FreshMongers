// frontend/src/app/profile/page.jsx
'use client';

import Navbar  from '@/components/Navbar';
import Footer  from '@/components/Footer';
import { useAuthStore } from '@/utils/store';
import Link    from 'next/link';
import { motion } from 'framer-motion';
import { FiUser, FiPhone, FiMail, FiPackage, FiLogOut, FiArrowRight } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const router           = useRouter();

  const handleLogout = () => { logout(); router.push('/'); };

  return (
    <>
      <Navbar />

      <div className="pt-20 bg-organic-sky border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="label-section">Account</p>
          <h1 className="font-display text-3xl md:text-4xl font-black">My Profile</h1>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 min-h-screen">
        {user ? (
          <div className="space-y-5">

            {/* Avatar + name card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-teal flex items-center justify-center shadow-primary shrink-0">
                <FiUser size={28} className="text-white" />
              </div>
              <div>
                <h2 className="font-display text-xl font-black text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-400 mt-0.5">FreshMongers Customer</p>
              </div>
            </motion.div>

            {/* Info fields */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card space-y-4">
              <h3 className="font-display font-bold text-gray-900">Personal Information</h3>

              {[
                { icon: FiUser,  label: 'Full Name', value: user.name },
                { icon: FiPhone, label: 'Mobile',    value: user.phone },
                ...(user.email ? [{ icon: FiMail, label: 'Email', value: user.email }] : []),
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                  <div className="w-9 h-9 rounded-xl bg-primary-bg flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-2xs text-gray-400 uppercase tracking-wide font-semibold">{label}</p>
                    <p className="font-semibold text-gray-900 text-sm mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Quick actions */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card space-y-2.5">
              <h3 className="font-display font-bold text-gray-900 mb-4">Quick Actions</h3>

              <Link href="/orders" className="flex items-center justify-between p-3.5 rounded-xl hover:bg-primary-bg transition group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-bg flex items-center justify-center">
                    <FiPackage size={15} className="text-primary" />
                  </div>
                  <span className="font-semibold text-sm text-gray-700 group-hover:text-primary transition">My Orders</span>
                </div>
                <FiArrowRight size={15} className="text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-coral-bg transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-coral-bg flex items-center justify-center">
                    <FiLogOut size={15} className="text-coral" />
                  </div>
                  <span className="font-semibold text-sm text-gray-700 group-hover:text-coral transition">Logout</span>
                </div>
                <FiArrowRight size={15} className="text-gray-400 group-hover:text-coral transition" />
              </button>
            </motion.div>
          </div>
        ) : (
          <div className="card text-center py-16 max-w-sm mx-auto">
            <p className="text-5xl mb-4">👤</p>
            <h3 className="font-display text-xl font-bold mb-2">Not logged in</h3>
            <p className="text-sm text-gray-500 mb-6">Please login to view your profile.</p>
            <Link href="/auth/login" className="btn btn-primary">Login / Sign Up</Link>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
