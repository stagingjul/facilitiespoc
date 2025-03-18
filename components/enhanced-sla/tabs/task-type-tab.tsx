"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart } from "@/components/enhanced-sla/bar-chart"
import { DonutChart } from "@/components/enhanced-sla/donut-chart"
import { formatTime } from "@/lib/format-time"
import { Wrench, Trash2, Shield, AlertTriangle, Lightbulb } from "lucide-react"

interface TaskTypeTabProps {
  taskTypePerformance: Array<{
    type: string
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
}

export function TaskTypeTab({ taskTypePerformance }: TaskTypeTabProps) {
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

  // Prepare data for charts
  const taskDistributionData = taskTypePerformance.map((type) => ({
    name: type.type.charAt(0).toUpperCase() + type.type.slice(1),
    value: type.totalTasks,
    color:
      type.type === "maintenance"
        ? "#0088FE"
        : type.type === "cleaning"
          ? "#00C49F"
          : type.type === "security"
            ? "#FFBB28"
            : type.type === "safety"
              ? "#FF8042"
              : "#8884d8",
  }))

  const slaComplianceData = taskTypePerformance.map((type) => ({
    name: type.type.charAt(0).toUpperCase() + type.type.slice(1),
    value: type.slaCompliance,
  }))

  const responseTimeData = taskTypePerformance.map((type) => ({
    name: type.type.charAt(0).toUpperCase() + type.type.slice(1),
    value: type.avgResponseTime,
  }))

  const completionTimeData = taskTypePerformance.map((type) => ({
    name: type.type.charAt(0).toUpperCase() + type.type.slice(1),
    value: type.avgCompletionTime,
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Type Performance</CardTitle>
          <CardDescription>Performance metrics for each task type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Type</TableHead>
                  <TableHead className="text-right">Total Tasks</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead className="text-right">In Progress</TableHead>
                  <TableHead className="text-right">SLA Compliance</TableHead>
                  <TableHead className="text-right">Avg. Response</TableHead>
                  <TableHead className="text-right">Avg. Completion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taskTypePerformance.map((type) => (
                  <TableRow key={type.type}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(type.type)}
                        <span className="capitalize">{type.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{type.totalTasks}</TableCell>
                    <TableCell className="text-right">{type.completedTasks}</TableCell>
                    <TableCell className="text-right">{type.inProgressTasks}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        className={
                          type.slaCompliance >= 90
                            ? "bg-success/10 text-success"
                            : type.slaCompliance >= 75
                              ? "bg-warning/10 text-warning"
                              : "bg-destructive/10 text-destructive"
                        }
                      >
                        {type.slaCompliance.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{type.formattedResponseTime}</TableCell>
                    <TableCell className="text-right">{type.formattedCompletionTime}</TableCell>
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
            <CardTitle>Task Distribution by Type</CardTitle>
            <CardDescription>Number of tasks in each category</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={taskDistributionData} valueFormatter={(value) => value.toString()} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SLA Compliance by Type</CardTitle>
            <CardDescription>Percentage of tasks meeting SLA by type</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={slaComplianceData}
              bars={[{ dataKey: "value", name: "SLA Compliance", color: "#22c55e" }]}
              xAxisKey="name"
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Response Time by Type</CardTitle>
            <CardDescription>Average time to respond to tasks by type</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={responseTimeData}
              bars={[{ dataKey: "value", name: "Response Time", color: "#3b82f6" }]}
              xAxisKey="name"
              valueFormatter={(value) => formatTime(value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Completion Time by Type</CardTitle>
            <CardDescription>Average time to complete tasks by type</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={completionTimeData}
              bars={[{ dataKey: "value", name: "Completion Time", color: "#8884d8" }]}
              xAxisKey="name"
              valueFormatter={(value) => formatTime(value)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

