"use client"

import { useState, useEffect } from "react"
import { useData } from "@/components/providers/data-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ExecutorTaskTable from "@/components/executor/executor-task-table"

export default function ExecutorDashboard() {
  const { executors, currentExecutor, setCurrentExecutor, tasks } = useData()
  const [selectedTab, setSelectedTab] = useState("assigned")

  useEffect(() => {
    // Only set the executor if it's not already set and we have executors
    if (!currentExecutor && executors.length > 0) {
      setCurrentExecutor(executors[0].id)
    }
  }, [currentExecutor, executors, setCurrentExecutor])

  const handleExecutorChange = (executorId: string) => {
    setCurrentExecutor(executorId)
  }

  if (!currentExecutor) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading executor data...</p>
      </div>
    )
  }

  const executor = executors.find((e) => e.id === currentExecutor)

  if (!executor) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Executor not found</p>
      </div>
    )
  }

  const assignedTasks = tasks.filter((task) => task.assignedTo === currentExecutor && task.status === "pending")
  const inProgressTasks = tasks.filter((task) => task.claimedBy === currentExecutor && task.status === "in_progress")
  const completedTasks = tasks.filter((task) => task.claimedBy === currentExecutor && task.status === "completed")

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Executor Dashboard</h2>
          <p className="text-muted-foreground">Manage and complete your assigned tasks</p>
        </div>
        <div className="w-full md:w-64">
          <Select value={currentExecutor} onValueChange={handleExecutorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select executor" />
            </SelectTrigger>
            <SelectContent>
              {executors.map((executor) => (
                <SelectItem key={executor.id} value={executor.id}>
                  {executor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assigned Tasks</CardTitle>
            <CardDescription>Tasks waiting to be claimed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedTasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <CardDescription>Tasks you are working on</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CardDescription>Tasks you have finished</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assigned" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assigned">Assigned ({assignedTasks.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgressTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="assigned" className="mt-6">
          <ExecutorTaskTable tasks={assignedTasks} type="assigned" />
        </TabsContent>
        <TabsContent value="in-progress" className="mt-6">
          <ExecutorTaskTable tasks={inProgressTasks} type="in-progress" />
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <ExecutorTaskTable tasks={completedTasks} type="completed" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

