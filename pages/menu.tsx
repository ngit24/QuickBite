import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import AuthGuard from '../components/auth/AuthGuard';
import FoodCard from '../components/ui/FoodCard';
import { FaSearch, FaFilter, FaUtensils, FaShoppingCart } from 'react-icons/fa';

export default function MenuPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [cart, setCart] = useState<any[]>([]);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://127.0.0.1:5000/products/available');
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

  const addToCart = (item: any, quantity: number) => {
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
    let newCart;
    if (existingItemIndex !== -1) {
      // Update existing item quantity
      newCart = [...cart];
      newCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      newCart = [...cart, { ...item, quantity }];
    }
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    
    // Show cart preview briefly
    setShowCartPreview(true);
    setTimeout(() => setShowCartPreview(false), 3000);
  };

  const goToCheckout = () => {
    router.push('/checkout');
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <AuthGuard>
      <Layout>
        <Head>
          <title>Menu - QuickByte</title>
          <meta name="description" content="Browse our food menu and place your order" />
        </Head>
        
        <div className="space-y-6">
          {/* Page header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Food Menu</h1>
              <p className="text-gray-600">Browse our delicious selection of food items</p>
            </div>
            
            {/* Cart button for mobile */}
            <div className="md:hidden">
              <button 
                className="relative p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                onClick={goToCheckout}
              >
                <FaShoppingCart className="h-5 w-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {/* Search and filter */}
          <div className="space-y-4">
            {/* Search and Filter Section - Mobile Optimized */}
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-16 z-10">
              <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search menu..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-600 focus:border-primary-600"
                  />
                </div>

                {/* Category Filter - Scrollable on mobile */}
                <div className="overflow-x-auto -mx-4 px-4 pb-2">
                  <div className="flex space-x-2 min-w-max">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => handleCategoryChange(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                          ${selectedCategory === category
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-60">
                  <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-600">Loading menu items...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <FoodCard
                    key={product.id}
                    {...product}
                    addToCart={addToCart}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-60">
                  <div className="text-7xl text-gray-300">
                    <FaUtensils />
                  </div>
                  <p className="mt-4 text-gray-600 text-lg">No food items found</p>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </div>

            {/* Cart Preview - Mobile Optimized */}
            {showCartPreview && cart.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Cart ({getTotalItems()} items)</span>
                  <span className="font-medium">₹{getTotalPrice().toFixed(2)}</span>
                </div>
                <button
                  onClick={goToCheckout}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}

            {/* Floating Cart Button - Desktop Only */}
            {cart.length > 0 && !showCartPreview && (
              <div className="fixed bottom-6 right-6 hidden md:block">
                <button
                  onClick={goToCheckout}
                  className="flex items-center gap-3 px-6 py-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700"
                >
                  <FaShoppingCart className="text-xl" />
                  <span className="font-medium">₹{getTotalPrice().toFixed(2)}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}
