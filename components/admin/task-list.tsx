"use client"

import { useState } from "react"
import { useData, type Task, type TaskStatus } from "@/components/providers/data-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"
import { Wrench, Trash2, Shield, AlertTriangle, Lightbulb, AlertCircle, CheckCircle, Clock, MapPin } from "lucide-react"
import TaskDetails from "@/components/admin/task-details"

interface TaskListProps {
  tasks: Task[]
  status: TaskStatus
}

export default function TaskList({ tasks, status }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const { executors } = useData()

  const getExecutorName = (executorId: string | null) => {
    if (!executorId) return "Unassigned"
    const executor = executors.find((e) => e.id === executorId)
    return executor ? executor.name : "Unknown"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      case "low":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500"
      case "in_progress":
        return "bg-blue-500/10 text-blue-500"
      case "completed":
        return "bg-green-500/10 text-green-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  // Add a function to get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "maintenance":
        return <Wrench className="h-4 w-4" />
      case "cleaning":
        return <Trash2 className="h-4 w-4" />
      case "security":
        return <Shield className="h-4 w-4" />
      case "safety":
        return <AlertTriangle className="h-4 w-4" />
      case "utility":
        return <Lightbulb className="h-4 w-4" />
      default:
        return null
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-muted p-3">{getStatusIcon(status)}</div>
        <h3 className="mt-4 text-lg font-medium">No {status.replace("_", " ")} tasks</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {status === "pending"
            ? "There are no pending tasks waiting to be claimed."
            : status === "in_progress"
              ? "There are no tasks currently in progress."
              : "There are no completed tasks to review."}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <Badge className={getStatusColor(task.status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(task.status)}
                    {task.status.replace("_", " ")}
                  </span>
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {task.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm line-clamp-2">{task.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 flex items-center gap-1"
                >
                  {getCategoryIcon(task.category)}
                  <span className="capitalize">{task.category}</span>
                </Badge>
                {task.evidence.length > 0 && (
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20">
                    {task.evidence.length} photo{task.evidence.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="text-xs text-muted-foreground">
                {task.status === "completed"
                  ? `Completed ${formatDistanceToNow(new Date(task.completedAt!), { addSuffix: true })}`
                  : `Created ${formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}`}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTask(task)}>
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        {selectedTask && (
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
            </DialogHeader>
            <TaskDetails task={selectedTask} executorName={getExecutorName(selectedTask.assignedTo)} />
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}

