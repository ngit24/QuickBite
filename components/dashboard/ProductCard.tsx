import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaStar, FaShoppingCart } from 'react-icons/fa';

interface ProductCardProps {
  product: any;
  onAddToCart: (product: any) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden group"
    >
      <div className="relative h-48">
        <Image
          src={product.image_url || '/images/default-food.jpg'}
          alt={product.name}
          layout="fill"
          objectFit="cover"
          className="group-hover:scale-110 transition-transform duration-300"
        />
        {product.discount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {product.discount}% OFF
          </div>
        )}
        {product.badge && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {product.badge}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
          <div className="flex items-center text-sm">
            <FaStar className="text-yellow-400 mr-1" />
            <span>{product.rating}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="space-x-2">
            {product.discount ? (
              <>
                <span className="text-gray-400 line-through">₹{product.price}</span>
                <span className="text-xl font-bold text-primary-600">
                  ₹{(product.price * (1 - product.discount / 100)).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-primary-600">₹{product.price}</span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onAddToCart(product)}
            className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            <FaShoppingCart className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
