"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart } from "@/components/enhanced-sla/line-chart"
import { formatTime } from "@/lib/format-time"

interface PerformanceTabProps {
  trendData: Array<{
    date: string
    rawDate: Date
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    pendingTasks: number
    slaCompliance: number
    avgResponseTime: number
    avgCompletionTime: number
  }>
}

export function PerformanceTab({ trendData }: PerformanceTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Time Trend</CardTitle>
            <CardDescription>Average time to respond to tasks over time</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              data={trendData}
              lines={[{ dataKey: "avgResponseTime", name: "Response Time", color: "#3b82f6" }]}
              xAxisKey="date"
              yAxisLabel="Minutes"
              valueFormatter={(value) => formatTime(value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completion Time Trend</CardTitle>
            <CardDescription>Average time to complete tasks over time</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              data={trendData}
              lines={[{ dataKey: "avgCompletionTime", name: "Completion Time", color: "#8884d8" }]}
              xAxisKey="date"
              yAxisLabel="Minutes"
              valueFormatter={(value) => formatTime(value)}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Volume and Completion</CardTitle>
          <CardDescription>Number of tasks created and completed over time</CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart
            data={trendData}
            lines={[
              { dataKey: "totalTasks", name: "Total Tasks", color: "#94a3b8" },
              { dataKey: "completedTasks", name: "Completed Tasks", color: "#22c55e" },
            ]}
            xAxisKey="date"
            valueFormatter={(value) => value.toString()}
            height={400}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Combined Performance Metrics</CardTitle>
          <CardDescription>SLA compliance, response time, and completion time trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground mb-2">
            Note: Response and completion times are scaled to fit on the same chart (lower is better)
          </div>
          <LineChart
            data={trendData.map((day) => ({
              ...day,
              // Scale response and completion times to fit on the same chart as SLA compliance
              scaledResponseTime: Math.max(0, 100 - day.avgResponseTime / 10),
              scaledCompletionTime: Math.max(0, 100 - day.avgCompletionTime / 60),
            }))}
            lines={[
              { dataKey: "slaCompliance", name: "SLA Compliance (%)", color: "#22c55e" },
              { dataKey: "scaledResponseTime", name: "Response Time Efficiency", color: "#3b82f6" },
              { dataKey: "scaledCompletionTime", name: "Completion Time Efficiency", color: "#8884d8" },
            ]}
            xAxisKey="date"
            valueFormatter={(value) => `${value.toFixed(1)}`}
            height={400}
          />
        </CardContent>
      </Card>
    </div>
  )
}

