"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Filter } from "lucide-react"

export function DashboardFilters() {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium text-foreground mb-2 block">חיפוש ספק</label>
        <Input placeholder="חפש לפי שם ספק..." className="w-full" />
      </div>

      <div className="w-[200px]">
        <label className="text-sm font-medium text-foreground mb-2 block">קטגוריה</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="כל הקטגוריות" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הקטגוריות</SelectItem>
            <SelectItem value="fuel">דלק</SelectItem>
            <SelectItem value="telecom">תקשורת</SelectItem>
            <SelectItem value="office">ציוד משרדי</SelectItem>
            <SelectItem value="food">מזון</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-[200px]">
        <label className="text-sm font-medium text-foreground mb-2 block">תאריך התחלה</label>
        <div className="relative">
          <Input type="date" className="w-full" />
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="w-[200px]">
        <label className="text-sm font-medium text-foreground mb-2 block">תאריך סיום</label>
        <div className="relative">
          <Input type="date" className="w-full" />
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <Button>
        <Filter className="w-4 h-4 ml-2" />
        סינון
      </Button>
    </div>
  )
}
