"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart } from "@/components/enhanced-sla/line-chart"
import { BarChart } from "@/components/enhanced-sla/bar-chart"
import { DonutChart } from "@/components/enhanced-sla/donut-chart"
import { formatTime } from "@/lib/format-time"
import type { EnhancedSLAMetrics } from "@/lib/generate-sla-metrics"

interface PerformanceMetricsCardProps {
  metrics: EnhancedSLAMetrics
}

export function PerformanceMetricsCard({ metrics }: PerformanceMetricsCardProps) {
  // Prepare category data for visualization
  const categoryData = Object.entries(metrics.categoryCounts).map(([category, count]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: count,
    color:
      category === "maintenance"
        ? "#0088FE"
        : category === "cleaning"
          ? "#00C49F"
          : category === "security"
            ? "#FFBB28"
            : category === "safety"
              ? "#FF8042"
              : "#8884d8",
  }))

  // Prepare priority data for visualization
  const priorityData = Object.entries(metrics.priorityCounts).map(([priority, count]) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    value: count,
    color: priority === "high" ? "#ef4444" : priority === "medium" ? "#f97316" : "#22c55e",
  }))

  // Prepare trend data for visualization
  const trendData = metrics.dailyCompletionTrend.map((day) => ({
    date: day.date.split("T")[0].split("-").slice(1).join("/"), // Format as MM/DD
    completions: day.count,
  }))

  // Calculate performance grade
  const getPerformanceGrade = (score: number) => {
    if (score >= 90) return { grade: "A", color: "text-success" }
    if (score >= 80) return { grade: "B", color: "text-success" }
    if (score >= 70) return { grade: "C", color: "text-warning" }
    if (score >= 60) return { grade: "D", color: "text-warning" }
    return { grade: "F", color: "text-destructive" }
  }

  const performanceGrade = getPerformanceGrade(metrics.performanceScore)

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{metrics.executorName}</CardTitle>
            <CardDescription>Performance Metrics</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Performance Score:</span>
            <Badge className={`${performanceGrade.color} bg-opacity-10`}>
              {metrics.performanceScore}/100 ({performanceGrade.grade})
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium mb-1">Tasks</div>
              <div className="text-2xl font-bold">{metrics.totalTasks}</div>
              <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="float-right font-medium">{metrics.tasksCompleted}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">In Progress:</span>
                  <span className="float-right font-medium">{metrics.tasksInProgress}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Pending:</span>
                  <span className="float-right font-medium">{metrics.tasksPending}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">SLA Compliance</div>
              <div className="text-2xl font-bold">{metrics.onTimeCompletion.toFixed(1)}%</div>
              <Progress value={metrics.onTimeCompletion} className="mt-2" />
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="priorities">Priorities</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-1">Response Time</div>
                  <div className="flex justify-between items-center">
                    <span>Avg: {formatTime(metrics.avgResponseTime)}</span>
                    <span>Min: {formatTime(metrics.minResponseTime)}</span>
                    <span>Max: {formatTime(metrics.maxResponseTime)}</span>
                  </div>
                  <Progress value={metrics.responseTimeSLA} className="mt-1" indicatorClassName="bg-blue-500" />
                  <div className="text-xs text-right mt-1">{metrics.responseTimeSLA.toFixed(1)}% within SLA</div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">Completion Time</div>
                  <div className="flex justify-between items-center">
                    <span>Avg: {formatTime(metrics.avgCompletionTime)}</span>
                    <span>Min: {formatTime(metrics.minCompletionTime)}</span>
                    <span>Max: {formatTime(metrics.maxCompletionTime)}</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">Daily Completions</div>
                  <LineChart
                    data={trendData}
                    lines={[{ dataKey: "completions", name: "Completions", color: "#22c55e" }]}
                    xAxisKey="date"
                    valueFormatter={(value) => value.toString()}
                    height={150}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="categories" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-1">Task Distribution</div>
                  <DonutChart
                    data={categoryData}
                    valueFormatter={(value) => value.toString()}
                    innerRadius={40}
                    outerRadius={60}
                  />
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Completion Rates</div>
                  <BarChart
                    data={Object.entries(metrics.categoryCompletionRates).map(([category, rate]) => ({
                      name: category.charAt(0).toUpperCase() + category.slice(1),
                      value: rate,
                    }))}
                    bars={[{ dataKey: "value", name: "Completion Rate", color: "#22c55e" }]}
                    xAxisKey="name"
                    valueFormatter={(value) => `${value.toFixed(1)}%`}
                    height={150}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="priorities" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-1">Priority Distribution</div>
                  <DonutChart
                    data={priorityData}
                    valueFormatter={(value) => value.toString()}
                    innerRadius={40}
                    outerRadius={60}
                  />
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Completion Rates</div>
                  <BarChart
                    data={Object.entries(metrics.priorityCompletionRates).map(([priority, rate]) => ({
                      name: priority.charAt(0).toUpperCase() + priority.slice(1),
                      value: rate,
                    }))}
                    bars={[{ dataKey: "value", name: "Completion Rate", color: "#22c55e" }]}
                    xAxisKey="name"
                    valueFormatter={(value) => `${value.toFixed(1)}%`}
                    height={150}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}

