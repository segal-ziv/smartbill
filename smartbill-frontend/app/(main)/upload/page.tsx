"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Mail, MessageSquare, Copy, Check, Upload, FileText } from "lucide-react"
import { useCreateDocument, useSuppliers, useCategories, useSettings } from "@/hooks/use-api"
import { Loader } from "@/components/loader"

export default function UploadPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    issueDate: new Date().toISOString().split('T')[0],
    totalAmount: "",
    supplierId: "",
    categoryId: "",
  })

  const { mutate: createDocument, isPending } = useCreateDocument()
  const { data: suppliers } = useSuppliers()
  const { data: categories } = useCategories()
  const { data: settings } = useSettings()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile || !formData.totalAmount) {
      return
    }

    createDocument(
      {
        file: selectedFile,
        issueDate: formData.issueDate,
        totalAmount: parseFloat(formData.totalAmount),
        supplierId: formData.supplierId || undefined,
        categoryId: formData.categoryId || undefined,
      },
      {
        onSuccess: () => {
          router.push('/dashboard')
        },
      }
    )
  }

  return (
    <div>
      <Header title="העלאת מסמכים" />

      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">בחר שיטת העלאה</h2>
          <p className="text-muted-foreground">העלה חשבוניות בשלוש דרכים שונות - בחר את הדרך הנוחה לך ביותר</p>
        </div>

        {/* Direct Upload Form */}
        <Card className="p-6 mb-6 border-2 border-primary">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">העלאה ישירה</h3>
                <p className="text-sm text-muted-foreground">העלה קובץ ישירות מהמחשב</p>
              </div>
            </div>
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
              מומלץ
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Input */}
            <div className="space-y-2">
              <Label htmlFor="file">קובץ</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2 text-foreground">
                      <FileText className="w-5 h-5" />
                      <span className="font-medium">{selectedFile.name}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        לחץ לבחירת קובץ או גרור ושחרר כאן
                      </p>
                      <p className="text-xs text-muted-foreground">PDF, JPG, PNG עד 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Issue Date */}
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

              {/* Total Amount */}
              <div className="space-y-2">
                <Label htmlFor="totalAmount">סכום כולל (₪)</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  required
                />
              </div>

              {/* Supplier */}
              <div className="space-y-2">
                <Label htmlFor="supplier">ספק (אופציונלי)</Label>
                <Select
                  value={formData.supplierId}
                  onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                >
                  <SelectTrigger>
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

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">קטגוריה (אופציונלי)</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
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
            </div>

            <Button type="submit" className="w-full" disabled={!selectedFile || isPending}>
              {isPending ? <Loader className="w-4 h-4" /> : "העלה מסמך"}
            </Button>
          </form>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gmail Integration */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col h-full">
              <div className="rounded-full bg-blue-100 w-14 h-14 flex items-center justify-center mb-4">
                <Mail className="w-7 h-7 text-blue-600" />
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2">חיבור Gmail</h3>

              <p className="text-sm text-muted-foreground mb-6 flex-1">
                חבר את חשבון Gmail שלך כדי לייבא חשבוניות אוטומטית מהדואר האלקטרוני שלך
              </p>

              <Button className="w-full" disabled>
                חיבור לחשבון Gmail
              </Button>

              <p className="text-xs text-muted-foreground mt-3 text-center">בקרוב - לא זמין כרגע</p>
            </div>
          </Card>

          {/* WhatsApp Bot */}
          <Card className="p-6 hover:shadow-lg transition-shadow border-2 border-primary">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="rounded-full bg-green-100 w-14 h-14 flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 text-green-600" />
                </div>
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                  מומלץ
                </span>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2">בוט WhatsApp</h3>

              <p className="text-sm text-muted-foreground mb-4 flex-1">
                צלם את החשבונית ושלח לבוט ה-WhatsApp שלנו. החשבונית תיקלט אוטומטית במערכת
              </p>

              <div className="bg-muted rounded-lg p-4 mb-4">
                <p className="text-xs text-muted-foreground mb-2">מספר הבוט:</p>
                <p className="text-lg font-bold text-foreground direction-ltr text-left">+972-50-123-4567</p>
              </div>

              <Button className="w-full">פתח WhatsApp</Button>
            </div>
          </Card>

          {/* Email Address */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col h-full">
              <div className="rounded-full bg-purple-100 w-14 h-14 flex items-center justify-center mb-4">
                <Mail className="w-7 h-7 text-purple-600" />
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2">כתובת דוא״ל ייעודית</h3>

              <p className="text-sm text-muted-foreground mb-4 flex-1">
                העבר חשבוניות לכתובת הדוא״ל האישית שלך והן יתווספו אוטומטית למערכת
              </p>

              <div className="bg-muted rounded-lg p-4 mb-4">
                <p className="text-xs text-muted-foreground mb-2">כתובת הדוא״ל שלך:</p>
                <p className="text-sm font-mono text-foreground break-all">{settings?.email || "לא הוגדר"}</p>
              </div>

              <Button variant="outline" className="w-full bg-transparent">
                <Copy className="w-4 h-4 ml-2" />
                העתק כתובת
              </Button>
            </div>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8 p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-foreground mb-4">💡 טיפים לשימוש</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>וודא שהחשבונית ברורה וקריאה לפני ההעלאה</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>ניתן להעלות מספר קבצים בבת אחת דרך WhatsApp או דוא״ל</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>פורמטים נתמכים: PDF, JPG, PNG</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>המערכת תזהה אוטומטית את פרטי החשבונית ותאפשר לך לערוך אותם</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
