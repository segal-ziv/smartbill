# SmartBill - Smart Invoice Management System

מערכת ניהול חשבוניות חכמה לעוסקים בישראל עם OCR אוטומטי, קליטה מרובת ערוצים וניהול מתקדם.

## 🏗 Architecture

```
SmartBill/
├── smartbill-backend/    # Node.js + Express API + Workers
└── smartbill-frontend/   # Next.js 14 (App Router) + React 19
```

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js v22+
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Queue**: BullMQ + Redis
- **Storage**: Supabase Storage
- **OCR**: Google Vision API
- **Auth**: Clerk
- **Deployment**: Render

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 19 + Tailwind CSS + shadcn/ui
- **State**: React Query (TanStack Query)
- **Auth**: Clerk
- **Deployment**: Vercel

## ✨ Features

- ✅ OCR אוטומטי לחשבוניות (Google Vision)
- ✅ העלאת מסמכים (PDF, JPG, PNG)
- ✅ קליטה אוטומטית מ-Gmail, IMAP, WhatsApp
- ✅ ניהול ספקים וקטגוריות
- ✅ ייצוא לאקסל
- ✅ Authentication מלא (Clerk)
- ✅ RTL Support (Hebrew)
- ✅ Responsive Design

## 📦 Prerequisites

- Node.js 22+ (recommended: use `nvm`)
- pnpm (recommended) or npm
- PostgreSQL database (Supabase recommended)
- Redis (Upstash recommended for production)
- Google Cloud account (for OCR)
- Clerk account (for authentication)

## 🛠 Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/smartbill.git
cd smartbill
```

### 2. Backend Setup

```bash
cd smartbill-backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
# See smartbill-backend/.env.example for all required variables

# Generate Prisma Client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Seed database with sample data
npm run db:seed

# Start development server
npm run dev

# In separate terminals, start workers:
npm run worker:ocr
npm run worker:ingestion
npm run worker:export
```

### 3. Frontend Setup

```bash
cd smartbill-frontend

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your credentials
# See smartbill-frontend/.env.example for required variables

# Start development server
pnpm dev
```

## 🚀 Production Deployment

### Backend (Render)

1. **Create Render Account**: https://render.com
2. **Create New Blueprint** from `smartbill-backend/render.yaml`
3. **Set Environment Variables** in Render Dashboard
4. **Deploy** - Render will automatically:
   - Build the app
   - Run migrations
   - Start API server
   - Start worker processes

See [smartbill-backend/DEPLOYMENT.md](smartbill-backend/DEPLOYMENT.md) for detailed instructions.

### Frontend (Vercel)

1. **Create Vercel Account**: https://vercel.com
2. **Import Project** from GitHub
3. **Configure**:
   - Root Directory: `smartbill-frontend`
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
4. **Set Environment Variables** in Vercel Dashboard
5. **Deploy**

See [smartbill-frontend/DEPLOYMENT.md](smartbill-frontend/DEPLOYMENT.md) for detailed instructions.

## 📚 Project Structure

### Backend

```
smartbill-backend/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts            # Sample data
├── src/
│   ├── api/               # API routes
│   ├── services/          # Business logic
│   ├── queues/            # BullMQ queues & workers
│   ├── lib/               # Utilities
│   ├── types/             # TypeScript types
│   └── index.ts           # Entry point
├── .env.example           # Environment variables template
├── render.yaml            # Render deployment config
└── package.json
```

### Frontend

```
smartbill-frontend/
├── app/
│   ├── (main)/            # Protected routes
│   │   ├── dashboard/
│   │   ├── upload/
│   │   ├── documents/
│   │   ├── suppliers/
│   │   ├── categories/
│   │   ├── settings/
│   │   └── export/
│   ├── layout.tsx
│   └── page.tsx
├── components/            # React components
├── hooks/                 # Custom hooks (React Query)
├── lib/                   # Utilities & API client
├── .env.example          # Environment variables template
└── package.json
```

## 🔐 Environment Variables

See:
- [smartbill-backend/.env.example](smartbill-backend/.env.example)
- [smartbill-frontend/.env.example](smartbill-frontend/.env.example)

## 📖 API Documentation

The backend provides the following endpoints:

- `GET  /api/auth/me` - Get current user
- `GET  /api/documents` - List documents
- `POST /api/documents` - Upload document
- `GET  /api/documents/:id` - Get document details
- `PATCH /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `GET  /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `GET  /api/categories` - List categories
- `POST /api/categories` - Create category
- `GET  /api/settings` - Get settings
- `PATCH /api/settings` - Update settings
- `GET  /api/export` - Export to Excel

Full API documentation: [smartbill-backend/README.md](smartbill-backend/README.md)

## 🧪 Testing

### Backend
```bash
cd smartbill-backend
npm test
```

### Frontend
```bash
cd smartbill-frontend
pnpm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary and confidential.

## 🙏 Credits

Built with ❤️ for Israeli businesses.

- **Backend**: Node.js, Express, Prisma, BullMQ
- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **OCR**: Google Cloud Vision
- **Auth**: Clerk
- **Deployment**: Vercel + Render

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**SmartBill** - ניהול חשבוניות חכם לעוסקים בישראל 🇮🇱
