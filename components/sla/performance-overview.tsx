"use client"

import { useData, type Task } from "@/components/providers/data-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { format, subDays } from "date-fns"
import { CheckCircle, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface PerformanceOverviewProps {
  tasks: Task[]
  timeRange: "7days" | "30days" | "90days" | "all"
  isMobile: boolean
  isTablet: boolean
}

export default function PerformanceOverview({ tasks, timeRange, isMobile, isTablet }: PerformanceOverviewProps) {
  const { slaMetrics } = useData()

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

  // Generate data for task status distribution
  const statusDistributionData = [
    { name: "Completed", value: completedTasks, color: "#22c55e" },
    { name: "In Progress", value: inProgressTasks, color: "#3b82f6" },
    { name: "Pending", value: pendingTasks, color: "#eab308" },
  ]

  // Generate data for task completion over time
  const generateTimeSeriesData = () => {
    if (tasks.length === 0) return []

    const days = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : timeRange === "90days" ? 90 : 90
    const today = new Date()
    const data = []

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i)
      const dateStr = format(date, "MMM dd")

      const dayTasks = tasks.filter((task) => {
        const taskDate = new Date(task.createdAt)
        return format(taskDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      })

      const completed = dayTasks.filter((task) => task.status === "completed").length
      const inProgress = dayTasks.filter((task) => task.status === "in_progress").length
      const pending = dayTasks.filter((task) => task.status === "pending").length

      data.push({
        date: dateStr,
        completed,
        inProgress,
        pending,
        total: completed + inProgress + pending,
      })
    }

    return data
  }

  const timeSeriesData = generateTimeSeriesData()

  // Generate data for priority distribution
  const priorityData = [
    { name: "High", value: tasks.filter((task) => task.priority === "high").length },
    { name: "Medium", value: tasks.filter((task) => task.priority === "medium").length },
    { name: "Low", value: tasks.filter((task) => task.priority === "low").length },
  ]

  // Generate data for category distribution
  const categoryData = [
    { name: "Maintenance", value: tasks.filter((task) => task.category === "maintenance").length },
    { name: "Cleaning", value: tasks.filter((task) => task.category === "cleaning").length },
    { name: "Security", value: tasks.filter((task) => task.category === "security").length },
    { name: "Safety", value: tasks.filter((task) => task.category === "safety").length },
    { name: "Utility", value: tasks.filter((task) => task.category === "utility").length },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  // State for collapsible sections on mobile
  const [openSections, setOpenSections] = useState({
    statusDistribution: true,
    taskCompletion: false,
    priorityDistribution: false,
    categoryDistribution: false,
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className={`${isMobile ? "" : "grid grid-cols-1 lg:grid-cols-2"} gap-6`}>
        {isMobile ? (
          <Collapsible
            open={openSections.statusDistribution}
            onOpenChange={() => toggleSection("statusDistribution")}
            className="w-full mb-6"
          >
            <Card>
              <CardHeader className="pb-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <CardTitle className="text-base">Task Status Distribution</CardTitle>
                  {openSections.statusDistribution ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="h-[250px]">
                    <ChartContainer
                      config={{
                        status: {
                          label: "Status Distribution",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {statusDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Task Status Distribution</CardTitle>
              <CardDescription>Current distribution of task statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    status: {
                      label: "Status Distribution",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {isMobile ? (
          <Collapsible
            open={openSections.taskCompletion}
            onOpenChange={() => toggleSection("taskCompletion")}
            className="w-full mb-6"
          >
            <Card>
              <CardHeader className="pb-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <CardTitle className="text-base">Task Completion Trend</CardTitle>
                  {openSections.taskCompletion ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="h-[250px]">
                    <ChartContainer
                      config={{
                        completed: {
                          label: "Completed",
                          color: "hsl(142, 76%, 36%)",
                        },
                        inProgress: {
                          label: "In Progress",
                          color: "hsl(215, 100%, 50%)",
                        },
                        pending: {
                          label: "Pending",
                          color: "hsl(38, 92%, 50%)",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={timeSeriesData.filter((_, i) => i % (isMobile ? 2 : 1) === 0)} // Show fewer data points on mobile
                          margin={{
                            top: 5,
                            right: 10,
                            left: 0,
                            bottom: 5,
                          }}
                        >
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} width={25} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
                          <Line
                            type="monotone"
                            dataKey="completed"
                            stroke="var(--color-completed)"
                            activeDot={{ r: 4 }}
                            strokeWidth={2}
                          />
                          <Line type="monotone" dataKey="inProgress" stroke="var(--color-inProgress)" strokeWidth={2} />
                          <Line type="monotone" dataKey="pending" stroke="var(--color-pending)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Task Completion Trend</CardTitle>
              <CardDescription>Task completion over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    completed: {
                      label: "Completed",
                      color: "hsl(142, 76%, 36%)",
                    },
                    inProgress: {
                      label: "In Progress",
                      color: "hsl(215, 100%, 50%)",
                    },
                    pending: {
                      label: "Pending",
                      color: "hsl(38, 92%, 50%)",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeSeriesData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="completed" stroke="var(--color-completed)" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="inProgress" stroke="var(--color-inProgress)" />
                      <Line type="monotone" dataKey="pending" stroke="var(--color-pending)" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className={`${isMobile ? "" : "grid grid-cols-1 lg:grid-cols-2"} gap-6`}>
        {isMobile ? (
          <Collapsible
            open={openSections.priorityDistribution}
            onOpenChange={() => toggleSection("priorityDistribution")}
            className="w-full mb-6"
          >
            <Card>
              <CardHeader className="pb-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <CardTitle className="text-base">Task Priority Distribution</CardTitle>
                  {openSections.priorityDistribution ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="h-[250px]">
                    <ChartContainer
                      config={{
                        priority: {
                          label: "Priority Distribution",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={priorityData}
                          margin={{
                            top: 5,
                            right: 10,
                            left: 0,
                            bottom: 5,
                          }}
                          barSize={20}
                        >
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} width={25} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="value" name="Tasks" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Task Priority Distribution</CardTitle>
              <CardDescription>Distribution of tasks by priority level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    priority: {
                      label: "Priority Distribution",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={priorityData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="value" name="Tasks" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {isMobile ? (
          <Collapsible
            open={openSections.categoryDistribution}
            onOpenChange={() => toggleSection("categoryDistribution")}
            className="w-full mb-6"
          >
            <Card>
              <CardHeader className="pb-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <CardTitle className="text-base">Task Category Distribution</CardTitle>
                  {openSections.categoryDistribution ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="h-[250px]">
                    <ChartContainer
                      config={{
                        category: {
                          label: "Category Distribution",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={categoryData}
                          margin={{
                            top: 5,
                            right: 10,
                            left: 0,
                            bottom: 5,
                          }}
                          barSize={20}
                        >
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} width={25} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="value" name="Tasks" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Task Category Distribution</CardTitle>
              <CardDescription>Distribution of tasks by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    category: {
                      label: "Category Distribution",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="value" name="Tasks" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

