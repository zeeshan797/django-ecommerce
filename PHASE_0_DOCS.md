# Phase 0: Project Scaffolding

## Overview
This phase sets up the backend (Django) and frontend (React + Vite) projects, configures the MySQL database connection via environment variables, and establishes the basic project structure.

## Backend (Django)
### Setup
- Created a virtual environment (`venv`)
- Installed Django 5.x (specifically 5.2.4 due to MySQL 8.0 compatibility) and dependencies:
  - django
  - djangorestframework
  - django-environ
  - pymysql (MySQL driver)
  - drf-spectacular (API documentation)
  - djangorestframework-simplejwt (JWT authentication)
  - pillow (image handling)
- Created Django project named `backend` inside the `backend/` directory
- Created the following apps:
  - accounts
  - products
  - orders
  - cart
  - reviews
  - payments
- Configured `backend/backend/settings.py` to use environment variables via `django-environ`
- Set up MySQL database configuration using `pymysql` as the driver (with `pymysql.install_as_MySQLdb()`)
- Configured REST Framework, JWT, and Spectacular settings
- Set up static and media files configuration
- Temporarily omitted `django-corsheaders` due to installation issues with Python 3.14; can be added later when CORS is needed.

### Environment Variables
Created `backend/.env.example` with the following variables:
```
# Database
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=3306

# Django
SECRET_KEY=your_secret_key_here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Optional: CORS
CORS_ORIGIN_ALLOW_ALL=True
```
**Note:** Copy `.env.example` to `.env` and fill in your actual database credentials.

### How to Run
1. Activate the virtual environment:
   ```bash
   .\venv\Scripts\activate
   ```
2. Apply migrations:
   ```bash
   python manage.py migrate
   ```
3. Create a superuser (for Django admin):
   ```bash
   set DJANGO_SUPERUSER_PASSWORD=admin123 && set DJANGO_SUPERUSER_USERNAME=admin && set DJANGO_SUPERUSER_EMAIL=admin@example.com && python manage.py createsuperuser --noinput
   ```
   (Adjust credentials as desired)
4. Start the development server:
   ```bash
   python manage.py runserver
   ```
5. Access the admin interface at `http://localhost:8000/admin` (login with superuser credentials)
6. Access the API schema at `http://localhost:8000/api/schema/` (Swagger UI)

## Frontend (React + Vite + TypeScript)
### Setup
- Created a Vite project with React and TypeScript template
- Installed dependencies:
  - TailwindCSS (via `@tailwindcss/cli` and `tailwindcss`)
  - PostCSS and Autoprefixer
  - Framer Motion (for animations)
  - TanStack Query (for server state)
  - Zustand (for client state)
  - Axios (for HTTP requests)
  - React Router DOM (for routing)
  - shadcn/ui dependencies:
    - class-variance-authority
    - clsx
    - lucide-react
    - tailwind-merge
    - tailwindcss-animate
    - @radix-ui/react-icons
- Initialized TailwindCSS configuration (`tailwind.config.js` and `postcss.config.js`)
- Set up shadcn/ui by creating `components.json` and configuring path aliases in `tsconfig.app.json`
- Created directory structure:
  - `src/components` (for shadcn/ui components)
  - `src/lib/utils` (for utility functions)

### How to Run
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The application will be available at `http://localhost:5173` (or another port if 5173 is in use)

## Folder Structure
```
Ecommerce/
├── backend/
│   ├── backend/          # Django project settings
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── accounts/
│   ├── products/
│   ├── orders/
│   ├── cart/
│   ├── reviews/
│   ├── payments/
│   ├── .env.example
│   ├── requirements.txt
│   ├── manage.py
│   └── venv/             # Virtual environment
├── frontend/
│   ├── node_modules/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   │   └── utils/
│   │   ├── index.css     # Tailwind directives
│   │   └── main.tsx
│   ├── .eslintrc.cjs
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── PHASE_0_DOCS.md
└── PHASE_0_PLAN.md
```

## Verification
### Backend
- After running migrations, verify that the database tables are created in MySQL Workbench.
- The superuser should be able to log in to the Django admin.
- The API schema endpoint should display the Swagger UI.

### Frontend
- The Vite dev server should start without errors.
- The page should display (currently blank, as we haven't added any components yet).
- TailwindCSS should be working (you can test by adding a Tailwind class to an element in `src/main.tsx`).

## Next Steps
In Phase 1, we will:
1. Define the data models for products, categories, users, etc.
2. Customize the Django Admin interface for managing products, categories, orders, and users.
3. Run migrations to create the database schema.
4. Add CORS support (install and configure django-corsheaders) to allow frontend-backend communication during development.