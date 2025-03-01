import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaRegHeart, FaRegClock, FaChevronRight, FaMinus, FaPlus } from 'react-icons/fa';
import Image from 'next/image';
import { useFavorites } from '@/hooks/useFavorites';

interface FavoriteProduct {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  discount?: number;
}

interface FavoritesSectionProps {
  favorites: FavoriteProduct[];
  onAddToCart: (product: FavoriteProduct, quantity: number) => void;
  onRemoveFavorite: (productId: string) => void;
  isLoading?: boolean;
}

const FavoriteListItem = React.memo(({ 
  product, 
  onAddToCart, 
  onRemoveFavorite,
  isActive,
  onClick
}: { 
  product: FavoriteProduct; 
  onAddToCart: (product: FavoriteProduct, quantity: number) => void;
  onRemoveFavorite: (id: string) => Promise<void>;
  isActive: boolean;
  onClick: () => void;
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(product.discount ? 
    product.price * (1 - product.discount / 100) : 
    product.price
  );

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsRemoving(true);
      await onRemoveFavorite(product.id);
      // Reset active state after removal
      onClick();
    } catch (error) {
      console.error('Failed to remove:', error);
    }
  };

  if (isRemoving) return null;

  return (
    <motion.div
      layout
      initial={false}
      onClick={() => !isTransitioning && onClick()}
      className={`relative overflow-hidden rounded-lg transition-all duration-300
        ${isActive ? 'bg-white shadow-md' : 'bg-gray-50 hover:bg-white hover:shadow-sm'}`}
    >
      {/* Main Row - Always Visible */}
      <div className="flex items-center p-3 gap-3">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          <Image
            src={product.image_url || '/images/default-food.jpg'}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}
          />
          {product.discount && (
            <div className="absolute top-0 left-0 bg-green-500 text-white text-xs px-1.5 py-0.5">
              -{product.discount}%
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-primary-600">{formattedPrice}</span>
            {product.discount && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.price}
              </span>
            )}
          </div>
        </div>

        <motion.div
          animate={{ rotate: isActive ? 90 : 0 }}
          className="text-gray-400"
        >
          <FaChevronRight className="w-4 h-4" />
        </motion.div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onAnimationStart={() => setIsTransitioning(true)}
            onAnimationComplete={() => setIsTransitioning(false)}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-3 space-y-4">
              {/* Quick Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowControls(!showControls);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                  >
                    <FaShoppingCart className="w-4 h-4" />
                    <span className="text-sm font-medium">Add to Cart</span>
                  </button>
                  <button
                    onClick={handleRemove}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    disabled={isRemoving}
                  >
                    <FaRegHeart className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {isRemoving ? 'Removing...' : 'Remove'}
                    </span>
                  </button>
                </div>
                
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <FaRegClock className="w-3 h-3" />
                  Added recently
                </span>
              </div>

              {/* Quantity Controls */}
              <AnimatePresence>
                {showControls && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuantity(Math.max(1, quantity - 1));
                        }}
                        className="p-1 rounded bg-white shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        <FaMinus className="w-3 h-3 text-gray-600" />
                      </button>
                      <span className="font-medium w-8 text-center">{quantity}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuantity(quantity + 1);
                        }}
                        className="p-1 rounded bg-white shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        <FaPlus className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product, quantity);
                        setShowControls(false);
                        setQuantity(1);
                      }}
                      className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                      Add {quantity} to Cart
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

FavoriteListItem.displayName = 'FavoriteListItem';

export default function FavoritesSection({ 
  favorites = [], 
  onAddToCart, 
  onRemoveFavorite,
  isLoading = false 
}: FavoritesSectionProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { fetchFavorites } = useFavorites();

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!favorites.length) {
    return (
      <div className="text-center py-8">
        <FaRegHeart className="w-8 h-8 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No favorites yet</p>
        <p className="text-sm text-gray-400">Items you heart will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {favorites.map((product) => (
        <FavoriteListItem
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onRemoveFavorite={onRemoveFavorite}
          isActive={activeId === product.id}
          onClick={() => setActiveId(activeId === product.id ? null : product.id)}
        />
      ))}
    </div>
  );
}
