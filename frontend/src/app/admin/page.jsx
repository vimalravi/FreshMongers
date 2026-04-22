// frontend/src/app/admin/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/utils/api';
import { useAuthStore } from '@/utils/store';
import { formatPrice } from '@/utils/helpers';
import toast from 'react-hot-toast';
import {
  FiDollarSign,
  FiShoppingCart,
  FiUser,
  FiBox,
  FiBarChart3,
  FiRefreshCw,
} from 'react-icons/fi';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/');
      return;
    }
    fetchStats();
  }, [user, router]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard/stats');
      setStats(res.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 pb-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-black">Admin Dashboard</h1>
            <button
              onClick={fetchStats}
              className="btn btn-primary flex items-center gap-2"
            >
              <FiRefreshCw /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="spinner"></div>
            </div>
          ) : stats ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Orders</p>
                      <p className="text-3xl font-bold">{stats.orders.total_orders}</p>
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {stats.orders.completed_orders} Completed
                      </p>
                    </div>
                    <div className="text-4xl">📦</div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Revenue</p>
                      <p className="text-3xl font-bold">
                        {formatPrice(stats.orders.verified_revenue || 0)}
                      </p>
                      <p className="text-xs text-green-600 mt-1">From verified payments</p>
                    </div>
                    <div className="text-4xl">💰</div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Products</p>
                      <p className="text-3xl font-bold">{stats.products.total_products}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        {stats.products.total_stock.toFixed(0)} kg in stock
                      </p>
                    </div>
                    <div className="text-4xl">🐟</div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Customers</p>
                      <p className="text-3xl font-bold">{stats.customers.total_customers}</p>
                      <p className="text-xs text-purple-600 mt-1">Active users</p>
                    </div>
                    <div className="text-4xl">👥</div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-8">
                {['overview', 'orders', 'payments', 'products'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`px-4 py-2 rounded-lg font-bold transition ${
                      selectedTab === tab
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="card">
                {selectedTab === 'overview' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Overview</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-gray-600">Pending Orders</p>
                        <p className="text-2xl font-bold">{stats.orders.pending_orders}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-gray-600">Completed Orders</p>
                        <p className="text-2xl font-bold">{stats.orders.completed_orders}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTab === 'orders' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Order #</th>
                            <th className="text-left py-2">Customer</th>
                            <th className="text-left py-2">Amount</th>
                            <th className="text-left py-2">Status</th>
                            <th className="text-left py-2">Payment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentOrders?.slice(0, 5).map((order) => (
                            <tr key={order.id} className="border-b">
                              <td className="py-2 font-bold">{order.order_number}</td>
                              <td className="py-2">#{order.customer_id}</td>
                              <td className="py-2">{formatPrice(order.total_amount)}</td>
                              <td className="py-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    order.payment_status === 'verified'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {order.payment_status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {selectedTab === 'payments' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Payments</h2>
                    <p className="text-gray-600">
                      Verified Revenue: {formatPrice(stats.orders.verified_revenue || 0)}
                    </p>
                    <p className="text-gray-600 mt-2">
                      Pending Verification: {stats.orders.pending_orders} orders
                    </p>
                  </div>
                )}

                {selectedTab === 'products' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Products</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-gray-600">Total Products</p>
                        <p className="text-2xl font-bold">{stats.products.total_products}</p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <p className="text-gray-600">Total Stock</p>
                        <p className="text-2xl font-bold">{stats.products.total_stock?.toFixed(1)} kg</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
      <Footer />
    </>
  );
}
