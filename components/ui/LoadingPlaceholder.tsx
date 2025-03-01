import React from 'react';

interface LoadingPlaceholderProps {
  variant?: 'card' | 'list' | 'menu-item' | 'order';
  count?: number;
  className?: string;
}

export default function LoadingPlaceholder({ 
  variant = 'card', 
  count = 3,
  className = ''
}: LoadingPlaceholderProps) {
  const variants = {
    card: (
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-48 w-full bg-gray-200 rounded-lg" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    ),

    'menu-item': (
      <div className="animate-pulse flex gap-4 bg-white rounded-lg p-4">
        <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    ),

    list: (
      <div className="animate-pulse flex gap-3 bg-white rounded-lg p-3">
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    ),

    order: (
      <div className="animate-pulse space-y-3 bg-white rounded-lg p-4">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-3/4" />
        </div>
        <div className="h-8 bg-gray-200 rounded w-1/3" />
      </div>
    )
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {Array(count).fill(0).map((_, i) => (
        <div key={i}>
          {variants[variant]}
        </div>
      ))}
    </div>
  );
}
