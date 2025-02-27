import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaUtensils, FaClipboardList, FaChartBar, FaSignOutAlt, FaBell } from 'react-icons/fa';

export default function CanteenLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const navigationItems = [
    { href: '/canteen/orders', icon: FaClipboardList, text: 'Orders' },
    { href: '/canteen/menu', icon: FaUtensils, text: 'Menu' },
    { href: '/canteen/dashboard', icon: FaChartBar, text: 'Dashboard' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-green-600 to-emerald-500 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/canteen/dashboard" className="flex items-center">
                <FaUtensils className="h-8 w-8 text-white" />
                <span className="ml-3 text-xl font-bold text-white">
                  QuickByte Canteen
                </span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${router.pathname === item.href 
                      ? 'bg-white text-green-600' 
                      : 'text-white hover:bg-green-500'}`}
                >
                  <item.icon className="w-5 h-5 mr-2" />
                  {item.text}
                </Link>
              ))}
              
              {unreadNotifications > 0 && (
                <div className="relative">
                  <FaBell className="w-5 h-5 text-white" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-white hover:bg-green-500 rounded-lg transition-colors"
              >
                <FaSignOutAlt className="w-5 h-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16 px-4 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
