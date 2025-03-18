"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useData } from "@/components/providers/data-provider"
import TaskTable from "@/components/admin/task-table"
import CreateTaskForm from "@/components/admin/create-task-form"
import SLADashboard from "@/components/admin/sla-dashboard"
import { Button } from "@/components/ui/button"
import { PlusCircle, BarChart } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"

export default function AdminDashboard() {
  const { tasks } = useData()
  const [createTaskOpen, setCreateTaskOpen] = useState(false)

  const pendingTasks = tasks.filter((task) => task.status === "pending")
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress")
  const completedTasks = tasks.filter((task) => task.status === "completed")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Administrator Dashboard</h2>
        <div className="flex items-center gap-2">
          <Link href="/enhanced-sla-dashboard">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Enhanced SLA Dashboard
            </Button>
          </Link>
          <Link href="/sla-dashboard">
            <Button variant="outline" size="sm">
              SLA Dashboard
            </Button>
          </Link>
          <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Fill in the details to create a new maintenance task.</DialogDescription>
              </DialogHeader>
              <CreateTaskForm onSuccess={() => setCreateTaskOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgressTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
          <TabsTrigger value="sla">SLA Dashboard</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-6">
          <TaskTable tasks={pendingTasks} status="pending" />
        </TabsContent>
        <TabsContent value="in-progress" className="mt-6">
          <TaskTable tasks={inProgressTasks} status="in_progress" />
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <TaskTable tasks={completedTasks} status="completed" />
        </TabsContent>
        <TabsContent value="sla" className="mt-6">
          <SLADashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}

