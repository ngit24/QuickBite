import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import AuthGuard from '../components/auth/AuthGuard';
import { FaSearch, FaUtensils, FaShoppingCart, FaLeaf, FaStar, FaTimes, FaChevronUp, FaMinus, FaPlus } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageWithFallback } from '../utils/imageHelpers';

export default function MenuPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [cart, setCart] = useState<any[]>([]);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartPanelRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://localhost969.pythonanywhere.com/products/available');
        const data = await response.json();

        if (data.success) {
          setProducts(data.products);
          setFilteredProducts(data.products);
          
          // Extract unique categories
          const uniqueCategories = ['All', ...new Set(data.products.map((p: any) => p.category))];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    fetchProducts();
  }, []);

  // Filter products when search or category changes
  useEffect(() => {
    let results = products;
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      results = results.filter(product => 
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Apply search term filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      results = results.filter(product => 
        product.name.toLowerCase().includes(searchTermLower) || 
        product.category.toLowerCase().includes(searchTermLower)
      );
    }
    
    setFilteredProducts(results);
  }, [searchTerm, selectedCategory, products]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const getItemQuantityInCart = (itemId: string) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const addToCart = (item: any, quantity: number) => {
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
    let newCart;
    if (existingItemIndex !== -1) {
      newCart = [...cart];
      newCart[existingItemIndex].quantity += quantity;
    } else {
      newCart = [...cart, { ...item, quantity }];
    }
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    
    // Show visual feedback
    setShowCartPreview(true);
    setTimeout(() => setShowCartPreview(false), 2000);
  };

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
    
    // Close cart if empty
    if (updatedCart.length === 0) {
      setIsCartOpen(false);
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
    setIsCartOpen(false);
  };

  const goToCheckout = () => {
    router.push('/checkout');
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Simplified total price calculation - remove delivery fee
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartPanelRef.current && !cartPanelRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <AuthGuard>
      <Layout>
        <Head>
          <title>Menu - QuickByte</title>
          <meta name="description" content="Browse our food menu and place your order" />
        </Head>
        
        <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 bg-gray-50">
          {/* Mobile-optimized search and filters */}
          <div className="mb-6 sticky top-0 bg-gray-50 z-10 pb-4 backdrop-blur-sm bg-opacity-90 px-2 -mx-2 sm:mx-0 sm:px-0">
            {/* Search Bar - Full width on mobile */}
            <div className="mb-3">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Find your favorite food..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-3 border-0 rounded-full focus:ring-2 focus:ring-primary-500 shadow-sm transition-all duration-300"
                />
                <FaSearch className="absolute left-5 top-3.5 text-primary-500" />
              </div>
            </div>
            
            {/* Categories - Scrollable on mobile */}
            <div className="flex overflow-x-auto py-1 gap-2 scrollbar-hide -mx-2 px-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white shadow-lg' 
                      : 'bg-white/80 hover:bg-white shadow-sm'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile-optimized Menu Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => {
                const quantityInCart = getItemQuantityInCart(product.id);
                
                return (
                  <div
                    key={product.id}
                    className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Premium Badge - Conditionally shown based on price */}
                    {product.price > 100 && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                          <FaStar className="text-white" />
                          Premium
                        </span>
                      </div>
                    )}
                    
                    {/* Modern Category Badge */}
                    {product.category && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium shadow-sm border border-gray-100 text-primary-700">
                          {product.category === 'Veg' ? (
                            <span className="flex items-center gap-1">
                              <FaLeaf className="text-green-500" />
                              {product.category}
                            </span>
                          ) : product.category}
                        </span>
                      </div>
                    )}
                    
                    {/* Make image container consistent on mobile */}
                    <div className="relative h-48 sm:h-56 overflow-hidden">
                      {/* Decorative background pattern */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-white opacity-70"></div>
                      
                      {/* Image with improved styling */}
                      <div className="absolute inset-0 flex items-center justify-center p-3">
                        <ImageWithFallback
                          src={product.image_url || '/images/default-food.jpg'}
                          alt={product.name}
                          className="object-contain max-h-full max-w-full rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      
                      {/* Gradient overlay at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
                    </div>

                    {/* Mobile-optimized Product Details */}
                    <div className="p-4 sm:p-5 flex flex-col">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {product.name}
                      </h3>

                      {/* Price and Add Button - Mobile optimized */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex flex-col">
                          <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                            ₹{product.price}
                          </span>
                        </div>
                        
                        {quantityInCart === 0 ? (
                          <button
                            onClick={() => addToCart(product, 1)}
                            className="relative overflow-hidden bg-primary-600 hover:bg-primary-700 text-white rounded-full px-4 sm:px-5 py-2 sm:py-2.5 font-medium transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 touch-manipulation"
                          >
                            <span className="flex items-center gap-2">
                              <FaShoppingCart />
                              <span>Add</span>
                            </span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateCartItem(cart.findIndex(item => item.id === product.id), quantityInCart - 1)}
                              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors border border-gray-200 active:bg-gray-300 touch-manipulation"
                              aria-label="Decrease quantity"
                            >
                              <FaMinus className="text-xs text-gray-700" />
                            </button>
                            
                            <span className="w-8 text-center font-medium text-gray-800">
                              {quantityInCart}
                            </span>
                            
                            <button
                              onClick={() => addToCart(product, 1)}
                              className="w-8 h-8 rounded-full bg-primary-600 hover:bg-primary-700 flex items-center justify-center transition-colors active:bg-primary-800 touch-manipulation"
                              aria-label="Increase quantity"
                            >
                              <FaPlus className="text-xs text-white" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State - Enhanced */}
          {!isLoading && filteredProducts.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md mx-auto">
              <FaUtensils className="mx-auto text-7xl text-gray-200 mb-6" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No items found</h3>
              <p className="text-gray-500 mb-6">We couldn't find any items matching your search criteria.</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }} 
                className="px-5 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-all duration-300"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Mobile-optimized Cart Button - Fixed position */}
          {cart.length > 0 && !isCartOpen && (
            <motion.button
              onClick={() => setIsCartOpen(true)}
              className="fixed bottom-6 right-4 sm:right-6 flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 z-40 active:scale-95 touch-manipulation"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <FaShoppingCart className="text-lg sm:text-xl" />
                <span className="absolute -top-2 -right-2 bg-white text-primary-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {getTotalItems()}
                </span>
              </div>
              <span className="font-medium">₹{getTotalPrice().toFixed(2)}</span>
              <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs sm:text-sm hidden sm:inline-block">View Cart</span>
            </motion.button>
          )}
          
          {/* Cart Preview Notification */}
          <AnimatePresence>
            {showCartPreview && (
              <motion.div
                className="fixed bottom-24 right-6 bg-white rounded-lg shadow-lg p-4 z-50"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-700">Item added to cart!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Mobile-optimized Cart Panel */}
          <AnimatePresence>
            {isCartOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  className="fixed inset-0 bg-black/50 z-40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsCartOpen(false)}
                />
                
                {/* Cart Panel */}
                <motion.div
                  ref={cartPanelRef}
                  className="fixed right-0 top-0 bottom-0 w-full max-w-[90%] sm:max-w-md bg-white shadow-xl z-50 flex flex-col"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 20 }}
                >
                  {/* Mobile-friendly Cart Header */}
                  <div className="flex items-center justify-between p-4 border-b safe-top">
                    <h2 className="text-lg sm:text-xl font-bold flex items-center">
                      <FaShoppingCart className="mr-2" /> 
                      <span>Your Cart</span>
                      <span className="ml-2 text-sm text-gray-500">({getTotalItems()} items)</span>
                    </h2>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  
                  {/* Cart Items */}
                  {cart.length > 0 ? (
                    <div className="flex-grow overflow-y-auto p-4 space-y-4">
                      {cart.map((item, index) => (
                        <motion.div 
                          key={`${item.id}-${index}`}
                          className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          {/* Item Image */}
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                            <ImageWithFallback
                              src={item.image_url || '/images/default-food.jpg'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Item Details */}
                          <div className="flex-grow">
                            <h3 className="font-medium line-clamp-1">{item.name}</h3>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-primary-600 font-bold">₹{item.price}</p>
                              
                              {/* Quantity Controls - FIXED SYNTAX */}
                              <div className="flex items-center border rounded-lg overflow-hidden">
                                <button 
                                  onClick={() => updateCartItem(index, item.quantity - 1)}
                                  className="px-2 py-1 bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                  <FaMinus className="w-3 h-3 text-gray-600" />
                                </button>
                                <span className="px-3 font-medium">{item.quantity}</span>
                                <button 
                                  onClick={() => updateCartItem(index, item.quantity + 1)}
                                  className="px-2 py-1 bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                  <FaPlus className="w-3 h-3 text-gray-600" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-grow flex items-center justify-center">
                      <div className="text-center p-6">
                        <FaShoppingCart className="mx-auto text-5xl text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium text-gray-700 mb-1">Your cart is empty</h3>
                        <p className="text-gray-500 mb-4">Add items to get started</p>
                        <button 
                          onClick={() => setIsCartOpen(false)}
                          className="px-6 py-2 bg-primary-600 text-white rounded-full"
                        >
                          Browse Menu
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Mobile-friendly Cart Footer - Simplified */}
                  {cart.length > 0 && (
                    <div className="p-4 border-t bg-white shadow-inner safe-bottom">
                      {/* Total - No delivery fee */}
                      <div className="mb-4 flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary-600">₹{getTotalPrice().toFixed(2)}</span>
                      </div>
                      
                      {/* Mobile-optimized Action Buttons */}
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={goToCheckout}
                          className="w-full py-3.5 px-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 active:bg-primary-800 touch-manipulation"
                        >
                          <span>Proceed to Checkout</span>
                        </button>
                        
                        <button
                          onClick={clearCart}
                          className="text-gray-500 hover:text-red-500 transition-colors text-sm flex items-center justify-center gap-1 py-2 touch-manipulation"
                        >
                          <FaTimes className="text-xs" />
                          <span>Clear Cart</span>
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </Layout>
    </AuthGuard>
  );
}
