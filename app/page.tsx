"use client"

import RoleSelection from "@/components/role-selection"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 container max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <RoleSelection />
      </div>
      <Toaster />
    </main>
  )
}

