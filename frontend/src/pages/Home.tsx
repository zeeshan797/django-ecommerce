import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Zap, 
  ArrowRight, 
  Sparkles, 
  Star, 
  CheckCircle2, 
  Copy, 
  Check,
  TrendingUp,
  Tag,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFeaturedProducts, useCategories, useProducts } from '@/api/storeApi';
import { ProductCard } from '@/components/common/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { RatingStars } from '@/components/common/RatingStars';
import { getImageUrl } from '@/utils/api';
import { toast } from 'sonner';

export default function HomePage() {
  const { data: featuredProducts, isLoading: featuredLoading } = useFeaturedProducts();
  const { data: recentProducts, isLoading: recentLoading } = useProducts({ page: 1 });
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const heroFeatured = featuredProducts?.[0] || recentProducts?.results?.[0];

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    toast.success(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCoupon(false), 2500);
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubscribed(true);
    toast.success('Thank you for subscribing to ShopVibe VIP Insider!');
  };

  const valueProps = [
    {
      icon: Truck,
      title: 'Free Express Shipping',
      description: 'On all orders over $75 with tracking',
    },
    {
      icon: ShieldCheck,
      title: '2-Year Full Warranty',
      description: '100% genuine verified products',
    },
    {
      icon: RotateCcw,
      title: '30-Day Free Returns',
      description: 'Instant prepaid return labels',
    },
    {
      icon: Zap,
      title: '24/7 Priority Support',
      description: 'Dedicated customer service on call',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFC]">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-14 sm:py-20 lg:py-24">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center justify-between">
            
            {/* Left Hero Content */}
            <div className="flex-1 min-w-0 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-400 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Next-Gen Tech & Premium Lifestyle Gear</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Engineered for <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                  Performance & Style.
                </span>
              </h1>

              <p className="text-xs sm:text-sm lg:text-base text-slate-300 max-w-xl leading-relaxed font-normal">
                Discover precision audio, ergonomic mechanical keyboards, ambient workspace lighting, and modern accessories curated for creators and power users.
              </p>

              <div className="pt-2 flex flex-row items-center gap-3">
                <Link to="/products">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2 text-xs sm:text-sm shadow-lg shadow-blue-600/30 rounded-xl px-5 sm:px-6">
                    Explore Catalog
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/products?featured=true">
                  <Button size="lg" variant="outline" className="bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white font-semibold text-xs sm:text-sm rounded-xl px-5 sm:px-6">
                    Featured Drops
                  </Button>
                </Link>
              </div>

              {/* Social Proof Counters */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-3 max-w-md text-slate-300">
                <div>
                  <div className="text-lg sm:text-2xl font-black text-white">4.9/5</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>Rating</span>
                  </div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-black text-white">48hr</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Dispatch</div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-black text-white">100%</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Authentic</div>
                </div>
              </div>
            </div>

            {/* Right Hero Showcase Card */}
            <div className="w-full md:w-[360px] lg:w-[420px] shrink-0">
              <div className="relative bg-gradient-to-b from-slate-800/90 to-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
                
                <div className="flex items-center justify-between">
                  <Badge variant="discount" className="text-xs px-3 py-1 bg-rose-600/90 text-white font-bold">
                    Special Launch Offer
                  </Badge>
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Member Perk
                  </span>
                </div>

                {heroFeatured && (
                  <Link 
                    to={`/products/${heroFeatured.slug || heroFeatured.id}`}
                    className="group block bg-slate-950/60 rounded-2xl border border-slate-800 p-4 hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-white rounded-xl p-2 shrink-0 flex items-center justify-center overflow-hidden">
                        {heroFeatured.images?.[0]?.image ? (
                          <img 
                            src={getImageUrl(heroFeatured.images[0].image)} 
                            alt={heroFeatured.name} 
                            className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" 
                          />
                        ) : (
                          <Package className="w-8 h-8 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Featured Item</span>
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                          {heroFeatured.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-base font-extrabold text-white">${parseFloat(heroFeatured.price || '0').toFixed(2)}</span>
                          {heroFeatured.stock > 0 && (
                            <span className="text-[10px] text-emerald-400 font-semibold">In Stock</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Get 20% Off Your First Order
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Use code <span className="font-bold text-white">WELCOME20</span> at checkout to unlock savings across the catalog.
                  </p>
                </div>

                {/* Promo Code Copy Box */}
                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-400" />
                    <span className="font-mono text-sm font-bold text-amber-300 tracking-wider">
                      WELCOME20
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCoupon('WELCOME20')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
                  >
                    {copiedCoupon ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCoupon ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                  <span>✓ Min. order $50</span>
                  <span>✓ Applied at cart</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Value Propositions Bar */}
      <section className="bg-white border-b border-gray-200/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {valueProps.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <item.icon className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug truncate">{item.title}</h4>
                  <p className="text-[11px] text-gray-500 leading-tight truncate">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Browse Categories */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">
                Explore Categories
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Curated Collections
              </h2>
            </div>
            <Link to="/products" className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {categoriesLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-white rounded-2xl border border-gray-200 animate-pulse p-4" />
              ))
            ) : (
              categories?.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug || cat.id}`}
                  className="group bg-white rounded-2xl border border-gray-200/80 p-5 hover:border-blue-400 hover:shadow-md transition-all flex items-center gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0 group-hover:scale-105 transition-transform">
                    {cat.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {cat.product_count !== undefined ? `${cat.product_count} items` : 'Explore gear'}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. Featured Product Highlights */}
      <section className="py-12 sm:py-16 bg-white border-y border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Handpicked Selections
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Featured Highlights
              </h2>
            </div>
            <Link to="/products?featured=true" className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Browse All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredLoading ? (
              [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
            ) : (
              featuredProducts?.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* 5. Trending New Arrivals */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Latest Catalog Additions
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Trending New Arrivals
              </h2>
            </div>
            <Link to="/products?ordering=-created_at" className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              See All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {recentLoading ? (
              [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
            ) : (
              recentProducts?.results?.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* 6. Customer Testimonials */}
      <section className="py-14 bg-white border-t border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              Verified Reviews
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Trusted by 50,000+ Creators & Tech Enthusiasts
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                quote: 'The build quality of the ambient desk lamp exceeded all expectations. Super fast shipping!',
                name: 'Alex Rivera',
                role: 'Software Engineer',
                rating: 5,
              },
              {
                quote: 'Customer support answered within 2 minutes when I requested an address modification. Seamless experience!',
                name: 'Sarah Chen',
                role: 'Product Designer',
                rating: 5,
              },
              {
                quote: 'Crystal clear sound on the headphones and genuine serial verification. Definitely my go-to tech store.',
                name: 'Marcus Vance',
                role: 'Tech Creator',
                rating: 5,
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-50/70 rounded-2xl border border-gray-200/80 p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <RatingStars rating={item.rating} size="sm" className="mb-3" />
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                    "{item.quote}"
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-200/60 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">{item.name}</div>
                    <div className="text-[11px] text-gray-500">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Newsletter Section */}
      <section className="py-14 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-400/30 text-blue-400 text-xs font-bold rounded-full">
            <Zap className="w-3.5 h-3.5" /> Stay in the Loop
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Join the ShopVibe Insider Circle
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Get exclusive early access to limited edition drops, flash discounts, and member-only coupons delivered to your inbox.
          </p>

          {subscribed ? (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl max-w-md mx-auto flex items-center justify-center gap-2 text-emerald-400 text-xs sm:text-sm font-bold">
              <CheckCircle2 className="w-4 h-4" />
              You're subscribed! Check your inbox for your welcome coupon.
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter your email address..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
              <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm h-10 px-6 rounded-xl cursor-pointer">
                Subscribe
              </Button>
            </form>
          )}

          <div className="text-[11px] text-slate-400">
            No spam, unsubscribe anytime with one click.
          </div>
        </div>
      </section>
    </div>
  );
}