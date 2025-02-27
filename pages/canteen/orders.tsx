import { useState, useEffect } from 'react';
import Head from 'next/head';
import { toast } from 'react-toastify';
import CanteenLayout from '../../components/layout/CanteenLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { 
  FaUtensils, FaClock, FaCheckCircle, FaTimes, 
  FaBell, FaMotorcycle, FaFilter 
} from 'react-icons/fa';

export default function CanteenOrders() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/orders/canteen?status=${filterStatus}`, {
        headers: {
          Authorization: localStorage.getItem('token') || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token') || ''
        },
        body: JSON.stringify({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
      });

      const data = await response.json();
      
      if (response.ok && data.ok) {
        toast.success(`Order ${newStatus} successfully`);
        fetchOrders(); // Refresh orders list
      } else {
        throw new Error(data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const OrderCard = ({ order }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
    >
      {/* Order Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900">#{order.id.slice(0, 8)}</h3>
            <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Order Items */}
      <div className="p-6">
        <div className="space-y-4">
          {order.items?.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-white border border-gray-200">
                <img 
                  src={item.image_url || '/placeholder.png'} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                    ×{item.quantity}
                  </span>
                  <span>₹{item.price} each</span>
                </div>
              </div>
              <p className="font-semibold text-gray-900">₹{(item.quantity * item.price).toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* Delivery Info */}
        {order.delivery_option === 'classroom' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2">
              <FaMotorcycle className="text-blue-600" />
              <span className="font-medium text-blue-800">Classroom Delivery</span>
            </div>
            <p className="mt-1 text-sm text-blue-600">Deliver to: {order.classroom}</p>
            {order.scheduled_time && (
              <p className="mt-1 text-sm text-blue-600">
                Scheduled: {new Date(order.scheduled_time).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Order Actions */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">Total Amount</span>
            <span className="text-2xl font-bold text-gray-900">₹{order.total.toFixed(2)}</span>
          </div>

          <div className="flex gap-3">
            {order.status === 'pending' && (
              <>
                <button
                  onClick={() => updateOrderStatus(order.id, 'ready')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaUtensils /> Accept & Prepare
                </button>
                <button
                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FaTimes /> Cancel Order
                </button>
              </>
            )}
            {order.status === 'ready' && (
              <button
                onClick={() => updateOrderStatus(order.id, 'completed')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaCheckCircle /> Mark Completed
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <CanteenLayout>
      <Head>
        <title>Order Management | QuickByte</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          
          <div className="flex flex-wrap gap-2">
            {['pending', 'ready', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${filterStatus === status 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <FaBell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No {filterStatus} orders</h3>
            <p className="mt-2 text-gray-500">When new orders arrive, they'll appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {orders.map((order: any) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </CanteenLayout>
  );
}
