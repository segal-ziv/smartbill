"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { Plus, Pencil, Trash2, Building2 } from "lucide-react"
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from "@/hooks/use-api"
import { EmptyState } from "@/components/empty-state"
import type { Supplier } from "@/lib/api-types"

export default function SuppliersPage() {
  const { data: suppliers, isLoading } = useSuppliers()
  const { mutate: createSupplier, isPending: isCreating } = useCreateSupplier()
  const { mutate: updateSupplier, isPending: isUpdating } = useUpdateSupplier()
  const { mutate: deleteSupplier, isPending: isDeleting } = useDeleteSupplier()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    taxId: "",
    email: "",
    phone: "",
    address: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      taxId: "",
      email: "",
      phone: "",
      address: "",
    })
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createSupplier(formData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false)
        resetForm()
      },
    })
  }

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      taxId: supplier.taxId || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSupplier) return

    updateSupplier(
      { id: editingSupplier.id, input: formData },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false)
          setEditingSupplier(null)
          resetForm()
        },
      }
    )
  }

  const handleDelete = (id: string) => {
    deleteSupplier(id)
  }

  if (isLoading) {
    return (
      <div>
        <Header title="ספקים" />
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
      <Header title="ספקים" />

      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">רשימת ספקים</h2>
            <p className="text-muted-foreground">נהל את הספקים שלך</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 ml-2" />
                הוסף ספק
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ספק חדש</DialogTitle>
                <DialogDescription>הוסף ספק חדש למערכת</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">שם הספק *</Label>
                  <Input
                    id="create-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="לדוגמה: חברת החשמל"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-taxId">ח.פ / ע.מ</Label>
                  <Input
                    id="create-taxId"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="123456789"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-email">אימייל</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="supplier@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-phone">טלפון</Label>
                  <Input
                    id="create-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="03-1234567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-address">כתובת</Label>
                  <Input
                    id="create-address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="רחוב 1, תל אביב"
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "יוצר..." : "צור ספק"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {suppliers && suppliers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map((supplier) => (
              <Card key={supplier.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{supplier.name}</h3>
                      {supplier.taxId && (
                        <p className="text-sm text-muted-foreground">ח.פ: {supplier.taxId}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(supplier)}
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
                            פעולה זו תמחק את הספק לצמיתות. לא ניתן לבטל פעולה זו.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ביטול</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(supplier.id)}>
                            מחק
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {supplier.email && (
                    <p className="text-muted-foreground">📧 {supplier.email}</p>
                  )}
                  {supplier.phone && (
                    <p className="text-muted-foreground">📞 {supplier.phone}</p>
                  )}
                  {supplier.address && (
                    <p className="text-muted-foreground">📍 {supplier.address}</p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t flex gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">מסמכים</p>
                    <p className="text-lg font-bold">{supplier.totalDocuments || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">סה״כ סכום</p>
                    <p className="text-lg font-bold">
                      ₪{parseFloat(supplier.totalAmount || "0").toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Building2}
            title="אין עדיין ספקים במערכת"
            description="התחל להוסיף ספקים כדי לנהל את החשבוניות שלך ביעילות"
            actionLabel="הוסף ספק ראשון"
            onAction={() => setIsCreateDialogOpen(true)}
          />
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>עריכת ספק</DialogTitle>
              <DialogDescription>ערוך את פרטי הספק</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">שם הספק *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-taxId">ח.פ / ע.מ</Label>
                <Input
                  id="edit-taxId"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">אימייל</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">טלפון</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-address">כתובת</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "מעדכן..." : "עדכן ספק"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
