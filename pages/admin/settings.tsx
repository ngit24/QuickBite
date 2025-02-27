import { useState } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/layout/AdminLayout';
import RoleBasedGuard from '../../components/auth/RoleBasedGuard';

export default function AdminSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwords.new.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || ''
        },
        body: JSON.stringify({
          current_password: passwords.current,
          new_password: passwords.new
        })
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Password updated successfully');
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        throw new Error(data.message || 'Failed to update password');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RoleBasedGuard allowedRoles={['admin']}>
      <AdminLayout>
        <div className="max-w-xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </AdminLayout>
    </RoleBasedGuard>
  );
}
