import { create } from 'zustand';
import { toast } from 'react-toastify';

interface FavoriteProduct {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  discount?: number;
}

interface FavoritesState {
  favorites: FavoriteProduct[];
  isLoading: boolean;
  setFavorites: (favorites: FavoriteProduct[]) => void;
  toggleFavorite: (product: FavoriteProduct) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  fetchFavorites: () => Promise<void>;
  removeFromFavorites: (product: any) => Promise<void>;
}

export const useFavorites = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoading: true,
  setFavorites: (favorites) => set({ favorites }),
  
  fetchFavorites: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost969.pythonanywhere.com/user/favorites', {
        headers: {
          'Authorization': token || ''
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.favorites)) {
          set({ favorites: data.favorites, isLoading: false });
        }
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleFavorite: async (product) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost969.pythonanywhere.com/user/favorites', {
        method: 'POST',
        headers: {
          'Authorization': token || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product_id: product.id })
      });

      if (response.ok) {
        const { favorites: currentFavorites } = get();
        const exists = currentFavorites.some(fav => fav.id === product.id);
        
        // Update local state immediately
        if (exists) {
          set({ favorites: currentFavorites.filter(fav => fav.id !== product.id) });
          toast.success('Removed from favorites');
        } else {
          set({ favorites: [...currentFavorites, product] });
          toast.success('Added to favorites');
        }
        
        // Refresh favorites from server
        await get().fetchFavorites();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  },

  isFavorite: (productId) => {
    const { favorites } = get();
    return favorites.some(item => item.id === productId);
  },

  removeFromFavorites: async (product) => {
    try {
      set({ isLoading: true });
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost969.pythonanywhere.com/user/favorites', {
        method: 'POST',
        headers: {
          'Authorization': token || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product_id: product.id })
      });

      if (response.ok) {
        // Optimistically update local state first
        set((state) => ({
          favorites: state.favorites.filter(fav => fav.id !== product.id)
        }));
        toast.success('Removed from favorites');
        
        // Refresh favorites from server
        await get().fetchFavorites();
      } else {
        throw new Error('Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    } finally {
      set({ isLoading: false });
    }
  }
}));
