# SmartBill Backend

Backend מלא עבור מערכת ניהול חשבוניות ומסמכים עם OCR אוטומטי.

## Tech Stack

- **Runtime**: Node.js (v22+)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase/Neon)
- **ORM**: Prisma
- **Queue**: BullMQ + Redis
- **Storage**: S3 / Supabase Storage
- **OCR**: Google Vision API / AWS Textract
- **Auth**: Clerk

## Project Structure

```
smartbill-backend/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts             # Database seeding
├── src/
│   ├── lib/
│   │   ├── prisma.ts       # Prisma client singleton
│   │   ├── storage.ts      # S3/Supabase storage
│   │   ├── redis.ts        # Redis client
│   │   └── auth.ts         # Clerk middleware
│   ├── services/
│   │   ├── ocr/
│   │   │   ├── googleVision.ts
│   │   │   └── awsTextract.ts
│   │   ├── ingestion/
│   │   │   ├── gmail.ts
│   │   │   ├── imap.ts
│   │   │   └── whatsapp.ts
│   │   └── export/
│   │       ├── excel.ts
│   │       └── zip.ts
│   ├── queues/
│   │   ├── ocrQueue.ts
│   │   ├── ingestionQueue.ts
│   │   ├── exportQueue.ts
│   │   └── workers/
│   │       ├── ocrWorker.ts
│   │       ├── ingestionWorker.ts
│   │       └── exportWorker.ts
│   ├── api/ (או routes/)
│   │   ├── documents/
│   │   ├── suppliers/
│   │   ├── categories/
│   │   ├── settings/
│   │   └── export/
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── validation.ts
│   │   ├── encryption.ts
│   │   └── errors.ts
│   └── index.ts            # Entry point
├── .env.example
├── tsconfig.json
├── package.json
├── ERD.md                  # Database ERD
└── README.md
```

## Setup

### 1. Clone & Install
```bash
cd smartbill-backend
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env
# עדכן את כל המשתנים הדרושים
```

### 3. Database Setup
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed database
npm run db:seed
```

### 4. Start Development
```bash
# Start API server
npm run dev

# Start workers (in separate terminals)
npm run worker:ocr
npm run worker:ingestion
npm run worker:export
```

## Database Schema

ראה [ERD.md](./ERD.md) לתיעוד מלא של מבנה מסד הנתונים.

### Core Tables
- **User** - משתמשים
- **Document** - חשבוניות ומסמכים
- **Supplier** - ספקים
- **Category** - קטגוריות
- **BusinessSettings** - הגדרות עסקיות
- **AuditLog** - לוג פעולות

## API Endpoints

All endpoints require authentication via Clerk. Include the auth token in the request headers.

### Authentication

#### `GET /api/auth/me`
Get current user information.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "clerkId": "clerk_user_id",
    "businessName": "My Business",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Documents

#### `GET /api/documents`
List documents with filters and pagination.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `sortBy` (string, default: "createdAt")
- `sortOrder` ("asc" | "desc", default: "desc")
- `supplierId` (uuid, optional)
- `categoryId` (uuid, optional)
- `status` ("DRAFT" | "PENDING" | "APPROVED" | "REJECTED", optional)
- `ocrStatus` ("PENDING" | "PROCESSING" | "COMPLETED" | "FAILED", optional)
- `from` (datetime, optional)
- `to` (datetime, optional)
- `search` (string, optional)

**Response:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### `POST /api/documents`
Upload new document.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file` (File, required)
- `issueDate` (datetime, required)
- `totalAmount` (number, required)
- `supplierId` (uuid, optional)
- `categoryId` (uuid, optional)
- `invoiceNumber` (string, optional)
- `dueDate` (datetime, optional)
- `vatAmount` (number, optional)
- `currency` (string, default: "ILS")
- `status` (string, default: "PENDING")
- `tags` (JSON array, default: [])
- `notes` (string, optional)

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "fileName": "invoice.pdf",
    "ocrStatus": "PENDING",
    ...
  }
}
```

#### `GET /api/documents/:id`
Get single document with fresh signed URL.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "fileUrl": "https://storage.../signed-url",
    "supplier": {...},
    "category": {...},
    ...
  }
}
```

#### `PATCH /api/documents/:id`
Update document fields.

**Body:**
```json
{
  "supplierId": "uuid",
  "categoryId": "uuid",
  "status": "APPROVED",
  "notes": "Updated notes",
  ...
}
```

#### `DELETE /api/documents/:id`
Delete document and associated file.

**Response:**
```json
{
  "data": {
    "success": true
  }
}
```

---

### Suppliers

