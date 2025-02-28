import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaTrash, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa';
import Layout from '../components/layout/Layout';

interface CartItem {
  id: string;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
}

interface DeliveryOption {
  id: string;
  label: string;
  charge: number;
}

interface MealTiming {
  id: string;
  label: string;
  start: string;
  end: string;
}

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [mealTimings, setMealTimings] = useState<MealTiming[]>([]);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState('PICKUP');
  const [selectedMealTiming, setSelectedMealTiming] = useState('');
  const [classroom, setClassroom] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadCart();
    fetchDeliveryOptions();
    fetchMealTimings();
  }, []);

  const loadCart = async () => {
    setIsLoading(true);
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    const parsedCart = savedCart ? JSON.parse(savedCart) : [];
    setCartItems(parsedCart);

    if (parsedCart.length > 0) {
      await fetchProductDetails();
    } else {
      setIsLoading(false);
    }
  };

  const fetchProductDetails = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/get-products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const productsList = await response.json();
      setProducts(productsList);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeliveryOptions = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/utility/delivery-locations');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.locations) {
          const options = Object.entries(data.locations).map(([id, details]: [string, any]) => ({
            id,
            label: details.label,
            charge: details.charge
          }));
          setDeliveryOptions(options);
        }
      }
    } catch (error) {
      console.error('Error fetching delivery options:', error);
    }
  };

  const fetchMealTimings = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/utility/meal-timings');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.timings) {
          const timings = Object.entries(data.timings).map(([id, details]: [string, any]) => ({
            id,
            label: details.label,
            start: details.start,
            end: details.end
          }));
          setMealTimings(timings);
          if (timings.length > 0) {
            setSelectedMealTiming(timings[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching meal timings:', error);
    }
  };

  const updateQuantity = (id: string, change: number) => {
    setCartItems((prev) => {
      const updatedCart = prev.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => {
      const updatedCart = prev.filter((item) => item.id !== id);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
    toast.success('Item removed from cart');
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!selectedMealTiming) {
      toast.error('Please select a meal timing');
      return;
    }

    if (selectedDeliveryOption === 'CLASS' && !classroom) {
      toast.error('Please enter your classroom number');
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');

      if (!token || !userEmail) {
        router.push('/login');
        return;
      }

      const orderItems = cartItems.map((item) => ({
        id: item.id,
        quantity: item.quantity
      }));

      const response = await fetch('http://127.0.0.1:5000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          user_email: userEmail,
          items: orderItems,
          delivery_option: selectedDeliveryOption,
          classroom: classroom,
          meal_timing: selectedMealTiming
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Clear cart
        localStorage.removeItem('cart');
        setCartItems([]);
        toast.success('Order placed successfully!');
        router.push('/orders');
      } else {
        throw new Error(data.error || 'Failed to place order');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'An error occurred during checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  const cartItemDetails = cartItems.map((item) => {
    const product = products.find((p) => p.id === item.id);
    return {
      ...item,
      name: product?.name || 'Unknown Product',
      price: product?.price || 0,
      image_url: product?.image_url || '',
      subtotal: (product?.price || 0) * item.quantity
    };
  });

  const subtotal = cartItemDetails.reduce((sum, item) => sum + item.subtotal, 0);
  const deliveryCharge = deliveryOptions.find(option => option.id === selectedDeliveryOption)?.charge || 0;
  const total = subtotal + deliveryCharge;

  return (
    <Layout>
      <Head>
        <title>Cart - QuickByte</title>
        <meta name="description" content="Your shopping cart" />
      </Head>

      <div className="container mx-auto px-4">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.back()} 
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Your Cart</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FaShoppingCart className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <button
              onClick={() => router.push('/menu')}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {cartItemDetails.map((item) => (
                    <motion.div
                      key={item.id}
                      className="p-4 flex"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      layout
                    >
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{item.name}</h3>
                            <p className="ml-4">₹{item.subtotal.toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">₹{item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1 text-gray-600 hover:text-gray-800"
                              disabled={item.quantity <= 1}
                            >
                              <FaMinus className="h-3 w-3" />
                            </button>
                            <span className="px-3 py-1">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1 text-gray-600 hover:text-gray-800"
                            >
                              <FaPlus className="h-3 w-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="font-medium text-red-600 hover:text-red-500 flex items-center"
                          >
                            <FaTrash className="h-3 w-3 mr-1" /> Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label htmlFor="meal-timing" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Meal Timing
                    </label>
                    <select
                      id="meal-timing"
                      value={selectedMealTiming}
                      onChange={(e) => setSelectedMealTiming(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="" disabled>Select a meal time</option>
                      {mealTimings.map((timing) => (
                        <option key={timing.id} value={timing.id}>
                          {timing.label} ({timing.start} - {timing.end})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="delivery-option" className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Option
                    </label>
                    <select
                      id="delivery-option"
                      value={selectedDeliveryOption}
                      onChange={(e) => setSelectedDeliveryOption(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      {deliveryOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label} (₹{option.charge})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedDeliveryOption === 'CLASS' && (
                    <div>
                      <label htmlFor="classroom" className="block text-sm font-medium text-gray-700 mb-2">
                        Classroom Number
                      </label>
                      <input
                        id="classroom"
                        type="text"
                        value={classroom}
                        onChange={(e) => setClassroom(e.target.value)}
                        placeholder="Enter your classroom number"
                        className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <p>Subtotal</p>
                    <p>₹{subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <p>Delivery Fee</p>
                    <p>₹{deliveryCharge.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Total</p>
                    <p>₹{total.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing || cartItems.length === 0}
                    className={`w-full bg-primary-600 text-white py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                      isProcessing || cartItems.length === 0
                        ? 'opacity-75 cursor-not-allowed'
                        : 'hover:bg-primary-700'
                    }`}
                  >
                    {isProcessing ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}