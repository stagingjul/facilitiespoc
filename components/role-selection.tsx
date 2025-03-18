"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useData } from "@/components/providers/data-provider"
import AdminDashboard from "@/components/admin/admin-dashboard"
import ExecutorDashboard from "@/components/executor/executor-dashboard"
import { AppLogo } from "@/components/app-logo"
import { Building2, HardHat } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function RoleSelection() {
  const { currentRole, setCurrentRole, resetSystem, generateDummyData } = useData()
  const [showRoleSelection, setShowRoleSelection] = useState(true)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  useEffect(() => {
    if (currentRole) {
      setShowRoleSelection(false)
    } else {
      setShowRoleSelection(true)
    }
  }, [currentRole])

  const handleRoleSelect = (role: "admin" | "executor") => {
    setCurrentRole(role)
    setShowRoleSelection(false)
  }

  const handleBackToRoleSelection = () => {
    setCurrentRole(null)
    setShowRoleSelection(true)
  }

  if (!showRoleSelection) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            Facility Monitoring System
            <span className="ml-2 text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">
              {currentRole === "admin" ? "Administrator" : "Executor"}
            </span>
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleBackToRoleSelection}>
              Switch Role
            </Button>
            <AppLogo />
          </div>
        </div>

        {currentRole === "admin" ? <AdminDashboard /> : <ExecutorDashboard />}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <AppLogo />
        </div>
        <h1 className="text-4xl font-bold">Facility Monitoring System</h1>
        <p className="text-muted-foreground">Select your role to continue</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleRoleSelect("admin")}>
          <CardHeader className="text-center">
            <Building2 className="w-12 h-12 mx-auto text-primary" />
            <CardTitle>Administrator</CardTitle>
            <CardDescription>Create and manage tasks, review completions</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>Create and assign tasks</li>
              <li>Review completed tasks</li>
              <li>Monitor SLA performance</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Enter as Administrator</Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleRoleSelect("executor")}>
          <CardHeader className="text-center">
            <HardHat className="w-12 h-12 mx-auto text-primary" />
            <CardTitle>Executor</CardTitle>
            <CardDescription>View and complete assigned tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>View assigned tasks</li>
              <li>Update task status</li>
              <li>Submit photo evidence</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Enter as Executor</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <Button variant="outline" onClick={generateDummyData}>
          Generate Demo Data
        </Button>
        <Button variant="destructive" onClick={() => setResetDialogOpen(true)}>
          Reset System
        </Button>
      </div>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset System</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset the system? This will delete all tasks and reset all metrics. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                resetSystem()
                setResetDialogOpen(false)
              }}
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

