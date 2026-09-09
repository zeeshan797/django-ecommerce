import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useCreateOrder, useProcessCOD } from '@/api/storeApi';
import { useAuthStore } from '@/stores/authStore';
import { useAddresses, type Address } from '@/api/authApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { toast } from 'sonner';
import { getImageUrl } from '@/utils/api';
import { 
  CheckCircle2, 
  CreditCard, 
  Truck, 
  Package, 
  ArrowRight, 
  ChevronLeft,
  Banknote,
  Lock
} from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading } = useCart();
  const { data: addresses } = useAddresses();
  const { user } = useAuthStore();
  const createOrder = useCreateOrder();
  const processCOD = useProcessCOD();

  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.profile?.phone_number || '',
    address_line_1: user?.profile?.address || '',
    address_line_2: '',
    city: user?.profile?.city || '',
    state: user?.profile?.state || '',
    postal_code: user?.profile?.postal_code || '',
    country: user?.profile?.country || 'United States',
    order_notes: '',
  });

  useEffect(() => {
    if (addresses && addresses.length > 0 && selectedAddressId === null) {
      const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
      applyAddress(defaultAddr);
    }
  }, [addresses]);

  const applyAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    const names = addr.full_name.split(' ');
    setFormData(prev => ({
      ...prev,
      first_name: names[0] || prev.first_name,
      last_name: names.slice(1).join(' ') || prev.last_name,
      phone: addr.phone || prev.phone,
      address_line_1: addr.address_line_1,
      address_line_2: addr.address_line_2 || '',
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] bg-gray-50/40 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-xs sm:text-sm font-semibold text-gray-600">Preparing checkout session...</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-[75vh] bg-gray-50/40 flex items-center justify-center px-4 py-16">
        <EmptyState
          icon={Package}
          title="No items to checkout"
          description="Your shopping bag is currently empty. Please add items before checking out."
          actionLabel="Browse Products"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  const cartSubtotal = typeof cart.total_price === 'string' ? parseFloat(cart.total_price) : Number(cart.total_price || 0);
  const shippingCost = shippingMethod === 'express' ? 15.00 : (cartSubtotal >= 75 ? 0 : 5.00);
  const total = cartSubtotal + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.address_line_1 || !formData.city || !formData.postal_code) {
      toast.error('Please complete all required shipping fields');
      return;
    }
    setStep('payment');
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('review');
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const orderData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        address_line_1: formData.address_line_1,
        address_line_2: formData.address_line_2,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country,
        order_notes: formData.order_notes,
      };
      
      const order = await createOrder.mutateAsync(orderData);
      
      // Process COD payment
      await processCOD.mutateAsync(order.data.id);
      
      toast.success(`Order #${order.data.id} confirmed successfully!`);
      navigate(`/orders/${order.data.id}`);
    } catch (err) {
      toast.error('Failed to place order. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { id: 'shipping', label: '1. Shipping Address' },
    { id: 'payment', label: '2. Payment Method' },
    { id: 'review', label: '3. Review & Order' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/40 pb-20">
      {/* Top Banner */}
      <div className="bg-white border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Express Checkout
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit SSL Encrypted & Secured</span>
              </p>
            </div>

            {/* Stepper Header */}
            <div className="flex items-center gap-2">
              {stepsList.map((s, idx) => {
                const isCurrent = step === s.id;
                const isDone = (step === 'payment' && idx === 0) || (step === 'review' && idx < 2);

                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{s.label}</span>
                    </div>
                    {idx < stepsList.length - 1 && (
                      <span className="text-gray-300 font-bold">/</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form Flow Area */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* STEP 1: Shipping Address Form */}
            {step === 'shipping' && (
              <form onSubmit={handleSubmitShipping} className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">Shipping Destination</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Where should we deliver your items?</p>
                </div>

                {/* Saved Address Quick Selector Cards */}
                {addresses && addresses.length > 0 && (
                  <div className="space-y-2.5 pb-4 border-b border-gray-100">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                      Choose from Saved Addresses:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {addresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => applyAddress(addr)}
                            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-gray-900">{addr.full_name}</span>
                              {addr.is_default && <Badge variant="secondary" size="sm">Default</Badge>}
                            </div>
                            <p className="text-xs text-gray-600 leading-snug truncate">{addr.address_line_1}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{addr.city}, {addr.state} {addr.postal_code}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <label className="font-bold text-gray-800 block mb-1">First Name *</label>
                    <input
                      type="text"
                      name="first_name"
                      required
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-800 block mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="last_name"
                      required
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-800 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-800 block mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-gray-800 block mb-1">Street Address *</label>
                    <input
                      type="text"
                      name="address_line_1"
                      required
                      placeholder="Street name, house number, apartment"
                      value={formData.address_line_1}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-800 block mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-800 block mb-1">State / Province *</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-800 block mb-1">Postal Code *</label>
                    <input
                      type="text"
                      name="postal_code"
                      required
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-800 block mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-medium"
                    />
                  </div>
                </div>

                {/* Shipping Speed Radio Cards */}
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Shipping Method
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setShippingMethod('standard')}
                      className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                        shippingMethod === 'standard'
                          ? 'border-blue-600 bg-blue-50/50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="text-xs font-bold text-gray-900">Standard Delivery</div>
                          <div className="text-[11px] text-gray-500">3-5 Business Days</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700">{cartSubtotal >= 75 ? 'FREE' : '$5.00'}</span>
                    </div>

                    <div
                      onClick={() => setShippingMethod('express')}
                      className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                        shippingMethod === 'express'
                          ? 'border-blue-600 bg-blue-50/50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-indigo-600" />
                        <div>
                          <div className="text-xs font-bold text-gray-900">Express Courier</div>
                          <div className="text-[11px] text-gray-500">1-2 Business Days</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gray-900">$15.00</span>
                    </div>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm h-12 rounded-xl">
                  Continue to Payment
                </Button>
              </form>
            )}

            {/* STEP 2: Payment Method */}
            {step === 'payment' && (
              <form onSubmit={handleSubmitPayment} className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">Payment Selection</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Select your preferred payment method</p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border-2 border-blue-600 bg-blue-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Banknote className="w-6 h-6 text-emerald-600" />
                      <div>
                        <span className="text-sm font-bold text-gray-900 block">Cash On Delivery (COD)</span>
                        <span className="text-xs text-gray-500">Pay cash directly when order arrives at your door</span>
                      </div>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 opacity-60 flex items-center justify-between cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-gray-400" />
                      <div>
                        <span className="text-sm font-bold text-gray-700 block">Credit / Debit Card (Stripe Gateway)</span>
                        <span className="text-xs text-gray-400">Available on live production deployments</span>
                      </div>
                    </div>
                    <Badge variant="secondary">Upcoming</Badge>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep('shipping')} className="font-bold text-xs">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button type="submit" size="lg" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm h-12 rounded-xl">
                    Review Order
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 3: Order Review & Final Confirmation */}
            {step === 'review' && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">Final Order Confirmation</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Please review your delivery details and order summary before placing</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50/80 rounded-2xl border border-gray-100 text-xs">
                  <div>
                    <span className="font-bold text-gray-900 uppercase tracking-wider block mb-1 text-[11px] text-blue-600">
                      Deliver To:
                    </span>
                    <p className="font-bold text-gray-900">{formData.first_name} {formData.last_name}</p>
                    <p className="text-gray-600 mt-0.5">{formData.address_line_1}</p>
                    <p className="text-gray-600">{formData.city}, {formData.state} {formData.postal_code}</p>
                    <p className="text-gray-500 mt-1">{formData.phone}</p>
                  </div>

                  <div>
                    <span className="font-bold text-gray-900 uppercase tracking-wider block mb-1 text-[11px] text-blue-600">
                      Payment & Shipping:
                    </span>
                    <p className="font-bold text-gray-900">Cash On Delivery (COD)</p>
                    <p className="text-gray-600 mt-0.5">
                      {shippingMethod === 'express' ? 'Express Courier (1-2 Days)' : 'Standard Delivery (3-5 Days)'}
                    </p>
                    <span className="inline-block mt-2 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                      Verified Address
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep('payment')} className="font-bold text-xs">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button 
                    onClick={handlePlaceOrder}
                    loading={isSubmitting}
                    size="lg" 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm h-12 rounded-xl shadow-md gap-2"
                  >
                    Confirm & Place Order (${total.toFixed(2)})
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100">
                Summary ({cart.items.length} items)
              </h3>

              {/* Mini Item List */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {cart.items.map((item: any) => {
                  const img = item.product?.images?.[0]?.image || item.product?.image || '';
                  const price = parseFloat(item.unit_price || item.product?.price || '0');
                  const name = item.product?.name || item.product_name || 'Product';

                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        {img ? (
                          <img src={getImageUrl(img)} alt="" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <Package className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{name}</p>
                        <p className="text-[11px] text-gray-500">Qty: {item.quantity} × ${price.toFixed(2)}</p>
                      </div>
                      <span className="text-xs font-bold text-gray-900">
                        ${(price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Calculation */}
              <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-gray-900">${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Cost</span>
                  <span className="font-bold text-emerald-600">{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-gray-900">Total Due</span>
                <span className="text-2xl font-extrabold text-blue-600 tracking-tight">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}