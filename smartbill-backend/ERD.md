# SmartBill Backend - Entity Relationship Diagram

## Core Entities

### User
**Purpose**: מנהל משתמשים ואימות
```
- id: String (PK, UUID)
- email: String (Unique)
- clerkId: String (Unique) // Integration with Clerk
- businessName: String?
- createdAt: DateTime
- updatedAt: DateTime
```

**Relations**:
- One-to-Many → Documents
- One-to-Many → Suppliers
- One-to-Many → Categories
- One-to-One → BusinessSettings
- One-to-Many → AuditLogs

---

### Document
**Purpose**: ניהול חשבוניות וקבלות
```
- id: String (PK, UUID)
- userId: String (FK)
- supplierId: String? (FK)
- categoryId: String? (FK)
-
- // Document metadata
- invoiceNumber: String?
- issueDate: DateTime
- dueDate: DateTime?
-
- // Financial data
- totalAmount: Decimal
- vatAmount: Decimal?
- currency: String (default: "ILS")
-
- // File storage
- fileUrl: String
- fileType: String (pdf|jpg|png)
- fileName: String
- fileSize: Int
-
- // OCR & Processing
- ocrStatus: OcrStatus (PENDING|PROCESSING|COMPLETED|FAILED)
- ocrData: Json? // Raw OCR response
- ocrConfidence: Float?
-
- // Ingestion tracking
- source: IngestionSource (MANUAL|GMAIL|IMAP|WHATSAPP|EMAIL)
- sourceMetadata: Json? // Original email/message data
-
- // Status & tags
- status: DocumentStatus (DRAFT|PENDING|APPROVED|REJECTED)
- tags: String[]
- notes: String?
-
- createdAt: DateTime
- updatedAt: DateTime
```

**Relations**:
- Many-to-One → User
- Many-to-One → Supplier
- Many-to-One → Category
- One-to-Many → AuditLogs

**Indexes**:
- userId
- supplierId
- categoryId
- issueDate
- status
- ocrStatus

---

### Supplier
**Purpose**: ניהול ספקים
```
- id: String (PK, UUID)
- userId: String (FK)
-
- name: String
- taxId: String? // ח.ר / ע.מ
- email: String?
- phone: String?
- address: String?
-
- // Auto-detection fields
- emailDomains: String[] // For auto-matching
- keywords: String[] // For OCR matching
-
- // Stats (computed)
- totalDocuments: Int (default: 0)
- totalAmount: Decimal (default: 0)
-
- createdAt: DateTime
- updatedAt: DateTime
```

**Relations**:
- Many-to-One → User
- One-to-Many → Documents

**Indexes**:
- userId
- name

---

### Category
**Purpose**: קטגוריזציה של חשבוניות
```
- id: String (PK, UUID)
- userId: String (FK)
-
- name: String
- color: String? // HEX color for UI
- icon: String? // Icon identifier
-
- // Auto-detection
- keywords: String[] // For auto-categorization
-
- // Stats
- totalDocuments: Int (default: 0)
-
- createdAt: DateTime
- updatedAt: DateTime
```

**Relations**:
- Many-to-One → User
- One-to-Many → Documents

**Indexes**:
- userId
- name

---

### BusinessSettings
**Purpose**: הגדרות עסקיות ואינטגרציות
```
- id: String (PK, UUID)
- userId: String (FK, Unique)
-
- // Business info
- businessName: String?
- taxId: String?
- address: String?
-
- // Gmail integration
- gmailEnabled: Boolean (default: false)
- gmailAccessToken: String? // Encrypted
- gmailRefreshToken: String? // Encrypted
- gmailTokenExpiry: DateTime?
- gmailSyncFrequency: Int? // minutes
- gmailLastSync: DateTime?
-
- // IMAP integration
- imapEnabled: Boolean (default: false)
- imapHost: String?
- imapPort: Int?
- imapUsername: String?
- imapPassword: String? // Encrypted
- imapSyncFrequency: Int?
- imapLastSync: DateTime?
-
- // WhatsApp integration
- whatsappEnabled: Boolean (default: false)
- whatsappPhoneNumber: String?
- whatsappWebhookSecret: String?
-
- // Inbound email
- inboundEmailEnabled: Boolean (default: false)
- inboundEmailAddress: String? // user-specific email
-
- // OCR settings
- ocrProvider: OcrProvider (GOOGLE_VISION|AWS_TEXTRACT)
- ocrAutoProcess: Boolean (default: true)
-
- // Export settings
- defaultExportFormat: String (default: "excel")
- includeAttachments: Boolean (default: true)
-
- createdAt: DateTime
- updatedAt: DateTime
```

