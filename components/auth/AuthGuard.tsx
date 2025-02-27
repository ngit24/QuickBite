import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import LoadingScreen from '../ui/LoadingScreen';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!token || !userEmail) {
      router.push('/login');
      return;
    }

    const verifyAuth = async () => {
      try {
        const response = await fetch('https://localhost969.pythonanywhere.com/user', {
          headers: {
            Authorization: token,
          },
        });

        if (response.ok) {
          setAuthorized(true);
        } else {
          // If token is invalid, clear storage and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('userEmail');
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        router.push('/login');
      }
    };

    verifyAuth();
  }, [router]);

  if (!authorized) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
