# Phase 4: Storefront UI

## Overview
Build the complete e-commerce storefront UI including product catalog, cart, checkout, user dashboard, and admin interface.

## Components to Build

### 1. Core Layout & Navigation
- **AppLayout.tsx** - Main layout with Header, Footer, main content area
- **Footer.tsx** - Links, newsletter, social media
- **Navigation updates** - Categories dropdown, search bar

### 2. Home Page (`/`)
- **Hero Section** - Headline, CTA, background image
- **Featured Products** - Carousel/grid of featured products
- **Categories Section** - Visual category cards
- **Trust Signals** - Free shipping, returns, support badges

### 3. Product Listing Page (`/products`)
- **Sidebar Filters** - Categories, price range, rating, availability
- **Search & Sort** - Search bar, sort dropdown (price, rating, newest)
- **Product Grid** - Responsive grid (1/2/3/4 columns)
- **Pagination** - Page numbers, prev/next, results count
- **Mobile Filter Drawer** - Slide-out filter panel

### 4. Product Detail Page (`/products/:id`)
- **Image Gallery** - Main image + thumbnails, zoom on hover
- **Product Info** - Name, price, rating, description, stock status
- **Variant Selection** - Size, color, etc. (if applicable)
- **Quantity Selector** - +/- buttons, max stock limit
- **Add to Cart** - Button with loading state, toast confirmation
- **Product Tabs** - Description, Reviews, Shipping/Returns
- **Related Products** - Cross-sell carousel

### 5. Cart Page (`/cart`)
- **Cart Items** - Product image, name, price, quantity selector, line total
- **Quantity Controls** - +/- buttons, input, max stock validation
- **Remove Item** - Delete button with confirmation
- **Cart Summary** - Subtotal, estimated shipping, tax, total
- **Promo Code** - Input + apply button
- **Checkout CTA** - Proceed to checkout button
- **Continue Shopping** - Link back to products

### 6. Checkout Page (`/checkout`)
- **Step Indicator** - Shipping → Payment → Review
- **Shipping Form** - Name, email, phone, address fields
- **Shipping Method** - Radio options (standard, express)
- **Payment Method** - COD (Cash on Delivery) only for now
- **Order Summary** - Items, shipping, tax, total
- **Place Order** - Submit with validation

### 7. Order Confirmation (`/orders/:id`)
- **Order Details** - Order ID, date, status, payment method
- **Items List** - Products, quantities, prices
- **Shipping/Billing Address** - Formatted addresses
- **Order Timeline** - Status history (pending → processing → shipped → delivered)

### 8. User Dashboard (`/profile`, `/orders`, `/orders/:id`)
- **Profile Tab** - Personal info, avatar, change password
- **Addresses Tab** - CRUD for shipping/billing addresses
- **Orders Tab** - List with status badges, view details
- **Order Detail** - Full order info, timeline, reorder button

### 9. Admin Dashboard (`/admin/*`)
- **Dashboard** - Stats cards (orders, revenue, users, products)
- **Products Management** - CRUD, bulk actions, image upload
- **Orders Management** - List, filter, status updates, details
- **Users Management** - List, roles, status
- **Coupons Management** - CRUD, usage stats
- **Categories Management** - CRUD, hierarchy

## API Integration
- **Products API** - List, detail, search, filter
- **Categories API** - List, tree structure
- **Cart API** - Get, add, update, remove, clear
- **Orders API** - Create from cart, list, detail
- **Reviews API** - List, create
- **Coupons API** - Validate, apply
- **Payments API** - Process COD

## State Management
- **Cart Store** - Zustand with persistence
- **Auth Store** - Already implemented
- **UI State** - Modals, drawers, toasts

## UI Components (shadcn/ui + custom)
- ProductCard, ProductGrid, ProductImageGallery
- QuantitySelector, StarRating, PriceDisplay
- CartItem, CartSummary, PromoCodeInput
- CheckoutSteps, AddressForm, OrderSummary
- DataTable (admin), StatsCard, StatusBadge

## Dependencies to Add
```bash
npm install react-hot-toast @hello-pangea/dnd @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install -D @types/react-dom
```

## File Structure
```
frontend/src/
├── api/
│   ├── productsApi.ts
│   ├── cartApi.ts
│   ├── ordersApi.ts
│   └── categoriesApi.ts
├── stores/
│   ├── cartStore.ts
│   └── authStore.ts (existing)
├── pages/
│   ├── Home.tsx
│   ├── Products.tsx
│   ├── ProductDetail.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── OrderConfirmation.tsx
│   ├── Profile.tsx
│   ├── Orders.tsx
│   └── OrderDetail.tsx
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── products/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductImageGallery.tsx
│   │   ├── ProductFilters.tsx
│   │   ├── ProductTabs.tsx
│   │   └── RelatedProducts.tsx
│   ├── cart/
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   └── PromoCodeInput.tsx
│   ├── checkout/
│   │   ├── CheckoutSteps.tsx
│   │   ├── ShippingForm.tsx
│   │   ├── PaymentMethod.tsx
│   │   └── OrderSummary.tsx
│   ├── ui/ (existing shadcn/ui)
│   └── common/
│       ├── StarRating.tsx
│       ├── QuantitySelector.tsx
│       ├── PriceDisplay.tsx
│       └── ProductCard.tsx
├── hooks/
│   ├── useProducts.ts
│   ├── useCart.ts
│   ├── useCategories.ts
│   └── useAuth.ts (existing)
└── utils/
    ├── formatters.ts
    └── validators.ts
```

## Verification Steps
1. Install dependencies
2. Create API hooks and stores
3. Build layout components (Header, Footer, Layout)
3. Build Home page with hero + featured products
4. Build Products listing with filters/pagination
5. Build Product Detail with gallery/tabs
6. Build Cart page with quantity management
7. Build Checkout flow (shipping → payment → review)
8. Build Order Confirmation page
9. Build User Dashboard (profile, orders)
10. Build Admin Dashboard
11. Test full user journey: browse → cart → checkout → order

## Next Steps After Phase 4
Phase 5: Testing, optimization, deployment prep