"use client"

import { useState } from "react"
import { useData, type Task } from "@/components/providers/data-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"
import { Wrench, Trash2, Shield, AlertTriangle, Lightbulb, AlertCircle, CheckCircle, Clock, MapPin } from "lucide-react"
import TaskActionForm from "@/components/executor/task-action-form"

interface ExecutorTaskListProps {
  tasks: Task[]
  type: "assigned" | "in-progress" | "completed"
}

export default function ExecutorTaskList({ tasks, type }: ExecutorTaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [actionType, setActionType] = useState<"claim" | "complete" | "view">("view")
  const { currentExecutor, claimTask, updateTaskStatus } = useData()

  const handleAction = (task: Task, action: "claim" | "complete" | "view") => {
    setSelectedTask(task)
    setActionType(action)
  }

  const handleClaimTask = () => {
    if (selectedTask && currentExecutor) {
      claimTask(selectedTask.id, currentExecutor)
      updateTaskStatus(selectedTask.id, "in_progress")
      setSelectedTask(null)
    }
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
        <div className="rounded-full bg-muted p-3">
          {type === "assigned" ? (
            <AlertCircle className="h-4 w-4" />
          ) : type === "in-progress" ? (
            <Clock className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
        </div>
        <h3 className="mt-4 text-lg font-medium">No {type.replace("-", " ")} tasks</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {type === "assigned"
            ? "You don't have any assigned tasks waiting to be claimed."
            : type === "in-progress"
              ? "You don't have any tasks in progress."
              : "You haven't completed any tasks yet."}
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
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {task.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm line-clamp-2">{task.description}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                {getCategoryIcon(task.category)}
                <span className="capitalize">{task.category}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="text-xs text-muted-foreground">
                {type === "completed"
                  ? `Completed ${formatDistanceToNow(new Date(task.completedAt!), { addSuffix: true })}`
                  : `Created ${formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}`}
              </div>
              {type === "assigned" ? (
                <Button size="sm" onClick={() => handleAction(task, "claim")}>
                  Claim Task
                </Button>
              ) : type === "in-progress" ? (
                <Button size="sm" onClick={() => handleAction(task, "complete")}>
                  Complete Task
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => handleAction(task, "view")}>
                  View Details
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        {selectedTask && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {actionType === "claim" ? "Claim Task" : actionType === "complete" ? "Complete Task" : "Task Details"}
              </DialogTitle>
            </DialogHeader>
            {actionType === "claim" ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{selectedTask.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selectedTask.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getPriorityColor(selectedTask.priority)}>
                    {selectedTask.priority}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {selectedTask.location}
                  </span>
                </div>
                <p className="text-sm">
                  Are you sure you want to claim this task? Once claimed, you will be responsible for completing it.
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedTask(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleClaimTask}>Claim Task</Button>
                </div>
              </div>
            ) : actionType === "complete" ? (
              <TaskActionForm task={selectedTask} onClose={() => setSelectedTask(null)} />
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{selectedTask.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selectedTask.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getPriorityColor(selectedTask.priority)}>
                    {selectedTask.priority}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {selectedTask.location}
                  </span>
                </div>
                {selectedTask.resolution && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Resolution</h4>
                    <p className="text-sm">{selectedTask.resolution}</p>
                  </div>
                )}
                {selectedTask.evidence.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Evidence Photos</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedTask.evidence.map((evidence) => (
                        <div key={evidence.id} className="space-y-1">
                          <div className="aspect-video relative rounded-md overflow-hidden border">
                            <img
                              src={evidence.imageUrl || "/placeholder.svg"}
                              alt="Task evidence"
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setSelectedTask(null)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}

