"use client"

import { Header } from "@/components/header"
import { DocumentsTable } from "@/components/documents-table"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDocuments } from "@/hooks/use-api"
import { FileText, Plus } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { data, isLoading, error } = useDocuments({ page: 1, limit: 50 })

  const documents = data?.data || []
  const hasDocuments = documents.length > 0

  // Calculate stats
  const totalDocuments = documents.length
  const pendingDocuments = documents.filter((d) => d.status === "PENDING").length
  const approvedDocuments = documents.filter((d) => d.status === "APPROVED").length
  const totalAmount = documents.reduce((sum, d) => sum + parseFloat(d.totalAmount), 0)

  if (isLoading) {
    return (
      <div>
        <Header title="לוח בקרה" />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Header title="לוח בקרה" />
        <div className="p-6">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            שגיאה בטעינת נתונים: {error.message}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="לוח בקרה" />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-1">סה״כ חשבוניות</p>
            <p className="text-3xl font-bold text-foreground">{totalDocuments}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-1">ממתינות לאישור</p>
            <p className="text-3xl font-bold text-yellow-600">{pendingDocuments}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-1">אושרו</p>
            <p className="text-3xl font-bold text-green-600">{approvedDocuments}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-1">סכום כולל</p>
            <p className="text-3xl font-bold text-foreground">
              ₪{totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {hasDocuments ? (
          <>
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">החשבוניות שלי</h3>
              <Link href="/upload">
                <Button>
                  <Plus className="w-4 h-4 ml-2" />
                  העלה מסמך
                </Button>
              </Link>
            </div>

            {/* Documents Table */}
            <DocumentsTable documents={documents} />
          </>
        ) : (
          <EmptyState
            icon={FileText}
            title="אין עדיין חשבוניות במערכת"
            description="התחל להעלות חשבוניות כדי לעקוב אחר ההוצאות שלך"
            actionLabel="העלה מסמך"
            onAction={() => (window.location.href = "/upload")}
          />
        )}
      </div>
    </div>
  )
}
