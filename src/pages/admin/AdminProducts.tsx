import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DataTable, type Column } from '../../components/admin/shared/DataTable';
import { DynamicForm, type FormField } from '../../components/admin/shared/DynamicForm';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminProducts = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/admin/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProducts();
  }, [token]);

  const handleDelete = async (row: any) => {
    if (!window.confirm(`Are you sure you want to delete ${row.name}?`)) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/products/${row._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product', error);
    }
  };

  const handleEdit = (row: any) => {
    setEditingProduct(row);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const url = editingProduct 
        ? `http://localhost:5000/api/admin/products/${editingProduct._id}`
        : `http://localhost:5000/api/admin/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      // Basic formatting for arrays
      if (typeof formData.sizes === 'string') {
        formData.sizes = formData.sizes.split(',').map((s: string) => s.trim());
      }
      if (typeof formData.colors === 'string') {
        formData.colors = formData.colors.split(',').map((c: string) => c.trim());
      }

      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchProducts();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('An error occurred while saving the product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Image',
      cell: (row: any) => (
        <div className="w-12 h-12 rounded-md bg-gray-100 overflow-hidden">
          {row.images && row.images[0] && (
            <img src={row.images[0]} alt={row.name} className="w-full h-full object-cover" />
          )}
        </div>
      )
    },
    { header: 'ID', accessorKey: 'id' },
    { header: 'Name', accessorKey: 'name' },
    { header: 'Category', cell: (row: any) => <span className="capitalize">{row.category}</span> },
    { header: 'Type', cell: (row: any) => <span className="capitalize">{row.type}</span> },
    { header: 'Price', cell: (row: any) => `$${Number(row.price).toFixed(2)}` },
    { 
      header: 'Stock', 
      cell: (row: any) => (
        <span className={`px-2 py-1 text-xs font-bold rounded-md ${
          row.stock === 0 ? 'bg-red-100 text-luxury-red' : 
          row.stock < 10 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
        }`}>
          {row.stock}
        </span>
      )
    }
  ];

  const actions = [
    { icon: 'edit' as const, onClick: handleEdit },
    { icon: 'delete' as const, onClick: handleDelete }
  ];

  const formFields: FormField[] = [
    { name: 'basic_info', label: 'Basic Information', type: 'section' },
    { name: 'name', label: 'Product Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    
    { name: 'classification', label: 'Classification', type: 'section' },
    { 
      name: 'category', 
      label: 'Category', 
      type: 'select', 
      required: true,
      options: [
        { label: 'Men', value: 'men' },
        { label: 'Women', value: 'women' },
        { label: 'Kids', value: 'kids' }
      ]
    },
    { 
      name: 'type', 
      label: 'Product Type', 
      type: 'select', 
      required: true,
      options: [
        { label: 'Clothing', value: 'clothing' },
        { label: 'Accessories', value: 'accessories' },
        { label: 'Shoes', value: 'shoes' }
      ]
    },

    { name: 'variants_info', label: 'Variants & Inventory', type: 'section' },
    { name: 'sizes', label: 'Sizes', type: 'text', placeholder: 'S, M, L, XL', required: true },
    { name: 'colors', label: 'Colors', type: 'text', placeholder: 'Black, White, Red', required: true },
    { name: 'stock', label: 'Stock Quantity', type: 'number', required: true },

    { name: 'pricing_media', label: 'Pricing & Media', type: 'section' },
    { name: 'price', label: 'Price (Esp)', type: 'number', required: true, prefix: 'Esp' },
    { name: 'images', label: 'Product Images', type: 'file', multiple: true, required: !editingProduct }
  ];

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-2 border-luxury-red border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in min-h-screen bg-[#F5F5F5] -m-8 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight uppercase">Products</h1>
          <p className="text-sm text-gray-500">Manage your store's inventory and catalog.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 bg-luxury-red text-white px-4 py-2 rounded-md hover:bg-black transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <DataTable 
        data={products} 
        columns={columns} 
        actions={actions} 
        keyExtractor={(row) => row._id} 
      />

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-start justify-center p-4 overflow-y-auto pt-24 pb-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ duration: 0.5, type: 'spring', damping: 25 }}
              className="bg-white rounded-2xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-5xl min-h-[85vh] flex flex-col relative z-[201] border border-gray-100"
            >
              <div className="flex items-center justify-between p-8 border-b border-gray-100">
                <h2 className="text-2xl font-serif font-bold tracking-tight uppercase">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-black transition-colors p-2 hover:bg-gray-50 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="px-10 py-12 flex-1 scrollbar-hide">
                <DynamicForm 
                  fields={formFields} 
                  initialData={editingProduct ? {
                    ...editingProduct,
                    sizes: editingProduct.sizes?.join(', '),
                    colors: editingProduct.colors?.join(', ')
                  } : undefined}
                  onSubmit={handleSubmit}
                  onCancel={() => setIsModalOpen(false)}
                  submitLabel={editingProduct ? 'Update Product' : 'Create Product'}
                  isLoading={isSubmitting}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
