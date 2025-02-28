import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/layout/AdminLayout';
import { FaCopy, FaTicketAlt, FaCheck, FaTimes, FaPlus } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { generateRandomCode } from '../../utils/helpers';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ 
    code: generateRandomCode(), // Auto-generate initial code
    amount: '', 
    expiry: 7 
  });
  const [activeTab, setActiveTab] = useState<'unused' | 'used'>('unused');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/coupons/history');
      const data = await response.json();
      if (data.success) {
        setCoupons(data.coupons || []);
      }
    } catch (error) {
      toast.error('Failed to fetch coupons');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied!');
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') || ''
        },
        body: JSON.stringify(newCoupon)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Coupon created successfully');
        setShowCreateModal(false);
        setNewCoupon({ code: generateRandomCode(), amount: '', expiry: 7 });
        fetchCoupons();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error('Failed to create coupon');
    }
  };

  // Filter coupons based on active tab
  const filteredCoupons = useMemo(() => {
    return coupons.filter(coupon => 
      activeTab === 'used' ? coupon.is_used : !coupon.is_used
    );
  }, [coupons, activeTab]);

  return (
    <AdminLayout>
      <Head>
        <title>Coupon Management - Admin Dashboard</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Header and Create Button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Coupon Management</h1>
          <button
            onClick={() => {
              setNewCoupon({ ...newCoupon, code: generateRandomCode() });
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FaPlus /> Create Coupon
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: 'Total Coupons',
              value: coupons.length,
              icon: <FaTicketAlt className="text-primary-500" />
            },
            {
              title: 'Active Coupons',
              value: coupons.filter(c => !c.is_used).length,
              icon: <FaCheck className="text-green-500" />
            },
            {
              title: 'Used Coupons',
              value: coupons.filter(c => c.is_used).length,
              icon: <FaTimes className="text-red-500" />
            }
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('unused')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'unused'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Unused Coupons ({coupons.filter(c => !c.is_used).length})
          </button>
          <button
            onClick={() => setActiveTab('used')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'used'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Used Coupons ({coupons.filter(c => c.is_used).length})
          </button>
        </div>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => (
            <motion.div
              key={coupon.code}
              layout
              className={`bg-white rounded-xl shadow-sm overflow-hidden border ${
                coupon.is_used ? 'border-gray-200' : 'border-primary-100'
              }`}
            >
              <div className={`p-4 ${coupon.is_used ? 'bg-gray-50' : 'bg-primary-50'}`}>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleCopyCode(coupon.code)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                  >
                    <span className="font-mono font-medium">{coupon.code}</span>
                    <FaCopy className="text-gray-400" />
                  </button>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    coupon.is_used 
                      ? 'bg-gray-100 text-gray-600' 
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {coupon.is_used ? 'Used' : 'Active'}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium">₹{coupon.amount}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Expires</span>
                  <span className="font-medium">{coupon.expiry}</span>
                </div>
                {coupon.is_used && (
                  <>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Used By</span>
                      <span className="font-medium">{coupon.used_by}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Used On</span>
                      <span className="font-medium">
                        {new Date(coupon.used_at).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCoupons.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <FaTicketAlt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No {activeTab} coupons
            </h3>
            <p className="mt-2 text-gray-500">
              {activeTab === 'unused' 
                ? 'Create new coupons to get started'
                : 'No coupons have been used yet'}
            </p>
          </div>
        )}

        {/* Create Coupon Modal - Fixed Centering */}
        <AnimatePresence>
          {showCreateModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setShowCreateModal(false)}
              />
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="min-h-full flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-lg bg-white rounded-2xl shadow-xl relative mx-auto"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Create New Coupon</h2>
                        <button
                          onClick={() => setShowCreateModal(false)}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <FaTimes />
                        </button>
                      </div>

                      <form onSubmit={handleCreateCoupon} className="space-y-5">
                        {/* Coupon Code Field */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-700">
                              Coupon Code
                            </label>
                            <button
                              type="button"
                              onClick={() => setNewCoupon({ ...newCoupon, code: generateRandomCode() })}
                              className="text-xs text-primary-600 hover:text-primary-700"
                            >
                              Generate Random
                            </button>
                          </div>
                          <input
                            type="text"
                            value={newCoupon.code}
                            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500 font-mono bg-gray-50"
                            placeholder="XXXX-XXXX"
                            required
                          />
                        </div>

                        {/* Amount Field */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Amount (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-3.5 text-gray-500">₹</span>
                            <input
                              type="number"
                              value={newCoupon.amount}
                              onChange={(e) => setNewCoupon({ ...newCoupon, amount: e.target.value })}
                              className="w-full p-3 pl-7 border rounded-xl focus:ring-2 focus:ring-primary-500"
                              placeholder="Enter amount"
                              required
                            />
                          </div>
                        </div>

                        {/* Expiry Field */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Valid for
                          </label>
                          <select
                            value={newCoupon.expiry}
                            onChange={(e) => setNewCoupon({ ...newCoupon, expiry: parseInt(e.target.value) })}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500 bg-gray-50"
                          >
                            <option value={7}>7 days</option>
                            <option value={15}>15 days</option>
                            <option value={30}>30 days</option>
                            <option value={60}>60 days</option>
                          </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="flex-1 py-3 px-4 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors border"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                          >
                            Create Coupon
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                </div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}