**Relations**:
- One-to-One → User

**Indexes**:
- userId

---

### AuditLog
**Purpose**: מעקב אחר פעולות במערכת
```
- id: String (PK, UUID)
- userId: String (FK)
- documentId: String? (FK)
-
- action: AuditAction (CREATE|UPDATE|DELETE|EXPORT|OCR_PROCESS)
- entityType: String // Document|Supplier|Category|Settings
- entityId: String?
-
- changes: Json? // Before/after data
- metadata: Json? // Additional context
-
- ipAddress: String?
- userAgent: String?
-
- createdAt: DateTime
```

**Relations**:
- Many-to-One → User
- Many-to-One → Document (optional)

**Indexes**:
- userId
- documentId
- action
- createdAt

---

## Enums

### OcrStatus
```
PENDING      // Waiting for processing
PROCESSING   // Currently being processed
COMPLETED    // Successfully processed
FAILED       // Processing failed
```

### IngestionSource
```
MANUAL       // User uploaded manually
GMAIL        // Gmail API
IMAP         // IMAP ingestion
WHATSAPP     // WhatsApp webhook
EMAIL        // Inbound email (Mailgun/Postmark)
```

### DocumentStatus
```
DRAFT        // Not finalized
PENDING      // Awaiting review
APPROVED     // Approved by user
REJECTED     // Rejected
```

### OcrProvider
```
GOOGLE_VISION
AWS_TEXTRACT
```

### AuditAction
```
CREATE
UPDATE
DELETE
EXPORT
OCR_PROCESS
```

---

## Relationships Summary

```
User (1) ──→ (N) Documents
User (1) ──→ (N) Suppliers
User (1) ──→ (N) Categories
User (1) ──→ (1) BusinessSettings
User (1) ──→ (N) AuditLogs

Document (N) ──→ (1) User
Document (N) ──→ (1) Supplier
Document (N) ──→ (1) Category
Document (1) ──→ (N) AuditLogs

Supplier (N) ──→ (1) User
Supplier (1) ──→ (N) Documents

Category (N) ──→ (1) User
Category (1) ──→ (N) Documents

BusinessSettings (1) ──→ (1) User

AuditLog (N) ──→ (1) User
AuditLog (N) ──→ (1) Document [optional]
```

---

## Storage Strategy

### File Storage (S3/Supabase Storage)
```
/{userId}/documents/{documentId}/{fileName}
```

### Database
- PostgreSQL via Supabase/Neon
- Prisma ORM for type-safe queries

---

## Security Considerations

1. **Encryption at Rest**:
   - OAuth tokens (Gmail)
   - IMAP passwords
   - Sensitive credentials

2. **Row Level Security**:
   - All queries filtered by userId
   - Users can only access their own data

3. **File Access**:
   - Signed URLs with expiration
   - Private buckets only

4. **API Authentication**:
   - Clerk/NextAuth middleware on all routes
   - Rate limiting per user

---

## Scalability Notes

1. **Indexes**: All foreign keys + frequently queried fields
2. **Queues**: BullMQ for async processing (OCR, ingestion, export)
3. **Caching**: Redis for session data and frequent queries
4. **File Storage**: CDN for processed documents
5. **Database**: Connection pooling via Prisma
