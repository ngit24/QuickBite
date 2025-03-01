import { useState, useEffect, CSSProperties } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaWallet, FaChartLine, FaCalendarAlt, FaShoppingBag, 
  FaFire, FaBolt, FaClock, FaChevronRight, FaUserFriends, 
  FaMoneyBillWave, FaPercent, FaHeart, FaShoppingCart
} from 'react-icons/fa';
import { IoRestaurantOutline, IoFlashOutline, IoStar, IoFlame, IoSparkles, IoAdd, IoRemove } from 'react-icons/io5';
import { MdLocalOffer, MdExplore, MdOutlineFoodBank } from 'react-icons/md';
import { RiLeafLine, RiFireFill, RiEBike2Fill } from 'react-icons/ri';
import { BiFoodTag, BiDish } from 'react-icons/bi';
import { HiOutlineExternalLink } from 'react-icons/hi';
import Layout from '../components/layout/Layout';
import WelcomeHero from '../components/dashboard/WelcomeHero';
import QuickStats from '../components/dashboard/QuickStats';
import EnhancedProductCard from '../components/dashboard/EnhancedProductCard';
import OrderTimeline from '../components/dashboard/OrderTimeline';
import FloatingCart from '../components/cart/FloatingCart';
import LoyaltyCard from '../components/dashboard/LoyaltyCard';
import FavoritesSection from '../components/dashboard/FavoritesSection';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import { useLoyalty } from '../hooks/useLoyalty';
import { toast } from 'react-toastify';
import EnhancedFoodCard from '../components/dashboard/EnhancedFoodCard';
import StatsSection from '../components/dashboard/StatsSection';
import StatsCards from '../components/dashboard/StatsCards';
import LoyaltyProgress from '../components/dashboard/LoyaltyProgress';
import Image from 'next/image';

