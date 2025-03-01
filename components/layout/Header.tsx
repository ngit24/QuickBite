import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser,
  FaSignOutAlt,
  FaBell,
  FaUserCog,
  FaUtensils,
  FaHistory,
  FaShoppingCart,
  FaWallet,  // Add wallet icon
  FaTachometerAlt  // Add dashboard icon
} from 'react-icons/fa';

export default function Header() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch user info
    const token = localStorage.getItem('token');
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('https://localhost969.pythonanywhere.com/user', {
          headers: {
            Authorization: token || '',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    if (token) {
      fetchUserInfo();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    router.push('/auth');
  };

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: FaTachometerAlt },
    { name: 'Menu', href: '/menu', icon: FaUtensils },
    { name: 'Orders', href: '/orders', icon: FaHistory },
    { name: 'Cart', href: '/cart', icon: FaShoppingCart },
    { name: 'Wallet', href: '/wallet', icon: FaWallet },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard">
            <span className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary-600">QuickByte</span>
            </span>
          </Link>

          {/* Desktop Navigation - Now show first 4 items including Dashboard */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.slice(0, 4).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors flex items-center gap-2 ${
                  router.pathname === item.href
                    ? 'text-primary-600'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Wallet Balance */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-lg cursor-pointer"
              onClick={() => router.push('/wallet')}
            >
              <FaWallet className="w-4 h-4 text-primary-600" />
              <span className="font-medium text-primary-600">₹{userInfo?.wallet_balance || 0}</span>
              <motion.span 
                className="text-xs text-primary-400"
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
              >
                Add Money →
              </motion.span>
            </motion.div>

            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <FaBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Menu Button */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
              >
                <FaUser className="w-5 h-5" />
                <span className="text-sm font-medium hidden md:block">
                  {userInfo?.name || 'User'}
                </span>
              </button>

              {/* Enhanced Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100"
                  >
                    {/* User Info */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{userInfo?.name}</p>
                      <p className="text-xs text-gray-500">{userInfo?.email}</p>
                    </div>

                    {/* Menu Items - Show all on mobile except Profile */}
                    <div className="py-2">
                      {/* Show these items only on mobile */}
                      <div className="md:hidden">
                        {menuItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-2 text-sm ${
                              router.pathname === item.href
                                ? 'text-primary-600 bg-primary-50'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                            onClick={() => setDropdownOpen(false)}
                          >
                            <item.icon className="w-4 h-4" />
                            {item.name}
                          </Link>
                        ))}
                      </div>

                      {/* Always show Profile and Logout */}
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FaUserCog className="w-4 h-4" />
                        Profile Settings
                      </Link>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Notifications Panel */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-4 mt-2 w-80 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100"
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="font-semibold">Notifications</h3>
              </div>
              {notifications.length > 0 ? (
                notifications.map((notification: any) => (
                  <div
                    key={notification.id}
                    className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >
                    <p className="text-sm text-gray-800">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No new notifications
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
