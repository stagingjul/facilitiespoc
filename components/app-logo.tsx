"use client"

import { Building2 } from "lucide-react"

export function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-5 w-5 text-primary" />
      <span className="font-semibold text-sm">Facility MS</span>
    </div>
  )
}

