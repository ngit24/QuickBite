import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { FaUtensils, FaHistory, FaWallet, FaArrowRight } from 'react-icons/fa';
import Layout from '../components/layout/Layout';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface User {
  name: string;
  email: string;
  wallet_balance: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');

    if (!token || !userEmail) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        // Fetch user details
        const userResponse = await fetch('https://localhost969.pythonanywhere.com/user', {
          headers: {
            Authorization: token,
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        setUser(userData);

        // Fetch recent orders
        const ordersResponse = await fetch(`https://localhost969.pythonanywhere.com/orders/user/${userEmail}`);
        
        if (!ordersResponse.ok) {
          throw new Error('Failed to fetch orders');
        }

        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.orders?.slice(0, 3) || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Dashboard - QuickByte</title>
        <meta name="description" content="QuickByte user dashboard" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of your activity and quick access to common tasks.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/menu" className="bg-primary-50 hover:bg-primary-100 p-4 rounded-lg transition-colors flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                    <FaUtensils className="text-primary-600 text-xl" />
                  </div>
                  <span className="text-gray-800 font-medium">Order Food</span>
                </Link>
                <Link href="/orders" className="bg-primary-50 hover:bg-primary-100 p-4 rounded-lg transition-colors flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                    <FaHistory className="text-primary-600 text-xl" />
                  </div>
                  <span className="text-gray-800 font-medium">Order History</span>
                </Link>
                <Link href="/wallet" className="bg-primary-50 hover:bg-primary-100 p-4 rounded-lg transition-colors flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                    <FaWallet className="text-primary-600 text-xl" />
                  </div>
                  <span className="text-gray-800 font-medium">Manage Wallet</span>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Wallet Summary */}
          <motion.div
            className="col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Wallet Balance</h2>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-gray-800">
                  ₹{user?.wallet_balance.toFixed(2)}
                </div>
                <Link href="/wallet" className="mt-4 text-primary-600 flex items-center hover:text-primary-700 font-medium">
                  Manage Wallet <FaArrowRight className="ml-2" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
              <Link href="/orders" className="text-primary-600 hover:text-primary-700 flex items-center">
                View All <FaArrowRight className="ml-2" />
              </Link>
            </div>

            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-wrap justify-between mb-2">
                      <div className="font-medium text-gray-800">Order #{order.id.substring(0, 8)}...</div>
                      <div className="text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      {order.created_at ? formatDate(order.created_at) : 'Date not available'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.items?.slice(0, 2).map((item, index) => (
                        <span key={index}>
                          {item.quantity}x {item.name}
                          {index < Math.min(2, order.items.length - 1) ? ', ' : ''}
                        </span>
                      ))}
                      {order.items?.length > 2 && ` and ${order.items.length - 2} more`}
                    </div>
                    <div className="mt-2 text-sm font-medium text-gray-800">
                      Total: ₹{order.total.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No orders yet. Start ordering delicious meals!</p>
                <Link href="/menu" className="text-primary-600 mt-2 inline-block hover:text-primary-700">
                  Browse Menu
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
