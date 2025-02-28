import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';
import Layout from '../components/layout/Layout';
import LoadingScreen from '../components/ui/LoadingScreen';
import AuthGuard from '../components/auth/AuthGuard';

// Define route configurations
const routeConfig = {
  protected: [
    '/dashboard',
    '/menu',
    '/orders',
    '/profile',
    '/wallet',
    '/cart'
  ],
  canteen: [
    '/canteen/dashboard',
    '/canteen/orders',
    '/canteen/menu'
  ],
  admin: [
    '/admin/dashboard',
    '/admin/canteens',
    '/admin/users',
    '/admin/settings'
  ],
  public: [
    '/login',
    '/signup',
    '/forgot-password'
  ]
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'canteen' | 'admin' | null>(null);
  
  // Handle route change loading states
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  // Check user role on mount and token change
  useEffect(() => {
    const checkUserRole = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUserRole(null);
        if (!routeConfig.public.includes(router.pathname)) {
          router.push('/login');
        }
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:5000/user', {
          headers: { Authorization: token }
        });
        const data = await response.json();
        
        // Set user role based on response
        setUserRole(data.role || 'user');

        // Redirect if accessing unauthorized routes
        if (data.role === 'admin' && !routeConfig.admin.includes(router.pathname)) {
          router.push('/admin/dashboard');
        } else if (data.role === 'canteen' && !routeConfig.canteen.includes(router.pathname)) {
          router.push('/canteen/dashboard');
        } else if (data.role === 'user' && routeConfig.admin.includes(router.pathname)) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        localStorage.removeItem('token');
        setUserRole(null);
        router.push('/login');
      }
    };

    checkUserRole();
  }, [router.pathname]);

  // Determine if current route needs protection
  const isProtectedRoute = routeConfig.protected.some(route => 
    router.pathname.startsWith(route)
  );
  const isCanteenRoute = routeConfig.canteen.some(route => 
    router.pathname.startsWith(route)
  );

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // Render appropriate layout based on route type
  if (isCanteenRoute) {
    return (
      <>
        <AuthGuard>
          <Component {...pageProps} />
        </AuthGuard>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </>
    );
  }

  if (isProtectedRoute) {
    return (
      <>
        <AuthGuard>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </AuthGuard>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </>
    );
  }

  // Public routes
  return (
    <>
      <Component {...pageProps} />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}
