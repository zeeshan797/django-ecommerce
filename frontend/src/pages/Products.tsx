import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProducts, useCategories } from '@/api/storeApi';
import { ProductCard } from '@/components/common/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Star,
  Sparkles
} from 'lucide-react';

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read current filter state directly from URL searchParams
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const minPriceParam = searchParams.get('min_price') || '';
  const maxPriceParam = searchParams.get('max_price') || '';
  const sortParam = searchParams.get('ordering') || '-created_at';
  const ratingParam = searchParams.get('rating') || '';
  const inStockParam = searchParams.get('availability') === 'in_stock';
  const featuredParam = searchParams.get('featured') === 'true';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Local inputs
  const [searchInput, setSearchInput] = useState(searchParam);
  const [tempMinPrice, setTempMinPrice] = useState(minPriceParam);
  const [tempMaxPrice, setTempMaxPrice] = useState(maxPriceParam);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Sync inputs with URL params
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  useEffect(() => {
    setTempMinPrice(minPriceParam);
  }, [minPriceParam]);

  useEffect(() => {
    setTempMaxPrice(maxPriceParam);
  }, [maxPriceParam]);

  // Load live categories from backend API
  const { data: categories } = useCategories();

  // Query products with active parameters
  const { data: productsData, isLoading, error } = useProducts({
    category: categoryParam || undefined,
    search: searchParam || undefined,
    min_price: minPriceParam ? parseFloat(minPriceParam) : undefined,
    max_price: maxPriceParam ? parseFloat(maxPriceParam) : undefined,
    ordering: sortParam || undefined,
    featured: featuredParam ? true : undefined,
    availability: inStockParam ? 'in_stock' : undefined,
    rating: ratingParam || undefined,
    page: pageParam,
  });

  const products = productsData?.results || [];
  const totalCount = productsData?.count || 0;
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Helper to update search params
  const updateFilters = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === undefined) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    // Reset to page 1 whenever filters change (unless page itself is explicitly changed)
    if (!('page' in updates)) {
      newParams.delete('page');
    }

    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() || null });
  };

  const handleApplyPrice = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateFilters({
      min_price: tempMinPrice ? tempMinPrice : null,
      max_price: tempMaxPrice ? tempMaxPrice : null,
    });
    setFilterDrawerOpen(false);
  };

  const handleClearAll = () => {
    setSearchInput('');
    setTempMinPrice('');
    setTempMaxPrice('');
    setSearchParams(new URLSearchParams());
    setFilterDrawerOpen(false);
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (categoryParam) count++;
    if (searchParam) count++;
    if (minPriceParam || maxPriceParam) count++;
    if (ratingParam) count++;
    if (inStockParam) count++;
    if (featuredParam) count++;
    return count;
  }, [categoryParam, searchParam, minPriceParam, maxPriceParam, ratingParam, inStockParam, featuredParam]);

  const activeCategoryObj = categories?.find(
    (c) => c.slug === categoryParam || c.id.toString() === categoryParam
  );

  return (
    <div className="min-h-screen bg-[#FBFBFC] pb-24">
      {/* 1. Minimal Header */}
      <div className="bg-white border-b border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
                <Link to="/" className="hover:text-gray-900 transition-colors">Store</Link>
                <span>/</span>
                <span className="text-gray-900 font-bold">Catalog</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {activeCategoryObj ? activeCategoryObj.name : 'All Products'}
              </h1>
            </div>
            
            <p className="text-xs sm:text-sm font-medium text-gray-500">
              Showing <span className="font-bold text-gray-900">{totalCount}</span> {totalCount === 1 ? 'item' : 'items'}
            </p>
          </div>

          {/* Category Quick Filter Pills */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => updateFilters({ category: null })}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                !categoryParam
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All Items
            </button>
            {categories?.map((cat) => {
              const isSelected = categoryParam === cat.slug || categoryParam === cat.id.toString();
              return (
                <button
                  key={cat.id}
                  onClick={() => updateFilters({ category: cat.slug || cat.id.toString() })}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.product_count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {cat.product_count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Controls Toolbar (Search, Filter Drawer Button, Sort) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-6 border-b border-gray-200/70">
          
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by keyword, brand, or model..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-10 py-2 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all font-medium shadow-2xs"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateFilters({ search: null });
                }}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Filter & Sort Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 shadow-2xs ${
                activeFilterCount > 0
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-extrabold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-2xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">Sort:</span>
              <select
                value={sortParam}
                onChange={(e) => updateFilters({ ordering: e.target.value })}
                className="text-xs font-bold text-gray-800 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="-created_at">Newest Arrivals</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-4">
            <span className="text-xs font-semibold text-gray-400">Active filters:</span>
            {categoryParam && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-gray-800 rounded-full text-xs font-semibold border border-gray-200 shadow-2xs">
                Category: {activeCategoryObj?.name || categoryParam}
                <button onClick={() => updateFilters({ category: null })} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchParam && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-gray-800 rounded-full text-xs font-semibold border border-gray-200 shadow-2xs">
                "{searchParam}"
                <button onClick={() => { setSearchInput(''); updateFilters({ search: null }); }} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(minPriceParam || maxPriceParam) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-gray-800 rounded-full text-xs font-semibold border border-gray-200 shadow-2xs">
                ${minPriceParam || '0'} - ${maxPriceParam || '∞'}
                <button onClick={() => { setTempMinPrice(''); setTempMaxPrice(''); updateFilters({ min_price: null, max_price: null }); }} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {inStockParam && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-emerald-700 rounded-full text-xs font-semibold border border-gray-200 shadow-2xs">
                In Stock Only
                <button onClick={() => updateFilters({ availability: null })} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {featuredParam && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-amber-700 rounded-full text-xs font-semibold border border-gray-200 shadow-2xs">
                Featured
                <button onClick={() => updateFilters({ featured: null })} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {ratingParam && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-amber-700 rounded-full text-xs font-semibold border border-gray-200 shadow-2xs">
                {ratingParam}+ Stars
                <button onClick={() => updateFilters({ rating: null })} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={handleClearAll}
              className="text-xs font-bold text-rose-600 hover:underline ml-1"
            >
              Reset all
            </button>
          </div>
        )}

        {/* 3. Balanced Multi-Column Responsive Product Grid */}
        <div className="pt-6">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 shadow-xs max-w-md mx-auto">
              <p className="text-rose-600 font-bold mb-1">Failed to load catalog</p>
              <p className="text-xs text-gray-500 mb-4">Please check your network connection and try again.</p>
              <Button onClick={() => window.location.reload()} size="sm">Retry</Button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200/80 p-8 shadow-xs max-w-lg mx-auto">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">No products found</h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto mb-6">
                No items match your active filters. Try adjusting price or clearing criteria.
              </p>
              <Button onClick={handleClearAll} size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-bold">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Product Grid (4 columns on desktop, 3 on tablet, 2 on mobile) */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Minimal Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8 border-t border-gray-200/80">
                  <button
                    onClick={() => updateFilters({ page: (pageParam - 1).toString() })}
                    disabled={pageParam <= 1}
                    className="p-2 rounded-xl text-xs font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      const isCurrent = pageNum === pageParam;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => updateFilters({ page: pageNum.toString() })}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-slate-900 text-white shadow-2xs'
                              : 'text-gray-600 hover:bg-gray-100 bg-white border border-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => updateFilters({ page: (pageParam + 1).toString() })}
                    disabled={pageParam >= totalPages}
                    className="p-2 rounded-xl text-xs font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Minimal Slide-Over Filter Drawer */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setFilterDrawerOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl p-6 overflow-y-auto z-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-slate-900" />
                  <h2 className="text-base font-bold text-gray-900">Filters</h2>
                </div>
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Price Range</h3>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-2 text-gray-400 text-xs font-bold">$</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Min"
                      value={tempMinPrice}
                      onChange={(e) => setTempMinPrice(e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 text-xs text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 font-medium"
                    />
                  </div>
                  <span className="text-gray-400 font-bold">-</span>
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-2 text-gray-400 text-xs font-bold">$</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Max"
                      value={tempMaxPrice}
                      onChange={(e) => setTempMaxPrice(e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 text-xs text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-slate-900 font-medium"
                    />
                  </div>
                </div>

                {/* Quick Price Buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {[
                    { label: 'Under $50', min: '', max: '50' },
                    { label: '$50 - $100', min: '50', max: '100' },
                    { label: '$100 - $300', min: '100', max: '300' },
                    { label: '$300+', min: '300', max: '' },
                  ].map((bracket, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTempMinPrice(bracket.min);
                        setTempMaxPrice(bracket.max);
                      }}
                      className="px-2 py-1 text-[11px] font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                      {bracket.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Availability</h3>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockParam}
                    onChange={(e) => updateFilters({ availability: e.target.checked ? 'in_stock' : null })}
                    className="w-4 h-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-gray-700">In Stock Only</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={featuredParam}
                    onChange={(e) => updateFilters({ featured: e.target.checked ? 'true' : null })}
                    className="w-4 h-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Featured Items
                  </span>
                </label>
              </div>

              {/* Customer Rating */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Customer Rating</h3>
                <div className="space-y-1.5">
                  {[4, 3, 2, 1].map((stars) => {
                    const isSelected = ratingParam === stars.toString();
                    return (
                      <button
                        key={stars}
                        onClick={() => updateFilters({ rating: isSelected ? null : stars.toString() })}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isSelected ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < stars ? 'fill-current' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        <span>{stars}★ & above</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-100 space-y-2">
              <Button
                onClick={handleApplyPrice}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 rounded-xl"
              >
                Apply Filters
              </Button>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="w-full text-center text-xs font-bold text-rose-600 hover:underline py-1"
                >
                  Reset All Filters ({activeFilterCount})
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}