interface PriceDisplayProps {
  price: string | number;
  comparePrice?: string | number | null;
  className?: string;
  showComparePrice?: boolean;
}

export function PriceDisplay({ 
  price, 
  comparePrice, 
  className = '',
  showComparePrice = true 
}: PriceDisplayProps) {
  const formatPrice = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  const numCompare = comparePrice != null ? (typeof comparePrice === 'string' ? parseFloat(comparePrice) : comparePrice) : null;
  const hasDiscount = Boolean(numCompare && numCompare > numPrice);
  const discountPercent = hasDiscount && numCompare ? Math.round(((numCompare - numPrice) / numCompare) * 100) : 0;

  const currentPrice = formatPrice(price);
  const originalPrice = hasDiscount && numCompare ? formatPrice(numCompare) : null;

  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className="text-2xl font-bold text-gray-900">
        {currentPrice}
      </span>
      {showComparePrice && originalPrice && hasDiscount && (
        <>
          <span className="text-lg text-gray-400 line-through">
            {originalPrice}
          </span>
          <span className="bg-red-50 text-red-600 text-sm font-semibold px-2 py-0.5 rounded">
            -{discountPercent}%
          </span>
        </>
      )}
    </div>
  );
}