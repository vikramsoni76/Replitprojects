# Embroidery Machinery Marketplace

## Overview
A full-stack used embroidery machinery marketplace with three roles: Seller, Buyer, and Admin.

## Tech Stack
- **Frontend**: React + Vite, Wouter routing, TanStack Query, Shadcn UI, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Local username/password (Passport.js local strategy) + Replit OIDC fallback
- **File Upload**: Multer (stored in `/uploads` directory)
- **Email**: Nodemailer (SMTP config via env vars)

## Key Files
- `shared/schema.ts` - Database schema (listings, leads, users, sessions)
- `shared/models/auth.ts` - User model with fields: id, username, password, email, firstName, lastName, mobile, address, isAdmin
- `server/routes.ts` - API routes, file upload endpoint, seed data
- `server/storage.ts` - Database CRUD operations
- `server/replit_integrations/auth/replitAuth.ts` - Auth setup (local + OIDC), registration, login, isAuthenticated middleware
- `server/replit_integrations/auth/storage.ts` - User CRUD (getUser, getUserByEmail, getUserByUsername, upsertUser)
- `server/replit_integrations/auth/routes.ts` - /api/auth/user endpoint
- `client/src/pages/auth.tsx` - Seller registration/login page
- `client/src/pages/home.tsx` - Homepage with hero and featured listings
- `client/src/pages/browse.tsx` - Browse all approved machines
- `client/src/pages/dashboard.tsx` - Seller dashboard to manage listings
- `client/src/pages/admin.tsx` - Admin approval console
- `client/src/pages/listing-details.tsx` - Individual listing page
- `client/src/components/listing-form.tsx` - Machine listing form with photo/video upload
- `client/src/components/navbar.tsx` - Navigation bar
- `client/src/hooks/use-auth.ts` - Authentication hook

## Auth Flow
- Sellers register at `/auth` with name, email, mobile, address, password
- Existing sellers login at `/auth` with email + password
- Admin login: email=vikramsoni76@gmail.com, password=Antman@1976 (also username=Admin)
- "Sell Your Machine" links to `/auth` (not `/api/login`)
- After login, redirects to `/dashboard`

## Admin
- Email: vikramsoni76@gmail.com
- Admin is determined by `isAdmin` flag in DB or email match
- Admin can approve/reject listings, view all leads

## File Uploads
- Photos and videos uploaded via `/api/upload` endpoint (multer)
- Files stored in `/uploads` directory, served via `/uploads/:filename`
- Max 10 photos per listing, max 50MB per video file

## Email Notifications
- New listing → admin gets email with full machine and seller details
- New lead → admin gets email with buyer + machine + seller details
- Requires SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS env vars
