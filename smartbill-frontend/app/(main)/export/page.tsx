"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download, FileSpreadsheet, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { useExport, useDocuments, useSuppliers, useCategories } from "@/hooks/use-api"
import type { DocumentStatus } from "@/lib/api-types"
import { Loader } from "@/components/loader"

const statusColors = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
}

const statusLabels = {
  DRAFT: "טיוטה",
  PENDING: "ממתין",
  APPROVED: "אושר",
  REJECTED: "נדחה",
}

export default function ExportPage() {
  const { mutate: exportDocuments, isPending } = useExport()
  const { data: suppliers } = useSuppliers()
  const { data: categories } = useCategories()

  // Default to current month
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0]
  const lastDay = today.toISOString().split("T")[0]

  const [formData, setFormData] = useState({
    from: firstDay,
    to: lastDay,
    supplierId: "",
    categoryId: "",
    status: "" as DocumentStatus | "",
  })

  // Fetch preview documents
  const { data: previewData } = useDocuments({
    from: formData.from,
    to: formData.to,
    supplierId: formData.supplierId || undefined,
    categoryId: formData.categoryId || undefined,
    status: (formData.status as DocumentStatus) || undefined,
  })

  const documents = previewData?.data || []

  const handleExport = () => {
    const params: any = {
      from: formData.from,
      to: formData.to,
    }

    if (formData.supplierId) params.supplierId = formData.supplierId
    if (formData.categoryId) params.categoryId = formData.categoryId
    if (formData.status) params.status = formData.status

    exportDocuments(params)
  }

  return (
    <div>
      <Header title="ייצוא לרואה חשבון" />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Export Settings */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">בחירת טווח ופילטרים</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from">מתאריך</Label>
              <div className="relative">
                <Input
                  id="from"
                  type="date"
                  value={formData.from}
                  onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">עד תאריך</Label>
              <div className="relative">
                <Input
                  id="to"
                  type="date"
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">ספק (אופציונלי)</Label>
              <Select
                value={formData.supplierId}
                onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
              >
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="כל הספקים" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">כל הספקים</SelectItem>
                  {suppliers?.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">קטגוריה (אופציונלי)</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="כל הקטגוריות" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">כל הקטגוריות</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">סטטוס (אופציונלי)</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="כל הסטטוסים" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">כל הסטטוסים</SelectItem>
                  <SelectItem value="DRAFT">טיוטה</SelectItem>
                  <SelectItem value="PENDING">ממתין</SelectItem>
                  <SelectItem value="APPROVED">אושר</SelectItem>
                  <SelectItem value="REJECTED">נדחה</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Export Actions */}
        <div className="mb-6">
          <Button size="lg" className="w-full" onClick={handleExport} disabled={isPending}>
            {isPending ? (
              <Loader className="w-5 h-5 ml-2" />
            ) : (
              <FileSpreadsheet className="w-5 h-5 ml-2" />
            )}
            {isPending ? "מייצא..." : "ייצוא Excel"}
          </Button>
        </div>

        {/* Preview Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">תצוגה מקדימה</h3>
            <p className="text-sm text-muted-foreground">{documents.length} מסמכים נבחרו</p>
          </div>

          {documents.length > 0 ? (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">
                        מספר חשבונית
                      </th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">ספק</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">תאריך</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">סכום</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">מע״מ</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">
                        קטגוריה
                      </th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">
                        סטטוס
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {doc.invoiceNumber || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          {doc.supplier?.name || "לא משויך"}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(doc.issueDate).toLocaleDateString("he-IL")}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-foreground">
                          ₪{parseFloat(doc.totalAmount).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          ₪{doc.vatAmount ? parseFloat(doc.vatAmount).toFixed(2) : "0.00"}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {doc.category?.name || "לא משויך"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className={cn(statusColors[doc.status], "text-xs")}
                          >
                            {statusLabels[doc.status]}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="border-t p-4 bg-muted/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">סה״כ</span>
                  <span className="text-lg font-bold">
                    ₪
                    {documents
                      .reduce((sum, doc) => sum + parseFloat(doc.totalAmount), 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>אין מסמכים בטווח התאריכים שנבחר</p>
            </div>
          )}
        </Card>

        {/* Info Card */}
        <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-foreground mb-2">ℹ️ מידע על הייצוא</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• קובץ Excel יכלול טבלה מסודרת עם כל הפרטים הרלוונטיים</li>
            <li>• הייצוא כולל רק חשבוניות בטווח התאריכים שנבחר</li>
            <li>• ניתן לסנן לפי ספק, קטגוריה וסטטוס</li>
            <li>• הקובץ יורד אוטומטית לאחר היצירה</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
