# SmartBill Backend - Production Deployment Guide

This guide will walk you through deploying the SmartBill backend to production using Render, Supabase, Upstash, and Google Cloud Vision.

## 📋 Prerequisites

Before you begin, make sure you have:
- GitHub account (for code repository)
- Render account (for backend hosting)
- Supabase account (for database and storage)
- Upstash account (for Redis)
- Google Cloud account (for OCR)
- Clerk account (for authentication)

---

## 🗄️ Step 1: Database Setup (Supabase)

### 1.1 Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `smartbill-production`
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose closest to your users
4. Wait for the project to be created (~2 minutes)

### 1.2 Get Database Connection Strings

1. Go to **Project Settings** > **Database**
2. Copy the following connection strings:

   **Connection Pooling (for DATABASE_URL)**:
   ```
   postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

   **Direct Connection (for DIRECT_URL)**:
   ```
   postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```

### 1.3 Setup Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. Click **"Create a new bucket"**
3. Bucket settings:
   - **Name**: `smartbill-documents`
   - **Public bucket**: ❌ OFF (private)
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `application/pdf`
   - **Max file size**: `10MB`
4. Click **"Create bucket"**

### 1.4 Get API Keys

1. Go to **Project Settings** > **API**
2. Copy these keys:
   - **Project URL**: `SUPABASE_URL`
   - **anon public**: `SUPABASE_ANON_KEY`
   - **service_role**: `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

---

## 🔴 Step 2: Redis Setup (Upstash)

### 2.1 Create a Redis Database

