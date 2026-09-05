# Phase 0: Project Scaffolding Plan

## Backend (Django)
1. Create virtual environment and install dependencies
   - Python 3.11+
   - Django 5.x
   - djangorestframework
   - django-environ
   - pymysql
   - drf-spectacular (for API documentation)
   - djangorestframework-simplejwt (for JWT auth)
   - Pillow (for image handling)

2. Create Django project named `backend`
   - `django-admin startproject backend .`

3. Create Django apps:
   - accounts
   - products
   - orders
   - cart
   - reviews
   - payments

4. Configure settings:
   - Use django-environ to load environment variables from .env
   - Configure MySQL database using pymysql as driver
   - Set up REST Framework, JWT, Spectacular settings
   - Configure static and media files

5. Create .env.example with required variables:
   - DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT
   - SECRET_KEY
   - DEBUG
   - ALLOWED_HOSTS
   - CORS_ORIGIN_ALLOW_ALL (for development)

6. Run initial migrations to verify database connection
7. Create superuser account

## Frontend (React + Vite)
1. Create Vite project with React and TypeScript
   - `npm create vite@latest frontend -- --template react-ts`

2. Install dependencies:
   - TailwindCSS and peer dependencies
   - shadcn/ui (via CLI)
   - Framer Motion
   - TanStack Query
   - Zustand
   - Axios (for API calls)
   - React Router DOM

3. Configure TailwindCSS
4. Set up shadcn/ui components
5. Create basic folder structure:
   - components/
   - pages/
   - hooks/
   - lib/
   - styles/
   - utils/

6. Configure Vite proxy for API requests to backend (for development)

## Verification Steps
1. Backend:
   - Check that Django runs without errors
   - Verify MySQL connection via migrate command
   - Access Django admin at /admin
   - Access API schema at /api/schema/

2. Frontend:
   - Check that Vite dev server starts
   - Verify TailwindCSS is working
   - Verify shadcn/ui components render

## Manual Commands to Run
### Backend:
```bash
# Create virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install django djangorestframework django-environ pymysql drf-spectacular djangorestframework-simplejwt pillow

# Create project
django-admin startproject backend .

# Create apps
python manage.py startapp accounts
python manage.py startapp products
python manage.py startapp orders
python manage.py startapp cart
python manage.py startapp reviews
python manage.py startapp payments

# Make migrations and migrate
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Frontend:
```bash
# Create Vite project
npm create vite@latest frontend -- --template react-ts

# Install dependencies
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install @radix-ui/react-icons class-variance-authority clsx lucide-react tailwind-merge tailwindcss-animate
npm install zustand @tanstack/react-query axios framer-motion
npm install react-router-dom

# Install shadcn/ui (requires running the CLI and following prompts)
npx shadcn-ui@latest init
```

## Folder Structure After Phase 0
```
Ecommerce/
├── backend/
│   ├── backend/          # Django project settings
│   ├── accounts/
│   ├── products/
│   ├── orders/
│   ├── cart/
│   ├── reviews/
│   ├── payments/
│   ├── .env.example
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── node_modules/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── ...
    ├── .env.vite
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```