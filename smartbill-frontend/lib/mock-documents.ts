import type { DocumentType, Category, UserSettings } from "./types"

export const mockDocuments: DocumentType[] = [
  {
    id: "1",
    supplier: "פז תחנת דלק",
    date: "2025-01-12",
    amount: 92.5,
    vatAmount: 13.25,
    category: "דלק",
    status: "תועד",
    invoiceNumber: "123456",
  },
  {
    id: "2",
    supplier: "בזק",
    date: "2025-01-10",
    amount: 89.0,
    vatAmount: 12.74,
    category: "תקשורת",
    status: "ממתין",
    invoiceNumber: "BZ-789",
  },
  {
    id: "3",
    supplier: "אופיס דיפו",
    date: "2025-01-08",
    amount: 245.0,
    vatAmount: 35.0,
    category: "ציוד משרדי",
    status: "מעובד",
    invoiceNumber: "OD-2025-001",
  },
  {
    id: "4",
    supplier: "רמי לוי",
    date: "2025-01-05",
    amount: 156.8,
    vatAmount: 22.4,
    category: "מזון",
    status: "תועד",
    invoiceNumber: "RL-45678",
  },
  {
    id: "5",
    supplier: "סלקום",
    date: "2025-01-03",
    amount: 79.9,
    vatAmount: 11.42,
    category: "תקשורת",
    status: "ממתין",
    invoiceNumber: "CEL-12345",
  },
]

export const mockCategories: Category[] = [
  { id: "1", name: "דלק", color: "#3b82f6" },
  { id: "2", name: "תקשורת", color: "#8b5cf6" },
  { id: "3", name: "ציוד משרדי", color: "#06b6d4" },
  { id: "4", name: "מזון", color: "#10b981" },
  { id: "5", name: "אחזקה", color: "#f59e0b" },
  { id: "6", name: "שיווק", color: "#ef4444" },
  { id: "7", name: "שכר דירה", color: "#6366f1" },
  { id: "8", name: "ביטוח", color: "#14b8a6" },
]

export const mockSettings: UserSettings = {
  businessName: "העסק שלי בע״מ",
  businessType: "מורשה",
  email: "myuser@my.mrbill.app",
}

export const mockSuppliers = [
  "פז תחנת דלק",
  "בזק",
  "אופיס דיפו",
  "רמי לוי",
  "סלקום",
  "חברת החשמל",
  "מי ירושלים",
  "גוגל",
  "מיקרוסופט",
  "אמזון",
]
