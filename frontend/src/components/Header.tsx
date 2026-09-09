import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  ShoppingBag, 
  Package, 
  ShieldCheck, 
  Search,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/api/authApi';
import { useCart, useCategories } from '@/api/storeApi';
import { AnimatePresence, motion } from 'framer-motion';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { mutate: logout } = useLogout();
  const { data: cart } = useCart();
  const { data: categories } = useCategories();

  const cartItemCount = cart?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) ?? 0;

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        navigate('/');
      },
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(headerSearch.trim())}`);
      setHeaderSearch('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/90 backdrop-blur-md shadow-2xs">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-700 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-xs group-hover:scale-105 transition-transform duration-200">
              ⚡
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-blue-700 bg-clip-text text-transparent">
              ShopVibe
            </span>
          </Link>
          
          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-semibold text-gray-600">
            <Link to="/products" className="hover:text-blue-600 transition-colors">
              All Products
            </Link>
            {categories?.slice(0, 4).map((cat) => (
              <Link 
                key={cat.id} 
                to={`/products?category=${cat.slug || cat.id}`}
                className="hover:text-blue-600 transition-colors capitalize"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm mx-6">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tech, gear, styles..."
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
            />
          </form>
        </div>

        {/* Right: Actions (Cart & Auth) */}
        <div className="flex items-center gap-3">
          {/* Cart Icon & Live Bubble */}
          <Link 
            to="/cart" 
            className="relative p-2.5 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-xl transition-all" 
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 stroke-[2]" />
            {cartItemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white font-extrabold shadow-sm ring-2 ring-white">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </Link>

          {/* User Menu / Auth Buttons */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                  <Avatar className="h-8 w-8 rounded-lg border border-gray-200">
                    <AvatarImage src={user?.profile?.profile_picture || ''} alt={user?.username || 'User'} />
                    <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                      {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-xs font-bold text-gray-800 max-w-24 truncate">
                    {user?.first_name || user?.username}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 rounded-2xl shadow-xl border border-gray-100 p-2" align="end" forceMount>
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl mb-2">
                  <Avatar className="h-9 w-9 rounded-lg">
                    <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                      {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {user?.is_staff && (
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2">
                    <Link to="/admin" className="flex items-center text-xs font-semibold text-blue-700">
                      <ShieldCheck className="mr-2 h-4 w-4 text-blue-600" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2">
                  <Link to="/profile" className="flex items-center text-xs font-semibold text-gray-700">
                    <User className="mr-2 h-4 w-4 text-gray-500" />
                    My Account & Addresses
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2">
                  <Link to="/orders" className="flex items-center text-xs font-semibold text-gray-700">
                    <Package className="mr-2 h-4 w-4 text-gray-500" />
                    Order History
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-xl text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer py-2 text-xs font-bold"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="font-bold text-xs text-gray-700">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Slide-Down Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg overflow-hidden"
          >
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
              />
            </form>

            <div className="space-y-1">
              <Link 
                to="/products" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-600"
              >
                <span>All Products</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              {categories?.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug || cat.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  <span className="capitalize">{cat.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </Link>
              ))}
            </div>

            {!isAuthenticated && (
              <div className="pt-3 border-t border-gray-100 flex gap-2">
                <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-xs font-bold">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-blue-600 text-white text-xs font-bold">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}