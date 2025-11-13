export type DocumentStatus = "ממתין" | "מעובד" | "תועד"

export type DocumentType = {
  id: string
  supplier: string
  date: string
  amount: number
  vatAmount?: number
  category: string
  status: DocumentStatus
  invoiceNumber?: string
  pdfUrl?: string
}

export type BusinessType = "פטור" | "מורשה" | "עוסק פטור"

export type UserSettings = {
  businessName: string
  businessType: BusinessType
  email: string
}

export type Category = {
  id: string
  name: string
  color?: string
}
