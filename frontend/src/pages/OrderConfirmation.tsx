import { useParams, Link } from 'react-router-dom';
import { useOrder } from '@/api/storeApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  Package,
  ArrowRight,
  Clock,
  MapPin,
  Receipt
} from 'lucide-react';

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id || '0', 10);
  const { data: order, isLoading, error } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-sm font-semibold text-gray-600">Confirming your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-gray-200 shadow-xs">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">The order you're looking for doesn't exist or has been removed.</p>
          <Link to="/orders">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
              View All Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: ShieldCheck },
  ];

  const currentStatusIndex = statusSteps.findIndex(s => s.key === order.order_status?.toLowerCase());

  const statusColors = {
    pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    processing: 'bg-blue-50 text-blue-700 border border-blue-200',
    shipped: 'bg-purple-50 text-purple-700 border border-purple-200',
    delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    cancelled: 'bg-gray-50 text-gray-700 border border-gray-200',
  };

  const paymentStatusColors = {
    paid: 'bg-emerald-50 text-emerald-700',
    pending: 'bg-yellow-50 text-yellow-700',
    failed: 'bg-rose-50 text-rose-700',
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-10 shadow-xs text-center mb-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            Order Confirmed!
          </h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Thank you for your purchase. We've received your order and are preparing it for shipment.
          </p>
          <div className="inline-flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 mt-6">
            <Receipt className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-bold text-gray-900">Order #{order.id}</span>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Order Status</h2>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStatusIndex;
              return (
                <div key={step.key} className="flex flex-col items-center relative flex-1">
                  {index > 0 && (
                    <div className={`absolute top-5 -left-1/2 w-full h-1 ${
                      isActive ? 'bg-emerald-500' : 'bg-gray-200'
                    }`} />
                  )}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg z-10 transition-all ${
                    isActive ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className={`text-xs font-bold mt-3 ${
                    isActive ? 'text-emerald-700' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Details Card */}
          <Card className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Order Details</h2>
                <p className="text-xs text-gray-500">Transaction summary</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order Date</span>
                <span className="font-semibold text-gray-900">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order Status</span>
                <Badge variant="outline" className={statusColors[order.order_status?.toLowerCase() as keyof typeof statusColors] || statusColors.pending}>
                  {order.order_status?.charAt(0).toUpperCase() + order.order_status?.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Status</span>
                <Badge variant="outline" className={paymentStatusColors[order.payment_status as keyof typeof paymentStatusColors] || paymentStatusColors.pending}>
                  {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-semibold text-gray-900">
                  {order.payment_method?.toUpperCase() === 'COD' ? 'Cash on Delivery' : order.payment_method}
                </span>
              </div>
            </div>
          </Card>

          {/* Shipping Address Card */}
          <Card className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
                <p className="text-xs text-gray-500">Delivery destination</p>
              </div>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-bold text-gray-900">{order.first_name} {order.last_name}</p>
              <p>{order.address_line_1}</p>
              {order.address_line_2 && <p>{order.address_line_2}</p>}
              <p>{order.city}, {order.state} {order.postal_code}</p>
              <p>{order.country}</p>
              <p className="mt-2">{order.email}</p>
              <p>{order.phone}</p>
            </div>
          </Card>

          {/* Order Items Card */}
          <Card className="p-6 sm:p-8 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Items Ordered</h2>
                <p className="text-xs text-gray-500">{order.items?.length} item(s)</p>
              </div>
            </div>

            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                    <img
                      src={item.product?.images?.[0]?.image || '/placeholder.jpg'}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{item.product_name}</p>
                    <p className="text-xs text-gray-500">SKU: {item.product_sku}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                      <span className="text-xs text-gray-400">${parseFloat(item.unit_price).toFixed(2)} each</span>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">${parseFloat(item.total_price).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-6 mt-6 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">
                  ${(parseFloat(order.total_amount) - parseFloat(order.shipping_amount) - parseFloat(order.tax_amount) - parseFloat(order.discount_amount)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">
                  {parseFloat(order.shipping_amount) === 0 ? 'FREE' : `$${parseFloat(order.shipping_amount).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax</span>
                <span className="font-semibold text-gray-900">${parseFloat(order.tax_amount).toFixed(2)}</span>
              </div>
              {parseFloat(order.discount_amount) > 0 && (
                <>
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount</span>
                    <span>-${parseFloat(order.discount_amount).toFixed(2)}</span>
                  </div>
                  <Separator />
                </>
              )}
              <div className="flex justify-between items-baseline pt-4 border-t border-gray-200">
                <span className="text-base font-bold text-gray-900">Total Paid</span>
                <span className="text-2xl font-extrabold text-blue-600 tracking-tight">
                  ${parseFloat(order.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link to="/orders">
            <Button variant="outline" className="w-full sm:w-auto font-bold">
              View All Orders
            </Button>
          </Link>
          <Link to="/products">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-bold">
              Continue Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Trust Signals */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200/80 p-4">
            <Truck className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-900">Free Shipping</p>
              <p className="text-[11px] text-gray-500">On orders above $75</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200/80 p-4">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-900">Secure Checkout</p>
              <p className="text-[11px] text-gray-500">256-Bit SSL Encrypted</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200/80 p-4">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-900">30-Day Returns</p>
              <p className="text-[11px] text-gray-500">Hassle-free refunds</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
