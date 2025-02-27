import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FaTrash, FaArrowLeft, FaPlus, FaMinus, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import Layout from '../components/layout/Layout';
import AuthGuard from '../components/auth/AuthGuard';
import { toast } from 'react-toastify';

export default function CheckoutPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [deliveryOption, setDeliveryOption] = useState('PICKUP');
  const [classroom, setClassroom] = useState('');
  const [mealTiming, setMealTiming] = useState('LUNCH');
  const [timingSlots, setTimingSlots] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      // Redirect if cart is empty
      router.push('/menu');
    }

    // Fetch timing slots
    fetch('http://127.0.0.1:5000/utility/meal-timings')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTimingSlots(data.timings);
        }
      })
      .catch(err => console.error('Error fetching timing slots:', err));

    // Fetch user info for wallet balance
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://127.0.0.1:5000/user', {
        headers: {
          Authorization: token,
        },
      })
        .then(res => res.json())
        .then(data => {
          setUserInfo(data);
        })
        .catch(err => console.error('Error fetching user info:', err));
    }
  }, [router]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      // Remove item if quantity is less than 1
      const newCart = cart.filter(item => item.id !== id);
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
      
      if (newCart.length === 0) {
        router.push('/menu');
      }
    } else {
      // Update quantity
      const newCart = cart.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const removeItem = (id: string) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    
    if (newCart.length === 0) {
      router.push('/menu');
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
    router.push('/menu');
  };

  const handleCheckout = async () => {
    // Validate form
    if (deliveryOption === 'CLASS' && !classroom) {
      toast.error('Please specify your classroom for delivery');
      return;
    }

    setIsLoading(true);

    try {
      const userEmail = localStorage.getItem('userEmail');
      const token = localStorage.getItem('token');

      if (!userEmail || !token) {
        toast.error('You need to be logged in to place an order');
        router.push('/login');
        return;
      }

      const orderData = {
        user_email: userEmail,
        items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
        delivery_option: deliveryOption,
        classroom: classroom,
        meal_timing: mealTiming,
      };

      const response = await fetch('http://127.0.0.1:5000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Order placed successfully!');
        localStorage.removeItem('cart');
        router.push(`/orders?success=true&orderId=${data.order_id}`);
      } else {
        throw new Error(data.error || 'Failed to place order');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getDeliveryCharge = () => {
    return deliveryOption === 'CLASS' ? 20 : 0;
  };

  const getTotal = () => {
    return getSubtotal() + getDeliveryCharge();
  };

  return (
    <AuthGuard>
      <Layout>
        <Head>
          <title>Checkout - QuickByte</title>
          <meta name="description" content="Complete your food order" />
        </Head>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => router.back()}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Order Summary</h2>
                  <button 
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear Cart
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Your cart is empty</p>
                    <button 
                      onClick={() => router.push('/menu')}
                      className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    >
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {cart.map((item) => (
                      <div key={item.id} className="py-4 flex justify-between">
                        <div className="flex items-center">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 mr-4">
                            {item.image_url ? (
                              <img 
                                src={item.image_url} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary-100">
                                <FaUtensils className="text-2xl text-primary-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.category}</p>
                            <p className="text-primary-600 font-semibold">₹{item.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden mr-4">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                              <FaMinus className="text-xs" />
                            </button>
                            <span className="px-3 py-1">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                              <FaPlus className="text-xs" />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delivery Options */}
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h2 className="text-lg font-medium mb-4">Delivery Options</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <input
                      type="radio"
                      id="pickup"
                      name="deliveryOption"
                      value="PICKUP"
                      checked={deliveryOption === 'PICKUP'}
                      onChange={() => setDeliveryOption('PICKUP')}
                      className="mt-1"
                    />
                    <label htmlFor="pickup" className="ml-2">
                      <div className="font-medium flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-green-600" />
                        Canteen Pickup
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Pick up your order from the canteen counter (No extra charge)
                      </p>
                    </label>
                  </div>
                  
                  <div className="flex items-start">
                    <input
                      type="radio"
                      id="delivery"
                      name="deliveryOption"
                      value="CLASS"
                      checked={deliveryOption === 'CLASS'}
                      onChange={() => setDeliveryOption('CLASS')}
                      className="mt-1"
                    />
                    <label htmlFor="delivery" className="ml-2">
                      <div className="font-medium flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-blue-600" />
                        Classroom Delivery
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Get your order delivered to your classroom (₹20 extra)
                      </p>
                    </label>
                  </div>
                  
                  {deliveryOption === 'CLASS' && (
                    <div className="pl-6 mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Classroom/Location*
                      </label>
                      <input
                        type="text"
                        value={classroom}
                        onChange={(e) => setClassroom(e.target.value)}
                        placeholder="e.g. Room 301, Computer Lab"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-600 focus:border-primary-600"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Meal Timing */}
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <FaClock className="mr-2 text-primary-600" />
                  Meal Timing
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      When do you want your meal?
                    </label>
                    <select
                      value={mealTiming}
                      onChange={(e) => setMealTiming(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-600 focus:border-primary-600"
                    >
                      {Object.entries(timingSlots).map(([key, value]: [string, any]) => (
                        <option key={key} value={key}>
                          {value.label} ({value.start} - {value.end})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
                <h2 className="text-lg font-medium mb-4">Payment Summary</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>₹{getDeliveryCharge().toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-100 my-4"></div>
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>₹{getTotal().toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="bg-gray-50 rounded-md p-3 mb-4 flex justify-between">
                    <span className="text-gray-700">Wallet Balance</span>
                    <span className="font-medium">
                      ₹{userInfo?.wallet_balance?.toFixed(2) || '0.00'}
                    </span>
                  </div>

                  {userInfo && userInfo.wallet_balance < getTotal() && (
                    <div className="text-red-600 text-sm mb-4 text-center">
                      Insufficient wallet balance. Please add funds to continue.
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={isLoading || !userInfo || userInfo.wallet_balance < getTotal()}
                    className={`w-full py-3 px-4 rounded-lg text-white text-base font-medium transition-colors
                      ${isLoading || !userInfo || userInfo.wallet_balance < getTotal()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700'
                      }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      'Place Order'
                    )}
                  </button>

                  {userInfo && userInfo.wallet_balance < getTotal() && (
                    <Link 
                      href="/wallet"
                      className="mt-4 w-full py-3 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white text-base font-medium text-center block transition-colors"
                    >
                      Add Funds to Wallet
                    </Link>
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