// Define motion components for TypeScript
const MotionDiv = motion.div;
const MotionButton = motion.button;
const MotionSection = motion.section;

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
  const [loading, setLoading] = useState(true);
  const [trendingItems, setTrendingItems] = useState([]);
  const [discountedItems, setDiscountedItems] = useState([]);
  const { addItem: addToCart, totalItems } = useCart();
  const { 
    favorites, 
    removeFromFavorites, 
    isLoading: favoritesLoading, 
    fetchFavorites, // Add this
    toggleFavorite,  // Add this if needed
    isFavorite      // Add this if needed
  } = useFavorites();
  const { loyaltyStatus, redeemPoints } = useLoyalty();
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [statsData, setStatsData] = useState({
    ordersThisWeek: 0,
    totalSpent: 0,
    avgOrderValue: 0,
    orderFrequency: 0
  });

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

  // Verify authentication on client-side
  useEffect(() => {
    // Check for authentication
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Not authenticated, redirect to login
      window.location.href = '/auth';
      return;
    }
    
    // Simple validation of token format
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      // Continue normal loading
      setLoading(false);
    } catch (error) {
      // Invalid token, clear and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      
      window.location.href = '/auth';
    }
  }, [router]);

  useEffect(() => {
    const fetchTrendingAndDiscounted = async () => {
      try {
        // Fetch trending items
        const trendingResponse = await fetch('https://localhost969.pythonanywhere.com/products/popular');
        const trendingData = await trendingResponse.json();
        
        // Fetch discounted items
        const discountedResponse = await fetch('https://localhost969.pythonanywhere.com/products/discounted');
        const discountedData = await discountedResponse.json();

        if (trendingData.success) {
          setTrendingItems(trendingData.products);
        }
        
        if (discountedData.success) {
          setDiscountedItems(discountedData.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchTrendingAndDiscounted();
  }, []);
  
  // Add new effect for stats calculation
  useEffect(() => {
    if (recentOrders.length > 0) {
      const weekOrders = recentOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate >= weekAgo;
      });

      const totalSpent = recentOrders.reduce((sum, order) => sum + order.total, 0);
      
      setStatsData({
        ordersThisWeek: weekOrders.length,
        totalSpent,
        avgOrderValue: totalSpent / recentOrders.length,
        orderFrequency: Math.round((weekOrders.length / 7) * 100) / 100
      });
    }
  }, [recentOrders]);

  useEffect(() => {
    if (fetchFavorites) {  // Add safety check
      fetchFavorites();
    }
  }, [fetchFavorites]);  // Add fetchFavorites to dependency array

  const handleRedeemPoints = async (rewardId: string) => {
    try {
      const result = await redeemPoints(rewardId);
      if (result.success) {
        toast.success('Points redeemed successfully!');
        setShowRedeemModal(false);
      } else {
        toast.error(result.error || 'Failed to redeem points');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleAddToCart = async (product: any, quantity: number = 1) => {
    try {
      for (let i = 0; i < quantity; i++) {
        addToCart(product); // Remove await since addItem is synchronous
      }
      toast.success(`Added ${quantity} ${product.name} to cart`);
      // Refresh favorites after adding to cart
      await fetchFavorites();
      return Promise.resolve();
    } catch (error) {
      toast.error('Failed to add to cart');
      return Promise.reject(error);
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    const product = favorites.find(fav => fav.id === productId);
    if (product) {
      try {
        await removeFromFavorites(product);
        await fetchFavorites(); // Refresh favorites after removal
      } catch (error) {
        console.error('Error removing favorite:', error);
        toast.error('Failed to remove from favorites');
      }
    }
  };

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-primary-50 to-primary-100">
          <MotionDiv 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-gray-600 font-medium"
          >
            Loading your personalized dashboard...
          </motion.p>
        </div>
      </Layout>
    );
  }

  const dashboardStats = [
    {
      icon: FaMoneyBillWave,
      label: "Total Saved",
      value: `₹${(statsData.totalSpent * 0.1).toFixed(2)}`,
      sublabel: `${Math.round(statsData.totalSpent * 0.1 / 10)} loyalty points earned`,
      color: "purple"
    }
  ];

  return (
    <Layout>
      <Head>
        <title>QuickByte | Your Food Dashboard</title>
        <meta name="description" content="Your personalized food ordering dashboard" />
      </Head>

      <div className="min-h-screen bg-gray-50/50">
        <div className="space-y-6">
          {/* Welcome Hero */}
          <WelcomeHero userName={user?.name || ''} />
          
          {/* Loyalty Progress */}
          <div className="container mx-auto">
            <LoyaltyProgress 
              points={loyaltyStatus?.points || 0}
              tier={loyaltyStatus?.tier || 'Bronze'}
              nextTierPoints={
                loyaltyStatus?.tier === 'Bronze' ? 1000 :
                loyaltyStatus?.tier === 'Silver' ? 5000 :
                loyaltyStatus?.tier === 'Gold' ? 10000 : 15000
              }
            />
          </div>

          {/* Stats Section */}
          <div className="container mx-auto">
            <StatsCards totalSaved={(statsData.totalSpent * 0.1) || 0} />
          </div>

          {/* Main Content Grid */}
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-12 gap-8">
              {/* Featured Products Column */}
              <div className="lg:col-span-8 space-y-8">
                {/* REDESIGNED: Food Discoveries Section */}
                <section className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-end gap-3">
                      <h2 className="text-2xl font-bold text-gray-800">Food Discoveries</h2>
                      <span className="text-sm text-gray-500 font-medium pb-1">Curated for you</span>
                    </div>
                    <MotionButton
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push('/menu')}
                      className="text-sm font-medium text-primary-600 flex items-center gap-1 hover:underline"
                    >
                      <span>Browse all</span>
                      <MdExplore className="w-4 h-4" />
                    </MotionButton>
                  </div>
                  
                  {/* Product Cards Carousel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {trendingItems.map((item, index) => (
                      <FoodDiscoveryCard 
                        key={item.id}
                        product={item}
                        onAddToCart={handleAddToCart}
                        onToggleFavorite={toggleFavorite}
                        isFavorite={isFavorite(item.id)}
                      />
                    ))}
                  </div>
                </section>

                {/* REDESIGNED: Special Deals Section */}
                <section className="space-y-5 mt-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-red-50 rounded-lg">
                        <MdLocalOffer className="w-5 h-5 text-red-500" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">Today's Special Deals</h2>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {discountedItems.map((item, index) => (
                        <SpecialDealCard 
                          key={item.id}
                          product={item}
                          onAddToCart={handleAddToCart}
                          onToggleFavorite={toggleFavorite}
                          isFavorite={isFavorite(item.id)} 
                        />
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Sidebar - Keep existing structure */}
              <div className="lg:col-span-4 space-y-8">
                {/* Favorites Section */}
                <MotionSection
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <FaHeart className="text-red-500" />
                      <span>Your Favorites</span>
                    </h2>
                  </div>
                  <div className="p-6">
                    <FavoritesSection
                      favorites={favorites || []} // Add fallback empty array
                      onAddToCart={handleAddToCart}
                      onRemoveFavorite={handleRemoveFavorite}
                      isLoading={favoritesLoading}
                    />
                  </div>
                </MotionSection>

                {/* Recent Orders - Updated to show images and be clickable */}
                <MotionSection
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <FaClock className="text-gray-400" />
                      <span>Recent Orders</span>
                    </h2>
                  </div>
                  <div className="p-6">
                    <RecentOrdersList 
                      orders={recentOrders}
                      onViewOrder={() => router.push('/orders')}
                    />
                  </div>
                </MotionSection>

                {/* Additional Widgets can be added here */}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Cart */}
        <FloatingCart />
      </div>
    </Layout>
  );
}

