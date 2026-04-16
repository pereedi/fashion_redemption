import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DataTable, type Column } from '../../components/admin/shared/DataTable';
import { DynamicForm, type FormField } from '../../components/admin/shared/DynamicForm';
import VariantEditor, { type Variant } from '../../components/admin/ProductEditor/VariantEditor';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORY_MAP, ALL_CATEGORIES } from '../../config/categoryMapping';
import API_BASE_URL from '../../config/api';

const AdminProducts = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Extension State
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [variants, setVariants] = useState<Variant[]>([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
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
      const res = await fetch(`${API_BASE_URL}/api/admin/products/${row._id}`, {
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
    setSelectedCategory(row.category || '');
    setVariants(row.variants || []);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setSelectedCategory('');
    setVariants([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const url = editingProduct 
        ? `${API_BASE_URL}/api/admin/products/${editingProduct._id}`
        : `${API_BASE_URL}/api/admin/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      // Combine form data with managed variants
      const finalData = {
        ...formData,
        variants: variants
      };

      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalData)
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
    { 
      header: 'Category', 
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="capitalize font-medium">{row.category}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-tighter">{row.type}</span>
        </div>
      ) 
    },
    { header: 'Price', cell: (row: any) => `Esp ${Number(row.basePrice).toLocaleString()}` },
    { 
      header: 'Stock Status', 
      cell: (row: any) => {
        const totalStock = row.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) || row.stock || 0;
        return (
          <div className="flex flex-col gap-1">
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded w-fit ${
              totalStock === 0 ? 'bg-red-100 text-luxury-red' : 
              totalStock < 10 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
            }`}>
              {totalStock} TOTAL
            </span>
            <div className="flex flex-wrap gap-1">
              {row.variants?.map((v: any, i: number) => (
                <span key={i} className="text-[8px] bg-gray-100 px-1 rounded text-gray-600">
                  {v.size}: {v.stock}
                </span>
              ))}
            </div>
          </div>
        );
      }
    }
  ];

  const actions = [
    { icon: 'edit' as const, onClick: handleEdit },
    { icon: 'delete' as const, onClick: handleDelete }
  ];

  const formFields: FormField[] = useMemo(() => [
    { name: 'basic_info', label: 'Product Basics', type: 'section' },
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    
    { name: 'classification', label: 'Categorization', type: 'section' },
    { 
      name: 'category', 
      label: 'Main Category', 
      type: 'select', 
      required: true,
      options: ALL_CATEGORIES
    },
    { 
      name: 'type', 
      label: 'Sub-Category / Type', 
      type: 'select', 
      required: true,
      options: selectedCategory ? CATEGORY_MAP[selectedCategory]?.types || [] : []
    },

    { name: 'pricing_media', label: 'Pricing & Images', type: 'section' },
    { name: 'basePrice', label: 'Price (Esp)', type: 'number', required: true, prefix: 'Esp' },
    { name: 'images', label: 'Images (URLs)', type: 'file', multiple: true, required: !editingProduct }
  ], [selectedCategory, editingProduct]);

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
                <div className="mb-10">
                  <DynamicForm 
                    fields={formFields} 
                    initialData={editingProduct ? {
                      ...editingProduct,
                      basePrice: editingProduct.basePrice || editingProduct.base_price
                    } : { category: selectedCategory }}
                    onChange={(data) => {
                      if (data.category !== selectedCategory) {
                        setSelectedCategory(data.category);
                      }
                    }}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    submitLabel={editingProduct ? 'Update Product' : 'Create Product'}
                    isLoading={isSubmitting}
                    // Custom Footer/Extension
                    extension={
                      <div className="mt-12">
                        <VariantEditor 
                          variants={variants} 
                          onChange={setVariants} 
                        />
                      </div>
                    }
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
