import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DataTable, type Column } from '../../components/admin/shared/DataTable';
import { DynamicForm, type FormField } from '../../components/admin/shared/DynamicForm';
import { X } from 'lucide-react';
import API_BASE_URL from '../../config/api';

const AdminInventory = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Sort to show low stock first
        const sorted = data.sort((a: any, b: any) => a.stock - b.stock);
        setProducts(sorted);
      }
    } catch (error) {
      console.error('Failed to fetch inventory', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchInventory();
  }, [token]);

  const handleEdit = (row: any) => {
    setEditingProduct(row);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    if (!editingProduct) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stock: Number(formData.stock) })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchInventory();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('An error occurred while updating the stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<any>[] = [
    { 
      header: 'Detailed Stock Status', 
      cell: (row: any) => {
        const totalStock = row.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) || row.stock || 0;
        return (
          <div className="flex flex-col gap-2">
            <span className={`px-3 py-1 text-[10px] font-bold rounded-full w-fit border ${
              totalStock === 0 ? 'bg-red-50 text-luxury-red border-red-200 animate-pulse' : 
              totalStock < 10 ? 'bg-orange-50 text-orange-800 border-orange-200' : 'bg-green-50 text-green-800 border-green-200'
            }`}>
              {totalStock} TOTAL
            </span>
            {row.variants && row.variants.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {row.variants.map((v: any, i: number) => (
                  <div key={i} className="flex flex-col items-center bg-white border border-gray-100 px-2 py-1 rounded min-w-[32px]">
                    <span className="text-[8px] font-bold text-gray-400 leading-none mb-1">{v.size}</span>
                    <span className={`text-[10px] font-bold ${v.stock === 0 ? 'text-luxury-red' : 'text-black'}`}>{v.stock}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }
    }
  ];

  const actions = [
    { icon: 'edit' as const, onClick: handleEdit, title: 'Update Stock' }
  ];

  const formFields: FormField[] = [
    { name: 'stock', label: 'Stock Quantity', type: 'number', required: true }
  ];

  const [searchQuery, setSearchQuery] = useState('');

  const filteredInventory = useMemo(() => {
    if (!searchQuery) return products;
    const lowerQuery = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      p.id?.toString().toLowerCase().includes(lowerQuery)
    );
  }, [products, searchQuery]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-2 border-luxury-red border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-serif font-bold tracking-tight uppercase">Inventory Control</h1>
          <p className="text-sm text-gray-500">Monitor stock levels and quickly reconcile inventory.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <input 
            type="text"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 px-4 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-luxury-red transition-all"
          />
        </div>
      </div>

      <DataTable 
        data={filteredInventory} 
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
                Update Stock Quantity
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-100 flex items-center gap-4">
                {editingProduct?.images && editingProduct.images[0] && (
                  <img src={editingProduct.images[0]} alt={editingProduct.name} className="w-16 h-16 rounded object-cover" />
                )}
                <div>
                  <p className="text-sm font-bold text-black">{editingProduct?.name}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">ID: {editingProduct?.id}</p>
                </div>
              </div>

              <DynamicForm 
                fields={formFields} 
                initialData={{ stock: editingProduct?.stock }}
                onSubmit={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                submitLabel="Update Inventory"
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
