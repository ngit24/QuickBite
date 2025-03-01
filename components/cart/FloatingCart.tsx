import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FaShoppingCart, FaTimes, FaPlus, FaMinus, FaArrowRight, FaTrash } from 'react-icons/fa';
import { useCart } from '../../hooks/useCart';
import { toast } from 'react-toastify';

export default function FloatingCart() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const { items, totalItems, totalPrice, updateItemQuantity, removeItem } = useCart();

  useEffect(() => {
    // Show cart icon if there are items in cart
    setIsVisible(totalItems > 0);

    // Show animation when new item added
    if (totalItems > 0) {
      setCartAdded(true);
      setTimeout(() => setCartAdded(false), 1000);
    }

    // Listen for storage events (cart updates from other components)
    const handleStorageChange = () => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          if (parsedCart && parsedCart.length > 0) {
            setIsVisible(true);
            setCartAdded(true);
            setTimeout(() => setCartAdded(false), 1000);
          } else {
            setIsVisible(false);
          }
        } catch (error) {
          console.error('Failed to parse cart from localStorage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [totalItems]);

  const handleRemoveItem = (id: string) => {
    removeItem(id);
    toast.info('Item removed from cart', { autoClose: 2000 });
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Cart Toggle Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: cartAdded ? [1, 1.2, 1] : 1, 
          opacity: 1 
        }}
        transition={{ 
          scale: { duration: 0.4 },
          opacity: { duration: 0.2 } 
        }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.button
          className="bg-primary-600 text-white w-14 h-14 rounded-full shadow-lg flex flex-col items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <FaShoppingCart className="text-xl" />
          <span className="text-xs font-bold">{totalItems}</span>
        </motion.button>
      </motion.div>

      {/* Cart Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Cart Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed top-0 right-0 w-full sm:w-96 h-full bg-white shadow-xl z-50 flex flex-col"
            >
              {/* Cart Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <div>
                  <h2 className="text-lg font-bold">Your Cart</h2>
                  <p className="text-sm text-gray-500">{totalItems} items</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <FaTimes className="text-gray-500" />
                </motion.button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.length > 0 ? (
                  items.map(item => (
                    <div key={item.id} className="flex gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image_url || '/images/default-food.jpg'} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/images/default-food.jpg';
                          }}
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-medium line-clamp-1">{item.name}</h3>
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-semibold">₹{item.price}</span>
                            {item.discount && (
                              <span className="text-xs text-gray-500 line-through">
                                ₹{item.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-gray-100 rounded-lg">
                            <button 
                              onClick={() => {
                                if (item.quantity === 1) {
                                  // Confirm before removing the last item
                                  if (window.confirm('Remove this item from cart?')) {
                                    handleRemoveItem(item.id);
                                  }
                                } else {
                                  updateItemQuantity(item.id, item.quantity - 1);
                                }
                              }}
                              className="p-1 hover:bg-gray-200 rounded-l-lg w-8 h-8 flex items-center justify-center"
                            >
                              <FaMinus className="text-gray-600 w-2.5 h-2.5" />
                            </button>
                            
                            <span className="font-medium w-8 text-center text-sm">{item.quantity}</span>
                            
                            <button 
                              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-200 rounded-r-lg w-8 h-8 flex items-center justify-center"
                            >
                              <FaPlus className="text-gray-600 w-2.5 h-2.5" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                          >
                            <FaTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <FaShoppingCart className="text-4xl mb-3 text-gray-300" />
                    <p>Your cart is empty</p>
                  </div>
                )}
              </div>

              {/* Cart Footer - FIX THE LINK COMPONENT */}
              {items.length > 0 && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-bold">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  
                  {/* Fix for Next.js Link */}
                  <Link 
                    href="/checkout"
                    className="block w-full" 
                    passHref
                  >
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      Proceed to Checkout <FaArrowRight />
                    </motion.button>
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
