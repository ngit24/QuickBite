import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaTimes, FaPlus, FaMinus, FaArrowRight } from 'react-icons/fa';
import Image from 'next/image';
import { useRouter } from 'next/router';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  discount?: number;
}

interface SideCartProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  totalAmount: number;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
}

export default function SideCart({
  isOpen,
  onClose,
  cart,
  totalAmount,
  updateQuantity,
  removeItem
}: SideCartProps) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50"
          >
            {/* Cart Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaShoppingCart className="text-primary-600 w-5 h-5" />
                <h2 className="text-lg font-bold">Your Cart</h2>
                <span className="bg-primary-100 text-primary-600 px-2 py-1 rounded-full text-sm">
                  {cart.length} items
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="overflow-y-auto p-4 space-y-4 flex-1" style={{ maxHeight: 'calc(100vh - 180px)' }}>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className="flex gap-4 bg-white rounded-xl p-3 shadow-sm"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image_url || '/images/default-food.jpg'}
                      alt={item.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                        >
                          <FaMinus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                        >
                          <FaPlus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-primary-600 font-medium">₹{item.price}</p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Cart Footer */}
            <div className="border-t p-4 bg-white">
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Total Amount:</span>
                <span className="text-xl font-bold">₹{totalAmount.toFixed(2)}</span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  router.push('/checkout');
                }}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium 
                         hover:bg-primary-700 flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <FaArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
