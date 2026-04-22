import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DataTable, type Column } from '../../components/admin/shared/DataTable';
import { DynamicForm, type FormField } from '../../components/admin/shared/DynamicForm';
import { X } from 'lucide-react';
import API_BASE_URL from '../../config/api';

const AdminOrders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const handleEdit = (row: any) => {
    setEditingOrder(row);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    if (!editingOrder) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/${editingOrder.id}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: formData.status })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchOrders();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('An error occurred while updating the order status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<any>[] = [
    { 
      header: 'Order ID', 
      cell: (row: any) => <span className="font-medium px-2 py-1 bg-gray-100 rounded text-xs uppercase tracking-wider text-gray-700">#{String(row.id).padStart(6, '0')}</span> 
    },
    { header: 'Date', cell: (row: any) => new Date(row.created_at || row.createdAt).toLocaleDateString() },
    { header: 'Customer', cell: (row: any) => row.customer_name || 'Guest' },
    { header: 'Total', cell: (row: any) => `Esp ${Number(row.total).toLocaleString()}` },
    { 
      header: 'Payment Ref', 
      cell: (row: any) => row.payment_ref ? <span className="text-[10px] font-mono text-gray-400">{row.payment_ref}</span> : <span className="text-[10px] text-gray-300 italic">None</span>
    },
    { 
      header: 'Status', 
      cell: (row: any) => {
        const status = row.status?.toLowerCase();
        return (
          <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${
            status === 'delivered' || status === 'paid' ? 'bg-green-100 text-green-800' :
            status === 'processing' ? 'bg-blue-100 text-blue-800' :
            status === 'shipped' ? 'bg-purple-100 text-purple-800' :
            status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {status}
          </span>
        );
      }
    }
  ];

  const actions = [
    { icon: 'edit' as const, onClick: handleEdit, title: 'Update Status' }
  ];

  const formFields: FormField[] = [
    { 
      name: 'status', 
      label: 'Order Status', 
      type: 'select', 
      required: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' }
      ]
    }
  ];

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-2 border-luxury-red border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight uppercase">Orders</h1>
          <p className="text-sm text-gray-500">Manage customer orders and fulfillments.</p>
        </div>
      </div>

      <DataTable 
        data={orders} 
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
                Update Order Status
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
                <p className="text-sm text-gray-600 mb-1">Editing Order ID: <span className="font-bold text-black uppercase">#{String(editingOrder?.id).padStart(6, '0')}</span></p>
                <p className="text-sm text-gray-600">Customer: <span className="font-medium text-black">{editingOrder?.customer_name}</span></p>
                <p className="text-sm text-gray-600">Current Status: <span className="font-medium text-black uppercase">{editingOrder?.status}</span></p>
                {editingOrder?.payment_ref && (
                  <p className="text-xs text-gray-500 mt-2 italic font-mono">Payment Ref: {editingOrder.payment_ref}</p>
                )}
              </div>

              <DynamicForm 
                fields={formFields} 
                initialData={{ status: editingOrder?.status }}
                onSubmit={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                submitLabel="Update Status"
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
