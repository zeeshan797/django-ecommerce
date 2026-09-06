# Phase 2: DRF API Layer Plan

## Overview
This phase will build the Django REST Framework API layer, including serializers, viewsets, filtering, pagination, and API documentation using drf-spectacular. We'll also set up authentication endpoints (JWT) and protect the API.

## Backend Components to Create

### 1. Serializers (in each app's `serializers.py`)
- **Accounts**: UserSerializer, UserProfileSerializer, UserRegistrationSerializer
- **Products**: CategorySerializer, ProductSerializer, ProductImageSerializer
- **Orders**: OrderSerializer, OrderItemSerializer, OrderCreateSerializer
- **Cart**: CartSerializer, CartItemSerializer
- **Reviews**: ReviewSerializer
- **Payments**: PaymentSerializer
- **Coupons**: CouponSerializer

### 2. Viewsets (in each app's `views.py` or `api.py`)
- Use ModelViewSet for full CRUD operations where appropriate
- Use ReadOnlyModelViewSet for read-only endpoints
- Implement custom actions for specific operations (e.g., cart operations)
- Apply appropriate permission classes (IsAuthenticated, IsAdminUser, etc.)

### 3. URL Configuration
- Create `urls.py` in each app for API endpoints
- Include all app URLs in the project's `backend/urls.py`
- Use DRF routers for automatic URL routing
- Include API documentation endpoints

### 4. Filtering and Search
- Implement DjangoFilterBackend for filtering
- Implement SearchField for search functionality
- Implement OrderingFilter for sorting
- Create filter classes where needed (django-filter)

### 5. Pagination
- Configure custom pagination classes
- Apply pagination to list views

### 6. Authentication and Permissions
- Configure JWT authentication (already installed)
- Set up token obtain/refresh views
- Apply IsAuthenticated permission to protected endpoints
- Allow public access to product catalog, categories, etc.

### 7. API Documentation
- Configure drf-spectacular for Swagger/OpenAPI documentation
- Customize the API title, description, etc.
- Ensure all endpoints are properly documented

### 8. CORS Configuration
- Install and configure django-corsheaders (to be installed in this phase)
- Allow frontend origin for development

## Specific Implementation Details

### Accounts API
- Endpoints: `/api/auth/register/`, `/api/auth/login/`, `/api/auth/refresh/`, `/api/users/profile/`
- Registration endpoint to create user and profile
- Profile retrieval/update

### Products API
- Endpoints: `/api/categories/`, `/api/products/`, `/api/products/{id}/images/`
- Public read access for categories and products
- Admin-only write access
- Filtering by category, price range, featured status
- Search by name, description
- Pagination

### Cart API
- Endpoints: `/api/cart/`, `/api/cart/items/`, `/api/cart/items/{id}/`
- Authenticated users only
- Operations: get cart, add item, update item quantity, remove item, clear cart

### Orders API
- Endpoints: `/api/orders/`, `/api/orders/{id}/`, `/api/orders/{id}/cancel/`
- Authenticated users can view their own orders
- Admin can view all orders
- Order creation from cart
- Order status updates (admin only)

### Reviews API
- Endpoints: `/api/reviews/`, `/api/reviews/{id}/`
- Authenticated users can create reviews for products they've purchased
- Public read access for product reviews
- Prevent duplicate reviews (enforced by model constraint)

### Coupons API
- Endpoints: `/api/coupons/`, `/api/coupons/validate/`
- Public validation endpoint (check if coupon is valid)
- Admin-only management
- Validation based on date, usage limits, minimum order

### Payments API
- Endpoints: `/api/payments/`, `/api/payments/process/`
- Process cash on delivery payments
- Extensible for other gateways

## Dependencies to Install
- django-filter (for filtering)
- django-corsheaders (for CORS support)
- djangorestframework (already installed)
- drf-spectacular (already installed)
- djangorestframework-simplejwt (already installed)

## Environment Variables
- Add CORS_ALLOWED_ORIGINS to .env (for development: http://localhost:5173)
- JWT settings already configured in settings.py

## Verification Steps
1. Install new dependencies
2. Update settings.py with new apps and configurations
3. Create serializers, viewsets, URLs for each app
4. Run migrations if any model changes (none expected)
5. Test API endpoints using Swagger UI at `/api/schema/swagger-ui/`
6. Test authentication flow (register, login, access protected endpoints)
7. Test CRUD operations for each resource
8. Test filtering, search, and pagination
9. Verify API documentation is comprehensive

## Folder Structure Changes
Will add the following files:
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

## Manual Commands to Run
### Backend:
```bash
# Install additional dependencies
.\venv\Scripts\pip install django-filter django-corsheaders

# After implementing the code, run:
python manage.py makemigrations  # if any model changes
python manage.py migrate
```

### Testing:
1. Start server: `python manage.py runserver`
2. Visit `http://localhost:8000/api/schema/swagger-ui/` to test API
3. Test endpoints: register, login, get products, manage cart, place order, etc.