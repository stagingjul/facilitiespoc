"use client"

import { Toaster } from "@/components/ui/toaster"
import EnhancedSLADashboard from "@/components/enhanced-sla/dashboard"

export default function EnhancedSLADashboardPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 container max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <EnhancedSLADashboard />
      </div>
      <Toaster />
    </main>
  )
}

