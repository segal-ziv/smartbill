"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Save, Mail, MessageSquare, Settings2 } from "lucide-react"
import { useSettings, useUpdateSettings } from "@/hooks/use-api"
import type { OcrProvider } from "@/lib/api-types"

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings()
  const { mutate: updateSettings, isPending } = useUpdateSettings()

  const [formData, setFormData] = useState<{
    businessName: string
    businessType: string
    taxId: string
    email: string
    phone: string
    address: string
    imapEnabled: boolean
    imapHost: string
    imapPort: number
    imapUsername: string
    imapPassword: string
    ocrProvider: OcrProvider
    ocrAutoProcess: boolean
  }>({
    businessName: "",
    businessType: "",
    taxId: "",
    email: "",
    phone: "",
    address: "",
    imapEnabled: false,
    imapHost: "",
    imapPort: 993,
    imapUsername: "",
    imapPassword: "",
    ocrProvider: "GOOGLE_VISION",
    ocrAutoProcess: true,
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        businessName: settings.businessName || "",
        businessType: settings.businessType || "",
        taxId: settings.taxId || "",
        email: settings.email || "",
        phone: settings.phone || "",
        address: settings.address || "",
        imapEnabled: settings.imapEnabled,
        imapHost: settings.imapHost || "",
        imapPort: settings.imapPort || 993,
        imapUsername: settings.imapUsername || "",
        imapPassword: "",
        ocrProvider: settings.ocrProvider,
        ocrAutoProcess: settings.ocrAutoProcess,
      })
    }
  }, [settings])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings(formData)
  }

  if (isLoading) {
    return (
      <div>
        <Header title="הגדרות מערכת" />
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="הגדרות מערכת" />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              פרטי העסק
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">שם העסק</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                    placeholder="הזן שם עסק"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">ח.פ / ע.מ</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) =>
                      setFormData({ ...formData, taxId: e.target.value })
                    }
                    placeholder="123456789"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">אימייל</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="business@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">טלפון</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="03-1234567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">כתובת</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="רחוב 1, תל אביב"
                />
              </div>
            </div>
          </Card>

          {/* Gmail Integration */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Gmail Integration
                </h3>
                <p className="text-sm text-muted-foreground">
                  קליטה אוטומטית של חשבוניות מ-Gmail
                </p>
              </div>
              {settings?.gmailEnabled && (
                <Badge variant="default">מחובר</Badge>
              )}
            </div>

            <Button variant="outline" disabled>
              {settings?.gmailEnabled ? "נתק Gmail" : "חבר Gmail"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              בקרוב - דרך אימות OAuth של Google
            </p>
          </Card>

          {/* IMAP Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              הגדרות IMAP
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="imapEnabled">אפשר IMAP</Label>
                <Switch
                  id="imapEnabled"
                  checked={formData.imapEnabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, imapEnabled: checked })
                  }
                />
              </div>

              {formData.imapEnabled && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="imapHost">שרת IMAP</Label>
                      <Input
                        id="imapHost"
                        value={formData.imapHost}
                        onChange={(e) =>
                          setFormData({ ...formData, imapHost: e.target.value })
                        }
                        placeholder="imap.gmail.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="imapPort">פורט</Label>
                      <Input
                        id="imapPort"
                        type="number"
                        value={formData.imapPort}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            imapPort: parseInt(e.target.value),
                          })
                        }
                        placeholder="993"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="imapUsername">שם משתמש</Label>
                      <Input
                        id="imapUsername"
                        value={formData.imapUsername}
                        onChange={(e) =>
                          setFormData({ ...formData, imapUsername: e.target.value })
                        }
                        placeholder="user@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="imapPassword">סיסמה</Label>
                      <Input
                        id="imapPassword"
                        type="password"
                        value={formData.imapPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, imapPassword: e.target.value })
                        }
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* WhatsApp */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  WhatsApp Business
                </h3>
                <p className="text-sm text-muted-foreground">
                  קליטה אוטומטית דרך WhatsApp
                </p>
              </div>
              {settings?.whatsappEnabled && (
                <Badge variant="default">מחובר</Badge>
              )}
            </div>

            <Button variant="outline" disabled>
              {settings?.whatsappEnabled ? "נתק WhatsApp" : "חבר WhatsApp"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              בקרוב - דרך WhatsApp Business API
            </p>
          </Card>

          {/* OCR Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">הגדרות OCR</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ocrProvider">ספק OCR</Label>
                <Select
                  value={formData.ocrProvider}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, ocrProvider: value })
                  }
                >
                  <SelectTrigger id="ocrProvider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GOOGLE_VISION">Google Vision</SelectItem>
                    <SelectItem value="AWS_TEXTRACT">AWS Textract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ocrAutoProcess">עיבוד אוטומטי</Label>
                  <p className="text-xs text-muted-foreground">
                    עבד מסמכים ב-OCR אוטומטית בעת העלאה
                  </p>
                </div>
                <Switch
                  id="ocrAutoProcess"
                  checked={formData.ocrAutoProcess}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, ocrAutoProcess: checked })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isPending}>
            <Save className="w-4 h-4 ml-2" />
            {isPending ? "שומר..." : "שמור הגדרות"}
          </Button>
        </form>
      </div>
    </div>
  )
}
