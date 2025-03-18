"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart } from "@/components/enhanced-sla/bar-chart"
import { DonutChart } from "@/components/enhanced-sla/donut-chart"
import { formatTime } from "@/lib/format-time"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { SLABreachInfo } from "@/hooks/use-sla-data"

interface SLABreachesTabProps {
  slaBreaches: SLABreachInfo[]
}

export function SLABreachesTab({ slaBreaches }: SLABreachesTabProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter breaches
  const filteredBreaches = slaBreaches.filter(
    (breach) =>
      breach.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      breach.executorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      breach.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      breach.priority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      breach.breachType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      breach.breachSeverity.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Prepare data for charts
  const breachTypeData = [
    {
      name: "Response Time",
      value: slaBreaches.filter((breach) => breach.breachType === "response").length,
      color: "#f97316",
    },
    {
      name: "Completion Time",
      value: slaBreaches.filter((breach) => breach.breachType === "completion").length,
      color: "#8884d8",
    },
  ]

  const breachSeverityData = [
    {
      name: "Minor",
      value: slaBreaches.filter((breach) => breach.breachSeverity === "minor").length,
      color: "#eab308",
    },
    {
      name: "Moderate",
      value: slaBreaches.filter((breach) => breach.breachSeverity === "moderate").length,
      color: "#f97316",
    },
    {
      name: "Severe",
      value: slaBreaches.filter((breach) => breach.breachSeverity === "severe").length,
      color: "#ef4444",
    },
  ]

  // Count breaches by category
  const categoryBreaches = slaBreaches.reduce(
    (acc, breach) => {
      acc[breach.category] = (acc[breach.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const breachByCategoryData = Object.entries(categoryBreaches).map(([category, count]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: count,
  }))

  // Count breaches by executor
  const executorBreaches = slaBreaches.reduce(
    (acc, breach) => {
      acc[breach.executorName] = (acc[breach.executorName] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topExecutorBreaches = Object.entries(executorBreaches)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      value: count,
    }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search SLA breaches..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Breach Type Distribution</CardTitle>
            <CardDescription>Distribution of SLA breaches by type</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={breachTypeData} valueFormatter={(value) => value.toString()} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Breach Severity Distribution</CardTitle>
            <CardDescription>Distribution of SLA breaches by severity</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={breachSeverityData} valueFormatter={(value) => value.toString()} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Breaches by Category</CardTitle>
            <CardDescription>Number of SLA breaches by task category</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={breachByCategoryData}
              bars={[{ dataKey: "value", name: "Breaches", color: "#ef4444" }]}
              xAxisKey="name"
              valueFormatter={(value) => value.toString()}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Executors with Breaches</CardTitle>
            <CardDescription>Executors with the most SLA breaches</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={topExecutorBreaches}
              bars={[{ dataKey: "value", name: "Breaches", color: "#ef4444" }]}
              xAxisKey="name"
              valueFormatter={(value) => value.toString()}
              layout="vertical"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SLA Breach Details</CardTitle>
          <CardDescription>Detailed information about each SLA breach</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Executor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Breach Type</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBreaches.map((breach) => (
                  <TableRow key={`${breach.taskId}-${breach.breachType}`}>
                    <TableCell className="font-medium">{breach.taskTitle}</TableCell>
                    <TableCell>{breach.executorName}</TableCell>
                    <TableCell className="capitalize">{breach.category}</TableCell>
                    <TableCell className="capitalize">{breach.priority}</TableCell>
                    <TableCell className="capitalize">{breach.breachType}</TableCell>
                    <TableCell>{formatTime(breach.expectedTime)}</TableCell>
                    <TableCell>{formatTime(breach.actualTime)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          breach.breachSeverity === "minor"
                            ? "bg-warning/10 text-warning"
                            : breach.breachSeverity === "moderate"
                              ? "bg-orange-500/10 text-orange-500"
                              : "bg-destructive/10 text-destructive"
                        }
                      >
                        {breach.breachSeverity}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(breach.createdAt), "MMM d, yyyy")}</TableCell>
                  </TableRow>
                ))}
                {filteredBreaches.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      No SLA breaches found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

