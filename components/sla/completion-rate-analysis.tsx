"use client"

import { useData, type Task } from "@/components/providers/data-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
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
import { format, differenceInHours, subDays } from "date-fns"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface CompletionRateAnalysisProps {
  tasks: Task[]
  timeRange: "7days" | "30days" | "90days" | "all"
  isMobile: boolean
  isTablet: boolean
}

export default function CompletionRateAnalysis({ tasks, timeRange, isMobile, isTablet }: CompletionRateAnalysisProps) {
  const { slaMetrics } = useData()

  // Calculate completion rates
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === "completed").length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  // Calculate on-time completion rate
  const calculateOnTimeCompletions = () => {
    const completedTasksWithTimes = tasks.filter(
      (task) => task.status === "completed" && task.completedAt && task.createdAt,
    )

    const onTimeCount = completedTasksWithTimes.filter((task) => {
      const createdDate = new Date(task.createdAt)
      const completedDate = new Date(task.completedAt!)
      const completionTimeHours = differenceInHours(completedDate, createdDate)

      // Consider "on time" based on priority
      switch (task.priority) {
        case "high":
          return completionTimeHours <= 4 // 4 hours for high priority
        case "medium":
          return completionTimeHours <= 12 // 12 hours for medium priority
        case "low":
          return completionTimeHours <= 24 // 24 hours for low priority
        default:
          return completionTimeHours <= 24
      }
    }).length

    return {
      onTime: onTimeCount,
      late: completedTasksWithTimes.length - onTimeCount,
      onTimeRate: completedTasksWithTimes.length > 0 ? (onTimeCount / completedTasksWithTimes.length) * 100 : 0,
    }
  }

  const onTimeStats = calculateOnTimeCompletions()

  // Generate data for completion rate over time
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
      const total = dayTasks.length

      data.push({
        date: dateStr,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
      })
    }

    return data
  }

  const timeSeriesData = generateTimeSeriesData()

  // Calculate completion rate by category
  const completionRateByCategory = [
    {
      name: "Maintenance",
      value: calculateCategoryCompletionRate("maintenance"),
    },
    {
      name: "Cleaning",
      value: calculateCategoryCompletionRate("cleaning"),
    },
    {
      name: "Security",
      value: calculateCategoryCompletionRate("security"),
    },
    {
      name: "Safety",
      value: calculateCategoryCompletionRate("safety"),
    },
    {
      name: "Utility",
      value: calculateCategoryCompletionRate("utility"),
    },
  ]

  function calculateCategoryCompletionRate(category: string) {
    const categoryTasks = tasks.filter((task) => task.category === category)
    const completedCategoryTasks = categoryTasks.filter((task) => task.status === "completed")
    return categoryTasks.length > 0 ? (completedCategoryTasks.length / categoryTasks.length) * 100 : 0
  }

  // Calculate completion rate by priority
  const completionRateByPriority = [
    {
      name: "High",
      value: calculatePriorityCompletionRate("high"),
    },
    {
      name: "Medium",
      value: calculatePriorityCompletionRate("medium"),
    },
    {
      name: "Low",
      value: calculatePriorityCompletionRate("low"),
    },
  ]

  function calculatePriorityCompletionRate(priority: string) {
    const priorityTasks = tasks.filter((task) => task.priority === priority)
    const completedPriorityTasks = priorityTasks.filter((task) => task.status === "completed")
    return priorityTasks.length > 0 ? (completedPriorityTasks.length / priorityTasks.length) * 100 : 0
  }

  // Calculate completion time distribution
  const completionTimeDistribution = [
    { name: "< 1 hr", value: calculateCompletionTimeCount(0, 1) },
    { name: "1-4 hrs", value: calculateCompletionTimeCount(1, 4) },
    { name: "4-8 hrs", value: calculateCompletionTimeCount(4, 8) },
    { name: "8-24 hrs", value: calculateCompletionTimeCount(8, 24) },
    { name: "1-3 days", value: calculateCompletionTimeCount(24, 72) },
    { name: "> 3 days", value: calculateCompletionTimeCount(72, Number.POSITIVE_INFINITY) },
  ]

  function calculateCompletionTimeCount(minHours: number, maxHours: number) {
    return tasks.filter((task) => {
      if (task.status !== "completed" || !task.completedAt || !task.createdAt) return false

      const createdDate = new Date(task.createdAt)
      const completedDate = new Date(task.completedAt)
      const completionTimeHours = differenceInHours(completedDate, createdDate)

      return completionTimeHours >= minHours && completionTimeHours < maxHours
    }).length
  }

  // Data for on-time vs late pie chart
  const onTimeData = [
    { name: "On Time", value: onTimeStats.onTime, color: "#22c55e" },
    { name: "Late", value: onTimeStats.late, color: "#ef4444" },
  ]

  // State for collapsible sections on mobile
  const [openSections, setOpenSections] = useState({
    trend: true,
    onTime: false,
    category: false,
    priority: false,
    distribution: false,
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="space-y-6">
      <div className={`${isMobile ? "" : "grid grid-cols-1 lg:grid-cols-2"} gap-6`}>
        {isMobile ? (
          <Collapsible open={openSections.trend} onOpenChange={() => toggleSection("trend")} className="w-full mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <CardTitle className="text-base">Completion Rate Trend</CardTitle>
                  {openSections.trend ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="h-[250px]">
                    <ChartContainer
                      config={{
                        completionRate: {
                          label: "Completion Rate (%)",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={timeSeriesData.filter((_, i) => i % 2 === 0)} // Show fewer data points on mobile
                          margin={{
                            top: 5,
                            right: 10,
                            left: 0,
                            bottom: 5,
                          }}
                        >
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={25} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
                          <Line
                            type="monotone"
                            dataKey="completionRate"
                            name="Completion Rate"
                            stroke="var(--color-completionRate)"
                            activeDot={{ r: 4 }}
                            strokeWidth={2}
                          />
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
              <CardTitle>Completion Rate Trend</CardTitle>
              <CardDescription>Task completion rate over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    completionRate: {
                      label: "Completion Rate (%)",
                      color: "hsl(var(--chart-1))",
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
                      <YAxis domain={[0, 100]} label={{ value: "%", position: "insideLeft" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="completionRate"
                        name="Completion Rate"
                        stroke="var(--color-completionRate)"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {isMobile ? (
          <Collapsible open={openSections.onTime} onOpenChange={() => toggleSection("onTime")} className="w-full mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <CardTitle className="text-base">On-Time vs Late Completion</CardTitle>
                  {openSections.onTime ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="h-[250px] flex items-center justify-center">
                    <ChartContainer
                      config={{
                        onTime: {
                          label: "On-Time vs Late",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={onTimeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {onTimeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Overall on-time completion rate:{" "}
                      <span className="font-medium">{onTimeStats.onTimeRate.toFixed(1)}%</span>
                    </p>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>On-Time vs Late Completion</CardTitle>
              <CardDescription>Percentage of tasks completed on time vs late</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    onTime: {
                      label: "On-Time vs Late",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={onTimeData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {onTimeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Overall on-time completion rate:{" "}
                  <span className="font-medium">{onTimeStats.onTimeRate.toFixed(1)}%</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className={`${isMobile ? "" : "grid grid-cols-1 lg:grid-cols-2"} gap-6`}>
        {isMobile ? (
          <Collapsible
            open={openSections.category}
            onOpenChange={() => toggleSection("category")}
            className="w-full mb-6"
          >
            <Card>
              <CardHeader className="pb-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <CardTitle className="text-base">Completion Rate by Category</CardTitle>
                  {openSections.category ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="h-[250px]">
                    <ChartContainer
                      config={{
                        value: {
                          label: "Completion Rate (%)",
                          color: "hsl(var(--chart-3))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={completionRateByCategory}
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
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Completion Rate by Category</CardTitle>
              <CardDescription>Task completion rate for each category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    value: {
                      label: "Completion Rate (%)",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={completionRateByCategory}
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
        )}

        {isMobile ? (
          <Collapsible
            open={openSections.priority}
            onOpenChange={() => toggleSection("priority")}
            className="w-full mb-6"
          >
            <Card>
              <CardHeader className="pb-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <CardTitle className="text-base">Completion Rate by Priority</CardTitle>
                  {openSections.priority ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="h-[250px]">
                    <ChartContainer
                      config={{
                        radar: {
                          label: "Completion Rate",
                          color: "hsl(var(--chart-4))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={completionRateByPriority}
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
                          <Bar dataKey="value" name="Completion Rate" fill="var(--color-radar)" />
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
              <CardTitle>Completion Rate by Priority</CardTitle>
              <CardDescription>Task completion rate for each priority level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    radar: {
                      label: "Completion Rate",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={completionRateByPriority}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Completion Rate"
                        dataKey="value"
                        stroke="var(--color-radar)"
                        fill="var(--color-radar)"
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
      </div>

      {isMobile ? (
        <Collapsible
          open={openSections.distribution}
          onOpenChange={() => toggleSection("distribution")}
          className="w-full mb-6"
        >
          <Card>
            <CardHeader className="pb-2">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <CardTitle className="text-base">Completion Time Distribution</CardTitle>
                {openSections.distribution ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <div className="h-[250px]">
                  <ChartContainer
                    config={{
                      value: {
                        label: "Number of Tasks",
                        color: "hsl(var(--chart-5))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={completionTimeDistribution}
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
                        <Bar dataKey="value" name="Tasks" fill="var(--color-value)" />
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
            <CardTitle>Completion Time Distribution</CardTitle>
            <CardDescription>Distribution of time taken to complete tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  value: {
                    label: "Number of Tasks",
                    color: "hsl(var(--chart-5))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={completionTimeDistribution}
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
                    <Bar dataKey="value" name="Tasks" fill="var(--color-value)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