// Redesigned item card component with premium UI 
function FoodDiscoveryCard({ product, onAddToCart, onToggleFavorite, isFavorite }) {
  const { addItem } = useCart(); // Use the cart hook directly
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      addItem(product);
      toast.success(`Added ${product.name} to cart`);
      setTimeout(() => setIsAdding(false), 1000);
    } catch (error) {
      setIsAdding(false);
      toast.error('Failed to add to cart');
    }
  };

  const discountedPrice = product.discount 
    ? (product.price * (1 - product.discount / 100)).toFixed(0)
    : product.price;
    
  return (
    <MotionDiv
      layout
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* Premium subtle gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-100/50 via-transparent to-primary-50/30 rounded-2xl z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Card Header - Always Visible */}
      <div className="flex items-center justify-between p-2 px-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 text-sm truncate max-w-[80%]">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2">
          {product.rating && (
            <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded text-xs">
              <IoStar className="text-yellow-500 w-3 h-3" />
              <span className="font-medium text-yellow-700">{product.rating}</span>
            </div>
          )}
          
          <MotionButton
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product);
            }}
            className="p-1.5 rounded-full hover:bg-gray-100"
          >
            <FaHeart className={`w-3.5 h-3.5 ${isFavorite ? 'text-red-500' : 'text-gray-300'}`} />
          </MotionButton>
        </div>
      </div>
      
      {/* Image Container - Professional Aspect Ratio */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-50 border-b border-gray-100">
        {/* Discount badge - positioned at corner */}
        {product.discount && (
          <div className="absolute top-2 left-2 z-10">
            <motion.div
              initial={{ rotate: -5 }}
              animate={{ rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold flex items-center px-2 py-1 rounded shadow-lg"
            >
              <span className="text-xs">{product.discount}% OFF</span>
            </motion.div>
          </div>
        )}
        
        {/* Special badge if exists */}
        {product.badge && (
          <div className="absolute top-2 right-2 z-10">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="bg-primary-600 text-white text-xs font-semibold px-2 py-1 rounded shadow-md flex items-center gap-1"
            >
              <IoSparkles className="w-3 h-3 text-yellow-300" />
              <span>{product.badge}</span>
            </motion.div>
          </div>
        )}
        
        {/* Main Image */}
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000'}
            alt={product.name}
            className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/images/default-food.jpg';
            }}
          />
        </div>
        
        {/* Premium Overlay for Hover State - Only Shows on Hover */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center"
        >
          <div className="w-full p-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-lg">₹{discountedPrice}</span>
                {product.discount && (
                  <span className="text-xs text-white/70 line-through">₹{product.price}</span>
                )}
              </div>
              
              <MotionButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
                className="px-3 py-1 bg-white text-primary-600 text-sm font-medium rounded-full shadow-lg flex items-center gap-1"
              >
                <FaShoppingCart className="w-3 h-3" />
                <span>Add</span>
              </MotionButton>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Card Footer - Details & Info Section */}
      <div className="p-3 bg-white border-t border-gray-50">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              {product.discount ? (
                <>
                  <span className="font-bold text-primary-600">₹{discountedPrice}</span>
                  <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                </>
              ) : (
                <span className="font-bold text-primary-600">₹{product.price}</span>
              )}
            </div>
            
            {product.order_count > 0 && (
              <span className="text-xs text-gray-500 mt-0.5">
                {product.order_count} orders
              </span>
            )}
          </div>
          
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            className="text-gray-400 bg-gray-100 rounded-full p-1.5"
          >
            <FaChevronRight className="w-3 h-3" />
          </motion.div>
        </div>
      </div>

      {/* Expanded Content - Add to Cart UI */}
      <AnimatePresence>
        {isExpanded && (
          <div className="overflow-hidden">
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-3 space-y-4 bg-gray-50"
            >
              {/* Quantity Controls */}
              <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <MotionButton
                    whileHover={{ backgroundColor: "#f3f4f6" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuantity(Math.max(1, quantity - 1));
                    }}
                    className="p-2 rounded-full bg-gray-100 border border-gray-200 shadow-sm"
                  >
                    <IoRemove className="w-3 h-3 text-gray-700" />
                  </MotionButton>
                  
                  <span className="font-semibold w-6 text-center">{quantity}</span>
                  
                  <MotionButton
                    whileHover={{ backgroundColor: "#f3f4f6" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuantity(quantity + 1);
                    }}
                    className="p-2 rounded-full bg-gray-100 border border-gray-200 shadow-sm"
                  >
                    <IoAdd className="w-3 h-3 text-gray-700" />
                  </MotionButton>
                </div>
                
                <MotionButton
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart();
                  }}
                  disabled={isAdding}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isAdding ? 'bg-gray-300 text-gray-500' : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {isAdding ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding...</span>
                    </div>
                  ) : `Add ${quantity} to Cart`}
                </MotionButton>
              </div>
              
              {/* Additional Product Info */}
              {product.description && (
                <div className="text-xs text-gray-600 border-t border-gray-100 pt-2">
                  {product.description}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
}

// Redesigned special deal card with premium UI
function SpecialDealCard({ product, onAddToCart, onToggleFavorite, isFavorite }) {
  const { addItem } = useCart(); // Use the cart hook directly
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      addItem(product);
      toast.success(`Added ${product.name} to cart`);
      setTimeout(() => setIsAdding(false), 1000);
    } catch (error) {
      setIsAdding(false);
      toast.error('Failed to add to cart');
    }
  };

  const discountedPrice = product.discount 
    ? (product.price * (1 - product.discount / 100)).toFixed(0)
    : product.price;
  
  return (
    <MotionDiv
      layout
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* Special premium gradient border/glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-100/50 via-transparent to-orange-100/30 rounded-2xl z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Discount tag with premium ribbon style */}
      <div className="absolute -right-[40px] top-[20px] z-10 rotate-45">
        <div className="bg-red-600 text-white shadow-lg py-1 w-[140px] text-center">
          <div className="text-sm font-bold">{product.discount}% OFF</div>
        </div>
      </div>

      {/* Card Header */}
      <div className="flex items-center justify-between p-2 px-3 bg-gradient-to-r from-orange-50 to-white border-b border-orange-100">
        <h3 className="font-semibold text-gray-800 text-sm truncate max-w-[80%]">
          {product.name}
        </h3>
        
        <MotionButton
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);
          }}
          className="p-1.5 rounded-full hover:bg-gray-100"
        >
          <FaHeart className={`w-3.5 h-3.5 ${isFavorite ? 'text-red-500' : 'text-gray-300'}`} />
        </MotionButton>
      </div>
      
      {/* Image and Price Container */}
      <div className="flex items-center gap-2 p-2">
        {/* Left side: Perfect square image container */}
        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white border border-gray-100">
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=500'}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = '/images/default-food.jpg';
              }}
            />
          </div>
        </div>
        
        {/* Right side: Price and details */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Updated Price Display */}
          <div className="flex items-center gap-2">
            {/* Discounted Price */}
            <div className="text-lg font-bold text-primary-600">
              ₹{discountedPrice}
            </div>
            
            {/* Original Price - strikethrough */}
            {product.discount && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.price}
              </span>
            )}
          </div>
          
          {/* Limited time offer badge */}
          <div className="mt-1.5">
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full"
            >
              <RiEBike2Fill className="w-3 h-3" /> 
              <span className="font-medium">Limited time offer</span>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Card Footer */}
      <div className="p-3 flex items-center justify-between bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
        <div className="text-xs text-gray-600 flex items-center gap-1">
          <MdLocalOffer className="text-red-500 w-3.5 h-3.5" />
          <span>Special Deal</span>
        </div>
        
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          className="text-gray-400 bg-gray-100 rounded-full p-1.5"
        >
          <FaChevronRight className="w-3 h-3" />
        </motion.div>
      </div>

      {/* Expanded Content - Add to Cart Controls */}
      <AnimatePresence>
        {isExpanded && (
          <div className="overflow-hidden">
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-3 space-y-4 bg-orange-50/50"
            >
              {/* Special offer text */}
              <div className="text-center p-2 bg-gradient-to-r from-orange-100 to-pink-100 rounded-lg border border-orange-200">
                <span className="text-xs font-semibold text-orange-700">
                  Save ₹{(product.price - discountedPrice).toFixed(0)} with this limited time offer!
                </span>
              </div>
              
              {/* Quantity Controls */}
              <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <MotionButton
                    whileHover={{ backgroundColor: "#f3f4f6" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuantity(Math.max(1, quantity - 1));
                    }}
                    className="p-2 rounded-full bg-gray-100 border border-gray-200 shadow-sm"
                  >
                    <IoRemove className="w-3 h-3 text-gray-700" />
                  </MotionButton>
                  
                  <span className="font-semibold w-6 text-center">{quantity}</span>
                  
                  <MotionButton
                    whileHover={{ backgroundColor: "#f3f4f6" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuantity(quantity + 1);
                    }}
                    className="p-2 rounded-full bg-gray-100 border border-gray-200 shadow-sm"
                  >
                    <IoAdd className="w-3 h-3 text-gray-700" />
                  </MotionButton>
                </div>
                
                <MotionButton
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart();
                  }}
                  disabled={isAdding}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isAdding ? 'bg-gray-300 text-gray-500' : 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {isAdding ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding...</span>
                    </div>
                  ) : `Add ${quantity} to Cart`}
                </MotionButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Premium corner effect */}
      <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-orange-200 to-transparent opacity-50 pointer-events-none"></div>
    </MotionDiv>
  );
}

