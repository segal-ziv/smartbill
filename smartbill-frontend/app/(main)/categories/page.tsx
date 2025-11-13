"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Plus, Pencil, Trash2, Tag } from "lucide-react"
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-api"
import { EmptyState } from "@/components/empty-state"
import type { Category } from "@/lib/api-types"

const COLOR_OPTIONS = [
  { value: "#ef4444", label: "אדום" },
  { value: "#f97316", label: "כתום" },
  { value: "#eab308", label: "צהוב" },
  { value: "#22c55e", label: "ירוק" },
  { value: "#3b82f6", label: "כחול" },
  { value: "#a855f7", label: "סגול" },
  { value: "#ec4899", label: "ורוד" },
  { value: "#64748b", label: "אפור" },
]

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories()
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory()
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory()
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    color: "#3b82f6",
    icon: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      color: "#3b82f6",
      icon: "",
    })
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createCategory(formData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false)
        resetForm()
      },
    })
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      color: category.color || "#3b82f6",
      icon: category.icon || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    updateCategory(
      { id: editingCategory.id, input: formData },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false)
          setEditingCategory(null)
          resetForm()
        },
      }
    )
  }

  const handleDelete = (id: string) => {
    deleteCategory(id)
  }

  if (isLoading) {
    return (
      <div>
        <Header title="קטגוריות" />
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="קטגוריות" />

      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">רשימת קטגוריות</h2>
            <p className="text-muted-foreground">סדר את החשבוניות לפי קטגוריות</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 ml-2" />
                הוסף קטגוריה
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>קטגוריה חדשה</DialogTitle>
                <DialogDescription>הוסף קטגוריה חדשה למערכת</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">שם הקטגוריה *</Label>
                  <Input
                    id="create-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="לדוגמה: משרד"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-color">צבע</Label>
                  <div className="flex gap-2 flex-wrap">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`w-10 h-10 rounded-full border-2 ${
                          formData.color === color.value ? 'border-foreground' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-icon">אייקון (emoji)</Label>
                  <Input
                    id="create-icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="📁"
                    maxLength={2}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "יוצר..." : "צור קטגוריה"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-white text-2xl"
                      style={{ backgroundColor: category.color || "#3b82f6" }}
                    >
                      {category.icon || <Tag className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={isDeleting}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                          <AlertDialogDescription>
                            פעולה זו תמחק את הקטגוריה לצמיתות. לא ניתן לבטל פעולה זו.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ביטול</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(category.id)}>
                            מחק
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">מספר מסמכים</p>
                    <p className="text-2xl font-bold">{category.totalDocuments || 0}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Tag}
            title="אין עדיין קטגוריות במערכת"
            description="התחל להוסיף קטגוריות כדי לסדר את החשבוניות שלך"
            actionLabel="הוסף קטגוריה ראשונה"
            onAction={() => setIsCreateDialogOpen(true)}
          />
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>עריכת קטגוריה</DialogTitle>
              <DialogDescription>ערוך את פרטי הקטגוריה</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">שם הקטגוריה *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-color">צבע</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-10 h-10 rounded-full border-2 ${
                        formData.color === color.value ? 'border-foreground' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-icon">אייקון (emoji)</Label>
                <Input
                  id="edit-icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  maxLength={2}
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "מעדכן..." : "עדכן קטגוריה"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
