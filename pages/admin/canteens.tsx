import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/layout/AdminLayout';
import RoleBasedGuard from '../../components/auth/RoleBasedGuard';
import { FaSearch, FaTrash } from 'react-icons/fa';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function ManageCanteens() {
  const [canteens, setCanteens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCanteen, setSelectedCanteen] = useState<any>(null);
  const [showAddCanteen, setShowAddCanteen] = useState(false);
  const [newCanteenData, setNewCanteenData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchCanteens();
  }, []);

  const fetchCanteens = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/admin/canteens', {
        headers: {
          Authorization: token || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCanteens(data.canteens || []);
      } else {
        throw new Error('Failed to fetch canteens');
      }
    } catch (error) {
      toast.error('Error loading canteens');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCanteen = async (password: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/admin/canteens/${selectedCanteen.email}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || ''
        },
        body: JSON.stringify({ password })
      });
      
      if (response.ok) {
        toast.success('Canteen deleted successfully');
        fetchCanteens();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete canteen');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setShowDeleteConfirm(false);
    setSelectedCanteen(null);
  };

  const handleAddCanteen = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/admin/canteens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || ''
        },
        body: JSON.stringify(newCanteenData)
      });
      
      if (response.ok) {
        toast.success('Canteen added successfully');
        fetchCanteens();
        setShowAddCanteen(false);
        setNewCanteenData({ name: '', email: '', password: '' });
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add canteen');
    }
  };

  const filteredCanteens = canteens.filter(canteen => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      canteen.name?.toLowerCase().includes(searchLower) ||
      canteen.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <RoleBasedGuard allowedRoles={['admin']}>
      <AdminLayout>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Manage Canteens</h1>
              <button
                onClick={() => setShowAddCanteen(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                Add New Canteen
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 p-3 w-full border rounded-lg shadow-sm"
                placeholder="Search canteens..."
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full p-8 text-center">Loading canteens...</div>
            ) : filteredCanteens.length === 0 ? (
              <div className="col-span-full p-8 text-center">
                {searchTerm ? 'No matching canteens found' : 'No canteens found'}
              </div>
            ) : (
              filteredCanteens.map((canteen) => (
                <div key={canteen.email} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-lg">{canteen.name}</h3>
                      <p className="text-sm text-gray-500">{canteen.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Joined: {new Date(canteen.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCanteen(canteen);
                        setShowDeleteConfirm(true);
                      }}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Delete Canteen"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Canteen Modal */}
        {showAddCanteen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddCanteen(false)} />
              
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
                  <h3 className="text-lg font-semibold mb-4">Add New Canteen</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Canteen Name
                      </label>
                      <input
                        type="text"
                        value={newCanteenData.name}
                        onChange={(e) => setNewCanteenData({...newCanteenData, name: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newCanteenData.email}
                        onChange={(e) => setNewCanteenData({...newCanteenData, email: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={newCanteenData.password}
                        onChange={(e) => setNewCanteenData({...newCanteenData, password: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 sm:ml-3 sm:w-auto"
                    onClick={handleAddCanteen}
                  >
                    Add Canteen
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setShowAddCanteen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Canteen"
          message={`Are you sure you want to delete ${selectedCanteen?.name}? This action cannot be undone.`}
          confirmLabel="Delete"
          requirePassword={true}
          onConfirm={handleDeleteCanteen}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setSelectedCanteen(null);
          }}
        />
      </AdminLayout>
    </RoleBasedGuard>
  );
}
