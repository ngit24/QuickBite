import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import LoadingScreen from '../ui/LoadingScreen';
import { fetchWithAuth } from '../../utils/api';

interface RoleBasedGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function RoleBasedGuard({ children, allowedRoles }: RoleBasedGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');

      if (!token || !userRole) {
        router.push('/login');
        return;
      }

      try {
        const userData = await fetchWithAuth('http://127.0.0.1:5000/user');
        
        if (allowedRoles.includes(userData.role)) {
          setIsAuthorized(true);
        } else {
          // Redirect based on role
          switch (userData.role) {
            case 'admin':
              router.push('/admin/dashboard');
              break;
            case 'canteen':
              router.push('/canteen/dashboard');
              break;
            default:
              router.push('/dashboard');
          }
        }
      } catch (error) {
        localStorage.clear();
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth verification error:', error);
      localStorage.clear();
      router.push('/login');
    }
  };

  if (!isAuthorized) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
