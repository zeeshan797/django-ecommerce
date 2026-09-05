# Phase 1: Data Models + Fully Customized Django Admin

## Overview
This phase defines the data models for the ecommerce application and customizes the Django Admin interface for managing products, categories, orders, users, coupons, etc.

## Data Models Defined
We created models for the following apps:

### Accounts
- `UserProfile`: Extends the built-in Django User model with additional fields (phone, address, date of birth, profile picture, etc.).
  - Uses signals to automatically create a profile when a user is created.

### Products
- `Category`: Product category with name, slug, description, image, and active status.
- `Product`: Product model with name, slug, category, description, price, compare price, stock, active/featured flags.
- `ProductImage`: Images for a product, with support for a main image.

### Orders
- `Order`: Represents a customer's order with customer information, shipping address, order status, payment status, coupon, amounts, etc.
- `OrderItem`: Items within an order, referencing the product (with historical snapshot of name, SKU, unit price).

### Cart
- `Cart`: One-to-one with User, represents the user's shopping cart.
- `CartItem`: Items in the cart, referencing a product and quantity.

### Reviews
- `Review`: User reviews for products, with rating (1-5) and comment.

### Payments
- `Payment`: Payment record for an order (currently supports Cash on Delivery, extensible for other gateways).

### Coupons
- `Coupon`: Discount coupons with code, discount type (percentage/fixed), value, validity period, usage limits, and minimum order amount.

## Customized Django Admin
We customized the admin interface for each app to improve usability:

### Accounts
- Extended the built-in User admin to include the UserProfile as an inline.
- Added phone number to the user list display.

### Products
- Category admin: list display, filters, search, prepopulated slug.
- Product admin:
  - List display with name, category, price, stock, active/featured flags.
  - Inline editing of ProductImages.
  - Read-only fields for timestamps and discount percentage.
  - Fieldsets for better organization.
  - ProductImage inline with image preview.

### Orders
- Order admin:
  - List display with order ID, customer name, email, statuses, total amount, and date.
  - Inline editing of OrderItems (read-only to preserve historical data).
  - Fieldsets for customer information, shipping address, order details, and notes.
  - Methods to display full name and full address (with formatting).

### Cart
- Cart admin:
  - List display with user, total items, total price, and update time.
  - Inline editing of cart items.
  - Read-only timestamps.

### Reviews
- Review admin:
  - List display with product, user, rating, and date.
  - Filters by rating and date.
  - Search by product name, username, and comment.

### Payments
- Payment admin:
  - List display with order, payment method, amount, status, and date.
  - Filters by payment method and status.
  - Search by order ID and transaction ID.

### Coupons
- Coupon admin:
  - List display with code, discount type, value, active status, validity, and computed validity.
  - Filters by discount type, active status, and validity dates.
  - Search by code and description.
  - Read-only timestamps and computed validity field.
  - Fieldsets for organization.

## Migrations
We created and applied migrations for all new models.

## How to Run
1. Ensure the virtual environment is activated:
   ```bash
   .\venv\Scripts\activate
   ```
2. Apply migrations (if not already done):
   ```bash
   python manage.py migrate
   ```
3. Create a superuser (if not already done):
   ```bash
   set DJANGO_SUPERUSER_PASSWORD=admin123 && set DJANGO_SUPERUSER_USERNAME=admin && set DJANGO_SUPERUSER_EMAIL=admin@example.com && python manage.py createsuperuser --noinput
   ```
   (Adjust credentials as desired)
4. Start the development server:
   ```bash
   python manage.py runserver
   ```
5. Access the admin interface at `http://localhost:8000/admin` (login with superuser credentials).

## Folder Structure Changes
Added the following files (in addition to those from Phase 0):

```
backend/
├── accounts/
│   ├── admin.py
│   └── models.py
├── cart/
│   ├── admin.py
│   └── models.py
├── coupons/
│   ├── admin.py
│   └── models.py
├── orders/
│   ├── admin.py
│   └── models.py
├── payments/
│   ├── admin.py
│   └── models.py
├── products/
│   ├── admin.py
│   └── models.py
└── reviews/
    ├── admin.py
    └── models.py
```

## Verification
- After running migrations, verify that the tables are created in MySQL Workbench.
- The superuser should be able to log in to the Django admin and see the customized interfaces.
- Test creating a category, product, etc., to ensure the admin works as expected.

## Next Steps
In Phase 2, we will:
1. Build the DRF API layer: serializers, viewsets, filtering, pagination, and API documentation (using drf-spectacular).
2. Set up authentication endpoints (JWT) and protect the API.