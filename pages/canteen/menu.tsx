import { useState, useEffect } from 'react';
import Head from 'next/head';
import { toast } from 'react-toastify';
import CanteenLayout from '../../components/layout/CanteenLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaPencilAlt, FaTrash, FaSpinner } from 'react-icons/fa';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  availability: string;
  image_url: string;
}

export default function CanteenMenu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    availability: 'available',
    image: null as File | null,
    image_url: '' // Add this to store current image URL
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/get-products');
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleEditClick = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      availability: product.availability,
      image: null,
      image_url: product.image_url // Store the current image URL
    });
    setEditingProduct(product);
    // Scroll form into view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('availability', formData.availability);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const url = editingProduct 
        ? `http://127.0.0.1:5000/update-product/${editingProduct.id}`
        : 'http://127.0.0.1:5000/add-product';

      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        toast.success(editingProduct ? 'Product updated successfully' : 'Product added successfully');
        resetForm();
        fetchProducts();
      } else {
        throw new Error('Failed to process product');
      }
    } catch (error) {
      toast.error('Error processing product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: '',
      availability: 'available',
      image: null,
      image_url: ''
    });
    setEditingProduct(null);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/delete-product/${productId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Product deleted successfully');
        fetchProducts();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      toast.error('Error deleting product');
    }
  };

  const filteredProducts = filterCategory 
    ? products.filter(p => p.category === filterCategory)
    : products;

  return (
    <CanteenLayout>
      <Head>
        <title>Menu Management | QuickByte</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600 mt-1">Add, edit, and manage your menu items</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-20">
              <h2 className="text-lg font-semibold mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Snacks</option>
                    <option value="beverages">Beverages</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Availability</label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option value="available">Available</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Image</label>
                  {formData.image_url && !formData.image && (
                    <div className="mt-2 mb-2">
                      <img 
                        src={formData.image_url} 
                        alt="Current product" 
                        className="h-24 w-24 object-cover rounded-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1">Current image</p>
                    </div>
                  )}
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  {editingProduct && (
                    <p className="mt-1 text-xs text-gray-500">
                      Upload a new image only if you want to change the current one
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isSubmitting && <FaSpinner className="animate-spin mr-2" />}
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Menu Items</h2>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="rounded-lg border-gray-200 text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="snacks">Snacks</option>
                  <option value="beverages">Beverages</option>
                </select>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <FaSpinner className="animate-spin text-3xl text-green-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {filteredProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
                      >
                        <div className="aspect-w-16 aspect-h-9 relative bg-gray-100">
                          <img
                            src={product.image_url || '/placeholder.png'}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">{product.name}</h3>
                              <p className="text-green-600 font-medium">₹{product.price}</p>
                              <span className="text-sm text-gray-500 capitalize">{product.category}</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.availability === 'available' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.availability}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => handleEditClick(product)}
                              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No products found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </CanteenLayout>
  );
}
