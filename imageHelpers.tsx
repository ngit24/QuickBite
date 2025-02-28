/**
 * Helper function for handling images across the application
 * Provides consistent fallbacks and error handling
 */
export const getImageUrl = (url: string | undefined | null): string => {
  // If no URL provided, return default image
  if (!url) return '/images/default-food.jpg';
  
  // If URL is relative, ensure it's properly formed
  if (url.startsWith('/')) return url;
  
  // Return the original URL as is
  return url;
};

/**
 * Component to handle common image error fallbacks
 */
export const ImageWithFallback = ({ 
  src, 
  alt, 
  className, 
  ...props 
}: React.ImgHTMLAttributes<HTMLImageElement>) => {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null; // Prevent infinite error loop
    target.src = '/images/default-food.jpg';
  };

  return (
    <img 
      src={getImageUrl(src as string)} 
      alt={alt || 'Image'} 
      onError={handleError}
      className={className}
      {...props}
    />
  );
};