1. Go to [Upstash Console](https://console.upstash.com)
2. Click **"Create Database"**
3. Settings:
   - **Name**: `smartbill-redis`
   - **Type**: Regional (cheaper) or Global (faster)
   - **Region**: Choose same as your Render services
   - **TLS**: ✅ Enabled (required)
4. Click **"Create"**

### 2.2 Get Redis URL

1. Click on your database
2. Go to **"Details"** tab
3. Copy the **"Connection String"** (starts with `rediss://`)
   - Format: `rediss://default:[PASSWORD]@[HOST]:6379`
4. Save this as `REDIS_URL`

---

## 🔐 Step 3: Authentication Setup (Clerk)

### 3.1 Create Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click **"Create Application"**
3. Settings:
   - **Name**: `SmartBill`
   - **Sign-in methods**: Email, Google (optional)
   - **Application type**: Web application
4. Click **"Create Application"**

### 3.2 Configure Clerk

1. Go to **"API Keys"**
2. Copy:
   - **Publishable key**: `CLERK_PUBLISHABLE_KEY`
   - **Secret key**: `CLERK_SECRET_KEY`
3. Go to **"Paths"**:
   - **Sign-in URL**: `/sign-in`
   - **Sign-up URL**: `/sign-up`
   - **After sign-in**: `/dashboard`
   - **After sign-up**: `/dashboard`

---

## 👁️ Step 4: OCR Setup (Google Cloud Vision)

### 4.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Select a project"** > **"New Project"**
3. **Project name**: `smartbill-ocr`
4. Click **"Create"**

### 4.2 Enable Cloud Vision API

1. Go to **"APIs & Services"** > **"Library"**
2. Search for **"Cloud Vision API"**
3. Click **"Enable"**

### 4.3 Create Service Account

1. Go to **"IAM & Admin"** > **"Service Accounts"**
2. Click **"Create Service Account"**
3. Settings:
   - **Name**: `smartbill-ocr-service`
   - **Role**: `Cloud Vision AI > Cloud Vision AI Service Agent`
4. Click **"Done"**

### 4.4 Generate JSON Key

1. Click on the created service account
2. Go to **"Keys"** tab
3. Click **"Add Key"** > **"Create new key"**
4. Choose **JSON** format
5. Download the JSON file
6. **Important**: For Render deployment, you'll need to convert this to a single-line JSON string:
   ```bash
   cat service-account-key.json | jq -c '.'
   ```
7. Save the output as `GOOGLE_APPLICATION_CREDENTIALS_JSON`

---

## 🚀 Step 5: Backend Deployment (Render)

### 5.1 Push Code to GitHub

1. Initialize git repository (if not already done):
   ```bash
   cd /path/to/SmartBill
   git init
   git add .
   git commit -m "Initial commit - SmartBill v1.0"
   ```

2. Create GitHub repository:
   - Go to [GitHub](https://github.com/new)
   - Create a **private** repository named `smartbill`

3. Push code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/smartbill.git
   git branch -M main
   git push -u origin main
   ```

### 5.2 Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** > **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `smartbill-backend/render.yaml`
5. Click **"Apply"**

### 5.3 Configure Environment Variables

Render will create 4 services:
- `smartbill-api` (web service)
- `smartbill-worker-ocr` (background worker)
- `smartbill-worker-ingestion` (background worker)
- `smartbill-worker-export` (background worker)

**Set these environment variables for ALL services**:

1. Go to each service > **"Environment"**
2. Add the following variables:

   ```bash
   # Database (from Step 1)
   DATABASE_URL=postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres

   # Redis (from Step 2)
   REDIS_URL=rediss://default:[PASSWORD]@[HOST]:6379

   # Supabase Storage (from Step 1)
   SUPABASE_URL=https://[PROJECT-ID].supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Clerk Auth (from Step 3)
   CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY
   CLERK_SECRET_KEY=sk_live_YOUR_KEY

   # Google Cloud Vision (from Step 4)
   GOOGLE_CLOUD_PROJECT_ID=smartbill-ocr
   GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}

   # App Config (API service only)
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://smartbill.vercel.app
   ```

3. Click **"Save Changes"**

### 5.4 Verify Deployment

1. Wait for all services to deploy (~5 minutes)
2. Check logs for errors:
   - Go to each service > **"Logs"**
   - Look for "Redis connected successfully"
   - Look for "Server running on port 3001"
3. Test health endpoint:
   ```bash
   curl https://smartbill-api.onrender.com/health
   ```

---

## ✅ Step 6: Post-Deployment

### 6.1 Run Database Migrations

Migrations run automatically during deployment via `npm run db:migrate:prod`.

To verify:
1. Go to `smartbill-api` service > **"Logs"**
2. Look for Prisma migration logs

### 6.2 Test API Endpoints

```bash
# Get API URL
API_URL=https://smartbill-api.onrender.com

# Test health
curl $API_URL/health

# Test auth (should return 401 Unauthorized)
curl $API_URL/api/auth/me
```

### 6.3 Monitor Workers

1. Go to each worker service
2. Check **"Logs"** tab
3. Look for:
   - `Redis connected successfully`
   - `Worker started successfully`
   - No error messages

---

## 🔧 Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server`

**Solution**:
1. Check DATABASE_URL format
2. Ensure Supabase project is active
3. Verify password is correct (no special characters issues)

### Redis Connection Issues

**Error**: `Redis connection failed`

**Solution**:
1. Ensure REDIS_URL starts with `rediss://` (TLS)
2. Check Upstash database is active
3. Verify URL format: `rediss://default:[PASSWORD]@[HOST]:6379`

### OCR Errors

**Error**: `Google Cloud Vision authentication failed`

**Solution**:
1. Verify GOOGLE_APPLICATION_CREDENTIALS_JSON is valid JSON
2. Check service account has correct permissions
3. Ensure Cloud Vision API is enabled

### Worker Not Processing Jobs

**Solution**:
1. Check worker logs for errors
2. Verify Redis connection is working
3. Ensure all environment variables are set
4. Restart worker service

---

## 📊 Monitoring

### View Logs

```bash
# Via Render Dashboard
1. Go to service
2. Click "Logs" tab
3. Filter by error level

# Or use Render CLI
render logs -s smartbill-api
render logs -s smartbill-worker-ocr
```

### Check Service Health

```bash
# API Health
curl https://smartbill-api.onrender.com/health

# Redis Connection
# Check in service logs for "Redis connected successfully"
```

### Performance Monitoring

Consider adding:
- [Sentry](https://sentry.io) for error tracking
- [LogTail](https://logtail.com) for log aggregation
- [Uptime Robot](https://uptimerobot.com) for uptime monitoring

---

## 🔄 Updating Deployment

### Deploy New Changes

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push origin main
   ```

2. Render will automatically:
   - Detect changes
   - Build new version
   - Run migrations
   - Deploy with zero-downtime

### Rollback

1. Go to service > **"Events"**
2. Find previous successful deployment
3. Click **"Rollback to this deploy"**

---

## 💰 Cost Estimate

**Monthly costs** (as of 2024):

- **Render**: Free (Starter plan) or $7/month per service
  - 4 services = $28/month
- **Supabase**: Free (up to 500MB database, 1GB storage)
- **Upstash Redis**: Free (up to 10,000 commands/day)
- **Clerk**: Free (up to 10,000 MAU)
- **Google Cloud Vision**: $1.50 per 1,000 images

**Total**: ~$28-50/month depending on usage

---

## 📞 Support

For issues:
1. Check [Render Status](https://status.render.com)
2. Check [Supabase Status](https://status.supabase.com)
3. Review logs in Render Dashboard
4. Open an issue on GitHub

---

**🎉 Your backend is now live in production!**

Next: Deploy the frontend to Vercel (see `smartbill-frontend/DEPLOYMENT.md`)
