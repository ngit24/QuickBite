import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaHeart, FaPlus, FaMinus, FaFire, FaAward } from 'react-icons/fa';

interface EnhancedFoodCardProps {
  product: any;
  onAddToCart: (product: any, quantity: number) => void;
  onToggleFavorite: (product: any) => void;  // Changed to accept full product
  isFavorite: boolean;
  priority?: boolean;
}

export default function EnhancedFoodCard({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite,
  priority
}: EnhancedFoodCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await onAddToCart(product, quantity);
      setQuantity(1);
      setIsExpanded(false);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
      onHoverStart={() => !isExpanded && setIsExpanded(true)}
      onHoverEnd={() => !isAdding && setIsExpanded(false)}
    >
      <div className="relative">
        {/* Image */}
        <div className="relative h-40 overflow-hidden">
          <Image
            src={product.image_url || '/images/default-food.jpg'}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            className="transform transition-transform duration-500 group-hover:scale-110"
            priority={priority}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/40" />
        </div>

        {/* Updated Favorite Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);  // Pass the entire product
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm ${
            isFavorite 
              ? 'bg-red-500 text-white' 
              : 'bg-black/10 text-white hover:bg-red-500'
          } transition-colors duration-300`}
        >
          <FaHeart className="w-4 h-4" />
        </motion.button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.badge && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-sm"
            >
              <FaFire className="w-3 h-3" />
              <span className="text-xs font-medium">{product.badge}</span>
            </motion.div>
          )}
          {product.discount && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-sm"
            >
              <FaAward className="w-3 h-3" />
              <span className="text-xs font-medium">{product.discount}% OFF</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900">{product.name}</h3>
          <div className="flex items-center bg-orange-50 px-2 py-1 rounded-full">
            <FaStar className="w-3 h-3 text-orange-500 mr-1" />
            <span className="text-xs font-medium text-orange-600">
              {product.rating || '4.5'}
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {/* Price Display */}
              <div className="flex items-baseline gap-2">
                {product.discount ? (
                  <>
                    <span className="text-gray-400 text-sm line-through">
                      ₹{product.price}
                    </span>
                    <span className="text-lg font-bold text-primary-600">
                      ₹{(product.price * (1 - product.discount / 100)).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-primary-600">
                    ₹{product.price}
                  </span>
                )}
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <FaMinus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <FaPlus className="w-4 h-4 text-gray-600" />
                  </button>
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
                  } transition-colors font-medium text-sm`}
                >
                  {isAdding ? 'Adding...' : 'Add to Cart'}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-baseline gap-2">
                  {product.discount ? (
                    <>
                      <span className="text-gray-400 text-sm line-through">
                        ₹{product.price}
                      </span>
                      <span className="text-lg font-bold text-primary-600">
                        ₹{(product.price * (1 - product.discount / 100)).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-primary-600">
                      ₹{product.price}
                    </span>
                  )}
                </div>
                <FaPlus className="w-4 h-4 text-primary-600" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
