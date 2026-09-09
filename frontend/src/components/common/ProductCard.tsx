import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '@/utils/api';
import { useAddToCart } from '@/api/storeApi';
import { toast } from 'sonner';
import { ShoppingBag, Check, Plus } from 'lucide-react';

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCartMutation = useAddToCart();
  const [added, setAdded] = useState(false);

  const mainImage = product.images?.find((img: any) => img.is_main)?.image || product.images?.[0]?.image;
  const numPrice = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price || 0);
  const safePrice = isNaN(numPrice) ? 0 : numPrice;
  const numCompare = product.compare_price != null ? (typeof product.compare_price === 'string' ? parseFloat(product.compare_price) : Number(product.compare_price)) : null;
  const discountPercentage = numCompare && numCompare > safePrice
    ? Math.round(((numCompare - safePrice) / numCompare) * 100)
    : 0;

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  const handleQuickAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || addToCartMutation.isPending) return;

    addToCartMutation.mutate(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: () => {
          setAdded(true);
          toast.success(`Added ${product.name} to cart!`);
          setTimeout(() => setAdded(false), 2000);
        },
        onError: () => {
          toast.error('Failed to add item to cart');
        },
      }
    );
  };

  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-2xl border border-gray-200/80 hover:border-blue-300 transition-all duration-300 p-4 card-hover animate-fade-in">
      {/* 1. Image Container */}
      <Link 
        to={`/products/${product.slug || product.id}`} 
        className="relative w-full aspect-square max-h-[260px] bg-[#F8F9FA] rounded-xl overflow-hidden flex items-center justify-center p-4 mb-3 group-hover:bg-[#F2F4F7] transition-colors img-zoom"
      >
        {mainImage ? (
          <img
            src={getImageUrl(mainImage)}
            alt={product.name}
            className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <ShoppingBag className="w-10 h-10 text-gray-300 stroke-1" />
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discountPercentage > 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
              -{discountPercentage}%
            </span>
          )}
          {product.is_featured && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
              Featured
            </span>
          )}
        </div>

        {isOutOfStock && (
          <span className="absolute top-2.5 right-2.5 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
            Out of Stock
          </span>
        )}
      </Link>

      {/* 2. Meta Info */}
      <div className="flex flex-col flex-1 justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-blue-600 truncate">
              {product.category?.name || 'General'}
            </span>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-[10px] font-bold text-amber-600">Only {product.stock} left</span>
            )}
          </div>

          <Link to={`/products/${product.slug || product.id}`} className="block">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* 3. Bottom Row: Clear Price Tag & Add To Cart Button */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-black text-gray-900 tracking-tight">
                ${safePrice.toFixed(2)}
              </span>
              {numCompare && numCompare > safePrice && (
                <span className="text-xs text-gray-400 line-through">
                  ${numCompare.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleQuickAddToCart}
            disabled={isOutOfStock || addToCartMutation.isPending}
            className={`h-8 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs ${
              added
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
            }`}
            title="Add to Cart"
          >
            {added ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{added ? 'Added' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}