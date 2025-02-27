import { useState } from 'react';
import Image from 'next/image'; // Add this import
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

  const handleAddToCart = () => {
    // Animation effect for adding to cart
    setIsAdding(true);
    
    addToCart({ id, name, price, image_url, category }, quantity);
    
    // Show toast notification
    toast.success(`${quantity} ${name} added to cart!`, {
      position: "bottom-right",
      autoClose: 2000,
    });
    
    // Reset quantity after adding to cart
    setQuantity(1);
    
    // Reset animation after a short delay
    setTimeout(() => setIsAdding(false), 300);
  };

  const handleIncrement = () => {
    setQuantity(prev => Math.min(prev + 1, 10)); // Max 10 items
  };

  const handleDecrement = () => {
    setQuantity(prev => Math.max(prev - 1, 1)); // Min 1 item
  };

  return (
    <motion.div 
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Section */}
      <div className="relative w-full pt-[56.25%]"> {/* 16:9 aspect ratio */}
        {image_url ? (
          <Image
            src={image_url}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e: any) => {
              e.target.src = '/images/placeholder-food.png'; // Fallback image
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <FaUtensils className="text-4xl text-gray-400" />
          </div>
        )}
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
              onClick={() => handleDecrement()}
              className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100"
              disabled={quantity <= 1}
            >
              <FaMinus className="text-xs" />
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-sm">
              {quantity}
            </span>
            <button 
              onClick={() => handleIncrement()}
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
