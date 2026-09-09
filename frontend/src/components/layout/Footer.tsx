import { Link } from 'react-router-dom';
import { 
  Zap, 
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Truck,
  RefreshCw,
  HeadphonesIcon
} from 'lucide-react';

// Social icon SVGs (lucide-react doesn't export social brand icons)
const SvgFacebook = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);
const SvgTwitter = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
const SvgInstagram = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
);
const SvgYoutube = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-400">
      {/* Top value props strip */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck,           label: 'Free Shipping',   sub: 'On orders over $50' },
              { icon: RefreshCw,       label: '30-Day Returns',  sub: 'Hassle-free returns' },
              { icon: ShieldCheck,     label: 'Secure Payments', sub: '256-bit SSL encryption' },
              { icon: HeadphonesIcon,  label: '24/7 Support',    sub: 'Always here to help' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600/20 transition-colors">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-gray-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">ShopVibe</span>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Your premium destination for curated products — from tech & electronics to fashion & home living. Quality guaranteed, always.
            </p>

            <div className="space-y-2 text-sm">
              <a href="mailto:hello@shopvibe.com" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-blue-400" /> hello@shopvibe.com
              </a>
              <a href="tel:+18005678900" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-blue-400" /> +1 800 567 8900
              </a>
              <span className="flex items-center gap-2 text-gray-500">
                <MapPin className="w-4 h-4 text-blue-400" /> 42 Commerce Blvd, San Francisco, CA
              </span>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              {[
                { href: '#', label: 'Facebook',  Icon: SvgFacebook },
                { href: '#', label: 'Twitter',   Icon: SvgTwitter },
                { href: '#', label: 'Instagram', Icon: SvgInstagram },
                { href: '#', label: 'YouTube',   Icon: SvgYoutube },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-200"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-bold text-sm mb-5 tracking-wide uppercase">Shop</h3>
            <ul className="space-y-3 text-sm">
              {[
                { to: '/products',                 label: 'All Products' },
                { to: '/products?is_featured=true', label: 'Featured' },
                { to: '/products?ordering=price',   label: 'Best Price' },
                { to: '/products?ordering=-created_at', label: 'New Arrivals' },
                { to: '/cart',                     label: 'My Cart' },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} className="text-gray-400 hover:text-white hover:pl-1 transition-all duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white font-bold text-sm mb-5 tracking-wide uppercase">Account</h3>
            <ul className="space-y-3 text-sm">
              {[
                { to: '/login',   label: 'Sign In' },
                { to: '/register',label: 'Register' },
                { to: '/profile', label: 'My Profile' },
                { to: '/orders',  label: 'Order History' },
                { to: '/profile', label: 'Saved Addresses' },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} className="text-gray-400 hover:text-white hover:pl-1 transition-all duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold text-sm mb-5 tracking-wide uppercase">Stay Updated</h3>
            <p className="text-sm text-gray-500 mb-4">
              Get exclusive deals and new arrivals straight to your inbox.
            </p>
            <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="you@example.com"
                aria-label="Email for newsletter"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all duration-200 active:scale-[0.98]"
              >
                Subscribe →
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-500">
              © {year} ShopVibe. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
              <Link to="/cookies" className="hover:text-gray-300 transition-colors">Cookies</Link>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-bold text-blue-400">VISA</span>
              <span className="font-bold text-orange-400">Mastercard</span>
              <span className="font-bold text-sky-400">PayPal</span>
              <span className="font-bold text-green-400">UPI</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}