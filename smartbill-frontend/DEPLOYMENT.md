# SmartBill Frontend - Production Deployment Guide

This guide will walk you through deploying the SmartBill frontend to Vercel.

## 📋 Prerequisites

Before you begin, make sure you have:
- GitHub account with SmartBill repository
- Backend deployed to Render (see `smartbill-backend/DEPLOYMENT.md`)
- Clerk account configured (from backend setup)
- Vercel account

---

## 🚀 Step 1: Prepare for Deployment

### 1.1 Verify Configuration Files

Ensure these files exist in `smartbill-frontend/`:

- ✅ `vercel.json` - Vercel configuration
- ✅ `next.config.mjs` - Next.js configuration
- ✅ `.env.example` - Environment variables template
- ✅ `.gitignore` - Git ignore rules

### 1.2 Test Local Build

Before deploying, test the production build locally:

```bash
cd smartbill-frontend

# Install dependencies
pnpm install

# Build for production
pnpm build

# Test production build
pnpm start
```

Visit `http://localhost:3000` and verify everything works.

---

## 🎯 Step 2: Deploy to Vercel

### 2.1 Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** > **"Project"**
3. **Import Git Repository**:
   - Select your GitHub account
   - Find `smartbill` repository
   - Click **"Import"**

### 2.2 Configure Project

1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `smartbill-frontend`
3. **Build Command**: `pnpm build` (auto-detected)
4. **Output Directory**: `.next` (auto-detected)
5. **Install Command**: `pnpm install` (auto-detected)

### 2.3 Set Environment Variables

Click **"Environment Variables"** and add the following:

```bash
# Backend API URL (from Render deployment)
NEXT_PUBLIC_API_URL=https://smartbill-api.onrender.com

# Clerk Authentication (from backend setup)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_live_YOUR_KEY_HERE

# Clerk Routing
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

**Important Notes**:
- Use `pk_live_` and `sk_live_` keys for production (not `pk_test_`)
- Get your backend URL from Render Dashboard
- All variables are required

### 2.4 Deploy

1. Click **"Deploy"**
2. Wait for deployment (~2-3 minutes)
3. Vercel will:
   - Install dependencies
   - Build the Next.js application
   - Deploy to their edge network
   - Generate a unique URL

---

## ✅ Step 3: Post-Deployment Configuration

### 3.1 Get Deployment URL

After deployment completes:
1. Copy your production URL (e.g., `smartbill-abcd123.vercel.app`)
2. Consider setting up a custom domain (optional)

### 3.2 Update Clerk Settings

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your SmartBill application
3. Go to **"Domains"**
4. Add your Vercel URL:
   - `https://smartbill-abcd123.vercel.app`
5. Go to **"Paths"**:
   - Set **"Home URL"** to your Vercel URL
6. Click **"Save"**

### 3.3 Update Backend CORS (if needed)

If you encounter CORS errors:

1. Go to your backend code: `smartbill-backend/src/index.ts`
2. Update CORS configuration:
   ```typescript
   app.use(cors({
     origin: [
       'https://smartbill-abcd123.vercel.app',
       'http://localhost:3000' // for local development
     ],
     credentials: true
   }))
   ```
3. Push changes and Render will auto-deploy

---

## 🧪 Step 4: Verify Deployment

### 4.1 Test Application

1. Visit your Vercel URL
2. Test the following:
   - ✅ Homepage loads
   - ✅ Sign-in page works (`/sign-in`)
   - ✅ Sign-up page works (`/sign-up`)
   - ✅ After login, redirects to dashboard
   - ✅ Dashboard shows data from backend
   - ✅ Upload page can upload documents
   - ✅ Suppliers page loads
   - ✅ Categories page loads
   - ✅ Settings page loads
   - ✅ Export page can download Excel

### 4.2 Test API Connection

Open browser console (F12) and check:
- No CORS errors
- API calls succeed (check Network tab)
- Authentication works (check for Authorization headers)

### 4.3 Check Performance

1. Go to Vercel Dashboard > Your Project > **"Analytics"**
2. Monitor:
   - Page load times
   - Core Web Vitals
   - Error rates

---

## 🎨 Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain

1. Go to Vercel Dashboard > Your Project > **"Settings"** > **"Domains"**
2. Click **"Add"**
3. Enter your domain (e.g., `smartbill.yourdomain.com`)
4. Follow DNS configuration instructions

### 5.2 Update DNS Records

Add these records to your domain provider:

**For subdomain (recommended)**:
```
Type: CNAME
Name: smartbill
Value: cname.vercel-dns.com
```

**For root domain**:
```
Type: A
Name: @
Value: 76.76.21.21
```

### 5.3 Update Clerk

After domain is active:
1. Go to Clerk Dashboard > **"Domains"**
2. Add your custom domain
3. Update paths if needed

---

## 🔧 Troubleshooting

### Build Failures

