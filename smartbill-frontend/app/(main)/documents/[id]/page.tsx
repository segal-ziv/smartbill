"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Save, ArrowRight, FileText, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"
import {
  useDocument,
  useUpdateDocument,
  useDeleteDocument,
  useSuppliers,
  useCategories,
} from "@/hooks/use-api"
import { Loader } from "@/components/loader"
import type { DocumentStatus } from "@/lib/api-types"

export default function DocumentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { data: document, isLoading, error } = useDocument(params.id)
  const { data: suppliers } = useSuppliers()
  const { data: categories } = useCategories()
  const { mutate: updateDocument, isPending: isUpdating } = useUpdateDocument()
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument()

  const [formData, setFormData] = useState<{
    supplierId: string
    categoryId: string
    status: DocumentStatus
    invoiceNumber: string
    issueDate: string
    totalAmount: string
    vatAmount: string
  }>({
    supplierId: "",
    categoryId: "",
    status: "PENDING",
    invoiceNumber: "",
    issueDate: "",
    totalAmount: "",
    vatAmount: "",
  })

  useEffect(() => {
    if (document) {
      setFormData({
        supplierId: document.supplierId || "",
        categoryId: document.categoryId || "",
        status: document.status,
        invoiceNumber: document.invoiceNumber || "",
        issueDate: document.issueDate.split('T')[0],
        totalAmount: document.totalAmount,
        vatAmount: document.vatAmount || "",
      })
    }
  }, [document])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateDocument({
      id: params.id,
      input: {
        supplierId: formData.supplierId || undefined,
        categoryId: formData.categoryId || undefined,
        status: formData.status,
        invoiceNumber: formData.invoiceNumber || undefined,
        issueDate: formData.issueDate,
        totalAmount: parseFloat(formData.totalAmount),
        vatAmount: formData.vatAmount ? parseFloat(formData.vatAmount) : undefined,
      },
    })
  }

  const handleDelete = () => {
    deleteDocument(params.id, {
      onSuccess: () => {
        router.push('/dashboard')
      },
    })
  }

  if (isLoading) {
    return (
      <div>
        <Header title="תיעוד חשבונית" />
        <div className="p-6 max-w-7xl mx-auto">
          <Skeleton className="h-10 w-32 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[600px]" />
            <Skeleton className="h-[600px]" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div>
        <Header title="תיעוד חשבונית" />
        <div className="p-6">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            {error?.message || "המסמך לא נמצא"}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="תיעוד חשבונית" />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Back Button & Actions */}
        <div className="flex justify-between items-center mb-4">
          <Link href="/dashboard">
            <Button variant="ghost">
              <ArrowRight className="w-4 h-4 ml-2" />
              חזרה ללוח הבקרה
            </Button>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="w-4 h-4 ml-2" />
                מחק מסמך
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                <AlertDialogDescription>
                  פעולה זו תמחק את המסמך לצמיתות. לא ניתן לבטל פעולה זו.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ביטול</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>מחק</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document Preview & OCR Data */}
          <div className="space-y-6">
            {/* PDF Preview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">תצוגת מסמך</h3>
                {document.fileUrl && (
                  <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 ml-2" />
                      פתח
                    </Button>
                  </a>
                )}
              </div>

              {document.fileUrl ? (
                <iframe
                  src={document.fileUrl}
                  className="w-full h-[400px] rounded-lg border"
                  title="Document Preview"
                />
              ) : (
                <div className="bg-muted rounded-lg aspect-[3/4] flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">אין תצוגה מקדימה זמינה</p>
                  </div>
                </div>
              )}

              <div className="mt-4 text-sm text-muted-foreground">
                <p>שם קובץ: {document.fileName}</p>
                <p>גודל: {(document.fileSize / 1024).toFixed(2)} KB</p>
              </div>
            </Card>

            {/* OCR Data */}
            {document.ocrStatus !== 'PENDING' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">נתוני OCR</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">סטטוס:</span>
                    <Badge
                      variant={
                        document.ocrStatus === 'COMPLETED'
                          ? 'default'
                          : document.ocrStatus === 'FAILED'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {document.ocrStatus === 'COMPLETED'
                        ? 'הושלם'
                        : document.ocrStatus === 'PROCESSING'
                        ? 'מעבד'
                        : 'נכשל'}
                    </Badge>
                  </div>
                  {document.ocrConfidence && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">רמת ודאות:</span>
                      <span className="text-sm font-medium">
                        {(document.ocrConfidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                  {document.ocrData && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">נתונים שזוהו:</p>
                      <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                        {JSON.stringify(document.ocrData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Edit Form */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">פרטי החשבונית</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">ספק</Label>
                <Select
                  value={formData.supplierId}
                  onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                >
                  <SelectTrigger id="supplier">
                    <SelectValue placeholder="בחר ספק" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers?.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">מספר חשבונית</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="לדוגמה: 123456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueDate">תאריך חשבונית</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">סכום כולל (₪)</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vatAmount">סכום מע״מ (₪)</Label>
                  <Input
                    id="vatAmount"
                    type="number"
                    step="0.01"
                    value={formData.vatAmount}
                    onChange={(e) => setFormData({ ...formData, vatAmount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">קטגוריה</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="בחר קטגוריה" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">סטטוס</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="בחר סטטוס" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">טיוטה</SelectItem>
                    <SelectItem value="PENDING">ממתין</SelectItem>
                    <SelectItem value="APPROVED">אושר</SelectItem>
                    <SelectItem value="REJECTED">נדחה</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="submit" className="flex-1" disabled={isUpdating}>
                  {isUpdating ? <Loader className="w-4 h-4" /> : <Save className="w-4 h-4 ml-2" />}
                  {isUpdating ? "שומר..." : "שמור שינויים"}
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    ביטול
                  </Button>
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