#### `GET /api/suppliers`
Get all suppliers for current user.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Supplier Name",
      "email": "supplier@example.com",
      "totalDocuments": 15,
      "totalAmount": "15000.00",
      ...
    }
  ]
}
```

#### `POST /api/suppliers`
Create new supplier.

**Body:**
```json
{
  "name": "Supplier Name",
  "taxId": "123456789",
  "email": "supplier@example.com",
  "phone": "+972501234567",
  "address": "123 Main St",
  "emailDomains": ["example.com"],
  "keywords": ["keyword1", "keyword2"]
}
```

#### `GET /api/suppliers/:id`
Get single supplier.

#### `PATCH /api/suppliers/:id`
Update supplier.

#### `DELETE /api/suppliers/:id`
Delete supplier.

---

### Categories

#### `GET /api/categories`
Get all categories for current user.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Office Supplies",
      "color": "#FF5733",
      "icon": "📎",
      "totalDocuments": 25,
      ...
    }
  ]
}
```

#### `POST /api/categories`
Create new category.

**Body:**
```json
{
  "name": "Category Name",
  "color": "#FF5733",
  "icon": "📎",
  "keywords": ["keyword1", "keyword2"]
}
```

#### `GET /api/categories/:id`
Get single category.

#### `PATCH /api/categories/:id`
Update category.

#### `DELETE /api/categories/:id`
Delete category.

---

### Settings

