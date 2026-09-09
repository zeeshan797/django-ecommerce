import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart, useValidateCoupon } from '@/api/storeApi';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { toast } from 'sonner';
import { getImageUrl } from '@/utils/api';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  Tag, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Package
} from 'lucide-react';

export default function CartPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading, error } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const validateCoupon = useValidateCoupon();
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] bg-gray-50/40 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-xs sm:text-sm font-semibold text-gray-600">Loading your shopping bag...</p>
        </div>
      </div>
    );
  }

  if (error || !cart) {
    return (
      <div className="min-h-[70vh] bg-gray-50/40 flex items-center justify-center px-4">
        <EmptyState
          title="Failed to load your cart"
          description="We had trouble retrieving your shopping bag items. Please try refreshing the page."
          actionLabel="Retry Loading"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem.mutateAsync({ itemId, quantity: newQuantity });
    } catch (err) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeCartItem.mutateAsync(itemId);
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to remove all items from your cart?')) return;
    try {
      await clearCart.mutateAsync();
      toast.success('Cart cleared');
    } catch (err) {
      toast.error('Failed to clear cart');
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      const response = await validateCoupon.mutateAsync({ 
        code: couponCode.trim().toUpperCase(), 
        order_amount: cart.total_price 
      });
      if (response.data.valid) {
        setAppliedCoupon(response.data);
        toast.success(`Coupon applied! You saved $${response.data.discount_amount}!`);
      } else {
        toast.error(response.data.error || 'Invalid coupon code');
      }
    } catch (err) {
      toast.error('Failed to validate coupon');
    }
  };

  const cartSubtotal = typeof cart.total_price === 'string' ? parseFloat(cart.total_price) : Number(cart.total_price || 0);
  const discount = typeof appliedCoupon?.discount_amount === 'string' ? parseFloat(appliedCoupon.discount_amount) : Number(appliedCoupon?.discount_amount || 0);
  const finalTotal = Math.max(0, cartSubtotal - discount);

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-[75vh] bg-gray-50/40 flex items-center justify-center px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your shopping bag is empty"
          description="Explore our curated collection of next-gen electronics, ergonomic gear, and premium accessories."
          actionLabel="Explore Catalog"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/40 pb-20">
      {/* Top Header Banner */}
      <div className="bg-white border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Shopping Bag
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                <span className="font-bold text-gray-900">{cart.total_items || cart.items.length}</span> {cart.items.length === 1 ? 'item' : 'items'} ready for checkout
              </p>
            </div>

            <button
              onClick={handleClearCart}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Bag
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs divide-y divide-gray-100 overflow-hidden">
              {cart.items.map((item: any) => {
                const itemImg = item.product?.images?.[0]?.image || item.product?.image || '';
                const unitPrice = parseFloat(item.unit_price || item.product?.price || '0');
                const itemTotal = parseFloat(item.total_price || (unitPrice * item.quantity).toString());
                const itemName = item.product?.name || item.product_name || 'Product';
                const maxStock = item.product?.stock ?? 99;

                return (
                  <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-5 items-center">
                    {/* Thumbnail */}
                    <Link
                      to={`/products/${item.product?.slug || item.product?.id || item.product_id}`}
                      className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-200/80 p-2 flex items-center justify-center shrink-0 overflow-hidden"
                    >
                      {itemImg ? (
                        <img 
                          src={getImageUrl(itemImg)} 
                          alt={itemName}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-300 stroke-1" />
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0 w-full space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link 
                            to={`/products/${item.product?.slug || item.product?.id || item.product_id}`} 
                            className="text-sm sm:text-base font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
                          >
                            {itemName}
                          </Link>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Unit Price: <span className="font-semibold text-gray-800">${isNaN(unitPrice) ? '0.00' : unitPrice.toFixed(2)}</span>
                          </p>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove from cart"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updateCartItem.isPending}
                            className="px-3 py-1 text-gray-700 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 font-bold text-xs sm:text-sm transition-colors"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-3.5 py-1 border-x border-gray-300 min-w-[40px] text-center font-bold text-gray-900 bg-white text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= maxStock || updateCartItem.isPending}
                            className="px-3 py-1 text-gray-700 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 font-bold text-xs sm:text-sm transition-colors"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-right">
                          <span className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">
                            ${isNaN(itemTotal) ? '0.00' : itemTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Shopping Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 flex items-center gap-3">
                <Truck className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-gray-900 block">Free Shipping</span>
                  <span className="text-gray-500">Orders above $75</span>
                </div>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-gray-900 block">30-Day Returns</span>
                  <span className="text-gray-500">Prepaid return labels</span>
                </div>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-gray-200/80 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-gray-900 block">Secure Checkout</span>
                  <span className="text-gray-500">256-Bit SSL Encrypted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Summary Sidebar */}
          <div className="lg:col-span-4 space-y-5">
            {/* Promo Code Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Promo / Coupon Code
                </h3>
              </div>

              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs uppercase font-bold text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  loading={validateCoupon.isPending}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 rounded-xl"
                >
                  Apply
                </Button>
              </form>

              {appliedCoupon && (
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 font-bold">
                  <span>Coupon: {appliedCoupon.code || 'Applied'}</span>
                  <span className="text-emerald-700">-${discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Order Cost Breakdown Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Bag Subtotal</span>
                  <span className="font-bold text-gray-900">${cartSubtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Estimated Shipping</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Estimated Tax</span>
                  <span className="font-bold text-gray-900">$0.00</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-gray-900">Total Due</span>
                <span className="text-2xl font-extrabold text-blue-600 tracking-tight">
                  ${finalTotal.toFixed(2)}
                </span>
              </div>

              <Link to="/checkout" className="block pt-2">
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm gap-2 rounded-xl shadow-md">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link to="/products" className="block text-center text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors pt-1">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}