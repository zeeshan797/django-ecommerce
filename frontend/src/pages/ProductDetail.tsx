import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  useProduct, 
  useAddToCart, 
  useProductReviews, 
  useCreateReview, 
  useCart,
  useProducts 
} from '@/api/storeApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { RatingStars } from '@/components/common/RatingStars';
import { ProductCard } from '@/components/common/ProductCard';
import { toast } from 'sonner';
import { getImageUrl } from '@/utils/api';
import { 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  X,
  Sparkles,
  Package,
  Minus,
  Plus,
  Zap,
  Check
} from 'lucide-react';

export default function ProductDetail() {
  const { id: slugOrId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Fetch product using slug or numeric ID
  const { data: product, isLoading, error } = useProduct(slugOrId || '');
  const { data: reviews, error: reviewsError } = useProductReviews(product?.id || 0);
  const { data: cart } = useCart();
  const addToCart = useAddToCart();
  const createReview = useCreateReview();
  
  // Related products query
  const { data: relatedProductsData } = useProducts({ 
    category: product?.category?.slug || undefined,
    page: 1 
  });

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showAddedModal, setShowAddedModal] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [addedDirectly, setAddedDirectly] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] bg-[#FBFBFC] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-500 font-semibold text-xs">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] bg-[#FBFBFC] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <X className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Product Not Found</h2>
          <p className="text-xs text-gray-500 mb-6">
            The item you requested does not exist or has been removed from the catalog.
          </p>
          <Link to="/products">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl">
              Back to Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 
    ? product.images 
    : [{ id: 0, image: '', alt_text: product.name, is_main: true, created_at: '' }];

  const mainImage = images[selectedImage]?.image || '';
  const numPrice = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price || 0);
  const safePrice = isNaN(numPrice) ? 0 : numPrice;
  const numCompare = product.compare_price != null ? (typeof product.compare_price === 'string' ? parseFloat(product.compare_price) : Number(product.compare_price)) : null;
  const discountPercentage = numCompare && numCompare > safePrice
    ? Math.round(((numCompare - safePrice) / numCompare) * 100)
    : 0;

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  // Filter out current product from related items
  const relatedProducts = relatedProductsData?.results?.filter((p) => p.id !== product.id).slice(0, 4) || [];

  const handleAddToCart = async (directCheckout = false) => {
    if (isOutOfStock) return;
    try {
      if (directCheckout) {
        setIsBuyingNow(true);
      }
      await addToCart.mutateAsync({ productId: product.id, quantity });
      if (directCheckout) {
        navigate('/checkout');
      } else {
        setAddedDirectly(true);
        setShowAddedModal(true);
        setTimeout(() => setAddedDirectly(false), 2500);
      }
    } catch (err) {
      toast.error('Failed to add item to cart');
    } finally {
      setIsBuyingNow(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please enter review remarks');
      return;
    }
    try {
      await createReview.mutateAsync({ product: product.id, rating, comment });
      toast.success('Thank you! Your customer review has been posted.');
      setComment('');
      setRating(5);
    } catch (err) {
      toast.error('Failed to post review. Please ensure you are signed in.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] pb-24">
      {/* 1. Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400 overflow-x-auto">
            <Link to="/" className="hover:text-gray-900 transition-colors">Store</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-gray-900 transition-colors">Catalog</Link>
            <span>/</span>
            {product.category && (
              <>
                <Link to={`/products?category=${product.category.slug || product.category.id}`} className="hover:text-gray-900 transition-colors capitalize">
                  {product.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-900 font-bold truncate max-w-[200px] sm:max-w-sm">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        
        {/* 2. Main Product Showcase (Flexbox Split Layout - Side-by-side on md and up) */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 lg:p-10 shadow-xs">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Image Gallery */}
            <div className="w-full md:w-[380px] lg:w-[460px] shrink-0 flex flex-col items-center">
              <div className="relative w-full h-[340px] sm:h-[400px] lg:h-[420px] bg-[#F8F9FA] rounded-2xl border border-gray-200/70 overflow-hidden flex items-center justify-center p-6 group">
                {mainImage ? (
                  <img 
                    src={getImageUrl(mainImage)} 
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <Package className="w-16 h-16 text-gray-300 stroke-1" />
                )}
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  {discountPercentage > 0 && (
                    <span className="bg-rose-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs">
                      Save {discountPercentage}%
                    </span>
                  )}
                  {product.is_featured && (
                    <span className="bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Featured
                    </span>
                  )}
                </div>

                {isOutOfStock && (
                  <span className="absolute top-3 right-3 bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-2xs z-10">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2.5 justify-center mt-4 overflow-x-auto max-w-full pb-1">
                  {images.map((img: any, index: number) => (
                    <button
                      key={img.id || index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden bg-[#F8F9FA] border-2 transition-all p-1.5 flex items-center justify-center cursor-pointer ${
                        selectedImage === index 
                          ? 'border-blue-600 shadow-xs ring-2 ring-blue-600/20' 
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img src={getImageUrl(img.image)} alt="" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Buy Box & Product Info */}
            <div className="flex-1 min-w-0 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                    {product.category?.name || 'Store'}
                  </span>
                  {isOutOfStock ? (
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      In Stock ({product.stock} available)
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2.5">
                  <RatingStars rating={4.8} size="sm" showCount count={reviews?.length || 0} />
                </div>
              </div>

              {/* Price Banner */}
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-50/40 rounded-2xl border border-gray-200/70 flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                  ${safePrice.toFixed(2)}
                </span>
                {numCompare && numCompare > safePrice && (
                  <>
                    <span className="text-base text-gray-400 line-through font-medium">
                      ${numCompare.toFixed(2)}
                    </span>
                    <Badge variant="discount" size="sm">
                      Save ${(numCompare - safePrice).toFixed(2)}
                    </Badge>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                {product.description}
              </p>

              {/* Purchase Actions (Refined Studio Layout) */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                {/* Quantity Selector Bar */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Quantity
                  </span>
                  
                  <div className="flex items-center bg-gray-100 border border-gray-200/90 rounded-xl p-1 gap-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-xs transition-all disabled:opacity-30 cursor-pointer"
                      disabled={quantity <= 1 || isOutOfStock}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-gray-900 text-sm select-none">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-xs transition-all disabled:opacity-30 cursor-pointer"
                      disabled={quantity >= product.stock || isOutOfStock}
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Primary & Secondary Action Buttons (Side-by-Side Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(false)}
                    disabled={isOutOfStock || addToCart.isPending}
                    className="h-12 w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-xs hover:shadow-md hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addedDirectly ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300 stroke-[2.5]" />
                        <span>Added to Cart!</span>
                      </>
                    ) : addToCart.isPending && !isBuyingNow ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  {/* Buy Now Button */}
                  <button
                    onClick={() => handleAddToCart(true)}
                    disabled={isOutOfStock || addToCart.isPending}
                    className="h-12 w-full bg-slate-900 hover:bg-black active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBuyingNow ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span>Buy Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Minimal Trust Signals */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 text-[11px] text-gray-600">
                <div className="flex items-center gap-1.5 p-2.5 bg-gray-50/70 rounded-xl border border-gray-100">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold text-gray-800 truncate">Free Delivery</span>
                </div>
                <div className="flex items-center gap-1.5 p-2.5 bg-gray-50/70 rounded-xl border border-gray-100">
                  <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold text-gray-800 truncate">30-Day Returns</span>
                </div>
                <div className="flex items-center gap-1.5 p-2.5 bg-gray-50/70 rounded-xl border border-gray-100">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold text-gray-800 truncate">2-Yr Warranty</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 3. Tabbed Specifications & Customer Reviews */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-8">
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-6 sm:gap-8">
              {[
                { id: 'description', label: 'Technical Details' },
                { id: 'reviews', label: `Customer Reviews (${reviews?.length || 0})` },
                { id: 'shipping', label: 'Delivery & Returns' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3.5 text-xs sm:text-sm font-bold transition-all relative ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div>
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Specifications</h3>
                  <p className="leading-relaxed text-xs sm:text-sm text-gray-600">{product.description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-xs">
                  <div className="p-3 bg-[#F8F9FA] rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-medium">Category</span>
                    <p className="font-bold text-gray-900 mt-0.5">{product.category?.name}</p>
                  </div>
                  <div className="p-3 bg-[#F8F9FA] rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-medium">Model ID / SKU</span>
                    <p className="font-bold text-gray-900 mt-0.5 font-mono">#PRD-{product.id}</p>
                  </div>
                  <div className="p-3 bg-[#F8F9FA] rounded-xl border border-gray-100">
                    <span className="text-gray-400 font-medium">Availability</span>
                    <p className="font-bold text-emerald-700 mt-0.5">{product.stock} units in stock</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Form */}
                <form onSubmit={handleSubmitReview} className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-5 sm:p-6 space-y-4 max-w-2xl">
                  <h3 className="font-bold text-gray-900 text-sm">Write a Customer Review</h3>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-700">Rating:</span>
                    <RatingStars rating={rating} interactive onRatingChange={setRating} />
                  </div>

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe product quality, design, and performance..."
                    className="w-full px-4 py-3 text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-blue-600 resize-none font-medium"
                    rows={3}
                  />

                  <Button type="submit" loading={createReview.isPending} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl">
                    Submit Review
                  </Button>
                </form>

                {/* Reviews List */}
                <div className="space-y-3 max-w-3xl">
                  {reviewsError || !reviews || reviews.length === 0 ? (
                    <div className="p-6 text-center bg-gray-50/50 rounded-2xl border border-gray-100">
                      <p className="text-xs text-gray-500">No reviews yet for this product. Be the first to share your thoughts!</p>
                    </div>
                  ) : (
                    reviews.map((rev: any) => (
                      <div key={rev.id} className="p-4 rounded-xl border border-gray-200/70 bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-xs">
                              {rev.user?.first_name || rev.user?.username || 'Verified Buyer'}
                            </span>
                            <Badge variant="success" size="sm">
                              Verified
                            </Badge>
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {new Date(rev.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <RatingStars rating={rev.rating || 5} size="sm" />
                        <p className="text-xs text-gray-700 leading-relaxed font-normal">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
                <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200/60 space-y-1">
                  <h4 className="font-bold text-gray-900 text-sm">Express Shipping</h4>
                  <p className="leading-relaxed">
                    Same-day processing for orders placed before 2:00 PM EST. Free express courier on orders over $75.
                  </p>
                </div>
                <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200/60 space-y-1">
                  <h4 className="font-bold text-gray-900 text-sm">30-Day Money Back Guarantee</h4>
                  <p className="leading-relaxed">
                    Enjoy full satisfaction or return your item in its original box within 30 days for an instant refund.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Related Products Row */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-0.5">
                  Related Gear
                </span>
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  You Might Also Like
                </h3>
              </div>
              <Link 
                to={`/products?category=${product.category?.slug || product.category?.id}`} 
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                View Category <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Add-To-Cart Action Modal */}
      <Modal
        isOpen={showAddedModal}
        onClose={() => setShowAddedModal(false)}
        title={
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm sm:text-base">
            <CheckCircle2 className="w-4 h-4" />
            <span>Added to Shopping Bag</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-3.5 p-3 bg-gray-50 rounded-xl border border-gray-200/80">
            <div className="w-14 h-14 rounded-lg bg-white border border-gray-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
              {mainImage ? (
                <img src={getImageUrl(mainImage)} alt="" className="max-h-full max-w-full object-contain mix-blend-multiply" />
              ) : (
                <Package className="w-5 h-5 text-gray-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate">{product.name}</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Qty: <span className="font-bold text-gray-900">{quantity}</span></p>
              <p className="text-xs font-extrabold text-blue-600 mt-0.5">${(safePrice * quantity).toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Link to="/checkout" onClick={() => setShowAddedModal(false)} className="block">
              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 gap-2 text-xs rounded-xl shadow-xs">
                Proceed to Checkout
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link to="/cart" onClick={() => setShowAddedModal(false)} className="block">
              <Button size="sm" variant="outline" className="w-full border-gray-300 text-gray-900 font-bold h-10 text-xs rounded-xl">
                View Shopping Bag ({cart?.total_items || quantity})
              </Button>
            </Link>
            <button
              onClick={() => setShowAddedModal(false)}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-900 font-semibold py-1 transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}