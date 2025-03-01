import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaTimes, FaPlus, FaMinus } from 'react-icons/fa';
import Image from 'next/image';
import { useRouter } from 'next/router';

interface CartPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: any[];
  totalAmount: number;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  removeItem: (itemId: string) => void;
}

export default function CartPreviewModal({
  isOpen,
  onClose,
  cart,
  totalAmount,
  updateQuantity,
  removeItem
}: CartPreviewModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FaShoppingCart className="text-primary-600" />
            Your Cart
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-4 py-4 border-b">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                <Image
                  src={item.image_url || '/images/default-food.jpg'}
                  alt={item.name}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-primary-600">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  <FaMinus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  <FaPlus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Amount:</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => router.push('/checkout')}
              className="flex-1 py-3 px-4 rounded-xl bg-primary-600 text-white hover:bg-primary-700"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
