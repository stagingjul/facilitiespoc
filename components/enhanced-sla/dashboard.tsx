"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, HelpCircle } from "lucide-react"
import Link from "next/link"
import { AppLogo } from "@/components/app-logo"
import { useSLAData, type FilterOptions } from "@/hooks/use-sla-data"
import { DashboardFilters } from "@/components/enhanced-sla/dashboard-filters"
import { KPICard } from "@/components/enhanced-sla/kpi-card"
import { DonutChart } from "@/components/enhanced-sla/donut-chart"
import { LineChart } from "@/components/enhanced-sla/line-chart"
import { BarChart } from "@/components/enhanced-sla/bar-chart"
import { PerformanceTab } from "@/components/enhanced-sla/tabs/performance-tab"
import { ExecutorComparisonTab } from "@/components/enhanced-sla/tabs/executor-comparison-tab"
import { TaskTypeTab } from "@/components/enhanced-sla/tabs/task-type-tab"
import { SLABreachesTab } from "@/components/enhanced-sla/tabs/sla-breaches-tab"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function EnhancedSLADashboard() {
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: "30days",
    executors: [],
    taskTypes: [],
    statuses: [],
  })

  const { kpiMetrics, trendData, executorPerformance, taskTypePerformance, slaBreaches, enhancedExecutorMetrics } =
    useSLAData(filters)

  const handleExportData = () => {
    // In a real application, this would generate a CSV or Excel file
    alert("Data export functionality would be implemented here")
  }

  // Prepare data for sparklines
  const slaComplianceSparkline = trendData.map((day) => ({
    date: day.date,
    value: day.slaCompliance,
  }))

  const responseTimeSparkline = trendData.map((day) => ({
    date: day.date,
    value: day.avgResponseTime,
  }))

  const completionTimeSparkline = trendData.map((day) => ({
    date: day.date,
    value: day.avgCompletionTime,
  }))

  // Prepare data for donut chart
  const taskStatusData = [
    { name: "Completed", value: kpiMetrics.completedTasks, color: "#22c55e" },
    { name: "In Progress", value: kpiMetrics.inProgressTasks, color: "#3b82f6" },
    { name: "Pending", value: kpiMetrics.pendingTasks, color: "#eab308" },
  ]

  // Prepare data for SLA compliance trend chart
  const slaComplianceTrendData = trendData.map((day) => ({
    date: day.date,
    slaCompliance: day.slaCompliance,
  }))

  // Prepare data for executor performance chart
  const executorPerformanceData = executorPerformance
    .slice(0, 5) // Top 5 executors
    .map((executor) => ({
      name: executor.name,
      tasksCompleted: executor.completedTasks,
      avgResponseTime: executor.avgResponseTime,
      avgCompletionTime: executor.avgCompletionTime,
    }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">Enhanced SLA Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="hidden md:flex">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Dashboard Help</DialogTitle>
                <DialogDescription>
                  This dashboard provides comprehensive insights into SLA performance metrics.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <h4 className="font-medium mb-1">KPI Cards</h4>
                  <p className="text-sm text-muted-foreground">
                    The top section shows key performance indicators with sparklines to visualize trends.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Charts</h4>
                  <p className="text-sm text-muted-foreground">
                    Interactive charts provide visual representations of SLA compliance, task distribution, and executor
                    performance.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Analysis Tabs</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the tabs to explore detailed performance metrics, executor comparisons, task type analysis, and
                    SLA breaches.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Filters</h4>
                  <p className="text-sm text-muted-foreground">
                    Apply filters to focus on specific time periods, executors, task types, or statuses.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <AppLogo />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <p className="text-muted-foreground">Comprehensive analysis of Service Level Agreement performance metrics</p>
        <div className="flex items-center gap-2">
          <DashboardFilters filters={filters} onFiltersChange={setFilters} />
          <Button variant="outline" onClick={handleExportData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="SLA Compliance"
          value={`${kpiMetrics.slaCompliancePercentage.toFixed(1)}%`}
          description="Tasks completed within SLA"
          info="Percentage of tasks completed within the defined SLA timeframe based on priority level"
          sparklineData={slaComplianceSparkline}
          sparklineColor="#22c55e"
          valueFormatter={(value) => `${value.toFixed(1)}%`}
        />

        <KPICard
          title="Avg. Response Time"
          value={kpiMetrics.formattedResponseTime}
          description="Time to claim a task"
          info="Average time between task creation and when it's claimed by an executor"
          sparklineData={responseTimeSparkline}
          sparklineColor="#3b82f6"
          valueFormatter={(value) => `${Math.round(value)} min`}
        />

        <KPICard
          title="Avg. Completion Time"
          value={kpiMetrics.formattedCompletionTime}
          description="Time to complete a task"
          info="Average time between task creation and completion"
          sparklineData={completionTimeSparkline}
          sparklineColor="#8884d8"
          valueFormatter={(value) => `${Math.round(value)} min`}
        />

        <KPICard
          title="Total Tasks"
          value={kpiMetrics.totalTasks}
          description="All tasks in the system"
          info="Breakdown of tasks by status: completed, in progress, and pending"
          trend={kpiMetrics.completedTasks > kpiMetrics.pendingTasks ? "positive" : "negative"}
          trendValue={`${kpiMetrics.completedTasks} completed / ${kpiMetrics.pendingTasks} pending`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>SLA Compliance Trend</CardTitle>
            <CardDescription>Percentage of tasks meeting SLA over time</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              data={slaComplianceTrendData}
              lines={[{ dataKey: "slaCompliance", name: "SLA Compliance", color: "#22c55e" }]}
              xAxisKey="date"
              yAxisLabel="%"
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>Current distribution of task statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={taskStatusData} valueFormatter={(value) => value.toString()} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Executor Performance</CardTitle>
          <CardDescription>Top 5 executors by tasks completed</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart
            data={executorPerformanceData}
            bars={[{ dataKey: "tasksCompleted", name: "Tasks Completed", color: "#22c55e" }]}
            xAxisKey="name"
            valueFormatter={(value) => value.toString()}
          />
        </CardContent>
      </Card>

      {/* Analysis Tabs */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="executors">Executor Comparison</TabsTrigger>
          <TabsTrigger value="task-types">Task Type Analysis</TabsTrigger>
          <TabsTrigger value="breaches">SLA Breaches</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="mt-6">
          <PerformanceTab trendData={trendData} />
        </TabsContent>

        <TabsContent value="executors" className="mt-6">
          <ExecutorComparisonTab executorPerformance={executorPerformance} enhancedMetrics={enhancedExecutorMetrics} />
        </TabsContent>

        <TabsContent value="task-types" className="mt-6">
          <TaskTypeTab taskTypePerformance={taskTypePerformance} />
        </TabsContent>

        <TabsContent value="breaches" className="mt-6">
          <SLABreachesTab slaBreaches={slaBreaches} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

