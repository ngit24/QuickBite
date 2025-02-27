import { useEffect } from 'react';
import { useRouter } from 'next/router';
import RoleBasedGuard from '../../components/auth/RoleBasedGuard';
import LoadingScreen from '../../components/ui/LoadingScreen';

export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <RoleBasedGuard allowedRoles={['admin']}>
      <LoadingScreen />
    </RoleBasedGuard>
  );
}
