"use client"

import { useData } from "@/components/providers/data-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, User } from "lucide-react"

export default function SLADashboard() {
  const { slaMetrics, tasks } = useData()

  // Calculate overall metrics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === "completed").length
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress").length
  const pendingTasks = tasks.filter((task) => task.status === "pending").length

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  // Calculate average metrics across all executors
  const avgResponseTime = slaMetrics.reduce((sum, metric) => sum + metric.avgResponseTime, 0) / slaMetrics.length || 0
  const avgCompletionTime =
    slaMetrics.reduce((sum, metric) => sum + metric.avgCompletionTime, 0) / slaMetrics.length || 0
  const avgOnTimeCompletion =
    slaMetrics.reduce((sum, metric) => sum + metric.onTimeCompletion, 0) / slaMetrics.length || 0

  // Format time (minutes) to hours and minutes
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours} hr${hours !== 1 ? "s" : ""} ${mins} min`
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CardDescription>All tasks in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Completed: {completedTasks}
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                In Progress: {inProgressTasks}
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                Pending: {pendingTasks}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CardDescription>Percentage of completed tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <CardDescription>Time to claim a task</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(avgResponseTime)}</div>
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Across all executors
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <CardDescription>Time to complete a task</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(avgCompletionTime)}</div>
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Across all executors
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance">Executor Performance</TabsTrigger>
          <TabsTrigger value="completion">Completion Rates</TabsTrigger>
        </TabsList>
        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Executor Performance Metrics</CardTitle>
              <CardDescription>Detailed performance metrics for each executor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Executor</th>
                      <th className="text-center py-3 px-4 font-medium">Tasks Completed</th>
                      <th className="text-center py-3 px-4 font-medium">Tasks In Progress</th>
                      <th className="text-center py-3 px-4 font-medium">Avg. Response Time</th>
                      <th className="text-center py-3 px-4 font-medium">Avg. Completion Time</th>
                      <th className="text-center py-3 px-4 font-medium">On-Time Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slaMetrics.map((metric) => (
                      <tr key={metric.executorId} className="border-b">
                        <td className="py-3 px-4 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {metric.executorName}
                        </td>
                        <td className="text-center py-3 px-4">{metric.tasksCompleted}</td>
                        <td className="text-center py-3 px-4">{metric.tasksInProgress}</td>
                        <td className="text-center py-3 px-4">{formatTime(metric.avgResponseTime)}</td>
                        <td className="text-center py-3 px-4">{formatTime(metric.avgCompletionTime)}</td>
                        <td className="text-center py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={metric.onTimeCompletion} className="w-20" />
                            <span>{metric.onTimeCompletion.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completion" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Completion by Executor</CardTitle>
                <CardDescription>Number of tasks completed by each executor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {slaMetrics.map((metric) => (
                    <div key={metric.executorId} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.executorName}</span>
                        <span className="text-sm">{metric.tasksCompleted} tasks</span>
                      </div>
                      <Progress
                        value={(metric.tasksCompleted / (metric.tasksCompleted + metric.tasksInProgress || 1)) * 100}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Completed: {metric.tasksCompleted}</span>
                        <span>In Progress: {metric.tasksInProgress}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>On-Time Completion Rate</CardTitle>
                <CardDescription>Percentage of tasks completed within SLA timeframe</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {slaMetrics.map((metric) => (
                    <div key={metric.executorId} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.executorName}</span>
                        <span className="text-sm">{metric.onTimeCompletion.toFixed(1)}%</span>
                      </div>
                      <Progress value={metric.onTimeCompletion} />
                      <div className="text-xs text-muted-foreground">
                        Tasks completed on time: {Math.round((metric.tasksCompleted * metric.onTimeCompletion) / 100)}{" "}
                        of {metric.tasksCompleted}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

