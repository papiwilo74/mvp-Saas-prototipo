# Environment Variables Guide

This project uses `.env` files for configuration. Here's everything you need to know.

## File Layout

```
backend/
  .env.example            ← Template for all environments (copy to .env)
  .env.development        ← Pre-filled for local development
  .env.production.example ← Template for production (fill real values)
  .env                    ← YOUR actual config (git-ignored, never commit)

frontend/
  .env.example            ← Template for all environments
  .env.production.example ← Template for production
  .env                    ← YOUR actual config (git-ignored, never commit)
```

## Required vs Optional (Backend)

| Variable | Required | Notes |
|---|---|---|
| `NODE_ENV` | Yes | `development`, `production`, or `test` |
| `PORT` | Yes | Server port (default: 4000) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Min 24 characters |
| `FRONTEND_URL` | Yes | Frontend URL for CORS |
| `DIRECT_URL` | No | Only needed with Supabase pooler for migrations |
| `ALLOWED_ORIGINS` | No | Comma-separated extra CORS origins |
| `RESEND_API_KEY` | No | Needed for transactional emails |
| `EMAIL_FROM` | No | Sender address for emails |
| `CLOUDINARY_*` | No | Needed for image uploads |

## Required vs Optional (Frontend)

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_URL` | Yes | Backend API base URL |
| `VITE_RESTAURANT_SLUG` | No | Defaults to `demo-burger` |
| `VITE_ENABLE_ORDER_HISTORY` | No | Defaults to `true` |
| `VITE_DEMO_MODE` | No | Defaults to `false` |

## How to Get Values

### JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Resend API Key
1. Sign up at https://resend.com
2. Verify your sending domain (add DNS records)
3. Go to API Keys and create a new key
4. Emails will silently fail if the domain is not verified

### Cloudinary Credentials
1. Sign up at https://cloudinary.com
2. Go to Dashboard → Account Details
3. Copy Cloud name, API Key, and API Secret

### Database URL (Supabase)
1. Create a project at https://supabase.com
2. Go to Project Settings → Database
3. Copy the **Transaction pooler** URL for `DATABASE_URL`
4. Copy the **Session** URL for `DIRECT_URL`
5. Add `?pgbouncer=true` to the pooler URL

## Per-Environment Settings

### Development
- Relaxed rate limits (higher max values)
- `FRONTEND_URL` = `http://localhost:5173`
- JWT secret: any long string works
- Optional services (Resend, Cloudinary) can be left unset

### Production
- Tight rate limits (max 5 login attempts per 15 min)
- `FRONTEND_URL` must be your real deployed domain
- JWT secret must be a strong random string (64 bytes hex)
- All services should be properly configured
- `NODE_ENV=production`

## Common CORS Issues

**Symptom:** Browser shows "Network Error" or CORS errors on API calls.

**Fixes:**
1. Make sure `FRONTEND_URL` in backend `.env` matches your actual frontend origin exactly (protocol, domain, port).
2. If using multiple frontends (e.g., admin subdomain), add them to `ALLOWED_ORIGINS` as a comma-separated list.
3. In production, `FRONTEND_URL` must NOT be `localhost`. The env validator will reject it.
4. After changing CORS settings, restart the backend server.

## Setting Up for Production

1. Copy `backend/.env.production.example` → `backend/.env`
2. Copy `frontend/.env.production.example` → `frontend/.env`
3. Fill in ALL placeholder values with real credentials
4. Run validation:
   ```bash
   cd backend && npm run env:validate
   ```
5. Deploy with:
   ```bash
   cd backend && npm run prisma:deploy   # applies migrations
   cd backend && npm start               # starts production server
   ```
6. For the frontend, set env vars in your hosting dashboard (Vercel/Netlify) or use the `.env` file during build.
