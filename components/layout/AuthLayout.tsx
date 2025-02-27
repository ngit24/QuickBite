import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    // If not authenticated, redirect to login
    if (!token) {
      router.push('/login');
      return;
    }

    // Redirect if accessing wrong role's pages
    const path = router.pathname;
    if (path.startsWith('/admin') && userRole !== 'admin') {
      router.push('/unauthorized');
    } else if (path.startsWith('/canteen') && userRole !== 'canteen') {
      router.push('/unauthorized');
    } else if (path.startsWith('/user') && userRole !== 'user') {
      router.push('/unauthorized');
    }
  }, [router.pathname]);

  return <>{children}</>;
}
