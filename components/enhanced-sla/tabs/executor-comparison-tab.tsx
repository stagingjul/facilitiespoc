"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart } from "@/components/enhanced-sla/bar-chart"
import { formatTime } from "@/lib/format-time"
import { Input } from "@/components/ui/input"
import { ArrowDownAZ, ArrowUpZA, Search } from "lucide-react"
import type { EnhancedSLAMetrics } from "@/lib/generate-sla-metrics"
import { PerformanceMetricsCard } from "@/components/enhanced-sla/performance-metrics-card"

interface ExecutorComparisonTabProps {
  executorPerformance: Array<{
    id: string
    name: string
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    pendingTasks: number
    slaCompliance: number
    avgResponseTime: number
    avgCompletionTime: number
    formattedResponseTime: string
    formattedCompletionTime: string
  }>
  enhancedMetrics?: EnhancedSLAMetrics[]
}

export function ExecutorComparisonTab({ executorPerformance, enhancedMetrics }: ExecutorComparisonTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<string>("completedTasks")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedExecutorId, setSelectedExecutorId] = useState<string | null>(null)

  // Filter and sort executors
  const filteredExecutors = executorPerformance
    .filter((executor) => executor.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const aValue = a[sortField as keyof typeof a]
      const bValue = b[sortField as keyof typeof b]

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return 0
    })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleExecutorSelect = (executorId: string) => {
    setSelectedExecutorId(executorId === selectedExecutorId ? null : executorId)
  }

  // Prepare data for charts
  const completedTasksData = filteredExecutors.slice(0, 10).map((executor) => ({
    name: executor.name,
    value: executor.completedTasks,
  }))

  const responseTimeData = filteredExecutors.slice(0, 10).map((executor) => ({
    name: executor.name,
    value: executor.avgResponseTime,
  }))

  const completionTimeData = filteredExecutors.slice(0, 10).map((executor) => ({
    name: executor.name,
    value: executor.avgCompletionTime,
  }))

  const slaComplianceData = filteredExecutors.slice(0, 10).map((executor) => ({
    name: executor.name,
    value: executor.slaCompliance,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search executors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Executor Performance Table</CardTitle>
          <CardDescription>Detailed performance metrics for each executor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-1">
                      Executor
                      {sortField === "name" &&
                        (sortDirection === "asc" ? (
                          <ArrowUpZA className="h-3 w-3" />
                        ) : (
                          <ArrowDownAZ className="h-3 w-3" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("completedTasks")}>
                    <div className="flex items-center justify-end gap-1">
                      Completed
                      {sortField === "completedTasks" &&
                        (sortDirection === "asc" ? (
                          <ArrowUpZA className="h-3 w-3" />
                        ) : (
                          <ArrowDownAZ className="h-3 w-3" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("inProgressTasks")}>
                    <div className="flex items-center justify-end gap-1">
                      In Progress
                      {sortField === "inProgressTasks" &&
                        (sortDirection === "asc" ? (
                          <ArrowUpZA className="h-3 w-3" />
                        ) : (
                          <ArrowDownAZ className="h-3 w-3" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("slaCompliance")}>
                    <div className="flex items-center justify-end gap-1">
                      SLA Compliance
                      {sortField === "slaCompliance" &&
                        (sortDirection === "asc" ? (
                          <ArrowUpZA className="h-3 w-3" />
                        ) : (
                          <ArrowDownAZ className="h-3 w-3" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("avgResponseTime")}>
                    <div className="flex items-center justify-end gap-1">
                      Avg. Response
                      {sortField === "avgResponseTime" &&
                        (sortDirection === "asc" ? (
                          <ArrowUpZA className="h-3 w-3" />
                        ) : (
                          <ArrowDownAZ className="h-3 w-3" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("avgCompletionTime")}>
                    <div className="flex items-center justify-end gap-1">
                      Avg. Completion
                      {sortField === "avgCompletionTime" &&
                        (sortDirection === "asc" ? (
                          <ArrowUpZA className="h-3 w-3" />
                        ) : (
                          <ArrowDownAZ className="h-3 w-3" />
                        ))}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExecutors.map((executor) => (
                  <TableRow
                    key={executor.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleExecutorSelect(executor.id)}
                    data-selected={selectedExecutorId === executor.id ? true : undefined}
                  >
                    <TableCell className="font-medium">{executor.name}</TableCell>
                    <TableCell className="text-right">{executor.completedTasks}</TableCell>
                    <TableCell className="text-right">{executor.inProgressTasks}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        className={
                          executor.slaCompliance >= 90
                            ? "bg-success/10 text-success"
                            : executor.slaCompliance >= 75
                              ? "bg-warning/10 text-warning"
                              : "bg-destructive/10 text-destructive"
                        }
                      >
                        {executor.slaCompliance.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{executor.formattedResponseTime}</TableCell>
                    <TableCell className="text-right">{executor.formattedCompletionTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks Completed</CardTitle>
            <CardDescription>Number of tasks completed by each executor</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={completedTasksData}
              bars={[{ dataKey: "value", name: "Tasks Completed", color: "#22c55e" }]}
              xAxisKey="name"
              valueFormatter={(value) => value.toString()}
              layout="vertical"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SLA Compliance</CardTitle>
            <CardDescription>Percentage of tasks completed within SLA</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={slaComplianceData}
              bars={[{ dataKey: "value", name: "SLA Compliance", color: "#3b82f6" }]}
              xAxisKey="name"
              valueFormatter={(value) => `${value.toFixed(1)}%`}
              layout="vertical"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Response Time</CardTitle>
            <CardDescription>Average time to respond to tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={responseTimeData}
              bars={[{ dataKey: "value", name: "Response Time", color: "#f97316" }]}
              xAxisKey="name"
              valueFormatter={(value) => formatTime(value)}
              layout="vertical"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Completion Time</CardTitle>
            <CardDescription>Average time to complete tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={completionTimeData}
              bars={[{ dataKey: "value", name: "Completion Time", color: "#8884d8" }]}
              xAxisKey="name"
              valueFormatter={(value) => formatTime(value)}
              layout="vertical"
            />
          </CardContent>
        </Card>
      </div>
      {enhancedMetrics && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Performance Score Comparison</CardTitle>
            <CardDescription>
              Overall performance score based on SLA compliance, response time, and completion rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={enhancedMetrics.slice(0, 10).map((metric) => ({
                name: metric.executorName,
                value: metric.performanceScore,
              }))}
              bars={[{ dataKey: "value", name: "Performance Score", color: "#8b5cf6" }]}
              xAxisKey="name"
              valueFormatter={(value) => `${value.toFixed(0)}/100`}
              layout="vertical"
            />
          </CardContent>
        </Card>
      )}
      {enhancedMetrics && selectedExecutorId && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Detailed Executor Metrics</h3>
          <PerformanceMetricsCard metrics={enhancedMetrics.find((m) => m.executorId === selectedExecutorId)!} />
        </div>
      )}
    </div>
  )
}

