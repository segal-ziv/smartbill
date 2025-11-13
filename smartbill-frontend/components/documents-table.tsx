"use client"

import Link from "next/link"
import type { Document } from "@/lib/api-types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface DocumentsTableProps {
  documents: Document[]
}

const statusColors = {
  DRAFT: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  APPROVED: "bg-green-100 text-green-800 hover:bg-green-100",
  REJECTED: "bg-red-100 text-red-800 hover:bg-red-100",
}

const statusLabels = {
  DRAFT: "טיוטה",
  PENDING: "ממתין",
  APPROVED: "אושר",
  REJECTED: "נדחה",
}

const ocrStatusColors = {
  PENDING: "bg-gray-100 text-gray-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
}

const ocrStatusLabels = {
  PENDING: "ממתין לעיבוד",
  PROCESSING: "מעבד",
  COMPLETED: "הושלם",
  FAILED: "נכשל",
}

export function DocumentsTable({ documents }: DocumentsTableProps) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-right px-6 py-3 text-sm font-semibold text-foreground">ספק</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-foreground">תאריך</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-foreground">סכום כולל</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-foreground">קטגוריה</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-foreground">OCR</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-foreground">סטטוס</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-foreground">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  {doc.supplier?.name || "לא משויך"}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {new Date(doc.issueDate).toLocaleDateString("he-IL")}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-foreground">
                  ₪{parseFloat(doc.totalAmount).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {doc.category?.name || "לא משויך"}
                </td>
                <td className="px-6 py-4">
                  <Badge variant="secondary" className={cn(ocrStatusColors[doc.ocrStatus])}>
                    {ocrStatusLabels[doc.ocrStatus]}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="secondary" className={cn(statusColors[doc.status])}>
                    {statusLabels[doc.status]}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/documents/${doc.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 ml-2" />
                      צפייה
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
