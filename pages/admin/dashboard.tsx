import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { FaUsers, FaStore, FaChartBar, FaMoneyBillWave, FaTimesCircle, FaUndo } from 'react-icons/fa';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';
import RoleBasedGuard from '../../components/auth/RoleBasedGuard';

// Dynamically import charts to avoid SSR issues
const AnalyticsChart = dynamic(() => import('../../components/admin/AnalyticsChart'), { ssr: false });

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCanteens: 0,
    totalOrders: 0,
    totalRevenue: 0,
    cancelledOrders: 0,
    totalRefunded: 0,
    analytics: {
      daily: [],
      weekly: [],
      monthly: []
    }
  });

  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsType, setAnalyticsType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const authHeader = `Bearer ${token}`;
      
      const response = await fetch('http://127.0.0.1:5000/admin/dashboard', {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to load dashboard data');
        
        if (response.status === 401 || response.status === 403) {
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <motion.div 
      className="bg-white rounded-lg shadow-sm p-6"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <RoleBasedGuard allowedRoles={['admin']}>
      <AdminLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex gap-2">
              <button
                onClick={() => fetchDashboardData()}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                disabled={isLoading}
              >
                {isLoading ? 'Refreshing...' : 'Refresh Data'}
              </button>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={FaUsers}
              color="bg-blue-500"
            />
            <StatCard
              title="Total Canteens"
              value={stats.totalCanteens}
              icon={FaStore}
              color="bg-green-500"
            />
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={FaChartBar}
              color="bg-purple-500"
            />
            <StatCard
              title="Total Revenue"
              value={`₹${stats.totalRevenue.toLocaleString()}`}
              icon={FaMoneyBillWave}
              color="bg-yellow-500"
            />
            <StatCard
              title="Cancelled Orders"
              value={stats.cancelledOrders}
              icon={FaTimesCircle}
              color="bg-red-500"
            />
            <StatCard
              title="Total Refunded"
              value={`₹${stats.totalRefunded.toLocaleString()}`}
              icon={FaUndo}
              color="bg-orange-500"
            />
          </div>

          {showAnalytics && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Analytics</h2>
                  <div className="inline-flex rounded-md shadow-sm" role="group">
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                        analyticsType === 'daily' 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => setAnalyticsType('daily')}
                    >
                      Daily
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium ${
                        analyticsType === 'weekly' 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-white text-gray-700 border-t border-b border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => setAnalyticsType('weekly')}
                    >
                      Weekly
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                        analyticsType === 'monthly' 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => setAnalyticsType('monthly')}
                    >
                      Monthly
                    </button>
                  </div>
                </div>
                <div className="h-[400px]">
                  <AnalyticsChart 
                    data={stats.analytics[analyticsType]} 
                    type="revenue" 
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </RoleBasedGuard>
  );
}
