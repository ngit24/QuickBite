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
import Header from './Header';

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {children}
      </main>
    </div>
  );
}