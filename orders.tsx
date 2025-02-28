import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import { FaReceipt, FaCheckCircle, FaTimesCircle, FaBoxOpen, FaClock, FaMapMarkerAlt, 
         FaUtensils, FaTruck, FaHourglassHalf, FaChevronLeft } from 'react-icons/fa';
import { BiPackage } from 'react-icons/bi';
import Layout from '../components/layout/Layout';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import AuthGuard from '../components/auth/AuthGuard';
import { ImageWithFallback } from '../utils/imageHelpers';

// Interface definitions remain the same
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
  const [activeTab, setActiveTab] = useState('all');
  const router = useRouter();
  
  // Fetch orders (keep existing implementation)
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

  // New function to get filtered orders based on active tab
  const getFilteredOrders = () => {
    if (activeTab === 'all') return orders;
    if (activeTab === 'active') return orders.filter(order => 
      ['pending', 'accepted', 'ready'].includes(order.status)
    );
    if (activeTab === 'completed') return orders.filter(order => 
      order.status === 'completed'
    );
    if (activeTab === 'cancelled') return orders.filter(order => 
      order.status === 'cancelled'
    );
    return orders;
  };

  // Keep existing helper functions
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

  // New helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500" size={24} />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" size={24} />;
      case 'ready':
        return <FaBoxOpen className="text-blue-500" size={24} />;
      case 'accepted':
        return <FaUtensils className="text-purple-500" size={24} />;
      default: // pending
        return <FaClock className="text-amber-500" size={24} />;
    }
  };
  
  // New helper to get progress percentage
  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'completed': return 100;
      case 'ready': return 75;
      case 'accepted': return 50;
      case 'pending': return 25;
      case 'cancelled': return 100; // Full but styled differently
      default: return 0;
    }
  };

  return (
    <AuthGuard>
      <Layout>
        <Head>
          <title>My Orders - QuickByte</title>
          <meta name="description" content="View your order history" />
        </Head>

        <div className="container mx-auto px-4 py-6 sm:py-8 bg-gray-50 min-h-screen">
          {/* Mobile-friendly header */}
          <div className="relative mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">My Orders</h1>
                <p className="text-gray-500">Track and manage your food orders</p>
              </div>
              
              {!isLoading && orders.length > 0 && (
                <motion.button 
                  className="bg-primary-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full flex items-center gap-2 hover:bg-primary-700 transition-colors shadow-md active:scale-95 touch-manipulation w-full sm:w-auto justify-center"
                  onClick={() => router.push('/menu')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaUtensils />
                  <span>Order More</span>
                </motion.button>
              )}
            </div>

            {/* Mobile-optimized filter tabs - Scrollable */}
            {!isLoading && orders.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-1.5 mb-6 flex overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
                {[
                  { id: 'all', label: 'All Orders' },
                  { id: 'active', label: 'Active Orders' },
                  { id: 'completed', label: 'Completed' },
                  { id: 'cancelled', label: 'Cancelled' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl whitespace-nowrap font-medium transition-all flex-shrink-0 touch-manipulation ${
                      activeTab === tab.id 
                        ? 'bg-primary-600 text-white shadow-md' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-20 h-20 border-t-4 border-b-4 border-primary-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Loading your orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {getFilteredOrders().map((order) => (
                <motion.div
                  key={order.id}
                  layoutId={`order-card-${order.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl sm:rounded-3xl shadow-md hover:shadow-lg overflow-hidden cursor-pointer touch-manipulation"
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowOrderDetails(true);
                  }}
                >
                  {/* Order card header with status */}
                  <div className={`p-4 sm:p-5 relative ${
                    order.status === 'cancelled' ? 'bg-red-50' : 
                    order.status === 'completed' ? 'bg-green-50' : 
                    'bg-blue-50'
                  }`}>
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                      <span className="font-mono text-xs sm:text-sm bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-100">
                        #{order.id.substring(0, 8)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusBadgeClasses(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    
                    {/* Order progress bar */}
                    {order.status !== 'cancelled' && (
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2 sm:mb-3">
                        <motion.div 
                          className="h-full bg-primary-600"
                          initial={{ width: "0%" }}
                          animate={{ width: `${getProgressPercentage(order.status)}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="text-xs sm:text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                  
                  {/* Order Content */}
                  <div className="p-4 sm:p-5">
                    {/* Delivery option */}
                    <div className="flex items-center gap-2 mb-3 text-xs sm:text-sm text-gray-500">
                      {order.delivery_option === 'PICKUP' ? (
                        <>
                          <BiPackage className="text-primary-600" />
                          <span>Pickup at Canteen</span>
                        </>
                      ) : (
                        <>
                          <FaTruck className="text-primary-600" />
                          <span>Delivery to {order.classroom || 'Classroom'}</span>
                        </>
                      )}
                    </div>
                    
                    {/* Item preview with images */}
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-600 mb-2">Order Items:</h3>
                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="relative group">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-gray-200">
                              <ImageWithFallback
                                src={item.image_url || '/images/default-food.jpg'}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute -top-1 -right-1 bg-primary-600 text-white w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-xs">
                              {item.quantity}
                            </div>
                            
                            {/* Item name tooltip on hover */}
                            <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none whitespace-nowrap">
                              {item.name}
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Order meta info and actions */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="font-bold text-gray-900">
                        ₹{order.total.toFixed(2)}
                      </div>
                      
                      <div className="flex gap-2">
                        {canBeCancelled(order) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelOrder(order.id);
                            }}
                            className="px-4 py-1.5 text-xs sm:text-sm text-red-600 border border-red-200 rounded-full hover:bg-red-50"
                          >
                            Cancel
                          </button>
                        )}
                        <button 
                          className="px-4 py-1.5 text-xs sm:text-sm bg-primary-600 text-white rounded-full hover:bg-primary-700"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden max-w-lg mx-auto text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="p-8">
                <div className="w-32 h-32 mx-auto mb-6 bg-primary-50 rounded-full flex items-center justify-center">
                  <FaReceipt className="text-primary-400" size={48} />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-3">No Orders Yet</h2>
                <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                  Looks like you haven't placed any orders yet. Explore our delicious menu and place your first order now!
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
                  onClick={() => router.push('/menu')}
                >
                  <FaUtensils />
                  <span>Browse Our Menu</span>
                </motion.button>
              </div>
              
              <div className="bg-primary-50 p-6">
                <p className="text-primary-600 font-medium">Pro tip: Our most popular items sell out quickly!</p>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Innovative Order Details Modal */}
        <AnimatePresence>
          {showOrderDetails && selectedOrder && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowOrderDetails(false)}
            >
              <motion.div 
                className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
                layoutId={`order-card-${selectedOrder.id}`}
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                exit={{ y: 50 }}
              >
                {/* Order header with status */}
                <div className="relative">
                  {/* Status header bar with background gradient based on status */}
                  <div className={`p-6 ${
                    selectedOrder.status === 'cancelled' ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                    selectedOrder.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                    selectedOrder.status === 'ready' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                    selectedOrder.status === 'accepted' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                    'bg-gradient-to-r from-amber-500 to-amber-600'
                  } text-white`}>
                    <button 
                      onClick={() => setShowOrderDetails(false)}
                      className="absolute top-6 right-6 text-white/80 hover:text-white"
                    >
                      <FaChevronLeft size={24} />
                    </button>
                    
                    <div className="flex items-center gap-3">
                      {getStatusIcon(selectedOrder.status)}
                      <div>
                        <h3 className="font-bold text-xl">
                          Order {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </h3>
                        <p className="opacity-90">Order #{selectedOrder.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Order timeline - visual status representation */}
                  {selectedOrder.status !== 'cancelled' && (
                    <div className="bg-white p-4 border-b">
                      <div className="flex justify-between relative">
                        {/* Progress line behind status points */}
                        <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200">
                          <motion.div 
                            className="h-full bg-primary-600"
                            initial={{ width: "0%" }}
                            animate={{ width: `${getProgressPercentage(selectedOrder.status)}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                        
                        {/* Status points */}
                        {['pending', 'accepted', 'ready', 'completed'].map((status, i) => {
                          const isActive = ['pending', 'accepted', 'ready', 'completed'].indexOf(selectedOrder.status) >= i;
                          return (
                            <div key={status} className="flex flex-col items-center z-10">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isActive ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
                              }`}>
                                {i + 1}
                              </div>
                              <span className={`mt-2 text-xs font-medium ${
                                isActive ? 'text-primary-600' : 'text-gray-400'
                              }`}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Order content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      {/* Order Details */}
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-500 mb-2">ORDER DETAILS</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <FaClock className="text-gray-400" />
                            <span className="text-gray-600">{formatDate(selectedOrder.created_at)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            {selectedOrder.delivery_option === 'PICKUP' ? (
                              <>
                                <BiPackage className="text-gray-400" />
                                <span className="text-gray-600">Pickup at Canteen</span>
                              </>
                            ) : (
                              <>
                                <FaMapMarkerAlt className="text-gray-400" />
                                <span className="text-gray-600">Delivery to {selectedOrder.classroom}</span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <FaHourglassHalf className="text-gray-400" />
                            <span className="text-gray-600">
                              {selectedOrder.timing_slot?.label || 'Not specified'} 
                              {selectedOrder.timing_slot && (
                                <span className="text-gray-400"> ({selectedOrder.timing_slot.start} - {selectedOrder.timing_slot.end})</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Payment Summary */}
                      <div>
                        <h4 className="font-medium text-gray-500 mb-2">PAYMENT SUMMARY</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-gray-800">₹{selectedOrder.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Delivery Fee</span>
                            <span className="text-gray-800">₹{selectedOrder.delivery_charge.toFixed(2)}</span>
                          </div>
                          <div className="border-t border-gray-200 my-2 pt-2">
                            <div className="flex justify-between font-bold">
                              <span>Total</span>
                              <span className="text-primary-600">₹{selectedOrder.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-gray-500 mb-2">ORDER ITEMS ({selectedOrder.items.length})</h4>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto space-y-4">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex gap-3 bg-white p-3 rounded-lg shadow-sm">
                            <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                              <ImageWithFallback
                                src={item.image_url || '/images/default-food.jpg'}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-800">{item.name}</h5>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-gray-500 text-sm">{item.quantity} × ₹{item.price.toFixed(2)}</span>
                                <span className="font-medium">₹{(item.quantity * item.price).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action footer */}
                <div className="p-6 bg-gray-50 flex justify-end gap-3">
                  {canBeCancelled(selectedOrder) && (
                    <button
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      className="px-5 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      Cancel Order
                    </button>
                  )}
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Layout>
    </AuthGuard>
  );
}