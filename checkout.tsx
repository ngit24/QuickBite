import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import AuthGuard from '../components/auth/AuthGuard';
import { FaShoppingCart, FaArrowLeft, FaMoneyBillWave, FaWallet, FaTrashAlt, FaMinus, FaPlus, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { MdOutlineShoppingCartOff } from 'react-icons/md';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [deliveryOption, setDeliveryOption] = useState('PICKUP');
  const [classroom, setClassroom] = useState('');
  const [mealTiming, setMealTiming] = useState('LUNCH');
  const [timingSlots, setTimingSlots] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Fetch user details and delivery locations on page load
  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('https://localhost969.pythonanywhere.com/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }

      // Fetch meal timings
      try {
        const response = await fetch('http://127.0.0.1:5000/utility/meal-timings');
        if (response.ok) {
          const data = await response.json();
          setTimingSlots(data.timings);
        }
      } catch (error) {
        console.error('Error fetching meal timings:', error);
      }

      setIsLoading(false);
    };

    fetchUserDetails();
  }, [router]);

  const updateCartItem = (index: number, quantity: number) => {
    const updatedCart = [...cart];
    if (quantity <= 0) {
      updatedCart.splice(index, 1);
    } else {
      updatedCart[index].quantity = quantity;
    }
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (index: number) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateDeliveryCharge = () => {
    return deliveryOption === 'PICKUP' ? 0 : 20; // Example delivery charge
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDeliveryCharge();
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    setIsProcessing(true);
    setOrderError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const orderData = {
        user_email: user.email,
        items: cart,
        delivery_option: deliveryOption,
        classroom: classroom,
        meal_timing: mealTiming,
      };

      const response = await fetch('http://127.0.0.1:5000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Order placed successfully
        setOrderSuccess(true);
        clearCart();
      } else {
        setOrderError(data.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setOrderError('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  // Mobile-optimized empty cart view
  if (cart.length === 0 && !isLoading && !orderSuccess) {
    return (
      <AuthGuard>
        <Layout>
          <Head>
            <title>Your Cart - QuickByte</title>
          </Head>
          <div className="container mx-auto px-4 py-8 sm:py-16 flex flex-col items-center">
            <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-10 w-full max-w-2xl text-center">
              <div className="flex justify-center mb-6">
                <MdOutlineShoppingCartOff className="text-6xl sm:text-8xl text-gray-200" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-4">Your cart is empty</h2>
              <p className="text-gray-500 mb-8">
                Looks like you haven't added any items to your cart yet.
              </p>
              <button
                onClick={() => router.push('/menu')}
                className="px-6 sm:px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mx-auto active:scale-95 touch-manipulation"
              >
                <FaShoppingCart />
                <span>Browse Menu</span>
              </button>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  // Order success view
  if (orderSuccess) {
    return (
      <AuthGuard>
        <Layout>
          <Head>
            <title>Order Confirmation - QuickByte</title>
          </Head>
          <div className="container mx-auto px-4 py-16 flex flex-col items-center">
            <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-2xl text-center">
              <div className="w-24 h-24 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-700 mb-4">Order Placed Successfully!</h2>
              <p className="text-gray-500 mb-8">
                Thank you for your order. You can track your order status in the orders section.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/orders')}
                  className="px-6 py-3 bg-primary-600 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                  View Orders
                </button>
                <button
                  onClick={() => router.push('/menu')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-all duration-300"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex justify-center items-center h-[70vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary-600"></div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <Head>
          <title>Checkout - QuickByte</title>
          <meta name="description" content="Complete your order" />
        </Head>

        <div className="container mx-auto px-4 py-6 sm:py-8">
          {/* Back button with better mobile tap area */}
          <button 
            onClick={() => router.push('/menu')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4 sm:mb-6 transition-colors py-2 touch-manipulation"
          >
            <FaArrowLeft />
            <span>Continue Shopping</span>
          </button>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Complete Your Order</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Cart Items & Delivery Options - Full width on mobile */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Items with mobile optimizations */}
              <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Your Cart</h2>
                  <button 
                    onClick={clearCart}
                    className="text-gray-500 hover:text-red-500 transition-colors text-sm flex items-center gap-1 p-1 touch-manipulation"
                  >
                    <FaTrashAlt />
                    <span>Clear</span>
                  </button>
                </div>

                <div className="divide-y divide-gray-100">
                  {cart.map((item, index) => (
                    <div key={index} className="py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      {/* Mobile-optimized product layout */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image_url || '/images/default-food.jpg'} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/default-food.jpg';
                          }}
                        />
                      </div>

                      {/* Stack details vertically on mobile */}
                      <div className="flex-grow min-w-0">
                        <h3 className="font-medium text-gray-800 truncate">{item.name}</h3>
                        <p className="text-gray-500 text-sm">{item.category}</p>
                        <div className="flex items-center justify-between mt-2 sm:mt-1">
                          <p className="text-primary-600 font-bold">₹{item.price}</p>
                          
                          {/* Mobile-optimized quantity controls */}
                          <div className="flex items-center">
                            <button 
                              onClick={() => updateCartItem(index, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors active:bg-gray-300 touch-manipulation"
                              aria-label="Decrease quantity"
                            >
                              <FaMinus className="text-xs text-gray-600" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartItem(index, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors active:bg-gray-300 touch-manipulation"
                              aria-label="Increase quantity"
                            >
                              <FaPlus className="text-xs text-gray-600" />
                            </button>
                            
                            <span className="font-bold ml-3">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                            
                            <button 
                              onClick={() => removeFromCart(index)}
                              className="ml-3 text-gray-400 hover:text-red-500 transition-colors p-2 touch-manipulation"
                              aria-label="Remove item"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile-optimized delivery options */}
              <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">Delivery Options</h2>

                {/* Delivery option selection - Stack on mobile */}
                <div className="grid grid-cols-1 gap-3 mb-6">
                  <div 
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${
                      deliveryOption === 'PICKUP' 
                        ? 'border-primary-600 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setDeliveryOption('PICKUP')}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        deliveryOption === 'PICKUP' ? 'border-primary-600' : 'border-gray-300'
                      }`}>
                        {deliveryOption === 'PICKUP' && (
                          <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">Canteen Pickup</h3>
                        <p className="text-gray-500 text-sm">Collect from the counter</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${
                      deliveryOption === 'CLASS' 
                        ? 'border-primary-600 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setDeliveryOption('CLASS')}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        deliveryOption === 'CLASS' ? 'border-primary-600' : 'border-gray-300'
                      }`}>
                        {deliveryOption === 'CLASS' && (
                          <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">Classroom Delivery</h3>
                        <p className="text-gray-500 text-sm">Delivered to your classroom (₹20)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Classroom input - Larger input on mobile */}
                {deliveryOption === 'CLASS' && (
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="classroom">
                      Classroom Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaMapMarkerAlt className="text-gray-400" />
                      </div>
                      <input
                        id="classroom"
                        type="text"
                        className="pl-10 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter classroom number or name"
                        value={classroom}
                        onChange={(e) => setClassroom(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Mobile-friendly meal timing selection */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Preferred Meal Timing <span className="text-red-500">*</span>
                  </label>

                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(timingSlots).map(([key, slot]: [string, any]) => (
                      <div 
                        key={key}
                        className={`border rounded-xl p-4 cursor-pointer transition-all ${
                          mealTiming === key 
                            ? 'border-primary-600 bg-primary-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setMealTiming(key)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            mealTiming === key ? 'border-primary-600' : 'border-gray-300'
                          }`}>
                            {mealTiming === key && (
                              <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{slot.label}</h3>
                            <p className="text-gray-500 text-sm">{slot.start} - {slot.end}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary - Mobile optimized */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">₹{calculateDeliveryCharge().toFixed(2)}</span>
                  </div>
                  
                  <div className="h-px bg-gray-200 my-2"></div>
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">₹{calculateTotal().toFixed(2)}</span>
                  </div>

                  {/* Mobile-optimized wallet balance */}
                  <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <FaWallet className="text-primary-600" />
                      <span className="text-gray-600">Wallet Balance</span>
                    </div>
                    <span className="font-medium">
                      ₹{user?.wallet_balance?.toFixed(2) || '0.00'}
                    </span>
                  </div>

                  {/* Insufficient balance warning */}
                  {user && user.wallet_balance < calculateTotal() && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                      Insufficient wallet balance. Please add funds.
                    </div>
                  )}

                  {/* Place order button - Larger on mobile */}
                  <button
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 active:bg-primary-800 touch-manipulation"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || (user && user.wallet_balance < calculateTotal()) || deliveryOption === 'CLASS' && !classroom}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <FaMoneyBillWave />
                        <span>Place Order</span>
                      </>
                    )}
                  </button>

                  {/* Order error message */}
                  {orderError && (
                    <div className="text-red-500 text-sm text-center mt-2">
                      {orderError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}