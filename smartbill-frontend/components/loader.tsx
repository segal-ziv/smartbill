import { cn } from "@/lib/utils"

interface LoaderProps {
  className?: string
}

export function Loader({ className }: LoaderProps = {}) {
  return (
    <div className={cn("relative w-12 h-12", className)}>
      <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
      <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
    </div>
  )
}
