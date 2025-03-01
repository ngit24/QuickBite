import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import AuthGuard from '../components/auth/AuthGuard';
import { FaShoppingCart, FaMapMarkerAlt, FaClock, FaChevronRight, FaCheck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const DELIVERY_OPTIONS = {
  PICKUP: {
    id: 'PICKUP',
    label: 'Canteen Pickup',
    charge: 0,
    icon: <FaShoppingCart className="text-primary-500" />
  },
  CLASS: {
    id: 'CLASS',
    label: 'Classroom Delivery',
    charge: 20,
    icon: <FaMapMarkerAlt className="text-primary-500" />
  }
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [deliveryOption, setDeliveryOption] = useState('PICKUP');
  const [classroom, setClassroom] = useState('');
  const [mealTiming, setMealTiming] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mealTimings, setMealTimings] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      router.push('/menu');
    }

    // Fetch meal timings
    fetch('https://localhost969.pythonanywhere.com/utility/meal-timings')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMealTimings(data.timings);
        }
      })
      .catch(err => console.error('Error fetching meal timings:', err));
  }, [router]);

  // Updated price calculations - GST inclusive
  const calculatePrices = () => {
    const subtotalWithGST = cart.reduce((total, item) => {
      // Use the discounted price stored in cart
      return total + (item.price * item.quantity);
    }, 0);
    
    const gstAmount = (subtotalWithGST * 0.18) / 1.18; // Calculate GST from inclusive price
    const subtotalBeforeGST = subtotalWithGST - gstAmount;
    const deliveryCharge = DELIVERY_OPTIONS[deliveryOption].charge;
    const total = subtotalWithGST + deliveryCharge;

    return {
      subtotalBeforeGST: Number(subtotalBeforeGST.toFixed(2)),
      gstAmount: Number(gstAmount.toFixed(2)),
      subtotalWithGST: Number(subtotalWithGST.toFixed(2)),
      deliveryCharge,
      total: Number(total.toFixed(2))
    };
  };

  const prices = calculatePrices();

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    
    try {
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      
      const response = await fetch('https://localhost969.pythonanywhere.com/apply-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          code: couponCode,
          user_email: userEmail,
          order_total: prices.total
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAppliedCoupon(data.coupon);
        setCouponError('');
      } else {
        setCouponError(data.message);
      }
    } catch (error) {
      setCouponError('Failed to apply coupon');
    }
  };

  const handleSubmit = async () => {
    if (deliveryOption === 'CLASS' && !classroom) {
      setError('Please enter your classroom number');
      return;
    }

    if (!mealTiming) {
      setError('Please select a meal timing');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const userResponse = await fetch('https://localhost969.pythonanywhere.com/user', {
        headers: {
          'Authorization': token
        }
      });
      const userData = await userResponse.json();

      const orderData = {
        user_email: userData.email,
        items: cart,
        delivery_option: deliveryOption,
        classroom: classroom,
        meal_timing: mealTiming,
        total: prices.total
      };

      const response = await fetch('https://localhost969.pythonanywhere.com/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (data.success) {
        // Show success message with animation
        setShowSuccess(true);
        
        // Clear cart
        localStorage.removeItem('cart');
        
        // Wait for animation before redirecting
        setTimeout(() => {
          router.push('/orders');
        }, 2000);
      } else {
        setError(data.message || 'Insufficient balance');
      }
    } catch (err) {
      setError('An error occurred while placing your order');
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart.length) {
    return null; // Will redirect in useEffect
  }

  const CouponSection = (
    <div className="mt-6 border-t pt-6">
      <h3 className="text-lg font-medium mb-3">Have a coupon?</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="flex-1 p-2 border rounded-lg"
        />
        <button
          onClick={handleApplyCoupon}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg"
        >
          Apply
        </button>
      </div>
      {couponError && (
        <p className="mt-2 text-sm text-red-600">{couponError}</p>
      )}
      {appliedCoupon && (
        <div className="mt-2 p-2 bg-green-50 text-green-700 rounded-lg flex items-center justify-between">
          <span>Coupon applied! Cashback: ₹{appliedCoupon.cashback}</span>
          <button
            onClick={() => setAppliedCoupon(null)}
            className="text-sm underline"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );

  const CartItemDisplay = ({ item }: { item: any }) => (
    <div className="flex justify-between py-2">
      <div>
        <span className="font-medium">{item.quantity}x </span>
        {item.name}
      </div>
      <div className="flex items-center gap-2">
        {item.discount > 0 && (
          <span className="text-sm text-gray-400 line-through">
            ₹{(item.originalPrice * item.quantity).toFixed(2)}
          </span>
        )}
        <span className="font-medium">
          ₹{(item.price * item.quantity).toFixed(2)}
        </span>
      </div>
    </div>
  );

  return (
    <AuthGuard>
      <Layout>
        <Head>
          <title>Checkout - QuickByte</title>
          <meta name="description" content="Complete your order" />
        </Head>

        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 lg:pl-checkout-l lg:pr-checkout-r py-8">
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>

            {/* Delivery Options */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Delivery Options</h2>
              <div className="space-y-4">
                {Object.values(DELIVERY_OPTIONS).map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setDeliveryOption(option.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                      deliveryOption === option.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {option.icon}
                      <div className="text-left">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-500">
                          {option.charge ? `₹${option.charge} delivery fee` : 'No delivery fee'}
                        </div>
                      </div>
                    </div>
                    <FaChevronRight className={`transition-colors ${
                      deliveryOption === option.id ? 'text-primary-500' : 'text-gray-400'
                    }`} />
                  </button>
                ))}
              </div>

              {/* Classroom Input */}
              {deliveryOption === 'CLASS' && (
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Enter your classroom number / name"
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
            </div>

            {/* Meal Timing Selection */}
            {mealTimings && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Select Meal Timing</h2>
                <div className="space-y-3">
                  {Object.entries(mealTimings).map(([key, timing]: [string, any]) => (
                    <button
                      key={key}
                      onClick={() => setMealTiming(key)}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                        mealTiming === key
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FaClock className="text-primary-500" />
                        <div className="text-left">
                          <div className="font-medium">{timing.label}</div>
                          <div className="text-sm text-gray-500">
                            {timing.start} - {timing.end}
                          </div>
                        </div>
                      </div>
                      <FaChevronRight className={`transition-colors ${
                        mealTiming === key ? 'text-primary-500' : 'text-gray-400'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Order Summary - Updated with inclusive GST */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <CartItemDisplay key={item.id} item={item} />
                ))}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Price (incl. of GST)</span>
                    <span>₹{prices.subtotalWithGST.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Base Price</span>
                    <span>₹{prices.subtotalBeforeGST.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>GST (18%)</span>
                    <span>₹{prices.gstAmount.toFixed(2)}</span>
                  </div>
                  {prices.deliveryCharge > 0 && (
                    <div className="flex justify-between mt-2 text-gray-600">
                      <span>Delivery Fee</span>
                      <span>₹{prices.deliveryCharge.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between mt-2 pt-2 border-t text-lg font-bold text-primary-600">
                    <span>Total</span>
                    <span>₹{prices.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {CouponSection}

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full mt-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>

        {/* Success Message Overlay */}
        <AnimatePresence>
          {showSuccess && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-2xl"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center"
                  >
                    <FaCheck className="text-2xl text-green-600" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Order Placed Successfully!
                  </h3>
                  <p className="text-gray-500 mb-1">
                    Your order has been confirmed.
                  </p>
                  <p className="text-sm text-gray-400">
                    Redirecting to orders...
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </Layout>
    </AuthGuard>
  );
}