#### `GET /api/settings`
Get user business settings.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "businessName": "My Business",
    "gmailEnabled": true,
    "ocrProvider": "GOOGLE_VISION",
    "ocrAutoProcess": true,
    ...
  }
}
```

#### `PATCH /api/settings`
Update business settings.

**Body:**
```json
{
  "businessName": "Updated Business Name",
  "gmailEnabled": true,
  "imapHost": "mail.example.com",
  "imapPort": 993,
  "imapUsername": "user@example.com",
  "imapPassword": "encrypted_password",
  "ocrProvider": "AWS_TEXTRACT",
  ...
}
```

---

### Export

#### `GET /api/export`
Export documents to Excel.

**Query Parameters:**
- `from` (datetime, required) - Start date
- `to` (datetime, required) - End date
- `supplierId` (uuid, optional)
- `categoryId` (uuid, optional)
- `status` ("DRAFT" | "PENDING" | "APPROVED" | "REJECTED", optional)

**Response:**
```json
{
  "data": {
    "fileUrl": "https://storage.../export.xlsx",
    "expiresAt": "2024-01-01T01:00:00.000Z",
    "recordCount": 50
  }
}
```

---

### Error Responses

All endpoints return consistent error responses:

```json
{
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "errors": [] // Optional validation errors
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `INTERNAL_ERROR` (500)
- `DATABASE_ERROR` (500)

## Queues & Workers

### OCR Queue
מעבד קבצים שהועלו ומחלץ מידע:
- שם ספק
- תאריך חשבונית
- סכומים (כולל, מע"מ)
- מספר חשבונית

### Ingestion Queue
מושך חשבוניות ממקורות שונים:
- Gmail API
- IMAP (ספקי דוא"ל ישראלים)
- WhatsApp Business
- Inbound Email (Mailgun/Postmark)

### Export Queue
יוצר קבצי ייצוא:
- Excel עם כל המסמכים
- ZIP עם הקבצים המקוריים
- Signed URLs להורדה

## Development Guidelines

### Code Style
- TypeScript strict mode
- קבצים קטנים (< 200 שורות)
- פונקציות קצרות וממוקדות
- JSDoc לפונקציות ציבוריות

### Error Handling
```typescript
// Always use try-catch with proper error types
try {
  // code
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    // handle DB errors
  }
  throw error;
}
```

### Testing
```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
```

## Production Deployment

### Database Migration
```bash
npm run db:migrate:prod
```

### Build & Start
```bash
npm run build
npm start
```

### Workers
צריך להריץ כל worker בנפרד (כ-process או container):
```bash
npm run worker:ocr
npm run worker:ingestion
npm run worker:export
```

## Security

- **Encryption**: כל ה-tokens והסיסמאות מוצפנים ב-DB
- **Row Level Security**: משתמשים רואים רק את המידע שלהם
- **Rate Limiting**: 100 requests per 15min per user
- **File Storage**: Private buckets + signed URLs

## Monitoring

- Prisma logging for DB queries
- Queue metrics via BullMQ
- Error tracking (Sentry recommended)

## Phase 2 Completion Status

1. ✅ ERD + Prisma Schema
2. ✅ חיבור לפרויקט DB (Supabase)
3. ✅ API Routes מלאים (Documents, Suppliers, Categories, Settings, Export)
4. ✅ Authentication (Clerk integration)
5. ✅ Service Layer (documentsService, suppliersService, etc.)
6. ✅ File Upload (Supabase Storage)
7. ✅ Queue Infrastructure (OCR, Ingestion, Export queues + workers)
8. ✅ Error Handling Layer
9. ✅ Validation (Zod schemas)
10. ✅ Encryption utilities

## Phase 3 Completion Status

1. ✅ OCR Implementation (Google Vision)
2. ✅ Ingestion Pipelines (Gmail, IMAP, WhatsApp)
3. ✅ Environment Setup (.env.example updated)
4. ✅ Database Seeding (sample data)
5. ⬜ Testing (unit + integration)
6. ⬜ חיבור ל-Frontend
7. ⬜ Deployment configuration
8. ⬜ Documentation finalization

---

## OCR Implementation

### Google Vision API

The system uses Google Cloud Vision API for text extraction from invoices and receipts.

**Setup:**
1. Create a Google Cloud project
2. Enable Vision API
3. Create a service account and download the JSON key
4. Set `GOOGLE_APPLICATION_CREDENTIALS` to the path of the JSON file

**Features:**
- Text detection from images (JPG, PNG) and PDFs
- Automatic extraction of:
  - Supplier name
  - Invoice number
  - Issue date
  - Total amount
  - VAT amount
- Supplier auto-matching based on name/keywords
- Confidence scoring

**Code:** [src/services/ocr/googleVision.ts](src/services/ocr/googleVision.ts)

---

## Ingestion Services

### Gmail Integration

Automatically pulls invoices from Gmail attachments.

**Setup:**
1. Create OAuth 2.0 credentials in Google Cloud Console
2. Configure redirect URI: `http://localhost:3000/api/auth/gmail/callback`
3. Set environment variables:
   ```bash
   GMAIL_CLIENT_ID="your-client-id"
   GMAIL_CLIENT_SECRET="your-client-secret"
   GMAIL_REDIRECT_URI="http://localhost:3000/api/auth/gmail/callback"
   ```

**Features:**
- OAuth 2.0 authentication flow
- Automatic token refresh
- Pulls messages with PDF/JPG/PNG attachments
- Supplier matching by email domain
- Configurable sync frequency

**Code:** [src/services/ingestion/gmail.ts](src/services/ingestion/gmail.ts)

### IMAP Integration

Supports Israeli email providers and custom IMAP servers.

**Setup:**
1. Configure IMAP settings in BusinessSettings:
   ```json
   {
     "imapHost": "mail.example.com",
     "imapPort": 993,
     "imapUsername": "user@example.com",
     "imapPassword": "encrypted_password"
   }
   ```

**Features:**
- Secure IMAP connection (TLS)
- Encrypted password storage
- Processes new messages with attachments
- Supplier matching by email domain

**Code:** [src/services/ingestion/imap.ts](src/services/ingestion/imap.ts)

### WhatsApp Business Integration

Receives invoice images via WhatsApp Business API webhook.

**Setup:**
1. Create a Meta Business account
2. Set up WhatsApp Business API
3. Configure webhook URL: `https://yourdomain.com/api/webhooks/whatsapp`
4. Set environment variables:
   ```bash
   WHATSAPP_ACCESS_TOKEN="your-access-token"
   WHATSAPP_VERIFY_TOKEN="your-verify-token"
   WHATSAPP_WEBHOOK_SECRET="your-webhook-secret"
   ```

**Features:**
- Webhook verification
- Signature verification for security
- Supports images and PDF documents
- Automatic media download from Meta servers

**Code:**
- Service: [src/services/ingestion/whatsapp.ts](src/services/ingestion/whatsapp.ts)
- Webhook: [src/api/webhooks/whatsapp/route.ts](src/api/webhooks/whatsapp/route.ts)

---

## Running the System

### Start All Services

```bash
# Terminal 1: Start API server
npm run dev

# Terminal 2: Start OCR worker
npm run worker:ocr

# Terminal 3: Start Ingestion worker
npm run worker:ingestion

# Terminal 4: Start Export worker
npm run worker:export
```

### Seed Database

```bash
npm run db:seed
```

This creates:
- 1 demo user
- 3 suppliers
- 4 categories
- 3 sample documents
- Business settings

**Demo User:**
- Email: `demo@smartbill.com`
- Clerk ID: `demo_clerk_id_123`

---

## Environment Variables

See [.env.example](.env.example) for all required variables.

**Critical Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to Google Cloud service account JSON
- `REDIS_URL` - Redis connection for queues
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` - File storage
- `CLERK_SECRET_KEY` - Authentication
- `ENCRYPTION_KEY` - 32-byte key for encrypting sensitive data

---

## Next Steps (Phase 4)

1. ⬜ Integration Testing
2. ⬜ Frontend Connection
3. ⬜ Production Deployment (Vercel/Railway)
4. ⬜ Monitoring & Analytics
5. ⬜ Rate Limiting Implementation
6. ⬜ AWS Textract Support (optional)
7. ⬜ Inbound Email (Mailgun/Postmark)
