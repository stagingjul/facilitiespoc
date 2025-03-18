"use client"

import { Toaster } from "@/components/ui/toaster"
import AdvancedSLADashboard from "@/components/sla/advanced-sla-dashboard"

export default function SLADashboardPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 container max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <AdvancedSLADashboard />
      </div>
      <Toaster />
    </main>
  )
}

