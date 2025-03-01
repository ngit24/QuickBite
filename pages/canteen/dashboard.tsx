import { useState, useEffect } from 'react';
import Head from 'next/head';
import { toast } from 'react-toastify';
import CanteenLayout from '../../components/layout/CanteenLayout';
import { DashboardCard } from '../../components/ui/DashboardCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { motion } from 'framer-motion';
import { 
  FaUtensils, FaMoneyBillWave, FaShoppingCart, 
  FaCheckCircle, FaChartLine, FaClock 
} from 'react-icons/fa';

export default function CanteenDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    recentOrders: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('https://localhost969.pythonanywhere.com/orders/canteen', {
        headers: {
          Authorization: localStorage.getItem('token') || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const orders = data.orders || [];
          setStats({
            totalOrders: orders.length,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            completedOrders: orders.filter(o => o.status === 'completed').length,
            totalRevenue: orders.reduce((sum, o) => 
              o.status !== 'cancelled' ? sum + o.total : sum, 0
            ),
            recentOrders: orders.slice(0, 5)
          });
        }
      }
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <CanteenLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </CanteenLayout>
    );
  }

  return (
    <CanteenLayout>
      <Head>
        <title>Dashboard | QuickByte Canteen</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Canteen Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Monitor your canteen's performance and orders</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Today's Orders"
            value={stats.totalOrders}
            icon={FaShoppingCart}
            color="blue"
          />
          <DashboardCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={FaClock}
            color="amber"
          />
          <DashboardCard
            title="Completed Orders"
            value={stats.completedOrders}
            icon={FaCheckCircle}
            color="green"
          />
          <DashboardCard
            title="Today's Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={FaMoneyBillWave}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
            <div className="space-y-4">
              {stats.recentOrders.map((order: any) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <StatusBadge status={order.status} size="sm" />
                    </div>
                    <div>
                      <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">₹{order.total.toLocaleString()}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => window.location.href = '/canteen/orders'}
                className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FaShoppingCart className="w-6 h-6 text-blue-600 mb-2" />
                <p className="font-medium">View Orders</p>
              </button>
              <button
                onClick={() => window.location.href = '/canteen/menu'}
                className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <FaUtensils className="w-6 h-6 text-green-600 mb-2" />
                <p className="font-medium">Manage Menu</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </CanteenLayout>
  );
}
