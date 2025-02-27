import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { FaReceipt, FaInfoCircle, FaExclamationCircle } from 'react-icons/fa';
import Layout from '../components/layout/Layout';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image_url?: string;
}

interface Order {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  delivery_charge: number;
  created_at: string;
  items: OrderItem[];
  delivery_option: string;
  classroom?: string;
  meal_timing: string;
  timing_slot?: {
    label: string;
    start: string;
    end: string;
  };
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');

    if (!token || !userEmail) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(`https://localhost969.pythonanywhere.com/orders/user/${userEmail}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const ordersData = await response.json();
        if (ordersData.success && ordersData.orders) {
          setOrders(ordersData.orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'ready':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-purple-100 text-purple-800';
      default: // pending or any other status
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order? You\'ll receive a refund to your wallet.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost969.pythonanywhere.com/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || ''
        },
        body: JSON.stringify({ refund_option: 'full' })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Order cancelled successfully');
        // Update the order status in the list
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: 'cancelled' } 
              : order
          )
        );
        setShowOrderDetails(false);
      } else {
        toast.error(data.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('An error occurred while cancelling the order');
    }
  };

  const canBeCancelled = (order: Order) => {
    return order.status === 'pending';
  };

  return (
    <Layout>
      <Head>
        <title>My Orders - QuickByte</title>
        <meta name="description" content="View your order history" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <motion.tr 
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleOrderClick(order)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order.id.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(order.created_at)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items.slice(0, 2).map((item, index) => (
                          <span key={index}>
                            {item.quantity}x {item.name}
                            {index < Math.min(1, order.items.length - 1) ? ', ' : ''}
                          </span>
                        ))}
                        {order.items.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{order.total.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderClick(order);
                        }}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Details
                      </button>
                      {canBeCancelled(order) && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelOrder(order.id);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FaReceipt className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet. Start by ordering some delicious food!</p>
            <button
              onClick={() => router.push('/menu')}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Browse Menu
            </button>
          </div>
        )}
      </div>
      
      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div 
            className="bg-white rounded-lg w-full max-w-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Order Details <span className="text-sm text-gray-500 ml-2">#{selectedOrder.id.substring(0, 8)}...</span>
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500" 
                onClick={() => setShowOrderDetails(false)}
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div className="flex items-center mb-4">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(selectedOrder.status)}`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
                <span className="text-gray-500 text-sm ml-3">{formatDate(selectedOrder.created_at)}</span>
              </div>
              
              {/* Delivery Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Information</h4>
                <div className="flex flex-col space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Option:</span> {selectedOrder.delivery_option === 'PICKUP' 
                      ? 'Canteen Pickup' 
                      : `Classroom Delivery${selectedOrder.classroom ? ` (${selectedOrder.classroom})` : ''}`}
                  </p>
                  <p>
                    <span className="font-medium">Meal Timing:</span> {selectedOrder.timing_slot?.label || 'Not specified'} 
                    {selectedOrder.timing_slot && (
                      <span className="text-gray-500"> ({selectedOrder.timing_slot.start} - {selectedOrder.timing_slot.end})</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center border-b border-gray-100 pb-2">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-3">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <FaUtensils />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-800">{item.name}</h5>
                        <p className="text-xs text-gray-500">
                          {item.quantity} × ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        ₹{(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <p>Subtotal</p>
                  <p>₹{selectedOrder.subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <p>Delivery Fee</p>
                  <p>₹{selectedOrder.delivery_charge.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-base font-medium text-gray-900 border-t border-gray-200 pt-2 mt-2">
                  <p>Total</p>
                  <p>₹{selectedOrder.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              {canBeCancelled(selectedOrder) ? (
                <button
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Cancel Order
                </button>
              ) : selectedOrder.status === 'cancelled' ? (
                <div className="flex items-center text-red-600">
                  <FaExclamationCircle className="mr-2" />
                  <span>This order has been cancelled</span>
                </div>
              ) : null}
              <button
                onClick={() => setShowOrderDetails(false)}
                className="px-4 py-2 ml-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}