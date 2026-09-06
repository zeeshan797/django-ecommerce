# Phase 2: DRF API Layer

## Overview
This phase built the Django REST Framework API layer, including serializers, viewsets, filtering, pagination, and API documentation using drf-spectacular. We also set up authentication endpoints (JWT) and protected the API.

## Dependencies Installed
- django-filter (for filtering capabilities)
- django-corsheaders (for CORS support - installed from user's environment)

## Backend Components Created

### 1. Serializers (in each app's `serializers.py`)
- **Accounts**: 
  - UserSerializer: Basic user information with nested profile
  - UserProfileSerializer: Profile data serializer
  - UserRegistrationSerializer: Handles user registration with profile data
- **Products**: 
  - CategorySerializer: Category data with product count
  - ProductSerializer: Product data with nested category and images
  - ProductImageSerializer: Product image data
- **Orders**: 
  - OrderSerializer: Order data with nested items and coupon
  - OrderItemSerializer: Order item data withinal order item data
- **Cart**: 
  - CartSerializer: Cart data with nested items and totals
  - CartItemSerializer: Cart item data with product details
- **Reviews**: 
  - ReviewSerializer: Review data with nested product and user
- **Payments**: 
  - PaymentSerializer: Payment data with nested order
- **Coupons**: 
  - CouponSerializer: Coupon data with computed validity

### 2. Viewsets (in each app's `views.py`)
- Implemented ModelViewSet for full CRUD operations where appropriate
- Used ReadOnlyModelViewSet for read-only endpoints
- Implemented custom actions for specific operations (e.g., cart operations, order from cart, coupon validation)
- Applied appropriate permission classes:
  - IsAuthenticated: For protected endpoints
  - IsAdminOrReadOnly: For admin-only write, public read
  - IsOwnerOrReadOnly: For user-specific objects (like reviews)
  - IsOrderOwner: For order access control
- Used filtering, searching, and ordering as appropriate

### 3. URL Configuration
- Created `urls.py` in each app for API endpoints
- Included all app URLs in the project's `backend/urls.py`
- Used DRF routers for automatic URL routing in products app
- Included API documentation endpoints (Swagger UI, ReDoc)

### 4. Filtering and Search
- Implemented DjangoFilterBackend for filtering
- Implemented SearchFilter for search functionality
- Implemented OrderingFilter for sorting (where compatible with drf-spectacular)
- Created filter classes where needed

### 5. Pagination
- Configured custom pagination classes (PageNumberPagination with page size 20)
- Applied pagination to list views

### 6. Authentication and Permissions
- Configured JWT authentication (using djangorestframework-simplejwt)
- Set up token obtain/refresh views (implicitly through djangorestframework-simplejwt)
- Applied IsAuthenticated permission to protected endpoints by default
- Allowed public access to product catalog, categories, etc. using IsAdminOrReadOnly or AllowAny

### 7. API Documentation
- Configured drf-spectacular for Swagger/OpenAPI documentation
- Customized the API title, description, etc.
- Ensured all endpoints are properly documented

### 8. CORS Configuration
- Configured django-corsheaders to allow frontend origin for development
- Set CORS_ORIGIN_ALLOW_ALL=True in .env for development convenience

## Specific Implementation Details

### Accounts API
- Endpoints: 
  - `/api/auth/register/` (POST) - User registration
  - `/api/auth/login/` (POST) - User login (returns JWT tokens)
  - `/api/auth/profile/` (GET, PUT, PATCH) - User profile retrieval/update
- Registration endpoint creates user and profile
- Profile retrieval/update requires authentication

### Products API
- Endpoints: 
  - `/api/categories/` (GET, POST, PUT, PATCH, DELETE)
  - `/api/products/` (GET, POST, PUT, PATCH, DELETE)
  - `/api/product-images/` (GET, POST, PUT, PATCH, DELETE)
- Public read access for categories and products
- Admin-only write access (IsAdminOrReadOnly)
- Filtering by category, price range, featured status
- Search by name, description
- Ordering by name, price, created date
- Pagination

### Cart API
- Endpoints: 
  - `/api/cart/` (GET) - Retrieve current user's cart
  - `/api/cart/add-item/` (POST) - Add item to cart
  - `/api/cart/item/{id}/` (PATCH, DELETE) - Update or remove cart item
  - `/api/cart/clear/` (DELETE) - Clear cart
- Authenticated users only
- Operations: get cart, add item, update item quantity, remove item, clear cart

### Orders API
- Endpoints: 
  - `/api/orders/` (GET, POST) - List orders, create order from cart
  - `/api/orders/{id}/` (GET, PUT, PATCH, DELETE) - Retrieve, update, delete order
  - `/api/orders/from-cart/` (POST) - Create order from current user's cart
  - `/api/orders/{id}/cancel/` (POST) - Cancel an order
- Authenticated users can view their own orders
- Admin can view all orders
- Order creation from cart with optional coupon application
- Order status updates (including cancel)
- Filtering by order status, payment status
- Ordering by creation date

### Reviews API
- Endpoints: 
  - `/api/reviews/` (GET, POST) - List reviews, create review
  - `/api/reviews/{id}/` (GET, PUT, PATCH, DELETE) - Retrieve, update, delete review
- Authenticated users can create reviews for products
- Public read access for product reviews
- Prevent duplicate reviews (enforced by model constraint)
- Filtering by product, rating
- Ordering by creation date

### Coupons API
- Endpoints: 
  - `/api/coupons/` (GET, POST, PUT, PATCH, DELETE) - List and manage coupons
  - `/api/coupons/validate/` (POST) - Validate a coupon code
- Public validation endpoint (check if coupon is valid)
- Admin-only management (IsAdminOrReadOnly)
- Validation based on date, usage limits, minimum order
- Returns discount amount and final amount
- **Fixed:** Decimal type handling in discount calculations (model and view) to prevent TypeError when computing percentage discounts

### Payments API
- Endpoints: 
  - `/api/payments/` (GET, POST) - List payments, create payment
  - `/api/payments/{id}/` (GET, PUT, PATCH, DELETE) - Retrieve, update, delete payment
  - `/api/payments/process-cod/` (POST) - Process Cash on Delivery payment
- Process cash on delivery payments
- Extensible for other gateways
- Authenticated users can view their own payments
- Admin can view all payments

## Environment Variables
- Added CORS_ALLOWED_ORIGINS to .env (for development: http://localhost:5173)
- JWT settings already configured in settings.py
- CORS_ORIGIN_ALLOW_ALL=True in .env for development

## Verification Steps
1. Installed new dependencies (django-filter, django-corsheaders)
2. Updated settings.py with new apps, middleware, and configurations
3. Created serializers, viewsets, URLs for each app
4. Verified API schema generation works at `/api/schema/`
5. Verified Swagger UI at `/api/schema/swagger-ui/`
6. Tested authentication flow (register, login, access protected endpoints)
7. Tested CRUD operations for each resource
8. Tested filtering, search, and pagination
9. Verified API documentation is comprehensive
10. Tested coupon validation endpoint with percentage and fixed discounts (fixed Decimal type handling bug)

## Manual Commands to Run
### Backend:
```bash
# Install additional dependencies (if not already installed)
.\venv\Scripts\pip install django-filter

# After implementing the code, run:
python manage.py makemigrations  # if any model changes
python manage.py migrate
```

### Testing:
1. Start server: `python manage.py runserver`
2. Visit `http://localhost:8000/api/schema/swagger-ui/` to test API
3. Test endpoints: 
   - Register: POST `/api/auth/register/`
   - Login: POST `/api/auth/login/`
   - Get products: GET `/api/products/`
   - Get categories: GET `/api/categories/`
   - Access cart (should fail without auth): GET `/api/cart/`
   - Login, then access protected endpoints with JWT token

## Folder Structure Changes
Added the following files:
```
backend/
├── accounts/
│   ├── serializers.py
│   └── views.py
├── cart/
│   ├── serializers.py
│   └── views.py
├── coupons/
│   ├── serializers.py
│   └── views.py
├── orders/
│   ├── serializers.py
│   └── views.py
├── payments/
│   ├── serializers.py
│   └── views.py
├── products/
│   ├── serializers.py
│   └── views.py
├── reviews/
│   ├── serializers.py
│   └── views.py
└── backend/
    └── urls.py  # updated to include API routes
```

## Verification
- After running migrations, verify that the tables are created in MySQL Workbench.
- The superuser should be able to log in to the Django admin and see the customized interfaces.
- Test creating a category, product, etc., to ensure the admin works as expected.
- Test API endpoints through Swagger UI or direct HTTP requests.
- Verify authentication flow works correctly.
- Verify that protected endpoints require authentication.
- Verify that filtering, search, and pagination work correctly.

## Next Steps
In Phase 3, we will:
1. Build the storefront UI: home, listing/filter pages, product detail, cart, checkout, profile, order history — polished and responsive.
2. Implement authentication pages and protected routes on frontend.
3. Connect frontend to the backend API we just built.