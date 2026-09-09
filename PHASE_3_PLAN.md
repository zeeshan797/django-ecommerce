# Phase 3: Frontend Authentication & Protected Routes

## Overview
Build the frontend authentication system including auth pages, state management, protected routes, and API integration. The backend JWT endpoints are already implemented and tested.

## Components to Build

### 1. Auth State Management (Zustand)
- **File:** `frontend/src/stores/authStore.ts`
- User state (id, username, email, profile data)
- Token state (access, refresh)
- Actions: setAuth, clearAuth, updateProfile, refreshAccessToken
- Persistence: localStorage (or httpOnly cookies if preferred)

### 2. Auth API Integration (TanStack Query)
- **File:** `frontend/src/api/authApi.ts`
- Mutations: register, login, logout, refreshToken
- Queries: getProfile, updateProfile
- Error handling and token refresh logic

### 3. Auth Pages
- **Login Page** (`frontend/src/pages/Login.tsx`)
  - Email/password form with validation
  - "Remember me" option
  - Link to register/forgot password
- **Register Page** (`frontend/src/pages/Register.tsx`)
  - Full registration form (username, email, password, confirm, name, phone, address)
  - Password strength indicator
  - Terms checkbox
- **Forgot Password Page** (`frontend/src/pages/ForgotPassword.tsx`)
- **Reset Password Page** (`frontend/src/pages/ResetPassword.tsx`)

### 4. Protected Route Wrapper
- **File:** `frontend/src/components/ProtectedRoute.tsx`
- Redirects to login if not authenticated
- Preserves intended destination for post-login redirect
- Role-based access (admin routes)

### 5. Auth Layout & Components
- **AuthLayout** - Clean centered card layout for auth pages
- **Form Components** - Input, Label, Button using shadcn/ui
- **Error/Success Toast** - sonner or react-hot-toast

### 6. Header/User Menu
- **Header Component** - Logo, navigation, user avatar dropdown
- **User Dropdown** - Profile, Orders, Logout
- **Auth State Sync** - Update header on login/logout

### 7. Routing Updates
- Update `src/App.tsx` with React Router
- Public routes: /, /login, /register, /forgot-password, /reset-password
- Protected routes: /profile, /orders, /cart, /checkout, /admin/*

## Dependencies to Install
```bash
npm install @tanstack/react-query zustand react-router-dom react-hook-form @hookform/resolvers zod sonner lucide-react
npm install -D @types/react-router-dom
```

## File Structure
```
frontend/src/
├── api/
│   └── authApi.ts
├── stores/
│   └── authStore.ts
├── pages/
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ForgotPassword.tsx
│   └── ResetPassword.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthLayout.tsx
│   ├── ui/ (shadcn/ui components)
│   ├── ProtectedRoute.tsx
│   └── Header.tsx
├── hooks/
│   └── useAuth.ts
├── utils/
│   └── api.ts (axios instance with interceptors)
└── App.tsx (updated with routes)
```

## Verification Steps
1. Install dependencies
2. Create auth store with persistence
3. Set up axios instance with token interceptors
4. Build auth API hooks with TanStack Query
5. Create auth pages with forms and validation
6. Implement protected route wrapper
7. Update App.tsx with routing
8. Test: register → login → access protected route → logout
9. Test token refresh on expiry
10. Verify redirect after login works

## Next Phase
After authentication is complete, Phase 4 will build the Storefront UI (home, products, cart, checkout).