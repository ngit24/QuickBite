import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaUtensils, FaPlus, FaMinus } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface FoodCardProps {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  category: string;
  addToCart: (item: any, quantity: number) => void;
}

export default function FoodCard({ id, name, price, image_url, category, addToCart }: FoodCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false); // Track image load failure

  const handleAddToCart = () => {
    setIsAdding(true);
    const safeImageUrl = imageError || !image_url ? 'https://mt8848cafe.com/wp-content/uploads/2021/12/food-placeholder.jpg' : image_url;
    addToCart({ id, name, price, image_url: safeImageUrl, category }, quantity);
    toast.success(`${quantity} ${name} added to cart!`, {
      position: "bottom-right",
      autoClose: 2000,
    });
    setQuantity(1);
    setTimeout(() => setIsAdding(false), 300);
  };

  const handleIncrement = () => {
    setQuantity(prev => Math.min(prev + 1, 10)); // Max 10 items
  };

  const handleDecrement = () => {
    setQuantity(prev => Math.max(prev - 1, 1)); // Min 1 item
  };

  // Fallback URL if image fails or is missing
  const safeImageUrl = imageError || !image_url ? '/images/placeholder-food.png' : image_url;

  return (
    <motion.div 
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Section */}
      <div className="relative w-full pt-[56.25%]"> {/* 16:9 aspect ratio */}
        <Image
          src={safeImageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={75}
          onError={() => setImageError(true)} // Switch to fallback on error
          unoptimized={false} // Ensure Vercel optimization
        />
        <div className="absolute top-2 right-2 z-10">
          <span className="px-2 py-1 bg-white/90 rounded-full text-xs font-medium text-gray-700">
            {category}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-base text-gray-800 mb-1 truncate">{name}</h3>
        <p className="text-primary-600 font-bold mb-3">₹{price.toFixed(2)}</p>
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <button 
              onClick={handleDecrement}
              className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100"
              disabled={quantity <= 1}
            >
              <FaMinus className="text-xs" />
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-sm">
              {quantity}
            </span>
            <button 
              onClick={handleIncrement}
              className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100"
              disabled={quantity >= 10}
            >
              <FaPlus className="text-xs" />
            </button>
          </div>
          
          <motion.button
            onClick={handleAddToCart}
            className="flex-1 bg-primary-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}