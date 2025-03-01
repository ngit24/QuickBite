import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUtensils, FaSignOutAlt, FaChartBar, FaClipboardList, FaCog, FaBell } from 'react-icons/fa';

export default function CanteenLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost969.pythonanywhere.com/notifications', {
        headers: { Authorization: token || '' }
      });
      const data = await response.json();
      if (data.success) {
        setUnreadNotifications(data.unread_count);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const menuItems = [
    { 
      href: '/canteen/orders', 
      label: 'Orders', 
      icon: <FaClipboardList className="text-xl" />,
      activePattern: /^\/canteen\/orders/
    },
    { 
      href: '/canteen/menu', 
      label: 'Menu', 
      icon: <FaUtensils className="text-xl" />,
      activePattern: /^\/canteen\/menu/
    },
    { 
      href: '/canteen/dashboard', 
      label: 'Stats', 
      icon: <FaChartBar className="text-xl" />,
      activePattern: /^\/canteen\/dashboard/
    },
    {
      href: '#',
      label: 'Settings',
      icon: <FaCog className="text-xl" />,
      onClick: () => setShowLogoutConfirm(true),
      activePattern: /^$/  // Never matches, so never shows as active
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Top Header - Simplified */}
      <header className="bg-white shadow-sm fixed w-full top-0 z-40 px-4 h-14 flex items-center justify-between">
        <Link href="/canteen/dashboard" className="text-lg font-bold text-primary-600">
          QuickBite
        </Link>
        
        <div className="flex items-center gap-3">
          {unreadNotifications > 0 && (
            <div className="relative">
              <FaBell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadNotifications}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-14">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-up-lg border-t border-gray-100 z-40">
        <div className="flex items-center justify-around h-16">
          {menuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => item.onClick ? item.onClick() : router.push(item.href)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                item.activePattern.test(router.pathname)
                  ? 'text-primary-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
              {item.activePattern.test(router.pathname) && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 w-full h-0.5 bg-primary-600"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Logout Confirmation Modal - With Safe Area Padding */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl p-6 pb-8 safe-bottom"
            >
              <h3 className="text-lg font-semibold mb-4">Settings</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    router.push('/login');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full px-4 py-3.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