// New component for showing recent orders in a list with images
function RecentOrdersList({ orders, onViewOrder }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No recent orders</p>
        <button 
          className="mt-2 text-primary-600 font-medium hover:text-primary-700"
          onClick={() => window.location.href = '/menu'}
        >
          Browse menu
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <MotionDiv
          key={order.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onViewOrder(order.id)}
          className="bg-white border border-gray-100 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Order #{order.id.slice(0, 6)}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              order.status === 'completed' ? 'bg-green-100 text-green-800' :
              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {order.status}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {/* Show up to 3 item images */}
              {order.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="w-8 h-8 rounded-full border border-white bg-gray-200 overflow-hidden flex-shrink-0">
                  <img 
                    src={item.image_url || '/images/default-food.jpg'} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/default-food.jpg';
                    }}
                  />
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="w-8 h-8 rounded-full border border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                  +{order.items.length - 3}
                </div>
              )}
            </div>
            <div className="ml-1">
              <div className="text-sm text-gray-600 line-clamp-1">
                {order.items.map(item => item.name).join(', ')}
              </div>
              <div className="text-xs text-gray-400">
                {new Date(order.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
            <span className="font-medium text-primary-600">₹{order.total.toFixed(2)}</span>
          </div>
        </MotionDiv>
      ))}
      
      <button
        onClick={() => window.location.href = '/orders'}
        className="w-full py-2 text-center text-primary-600 font-medium hover:bg-primary-50 rounded-lg transition-colors"
      >
        View All Orders
      </button>
    </div>
  );
}

// Simple stat card component
function QuickStatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className={`w-8 h-8 rounded-lg bg-${color}-100 flex items-center justify-center mb-2`}>
        <Icon className={`w-4 h-4 text-${color}-600`} />
      </div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { req, res } = context;
  const cookies = req.cookies || {};
  
  // Check authentication
  if (!cookies.token) {
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      },
    };
  }
  
  // Get current pathname
  const currentPath = req.url;
  
  // Check role access - redirect if wrong dashboard for role
  const userRole = cookies.userRole || 'user';
  
  if (currentPath.startsWith('/admin') && userRole !== 'admin') {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }
  
  if (currentPath.startsWith('/canteen') && userRole !== 'canteen') {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }
  
  return {
    props: {}
  };
}
