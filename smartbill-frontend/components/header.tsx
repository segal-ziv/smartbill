import { User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-6">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>

        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
