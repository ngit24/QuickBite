import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { FaUserEdit, FaTrash, FaWallet, FaSearch, FaSortAmountUp, FaSortAmountDown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import RoleBasedGuard from '../../components/auth/RoleBasedGuard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newAdminData, setNewAdminData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/admin/users', {
        headers: {
          Authorization: token || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users');
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBalance = async (userId: string) => {
    const amountStr = prompt('Enter amount to add to wallet:');
    if (!amountStr) return;
    
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/admin/users/${userId}/balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || ''
        },
        body: JSON.stringify({ amount })
      });
      
      if (response.ok) {
        toast.success(`Added ₹${amount} to wallet successfully`);
        fetchUsers(); // Refresh user list
      } else {
        throw new Error('Failed to update balance');
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      toast.error('Failed to update wallet balance');
    }
  };

  const handleDeleteUser = async (password: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/admin/users/${selectedUser.email}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || ''
        },
        body: JSON.stringify({ password })
      });
      
      if (response.ok) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
    setShowDeleteConfirm(false);
    setSelectedUser(null);
  };

  const handleAddAdmin = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || ''
        },
        body: JSON.stringify(newAdminData)
      });
      
      if (response.ok) {
        toast.success('Admin created successfully');
        fetchUsers();
        setShowAddAdmin(false);
        setNewAdminData({ name: '', email: '', password: '' });
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create admin');
    }
  };

  // Sort function for users
  const sortUsers = (a: any, b: any) => {
    if (sortField === 'wallet_balance') {
      return sortOrder === 'asc' 
        ? a.wallet_balance - b.wallet_balance
        : b.wallet_balance - a.wallet_balance;
    }
    
    if (!a[sortField]) return sortOrder === 'asc' ? 1 : -1;
    if (!b[sortField]) return sortOrder === 'asc' ? -1 : 1;
    
    const comparison = a[sortField].toString().localeCompare(b[sortField].toString());
    return sortOrder === 'asc' ? comparison : -comparison;
  };

  // Filter and sort users for display
  const displayUsers = users
    .filter(user => {
      // First filter out admins and canteens
      if (user.role === 'admin' || user.role === 'canteen') return false;
      
      // Then apply search filter
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    })
    .sort(sortUsers);

  // Toggle sort order and field
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <RoleBasedGuard allowedRoles={['admin']}>
      <AdminLayout>
        <div className="p-4 sm:p-6">
          {/* Header with search only - removed add admin button */}
          <div className="flex flex-col gap-4 mb-6">
            <h1 className="text-2xl font-bold">Manage Users</h1>
            
            <div className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 p-3 w-full border rounded-lg shadow-sm"
                placeholder="Search users..."
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* User Cards - removed wallet balance display */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full p-8 text-center">Loading users...</div>
            ) : displayUsers.length === 0 ? (
              <div className="col-span-full p-8 text-center">
                {searchTerm ? 'No matching users found' : 'No users found'}
              </div>
            ) : (
              displayUsers.map((user) => (
                <div key={user.email} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-lg">{user.name || 'N/A'}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDeleteConfirm(true);
                      }}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Delete User"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete User"
          message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
          confirmLabel="Delete"
          requirePassword={true}
          onConfirm={handleDeleteUser}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setSelectedUser(null);
          }}
        />
      </AdminLayout>
    </RoleBasedGuard>
  );
}