**Error**: `Module not found` or `Cannot find package`

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### API Connection Fails

**Error**: Network error or CORS issues

**Solution**:
1. Check `NEXT_PUBLIC_API_URL` is correct
2. Verify backend is running (visit health endpoint)
3. Check CORS configuration in backend
4. Ensure backend URL uses HTTPS

### Authentication Not Working

**Error**: Clerk errors or redirect loops

**Solution**:
1. Verify Clerk keys are `pk_live_` and `sk_live_` (not test keys)
2. Check Clerk Dashboard > Domains includes your Vercel URL
3. Verify all `NEXT_PUBLIC_CLERK_*` variables are set
4. Clear browser cookies and try again

### Environment Variables Not Loading

**Error**: `process.env.NEXT_PUBLIC_*` is undefined

**Solution**:
1. Vercel Dashboard > Project > Settings > Environment Variables
2. Ensure variables have `NEXT_PUBLIC_` prefix for client-side
3. Redeploy after adding variables (variables don't update existing deployments)

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

1. **Main branch**: Deploys to production
   ```bash
   git push origin main
   ```

2. **Other branches**: Creates preview deployments
   ```bash
   git checkout -b feature/new-feature
   git push origin feature/new-feature
   ```

### Preview Deployments

- Every push to non-main branches creates a preview URL
- Test changes before merging to production
- Share preview URLs with team for review

### Deployment Protection

1. Go to Settings > **"Git"**
2. Enable **"Production Branch"** protection
3. Require preview deployment to pass before merging

---

## 📊 Monitoring & Analytics

### Vercel Analytics

1. Go to Dashboard > Your Project > **"Analytics"**
2. View:
   - Real-time visitors
   - Page views
   - Performance metrics
   - Core Web Vitals

### Error Tracking (Optional)

Add Sentry for production error tracking:

```bash
pnpm add @sentry/nextjs
```

Configure in `next.config.mjs`:
```javascript
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig({
  // your config
})
```

---

## 🎯 Performance Optimization

### Enable Vercel Speed Insights

1. Project already includes `@vercel/analytics`
2. It's automatically enabled on Vercel
3. View insights in Dashboard > **"Speed Insights"**

### Image Optimization

Images are automatically optimized via Next.js Image component:
- Lazy loading
- WebP format
- Responsive sizes
- CDN caching

Already configured in `next.config.mjs`:
```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.supabase.co',
      pathname: '/storage/v1/object/**',
    },
  ],
}
```

### Caching Strategy

Vercel automatically caches:
- Static pages: 31536000 seconds (1 year)
- API routes: Configurable via headers
- Image optimization: Automatic CDN

---

## 💰 Cost Estimate

**Vercel Pricing** (as of 2024):

- **Hobby (Free)**:
  - ✅ Perfect for personal projects
  - 100GB bandwidth/month
  - 1000 serverless function invocations
  - Automatic HTTPS
  - Preview deployments

- **Pro ($20/month)**:
  - For production apps
  - 1TB bandwidth
  - Unlimited serverless functions
  - Team collaboration
  - Advanced analytics

**Recommendation**: Start with Hobby plan, upgrade to Pro when needed.

---

## 🔐 Security Best Practices

### Environment Variables

- ✅ Never commit `.env.local` to git
- ✅ Use `NEXT_PUBLIC_` only for safe client-side variables
- ✅ Keep `CLERK_SECRET_KEY` server-side only (no `NEXT_PUBLIC_` prefix)
- ✅ Rotate keys if compromised

### HTTPS

- ✅ Vercel provides automatic HTTPS
- ✅ All connections encrypted by default
- ✅ SSL certificates auto-renewed

### Content Security Policy

Consider adding CSP headers in `next.config.mjs`:
```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        }
      ]
    }
  ]
}
```

---

## 🔄 Rollback Deployment

### Via Vercel Dashboard

1. Go to **"Deployments"**
2. Find previous successful deployment
3. Click **"..."** > **"Promote to Production"**

### Via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

---

## 📞 Support

For issues:
- Check [Vercel Status](https://www.vercel-status.com)
- Review [Vercel Documentation](https://vercel.com/docs)
- Check deployment logs in Dashboard
- Contact Vercel Support (Pro plan)

---

## 📋 Deployment Checklist

Before going live:

- [ ] Backend deployed and healthy
- [ ] Environment variables set correctly
- [ ] Clerk domains configured
- [ ] Test all main features
- [ ] Check mobile responsiveness
- [ ] Verify API connections work
- [ ] Test authentication flow
- [ ] Monitor initial traffic
- [ ] Set up error tracking
- [ ] Configure custom domain (optional)

---

**🎉 Your frontend is now live in production!**

**Full app**: Frontend (Vercel) + Backend (Render) + Database (Supabase)

Test your complete production app at: `https://your-vercel-url.vercel.app`
