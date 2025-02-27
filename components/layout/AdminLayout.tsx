import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  FaChartBar, 
  FaStore, 
  FaUsers, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaTimes 
} from 'react-icons/fa';

const menuItems = [
  {
    name: 'Dashboard',
    icon: <FaChartBar />,
    path: '/admin/dashboard'
  },
  {
    name: 'Users',
    icon: <FaUsers />,
    path: '/admin/users'
  },
  {
    name: 'Canteens',
    icon: <FaStore />,
    path: '/admin/canteens'
  },
  {
    name: 'Settings',
    icon: <FaCog />,
    path: '/admin/settings'
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
              >
                {isSidebarOpen ? <FaTimes /> : <FaBars />}
              </button>
              <span className="text-xl font-bold text-primary-600 ml-3">
                Admin Dashboard
              </span>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 flex items-center gap-2"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className="flex">
        <aside className={`
          fixed inset-y-0 left-0 transform 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0
          w-64 bg-white border-r border-gray-200 
          transition-transform duration-200 ease-in-out
          pt-16 z-30
        `}>
          <nav className="mt-5 px-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center px-4 py-2 mt-2 text-gray-600 rounded-lg 
                  ${router.pathname === item.path ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'}
                `}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 pt-16 lg:pl-64">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
