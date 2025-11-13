"use client"

import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  DocumentsQueryParams,
  CreateDocumentInput,
  UpdateDocumentInput,
  CreateSupplierInput,
  UpdateSupplierInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  UpdateSettingsInput,
  ExportQueryParams,
} from '@/lib/api-types'
import { toast } from 'sonner'

// Initialize API client with Clerk token
export function useApiAuth() {
  const { getToken } = useAuth()

  useEffect(() => {
    apiClient.setTokenGetter(getToken)
  }, [getToken])
}

// Documents
export function useDocuments(params?: DocumentsQueryParams) {
  useApiAuth()
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => apiClient.getDocuments(params),
  })
}

export function useDocument(id: string) {
  useApiAuth()
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => apiClient.getDocument(id),
    enabled: !!id,
  })
}

export function useCreateDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateDocumentInput) => apiClient.createDocument(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('המסמך הועלה בהצלחה והתחיל בעיבוד OCR')
    },
    onError: (error: Error) => {
      toast.error(`שגיאה בהעלאת מסמך: ${error.message}`)
    },
  })
}

export function useUpdateDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDocumentInput }) =>
      apiClient.updateDocument(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['documents', data.id] })
      toast.success('המסמך עודכן בהצלחה')
    },
    onError: (error: Error) => {
      toast.error(`שגיאה בעדכון מסמך: ${error.message}`)
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('המסמך נמחק בהצלחה')
    },
    onError: (error: Error) => {
      toast.error(`שגיאה במחיקת מסמך: ${error.message}`)
    },
  })
}

// Suppliers
export function useSuppliers() {
  useApiAuth()
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => apiClient.getSuppliers(),
  })
}

export function useSupplier(id: string) {
  useApiAuth()
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => apiClient.getSupplier(id),
    enabled: !!id,
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateSupplierInput) => apiClient.createSupplier(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('הספק נוצר בהצלחה')
    },
    onError: (error: Error) => {
      toast.error(`שגיאה ביצירת ספק: ${error.message}`)
    },
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSupplierInput }) =>
      apiClient.updateSupplier(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      queryClient.invalidateQueries({ queryKey: ['suppliers', data.id] })
      toast.success('הספק עודכן בהצלחה')
    },
    onError: (error: Error) => {
      toast.error(`שגיאה בעדכון ספק: ${error.message}`)
    },
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('הספק נמחק בהצלחה')
    },
    onError: (error: Error) => {
      toast.error(`שגיאה במחיקת ספק: ${error.message}`)
    },
  })
}

// Categories
export function useCategories() {
  useApiAuth()
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  })
}

export function useCategory(id: string) {
  useApiAuth()
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => apiClient.getCategory(id),
    enabled: !!id,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => apiClient.createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('הקטגוריה נוצרה בהצלחה')
    },
    onError: (error: Error) => {
      toast.error(`שגיאה ביצירת קטגוריה: ${error.message}`)
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      apiClient.updateCategory(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories', data.id] })
      toast.success('הקטגוריה עודכנה בהצלחה')
    },
    onError: (error: Error) => {
      toast.error(`שגיאה בעדכון קטגוריה: ${error.message}`)
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('הקטגוריה נמחקה בהצלחה')
    },
    onError: (error: Error) => {
      toast.error(`שגיאה במחיקת קטגוריה: ${error.message}`)
    },
  })
}

// Settings
export function useSettings() {
  useApiAuth()
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => apiClient.getSettings(),
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateSettingsInput) => apiClient.updateSettings(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('ההגדרות עודכנו בהצלחה')
    },
    onError: (error: Error) => {
      toast.error(`שגיאה בעדכון הגדרות: ${error.message}`)
    },
  })
}

// Export
export function useExport() {
  return useMutation({
    mutationFn: (params: ExportQueryParams) => apiClient.exportDocuments(params),
    onSuccess: (data) => {
      toast.success(`נוצר קובץ ייצוא עם ${data.recordCount} רשומות`)
      // Download the file
      window.open(data.fileUrl, '_blank')
    },
    onError: (error: Error) => {
      toast.error(`שגיאה בייצוא: ${error.message}`)
    },
  })
}

// User
export function useMe() {
  useApiAuth()
  return useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.getMe(),
  })
}
