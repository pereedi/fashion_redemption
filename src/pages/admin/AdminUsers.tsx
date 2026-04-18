import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DataTable, type Column } from '../../components/admin/shared/DataTable';
import { DynamicForm, type FormField } from '../../components/admin/shared/DynamicForm';
import { X } from 'lucide-react';
import API_BASE_URL from '../../config/api';

const AdminUsers = () => {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handleDelete = async (row: any) => {
    if (row.id === currentUser?.id) {
      alert("You cannot delete your own admin account.");
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete user ${row.name}?`)) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${row.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user', error);
    }
  };

  const handleEdit = (row: any) => {
    if (row.id === currentUser?.id) {
      alert("You cannot change your own role here.");
      return;
    }
    setEditingUser(row);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    if (!editingUser) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${editingUser.id}/role`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: formData.role })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchUsers();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('An error occurred while updating the user role.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<any>[] = [
    { 
      header: 'Avatar', 
      cell: (row: any) => (
        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-serif font-bold text-lg">
          {row.name.charAt(0).toUpperCase()}
        </div>
      )
    },
    { header: 'Name', cell: (row) => <span className="font-medium text-gray-900">{row.name}</span> },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Joined', cell: (row: any) => new Date(row.createdAt).toLocaleDateString() },
    { 
      header: 'Role', 
      cell: (row: any) => (
        <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${
          row.role === 'admin' ? 'bg-luxury-red text-white' : 'bg-gray-100 text-gray-600'
        }`}>
          {row.role || 'customer'}
        </span>
      )
    }
  ];

  const actions = [
    { icon: 'edit' as const, onClick: handleEdit, title: 'Change Role' },
    { icon: 'delete' as const, onClick: handleDelete, title: 'Delete User' }
  ];

  const formFields: FormField[] = [
    { 
      name: 'role', 
      label: 'User Role', 
      type: 'select', 
      required: true,
      options: [
        { label: 'Customer', value: 'customer' },
        { label: 'Admin', value: 'admin' }
      ]
    }
  ];

  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const lowerQuery = searchQuery.toLowerCase();
    return users.filter(u => 
      u.name.toLowerCase().includes(lowerQuery) || 
      u.email?.toLowerCase().includes(lowerQuery)
    );
  }, [users, searchQuery]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-2 border-luxury-red border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold tracking-tight uppercase">Users</h1>
          <p className="text-sm text-gray-500">Manage customer accounts and admin access.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <input 
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 px-4 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-luxury-red transition-all"
          />
        </div>
      </div>

      <DataTable 
        data={filteredUsers} 
        columns={columns} 
        actions={actions} 
        keyExtractor={(row) => row.id} 
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-serif font-bold tracking-tight uppercase">
                Change User Role
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-100">
                <p className="text-sm text-gray-600 mb-1">User: <span className="font-bold text-black">{editingUser?.name}</span></p>
                <p className="text-sm text-gray-600">Email: <span className="font-medium text-black">{editingUser?.email}</span></p>
              </div>

              <DynamicForm 
                fields={formFields} 
                initialData={{ role: editingUser?.role || 'customer' }}
                onSubmit={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                submitLabel="Update Role"
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
