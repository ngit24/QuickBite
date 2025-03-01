import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaShoppingCart, FaHeart, FaFire } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface EnhancedProductCardProps {
  product: any;
  onAddToCart: (product: any) => void;
  priority?: boolean;
}

export default function EnhancedProductCard({ product, onAddToCart, priority = false }: EnhancedProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await onAddToCart(product);
      toast.success('Added to cart!', {
        position: 'bottom-right',
        icon: '🛒'
      });
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={product.image_url || '/images/default-food.jpg'}
          alt={product.name}
          layout="fill"
          objectFit="cover"
          priority={priority}
          className="transform transition-transform duration-500"
          style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300"
             style={{ opacity: isHovered ? 1 : 0 }} />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {product.badge && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
            >
              <FaFire className="text-yellow-300" />
              {product.badge}
            </motion.div>
          )}
          {product.discount && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium"
            >
              {product.discount}% OFF
            </motion.div>
          )}
        </div>

        {/* Favorite Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/90 shadow-lg"
        >
          <FaHeart className={`w-4 h-4 transition-colors ${
            isFavorite ? 'text-red-500' : 'text-gray-400'
          }`} />
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{product.name}</h3>
          <div className="flex items-center text-sm bg-yellow-50 px-2 py-1 rounded-full">
            <FaStar className="text-yellow-400 mr-1" />
            <span className="font-medium">{product.rating}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              {product.discount ? (
                <>
                  <span className="text-gray-400 text-sm line-through">₹{product.price}</span>
                  <span className="text-xl font-bold text-primary-600">
                    ₹{(product.price * (1 - product.discount / 100)).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-primary-600">₹{product.price}</span>
              )}
            </div>
            {product.order_count > 0 && (
              <p className="text-xs text-gray-500">{product.order_count} orders this month</p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`px-4 py-2 rounded-lg ${
              isAdding 
                ? 'bg-gray-100 text-gray-400' 
                : 'bg-primary-600 text-white hover:bg-primary-700'
            } transition-colors flex items-center gap-2`}
          >
            <FaShoppingCart className={`w-4 h-4 ${isAdding ? 'animate-bounce' : ''}`} />
            {isAdding ? 'Adding...' : 'Add'}
          </motion.button>
        </div>
      </div>

      {/* Quick View Overlay (optional) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 bg-black/75 flex items-center justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-white text-primary-600 rounded-lg font-medium"
            >
              Quick View
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
