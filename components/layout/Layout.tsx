import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUtensils, 
  FaTachometerAlt,
  FaHistory, 
  FaWallet,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaShoppingCart,
  FaTimes,
  FaBell
} from 'react-icons/fa';

interface LayoutProps {
  children: React.ReactNode;
}

interface Notification {
  id: string;
  type: 'order_ready' | 'order_cancelled' | 'refund_processed';
  message: string;
  timestamp: Date;
  read: boolean;
  orderId?: string;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('');
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Set the active menu item based on the current route
    const path = router.pathname;
    setActiveItem(path);

    // Fetch user data
    const token = localStorage.getItem('token');
    const fetchUserData = async () => {
      try {
        const response = await fetch('https://localhost969.pythonanywhere.com/user', {
          headers: {
            Authorization: token || '',
          },
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (token) {
      fetchUserData();
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }

    // Setup event listener for cart updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart' && e.newValue) {
        setCartItems(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Load notifications
    const checkNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://localhost969.pythonanywhere.com/notifications', {
          headers: {
            Authorization: token || '',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications);
          setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    checkNotifications();
    // Check for new notifications every minute
    const notificationInterval = setInterval(checkNotifications, 60000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(notificationInterval);
    };
  }, [router.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    router.push('/login');
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://localhost969.pythonanywhere.com/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: token || '',
        },
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: <FaTachometerAlt />,
      path: '/dashboard',
    },
    {
      name: 'Menu',
      icon: <FaUtensils />,
      path: '/menu',
    },
    {
      name: 'Orders',
      icon: <FaHistory />,
      path: '/orders',
    },
    {
      name: 'Wallet',
      icon: <FaWallet />,
      path: '/wallet',
    },
    {
      name: 'Profile',
      icon: <FaUser />,
      path: '/profile',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <FaBars className="w-6 h-6" />
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <FaUtensils className="text-white text-lg" />
              </div>
              <span className="text-lg font-semibold text-gray-900">QuickByte</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button 
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">Notifications</h3>
                    {notifications.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No notifications</p>
                    ) : (
                      <div className="space-y-4">
                        {notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3 rounded-lg ${
                              notification.read ? 'bg-gray-50' : 'bg-blue-50'
                            }`}
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <p className="text-sm text-gray-800">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link href="/cart" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 relative">
              <FaShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>

            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <FaSignOutAlt className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Side Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 pt-16 z-40
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Navigation Links */}
        <nav className="h-full overflow-y-auto p-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex items-center gap-3 px-3 py-2 mb-2 rounded-lg transition-colors
                ${activeItem === item.path
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
              <FaUser className="text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}