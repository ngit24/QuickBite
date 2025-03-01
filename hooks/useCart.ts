import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  discount?: number;
  originalPrice?: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Load cart from localStorage when component mounts
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        }
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        // Reset cart if there's an error
        localStorage.setItem('cart', JSON.stringify([]));
      }
    }
  }, []);

  // Update localStorage when items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
    
    // Trigger a storage event so other components can react to cart changes
    const event = new Event('storage');
    window.dispatchEvent(event);
  }, [items]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalPrice = items.reduce((sum, item) => {
    // Use the current price (which may already be discounted)
    return sum + item.price * item.quantity;
  }, 0);

  // Add item to cart (or increase quantity if it exists)
  const addItem = (product: any) => {
    // Prepare the product to be added to cart
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.discount 
        ? product.price * (1 - product.discount / 100) 
        : product.price,
      quantity: 1,
      image_url: product.image_url,
      discount: product.discount,
      originalPrice: product.price, // Store original price for reference
    };

    setItems(currentItems => {
      // Check if the item already exists in the cart
      const existingItemIndex = currentItems.findIndex(item => item.id === product.id);

      if (existingItemIndex !== -1) {
        // If item exists, increase its quantity
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      } else {
        // If item doesn't exist, add it to the cart
        return [...currentItems, cartItem];
      }
    });
  };

  // Update the quantity of an item
  const updateItemQuantity = (id: string, quantity: number) => {
    setItems(currentItems => {
      if (quantity <= 0) {
        // Remove item if quantity is zero or negative
        return currentItems.filter(item => item.id !== id);
      }

      // Otherwise update the quantity
      return currentItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      );
    });
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  // Clear the entire cart
  const clearCart = () => {
    setItems([]);
  };

  return {
    items,
    totalItems,
    totalPrice,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart
  };
}
