"use client"

import { useData, type Task } from "@/components/providers/data-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { differenceInMinutes, differenceInHours } from "date-fns"
import { Wrench, Trash2, Shield, AlertTriangle, Lightbulb, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface CategoryPerformanceProps {
  tasks: Task[]
  timeRange: "7days" | "30days" | "90days" | "all"
  isMobile: boolean
  isTablet: boolean
}

export default function CategoryPerformance({ tasks, timeRange, isMobile, isTablet }: CategoryPerformanceProps) {
  const { slaMetrics } = useData()

  // Format time (minutes) to hours and minutes
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours} hr${hours !== 1 ? "s" : ""} ${mins} min`
  }

  // Get category icon
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

  // Calculate category metrics
  const calculateCategoryMetrics = () => {
    const categories = ["maintenance", "cleaning", "security", "safety", "utility"]

    return categories.map((category) => {
      const categoryTasks = tasks.filter((task) => task.category === category)
      const completedTasks = categoryTasks.filter((task) => task.status === "completed")
      const inProgressTasks = categoryTasks.filter((task) => task.status === "in_progress")
      const pendingTasks = categoryTasks.filter((task) => task.status === "pending")

      // Calculate completion rate
      const completionRate = categoryTasks.length > 0 ? (completedTasks.length / categoryTasks.length) * 100 : 0

      // Calculate average response time
      let totalResponseTime = 0
      let responseCount = 0

      categoryTasks.forEach((task) => {
        if ((task.status === "in_progress" || task.status === "completed") && task.updatedAt && task.createdAt) {
          const createdDate = new Date(task.createdAt)
          const updatedDate = new Date(task.updatedAt)
          totalResponseTime += differenceInMinutes(updatedDate, createdDate)
          responseCount++
        }
      })

      const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0

      // Calculate average completion time
      let totalCompletionTime = 0
      let completionCount = 0

      completedTasks.forEach((task) => {
        if (task.completedAt && task.createdAt) {
          const createdDate = new Date(task.createdAt)
          const completedDate = new Date(task.completedAt)
          totalCompletionTime += differenceInMinutes(completedDate, createdDate)
          completionCount++
        }
      })

      const avgCompletionTime = completionCount > 0 ? totalCompletionTime / completionCount : 0

      // Calculate on-time completion rate
      let onTimeCount = 0

      completedTasks.forEach((task) => {
        if (task.completedAt && task.createdAt) {
          const createdDate = new Date(task.createdAt)
          const completedDate = new Date(task.completedAt)
          const completionTimeHours = differenceInHours(completedDate, createdDate)

          // Consider "on time" based on priority
          switch (task.priority) {
            case "high":
              onTimeCount += completionTimeHours <= 4 ? 1 : 0
              break // 4 hours for high priority
            case "medium":
              onTimeCount += completionTimeHours <= 12 ? 1 : 0
              break // 12 hours for medium priority
            case "low":
              onTimeCount += completionTimeHours <= 24 ? 1 : 0
              break // 24 hours for low priority
            default:
              onTimeCount += completionTimeHours <= 24 ? 1 : 0
          }
        }
      })

      const onTimeRate = completedTasks.length > 0 ? (onTimeCount / completedTasks.length) * 100 : 0

      return {
        name: category,
        icon: getCategoryIcon(category),
        total: categoryTasks.length,
        completed: completedTasks.length,
        inProgress: inProgressTasks.length,
        pending: pendingTasks.length,
        completionRate,
        avgResponseTime,
        avgCompletionTime,
        onTimeRate,
        formattedResponseTime: formatTime(avgResponseTime),
        formattedCompletionTime: formatTime(avgCompletionTime),
      }
    })
  }

  const categoryMetrics = calculateCategoryMetrics()

  // Prepare data for radar chart
  const radarData = [
    {
      subject: "Completion Rate",
      maintenance: categoryMetrics[0].completionRate,
      cleaning: categoryMetrics[1].completionRate,
      security: categoryMetrics[2].completionRate,
      safety: categoryMetrics[3].completionRate,
      utility: categoryMetrics[4].completionRate,
    },
    {
      subject: "On-Time Rate",
      maintenance: categoryMetrics[0].onTimeRate,
      cleaning: categoryMetrics[1].onTimeRate,
      security: categoryMetrics[2].onTimeRate,
      safety: categoryMetrics[3].onTimeRate,
      utility: categoryMetrics[4].onTimeRate,
    },
    {
      subject: "Response Time",
      maintenance: Math.min(100, 100 - categoryMetrics[0].avgResponseTime / 10),
      cleaning: Math.min(100, 100 - categoryMetrics[1].avgResponseTime / 10),
      security: Math.min(100, 100 - categoryMetrics[2].avgResponseTime / 10),
      safety: Math.min(100, 100 - categoryMetrics[3].avgResponseTime / 10),
      utility: Math.min(100, 100 - categoryMetrics[4].avgResponseTime / 10),
    },
    {
      subject: "Completion Time",
      maintenance: Math.min(100, 100 - categoryMetrics[0].avgCompletionTime / 60),
      cleaning: Math.min(100, 100 - categoryMetrics[1].avgCompletionTime / 60),
      security: Math.min(100, 100 - categoryMetrics[2].avgCompletionTime / 60),
      safety: Math.min(100, 100 - categoryMetrics[3].avgCompletionTime / 60),
      utility: Math.min(100, 100 - categoryMetrics[4].avgCompletionTime / 60),
    },
    {
      subject: "Task Volume",
      maintenance: Math.min(100, categoryMetrics[0].total * 5),
      cleaning: Math.min(100, categoryMetrics[1].total * 5),
      security: Math.min(100, categoryMetrics[2].total * 5),
      safety: Math.min(100, categoryMetrics[3].total * 5),
      utility: Math.min(100, categoryMetrics[4].total * 5),
    },
  ]

  // Prepare data for comparison charts
  const completionRateData = categoryMetrics.map((metric) => ({
    name: metric.name.charAt(0).toUpperCase() + metric.name.slice(1),
    value: metric.completionRate,
  }))

  const responseTimeData = categoryMetrics.map((metric) => ({
    name: metric.name.charAt(0).toUpperCase() + metric.name.slice(1),
    value: metric.avgResponseTime,
  }))

  const completionTimeData = categoryMetrics.map((metric) => ({
    name: metric.name.charAt(0).toUpperCase() + metric.name.slice(1),
    value: metric.avgCompletionTime,
  }))

  const onTimeRateData = categoryMetrics.map((metric) => ({
    name: metric.name.charAt(0).toUpperCase() + metric.name.slice(1),
    value: metric.onTimeRate,
  }))

  // Prepare data for task distribution
  const taskDistributionData = categoryMetrics.map((metric) => ({
    name: metric.name.charAt(0).toUpperCase() + metric.name.slice(1),
    value: metric.total,
  }))

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  // State for collapsible sections on mobile
  const [openSections, setOpenSections] = useState({
    metrics: true,
    comparison: false,
    charts: false,
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="space-y-6">
      {isMobile ? (
        <Collapsible open={openSections.metrics} onOpenChange={() => toggleSection("metrics")} className="w-full mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <CardTitle className="text-base">Category Metrics</CardTitle>
                {openSections.metrics ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="p-2">
                {categoryMetrics.map((metric, index) => (
                  <Card key={metric.name} className="mb-2 shadow-sm">
                    <CardHeader className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        {metric.icon}
                        <CardTitle className="text-sm font-medium capitalize">{metric.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2 px-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Tasks:</span>
                          <span className="float-right font-medium">{metric.total}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Completion:</span>
                          <span className="float-right font-medium">{metric.completionRate.toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">On-Time:</span>
                          <span className="float-right font-medium">{metric.onTimeRate.toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg. Response:</span>
                          <span className="float-right font-medium">{metric.formattedResponseTime}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {categoryMetrics.map((metric, index) => (
            <Card key={metric.name}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  {metric.icon}
                  <CardTitle className="text-sm font-medium capitalize">{metric.name}</CardTitle>
                </div>
                <CardDescription>Performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tasks:</span>
                    <span className="font-medium">{metric.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completion Rate:</span>
                    <span className="font-medium">{metric.completionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">On-Time Rate:</span>
                    <span className="font-medium">{metric.onTimeRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg. Response:</span>
                    <span className="font-medium">{metric.formattedResponseTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg. Completion:</span>
                    <span className="font-medium">{metric.formattedCompletionTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isMobile ? (
        <Collapsible
          open={openSections.comparison}
          onOpenChange={() => toggleSection("comparison")}
          className="w-full mb-6"
        >
          <Card>
            <CardHeader className="pb-2">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <CardTitle className="text-base">Category Comparison</CardTitle>
                {openSections.comparison ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      value: {
                        label: "Completion Rate (%)",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={completionRateData}
                        margin={{
                          top: 5,
                          right: 10,
                          left: 0,
                          bottom: 5,
                        }}
                        barSize={20}
                      >
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={25} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" name="Completion Rate" fill="var(--color-value)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="mt-2 text-xs text-center text-muted-foreground">
                  Simplified view: Completion rate by category
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Category Performance Comparison</CardTitle>
            <CardDescription>Radar chart comparing performance across all categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ChartContainer
                config={{
                  maintenance: {
                    label: "Maintenance",
                    color: "hsl(var(--chart-1))",
                  },
                  cleaning: {
                    label: "Cleaning",
                    color: "hsl(var(--chart-2))",
                  },
                  security: {
                    label: "Security",
                    color: "hsl(var(--chart-3))",
                  },
                  safety: {
                    label: "Safety",
                    color: "hsl(var(--chart-4))",
                  },
                  utility: {
                    label: "Utility",
                    color: "hsl(var(--chart-5))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Maintenance"
                      dataKey="maintenance"
                      stroke="var(--color-maintenance)"
                      fill="var(--color-maintenance)"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Cleaning"
                      dataKey="cleaning"
                      stroke="var(--color-cleaning)"
                      fill="var(--color-cleaning)"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Security"
                      dataKey="security"
                      stroke="var(--color-security)"
                      fill="var(--color-security)"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Safety"
                      dataKey="safety"
                      stroke="var(--color-safety)"
                      fill="var(--color-safety)"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Utility"
                      dataKey="utility"
                      stroke="var(--color-utility)"
                      fill="var(--color-utility)"
                      fillOpacity={0.6}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {isMobile ? (
        <Collapsible open={openSections.charts} onOpenChange={() => toggleSection("charts")} className="w-full mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <CardTitle className="text-base">Category Charts</CardTitle>
                {openSections.charts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-4">
                  {/*<Select
                    defaultValue="completion"
                    onValueChange={(value) => {
                      // You could add state here to track the selected chart type
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completion">Completion Rate</SelectItem>
                      <SelectItem value="response">Response Time</SelectItem>
                      <SelectItem value="time">Completion Time</SelectItem>
                      <SelectItem value="ontime">On-Time Rate</SelectItem>
                      <SelectItem value="distribution">Distribution</SelectItem>
                    </SelectContent>
                  </Select>*/}

                  <div className="h-[250px]">
                    <ChartContainer
                      config={{
                        value: {
                          label: "Completion Rate (%)",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={completionRateData}
                          margin={{
                            top: 5,
                            right: 10,
                            left: 0,
                            bottom: 5,
                          }}
                          barSize={20}
                        >
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={25} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="value" name="Completion Rate" fill="var(--color-value)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ) : (
        <Tabs defaultValue="completion">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
            <TabsTrigger value="completion">Completion Rate</TabsTrigger>
            <TabsTrigger value="response">Response Time</TabsTrigger>
            <TabsTrigger value="time">Completion Time</TabsTrigger>
            <TabsTrigger value="ontime">On-Time Rate</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="completion" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Completion Rate by Category</CardTitle>
                <CardDescription>Percentage of tasks completed for each category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      value: {
                        label: "Completion Rate (%)",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={completionRateData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} label={{ value: "%", position: "insideLeft" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="value" name="Completion Rate" fill="var(--color-value)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="response" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Average Response Time by Category</CardTitle>
                <CardDescription>Average time to respond to tasks for each category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      value: {
                        label: "Response Time (minutes)",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={responseTimeData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="value" name="Response Time" fill="var(--color-value)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="time" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Average Completion Time by Category</CardTitle>
                <CardDescription>Average time to complete tasks for each category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      value: {
                        label: "Completion Time (minutes)",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={completionTimeData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="value" name="Completion Time" fill="var(--color-value)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ontime" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>On-Time Completion Rate by Category</CardTitle>
                <CardDescription>Percentage of tasks completed on time for each category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      value: {
                        label: "On-Time Rate (%)",
                        color: "hsl(var(--chart-4))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={onTimeRateData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} label={{ value: "%", position: "insideLeft" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="value" name="On-Time Rate" fill="var(--color-value)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Distribution by Category</CardTitle>
                <CardDescription>Number of tasks in each category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      distribution: {
                        label: "Task Distribution",
                        color: "hsl(var(--chart-5))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {taskDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

