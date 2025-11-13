import axios, { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiResponse,
  ApiError,
  Document,
  DocumentsQueryParams,
  CreateDocumentInput,
  UpdateDocumentInput,
  Supplier,
  CreateSupplierInput,
  UpdateSupplierInput,
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  BusinessSettings,
  UpdateSettingsInput,
  ExportQueryParams,
  ExportResponse,
  PaginatedResponse,
  User,
} from './api-types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ApiClient {
  private client: AxiosInstance
  private getTokenFn: (() => Promise<string | null>) | null = null

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        if (this.getTokenFn) {
          try {
            const token = await this.getTokenFn()
            if (token) {
              config.headers.Authorization = `Bearer ${token}`
            }
          } catch (error) {
            console.error('Failed to get auth token:', error)
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error.message)
        }
        throw new Error(error.message || 'An unexpected error occurred')
      }
    )
  }

  // Set the token getter function (called from hooks)
  setTokenGetter(fn: () => Promise<string | null>) {
    this.getTokenFn = fn
  }

  // Auth
  async getMe(): Promise<User> {
    const { data } = await this.client.get<ApiResponse<User>>('/api/auth/me')
    return data.data
  }

  // Documents
  async getDocuments(
    params?: DocumentsQueryParams
  ): Promise<PaginatedResponse<Document>> {
    const { data } = await this.client.get<PaginatedResponse<Document>>(
      '/api/documents',
      { params }
    )
    return data
  }

  async getDocument(id: string): Promise<Document> {
    const { data } = await this.client.get<ApiResponse<Document>>(
      `/api/documents/${id}`
    )
    return data.data
  }

  async createDocument(input: CreateDocumentInput): Promise<Document> {
    const formData = new FormData()
    formData.append('file', input.file)
    formData.append('issueDate', input.issueDate)
    formData.append('totalAmount', input.totalAmount.toString())

    if (input.supplierId) formData.append('supplierId', input.supplierId)
    if (input.categoryId) formData.append('categoryId', input.categoryId)
    if (input.invoiceNumber) formData.append('invoiceNumber', input.invoiceNumber)
    if (input.dueDate) formData.append('dueDate', input.dueDate)
    if (input.vatAmount) formData.append('vatAmount', input.vatAmount.toString())
    if (input.currency) formData.append('currency', input.currency)
    if (input.status) formData.append('status', input.status)
    if (input.tags) formData.append('tags', JSON.stringify(input.tags))
    if (input.notes) formData.append('notes', input.notes)

    const { data } = await this.client.post<ApiResponse<Document>>(
      '/api/documents',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return data.data
  }

  async updateDocument(id: string, input: UpdateDocumentInput): Promise<Document> {
    const { data } = await this.client.patch<ApiResponse<Document>>(
      `/api/documents/${id}`,
      input
    )
    return data.data
  }

  async deleteDocument(id: string): Promise<void> {
    await this.client.delete(`/api/documents/${id}`)
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    const { data } = await this.client.get<ApiResponse<Supplier[]>>('/api/suppliers')
    return data.data
  }

  async getSupplier(id: string): Promise<Supplier> {
    const { data } = await this.client.get<ApiResponse<Supplier>>(
      `/api/suppliers/${id}`
    )
    return data.data
  }

  async createSupplier(input: CreateSupplierInput): Promise<Supplier> {
    const { data } = await this.client.post<ApiResponse<Supplier>>(
      '/api/suppliers',
      input
    )
    return data.data
  }

  async updateSupplier(id: string, input: UpdateSupplierInput): Promise<Supplier> {
    const { data } = await this.client.patch<ApiResponse<Supplier>>(
      `/api/suppliers/${id}`,
      input
    )
    return data.data
  }

  async deleteSupplier(id: string): Promise<void> {
    await this.client.delete(`/api/suppliers/${id}`)
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const { data } = await this.client.get<ApiResponse<Category[]>>(
      '/api/categories'
    )
    return data.data
  }

  async getCategory(id: string): Promise<Category> {
    const { data } = await this.client.get<ApiResponse<Category>>(
      `/api/categories/${id}`
    )
    return data.data
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const { data } = await this.client.post<ApiResponse<Category>>(
      '/api/categories',
      input
    )
    return data.data
  }

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    const { data } = await this.client.patch<ApiResponse<Category>>(
      `/api/categories/${id}`,
      input
    )
    return data.data
  }

  async deleteCategory(id: string): Promise<void> {
    await this.client.delete(`/api/categories/${id}`)
  }

  // Settings
  async getSettings(): Promise<BusinessSettings> {
    const { data } = await this.client.get<ApiResponse<BusinessSettings>>(
      '/api/settings'
    )
    return data.data
  }

  async updateSettings(input: UpdateSettingsInput): Promise<BusinessSettings> {
    const { data } = await this.client.patch<ApiResponse<BusinessSettings>>(
      '/api/settings',
      input
    )
    return data.data
  }

  // Export
  async exportDocuments(params: ExportQueryParams): Promise<ExportResponse> {
    const { data } = await this.client.get<ApiResponse<ExportResponse>>(
      '/api/export',
      { params }
    )
    return data.data
  }
}

export const apiClient = new ApiClient()
