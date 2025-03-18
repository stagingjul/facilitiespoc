"use client"

import type { Task } from "@/components/providers/data-provider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
// Add imports for category icons
import {
  Wrench,
  Trash2,
  Shield,
  AlertTriangle,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  User,
} from "lucide-react"

interface TaskDetailsProps {
  task: Task
  executorName: string
}

export default function TaskDetails({ task, executorName }: TaskDetailsProps) {
  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500"
      case "medium":
        return "bg-yellow-500/10 text-yellow-500"
      case "low":
        return "bg-green-500/10 text-green-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  // Add a function to get category icon and description
  const getCategoryInfo = (category: string) => {
    switch (category) {
      case "maintenance":
        return {
          icon: <Wrench className="h-3.5 w-3.5" />,
          description: "Equipment repairs, HVAC issues, plumbing fixes",
        }
      case "cleaning":
        return {
          icon: <Trash2 className="h-3.5 w-3.5" />,
          description: "General cleaning, sanitation, waste disposal",
        }
      case "security":
        return {
          icon: <Shield className="h-3.5 w-3.5" />,
          description: "CCTV checks, door access, patrol reports",
        }
      case "safety":
        return {
          icon: <AlertTriangle className="h-3.5 w-3.5" />,
          description: "Fire extinguisher inspections, hazard removal",
        }
      case "utility":
        return {
          icon: <Lightbulb className="h-3.5 w-3.5" />,
          description: "Power, water, internet, lighting issues",
        }
      default:
        return { icon: null, description: "" }
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{task.title}</h3>
          <Badge className={getStatusColor(task.status)}>
            <span className="flex items-center gap-1">
              {getStatusIcon(task.status)}
              {task.status.replace("_", " ")}
            </span>
          </Badge>
        </div>
        <p className="text-muted-foreground">{task.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Task Details</h4>
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Location</span>
                  <span className="flex items-center gap-1 text-sm font-medium">
                    <MapPin className="h-3.5 w-3.5" />
                    {task.location}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <span className="flex items-center gap-1 text-sm font-medium">
                    {getCategoryInfo(task.category).icon}
                    <span className="capitalize">{task.category}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Priority</span>
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Assigned To</span>
                  <span className="flex items-center gap-1 text-sm font-medium">
                    <User className="h-3.5 w-3.5" />
                    {executorName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">{format(new Date(task.createdAt), "PPp")}</span>
                </div>
                {task.completedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="text-sm">{format(new Date(task.completedAt), "PPp")}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {task.status === "completed" && task.resolution && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Resolution</h4>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm">{task.resolution}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {task.status === "completed" && task.evidence.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Evidence Photos</h4>
            <Card>
              <CardContent className="p-4 space-y-4">
                {task.evidence.map((evidence) => (
                  <div key={evidence.id} className="space-y-2">
                    <div className="aspect-video relative rounded-md overflow-hidden border">
                      <img
                        src={evidence.imageUrl || "/placeholder.svg"}
                        alt="Task evidence"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Submitted on {format(new Date(evidence.timestamp), "PPp")}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Task Timeline</h4>
        <div className="space-y-2">
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary w-2 h-2" />
              <div className="bg-border w-0.5 flex-1" />
            </div>
            <div className="space-y-0.5 pb-4">
              <p className="text-sm font-medium">Task Created</p>
              <p className="text-xs text-muted-foreground">{format(new Date(task.createdAt), "PPp")}</p>
            </div>
          </div>

          {task.claimedBy && (
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-primary w-2 h-2" />
                <div className="bg-border w-0.5 flex-1" />
              </div>
              <div className="space-y-0.5 pb-4">
                <p className="text-sm font-medium">Task Claimed</p>
                <p className="text-xs text-muted-foreground">{format(new Date(task.updatedAt), "PPp")}</p>
              </div>
            </div>
          )}

          {task.status === "in_progress" && (
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-primary w-2 h-2" />
                <div className="bg-border w-0.5 flex-1" />
              </div>
              <div className="space-y-0.5 pb-4">
                <p className="text-sm font-medium">Work Started</p>
                <p className="text-xs text-muted-foreground">{format(new Date(task.updatedAt), "PPp")}</p>
              </div>
            </div>
          )}

          {task.status === "completed" && (
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-primary w-2 h-2" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Task Completed</p>
                <p className="text-xs text-muted-foreground">{format(new Date(task.completedAt!), "PPp")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

