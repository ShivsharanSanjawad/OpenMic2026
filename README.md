# SPARK OpenMic 10 — Registration Platform

Full-stack Next.js application for public performer registration + secure admin management.

## Stack

- Next.js (App Router) + Tailwind
- Prisma + PostgreSQL
- Cloudinary (image uploads)
- Nodemailer (Gmail SMTP)
- Custom JWT admin auth with HttpOnly cookie

## Setup

1. Copy `.env.example` to `.env` and fill credentials.
2. Install dependencies: `npm install`
3. Generate Prisma client: `npm run db:generate`
4. Run migrations: `npm run db:migrate`
5. Seed admin + default settings: `npm run db:seed`
6. Start app: `npm run dev`

## Security Implemented

- Secret admin base path from `ADMIN_BASE_PATH`
- Middleware 404 for unauthenticated admin path access
- Signed JWT (`admin_session`) cookie: HttpOnly + Secure + SameSite=Strict + 8h expiry
- Server-side input sanitization + zod validation
- CSRF-style origin checks on sensitive POST/PUT/DELETE routes
- Registration API rate limiting (3/IP/hour)
- MIME + size validation for payment and QR image uploads
- Optional script upload with MIME validation and strict 1MB limit
- CSP and additional secure response headers

## Important

- No admin signup endpoint exists.
- Admin account is created only via `prisma/seed.ts`.
