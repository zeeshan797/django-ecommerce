import { ProductCard } from '@/components/common/ProductCard';

interface ProductGridProps {
  products: any[];
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export default function ProductGrid({
  products = [],
  totalPages = 1,
  currentPage = 1,
  onPageChange,
}: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No products found</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          We couldn't find any products matching your current filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex justify-center pt-4 border-t border-gray-100">
          <nav className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm font-medium text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}