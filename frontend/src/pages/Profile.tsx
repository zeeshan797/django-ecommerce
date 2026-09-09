import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrders } from '@/api/storeApi';
import { useAuthStore } from '@/stores/authStore';
import { useUpdateProfile, useLogout, useAddresses, useCreateAddress, useDeleteAddress } from '@/api/authApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  User, 
  MapPin, 
  Package, 
  LogOut, 
  Mail, 
  Phone, 
  Plus,
  Trash2,
  ChevronRight,
  Calendar
} from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const deleteAddress = useDeleteAddress();
  const { user } = useAuthStore();
  const updateProfile = useUpdateProfile();
  const logoutMutation = useLogout();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);

  const [newAddress, setNewAddress] = useState({
    full_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
    phone: user?.profile?.phone_number || '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    is_default: false,
    address_type: 'shipping' as const,
  });
   
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.profile?.phone_number || '',
  });

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate('/login'),
    });
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAddress.mutate(newAddress, {
      onSuccess: () => {
        setShowAddAddress(false);
        setNewAddress({
          full_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
          phone: '',
          address_line_1: '',
          address_line_2: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'United States',
          is_default: false,
          address_type: 'shipping',
        });
      },
      onError: () => toast.error('Failed to save address'),
    });
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      profile: {
        phone_number: formData.phone,
        address: user?.profile?.address || '',
        city: user?.profile?.city || '',
        state: user?.profile?.state || '',
        postal_code: user?.profile?.postal_code || '',
        country: user?.profile?.country || '',
        date_of_birth: user?.profile?.date_of_birth || null,
        profile_picture: user?.profile?.profile_picture || null,
      },
    }, {
      onSuccess: () => setIsEditing(false),
      onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update profile'),
    });
  };

  const profileTab = (
    <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
        <Button 
          onClick={() => setIsEditing(!isEditing)} 
          variant={isEditing ? 'outline' : 'default'}
          size="sm"
          className="font-bold"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">First Name</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm font-medium transition-colors disabled:bg-gray-100 disabled:text-gray-700 disabled:border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Last Name</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm font-medium transition-colors disabled:bg-gray-100 disabled:text-gray-700 disabled:border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!isEditing}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm font-medium transition-colors disabled:bg-gray-100 disabled:text-gray-700 disabled:border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              disabled={!isEditing}
              placeholder="Add phone number"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm font-medium transition-colors placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-700 disabled:border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={updateProfile.isPending} className="bg-blue-600 hover:bg-blue-700 font-bold">
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="font-bold">
              Cancel
            </Button>
          </div>
        )}
      </form>
    </div>
  );

  const addressesTab = (
    <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
          <p className="text-sm text-gray-500">Manage your shipping and billing addresses</p>
        </div>
        <Button 
          onClick={() => setShowAddAddress(!showAddAddress)}
          className="bg-blue-600 hover:bg-blue-700 font-bold"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Address
        </Button>
      </div>

      {showAddAddress && (
        <form onSubmit={handleAddressSubmit} className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
          <h3 className="font-bold text-gray-900">New Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newAddress.full_name}
                onChange={(e) => setNewAddress(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                required
                value={newAddress.phone}
                onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Address Line 1</label>
            <input
              type="text"
              required
              value={newAddress.address_line_1}
              onChange={(e) => setNewAddress(prev => ({ ...prev, address_line_1: e.target.value }))}
              placeholder="Street address or P.O. Box"
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Address Line 2 (Optional)</label>
            <input
              type="text"
              value={newAddress.address_line_2}
              onChange={(e) => setNewAddress(prev => ({ ...prev, address_line_2: e.target.value }))}
              placeholder="Apartment, suite, unit, building, floor, etc."
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
              <input
                type="text"
                required
                value={newAddress.city}
                onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">State</label>
              <input
                type="text"
                required
                value={newAddress.state}
                onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">ZIP / Postal Code</label>
              <input
                type="text"
                required
                value={newAddress.postal_code}
                onChange={(e) => setNewAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_default"
              checked={newAddress.is_default}
              onChange={(e) => setNewAddress(prev => ({ ...prev, is_default: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_default" className="text-xs font-medium text-gray-700">Set as default shipping address</label>
          </div>
          <div className="flex gap-3 pt-3">
            <Button type="submit" disabled={createAddress.isPending} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold">
              {createAddress.isPending ? 'Saving...' : 'Save Address'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowAddAddress(false)} className="text-gray-700 font-bold">
              Cancel
            </Button>
          </div>
        </form>
      )}

      {addressesLoading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : (!addresses || addresses.length === 0) ? (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <p className="font-semibold text-gray-900 mb-1">No saved addresses</p>
          <p className="text-sm text-gray-500 mb-4">Add your shipping addresses for fast and easy checkout.</p>
          <Button onClick={() => setShowAddAddress(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
            Add Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="p-5 border border-gray-200 rounded-xl relative hover:border-blue-400 transition-colors bg-white shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900">{addr.full_name}</span>
                {addr.is_default && (
                  <Badge variant="default" className="text-[10px]">Default</Badge>
                )}
              </div>
              <p className="text-sm text-gray-700">{addr.address_line_1}</p>
              {addr.address_line_2 && <p className="text-sm text-gray-700">{addr.address_line_2}</p>}
              <p className="text-sm text-gray-700">{addr.city}, {addr.state} {addr.postal_code}</p>
              <p className="text-xs text-gray-500 mt-2">{addr.phone}</p>
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => deleteAddress.mutate(addr.id)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ordersTab = (
    <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Package className="w-5 h-5 text-blue-600" />
        My Orders
      </h2>

      {ordersLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
          <Link to="/products">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors bg-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold text-gray-900">Order #{order.id}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
                <Badge variant={
                  order.order_status === 'pending' ? 'warning' :
                  order.order_status === 'processing' ? 'default' :
                  order.order_status === 'shipped' ? 'secondary' :
                  order.order_status === 'delivered' ? 'success' :
                  'outline'
                }>
                  {order.order_status?.charAt(0).toUpperCase() + order.order_status?.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {order.items?.slice(0, 3).map((item: any) => (
                    <div
                      key={item.id}
                      className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
                    >
                      <img
                        src={item.product?.images?.[0]?.image || '/placeholder.jpg'}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <span className="text-xs text-gray-500 font-semibold">+{order.items.length - 3} more</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">
                    ${parseFloat(order.total_amount).toFixed(2)}
                  </span>
                  <Link to={`/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="font-bold text-xs">
                      View Details
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Account</h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs sticky top-4">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-extrabold text-blue-600">
                    {user?.first_name?.[0] || 'U'}{user?.last_name?.[0] || ''}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'addresses' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  Saved Addresses
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'orders' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  My Orders
                </button>
                <Separator className="my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && profileTab}
            {activeTab === 'addresses' && addressesTab}
            {activeTab === 'orders' && ordersTab}
          </div>
        </div>
      </div>
    </div>
  );
}