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
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface ExecutorComparisonProps {
  tasks: Task[]
  timeRange: "7days" | "30days" | "90days" | "all"
  isMobile: boolean
  isTablet: boolean
}

export default function ExecutorComparison({ tasks, timeRange, isMobile, isTablet }: ExecutorComparisonProps) {
  const { slaMetrics, executors } = useData()
  const [selectedExecutors, setSelectedExecutors] = useState<string[]>(executors.slice(0, 3).map((e) => e.id))

  // Format time (minutes) to hours and minutes
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours} hr${hours !== 1 ? "s" : ""} ${mins} min`
  }

  // Toggle executor selection
  const toggleExecutor = (executorId: string) => {
    if (selectedExecutors.includes(executorId)) {
      if (selectedExecutors.length > 1) {
        // Ensure at least one executor is selected
        setSelectedExecutors(selectedExecutors.filter((id) => id !== executorId))
      }
    } else {
      setSelectedExecutors([...selectedExecutors, executorId])
    }
  }

  // Filter metrics for selected executors
  const filteredMetrics = slaMetrics.filter((metric) => selectedExecutors.includes(metric.executorId))

  // Prepare data for comparison charts
  const tasksCompletedData = filteredMetrics.map((metric) => ({
    name: metric.executorName,
    value: metric.tasksCompleted,
  }))

  const responseTimeData = filteredMetrics.map((metric) => ({
    name: metric.executorName,
    value: metric.avgResponseTime,
  }))

  const completionTimeData = filteredMetrics.map((metric) => ({
    name: metric.executorName,
    value: metric.avgCompletionTime,
  }))

  const onTimeCompletionData = filteredMetrics.map((metric) => ({
    name: metric.executorName,
    value: metric.onTimeCompletion,
  }))

  // Prepare data for radar chart
  const radarData = [
    {
      subject: "Tasks Completed",
      ...filteredMetrics.reduce((acc, metric) => ({ ...acc, [metric.executorName]: metric.tasksCompleted }), {}),
    },
    {
      subject: "On-Time Rate",
      ...filteredMetrics.reduce((acc, metric) => ({ ...acc, [metric.executorName]: metric.onTimeCompletion }), {}),
    },
    {
      subject: "Response Time",
      ...filteredMetrics.reduce(
        (acc, metric) => ({ ...acc, [metric.executorName]: Math.min(100, 100 - metric.avgResponseTime / 10) }),
        {},
      ),
    },
    {
      subject: "Completion Time",
      ...filteredMetrics.reduce(
        (acc, metric) => ({ ...acc, [metric.executorName]: Math.min(100, 100 - metric.avgCompletionTime / 60) }),
        {},
      ),
    },
  ]

  // Prepare data for scatter plot
  const scatterData = filteredMetrics.map((metric) => ({
    x: metric.avgResponseTime,
    y: metric.avgCompletionTime,
    z: metric.tasksCompleted,
    name: metric.executorName,
    onTimeRate: metric.onTimeCompletion,
  }))

  // Generate colors for executors
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"]

  // State for collapsible sections on mobile
  const [openSections, setOpenSections] = useState({
    selection: true,
    performance: false,
    tasksCompleted: false,
    onTimeRate: false,
    responseTime: false,
    completionTime: false,
    scatter: false,
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
        <Collapsible
          open={openSections.selection}
          onOpenChange={() => toggleSection("selection")}
          className="w-full mb-6"
        >
          <Card>
            <CardHeader className="pb-2">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <CardTitle className="text-base">Executor Selection</CardTitle>
                {openSections.selection ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {executors.map((executor, index) => (
                    <Badge
                      key={executor.id}
                      variant={selectedExecutors.includes(executor.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      style={{
                        backgroundColor: selectedExecutors.includes(executor.id)
                          ? COLORS[index % COLORS.length]
                          : undefined,
                      }}
                      onClick={() => toggleExecutor(executor.id)}
                    >
                      {executor.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Executor Selection</CardTitle>
            <CardDescription>Select executors to compare</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {executors.map((executor, index) => (
                <Badge
                  key={executor.id}
                  variant={selectedExecutors.includes(executor.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  style={{
                    backgroundColor: selectedExecutors.includes(executor.id)
                      ? COLORS[index % COLORS.length]
                      : undefined,
                  }}
                  onClick={() => toggleExecutor(executor.id)}
                >
                  {executor.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isMobile ? (
        <Collapsible
          open={openSections.performance}
          onOpenChange={() => toggleSection("performance")}
          className="w-full mb-6"
        >
          <Card>
            <CardHeader className="pb-2">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <CardTitle className="text-base">Performance Comparison</CardTitle>
                {openSections.performance ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      value: {
                        label: "Tasks Completed",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={tasksCompletedData}
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
                        <Bar dataKey="value" name="Tasks Completed" fill="var(--color-value)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="mt-2 text-xs text-center text-muted-foreground">
                  Simplified view: Tasks completed by executor
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Executor Performance Comparison</CardTitle>
            <CardDescription>Radar chart comparing performance across selected executors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ChartContainer
                config={filteredMetrics.reduce(
                  (acc, metric, index) => ({
                    ...acc,
                    [metric.executorName]: {
                      label: metric.executorName,
                      color: COLORS[index % COLORS.length],
                    },
                  }),
                  {},
                )}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    {filteredMetrics.map((metric, index) => (
                      <Radar
                        key={metric.executorId}
                        name={metric.executorName}
                        dataKey={metric.executorName}
                        stroke={COLORS[index % COLORS.length]}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.6}
                      />
                    ))}
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className={`${isMobile ? "" : "grid grid-cols-1 lg:grid-cols-2"} gap-6`}>
        {isMobile ? (
          <Collapsible
            open={openSections.tasksCompleted}
            onOpenChange={() => toggleSection("tasksCompleted")}
            className="w-full mb-6"
          >
            <Card>
              <CardHeader className="pb-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <CardTitle className="text-base">Tasks Completed</CardTitle>
                  {openSections.tasksCompleted ? (
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
                        value: {
                          label: "Tasks Completed",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={tasksCompletedData}
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
                          <Bar dataKey="value" name="Tasks Completed" fill="var(--color-value)" />
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
              <CardTitle>Tasks Completed</CardTitle>
              <CardDescription>Number of tasks completed by each executor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    value: {
                      label: "Tasks Completed",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={tasksCompletedData}
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
                      <Bar dataKey="value" name="Tasks Completed" fill="var(--color-value)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {isMobile ? (
          <Collapsible
            open={openSections.onTimeRate}
            onOpenChange={() => toggleSection("onTimeRate")}
            className="w-full mb-6"
          >
            <Card>
              <CardHeader className="pb-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <CardTitle className="text-base">On-Time Completion Rate</CardTitle>
                  {openSections.onTimeRate ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="h-[250px]">
                    <ChartContainer
                      config={{
                        value: {
                          label: "On-Time Rate (%)",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={onTimeCompletionData}
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
                          <Bar dataKey="value" name="On-Time Rate" fill="var(--color-value)" />
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
              <CardTitle>On-Time Completion Rate</CardTitle>
              <CardDescription>Percentage of tasks completed on time by each executor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    value: {
                      label: "On-Time Rate (%)",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={onTimeCompletionData}
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
        )}
      </div>

      <div className={`${isMobile ? "" : "grid grid-cols-1 lg:grid-cols-2"} gap-6`}>
        {isMobile ? (
          <Collapsible
            open={openSections.responseTime}
            onOpenChange={() => toggleSection("responseTime")}
            className="w-full mb-6"
          >
            <Card>
              <CardHeader className="pb-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <CardTitle className="text-base">Average Response Time</CardTitle>
                  {openSections.responseTime ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="h-[250px]">
                    <ChartContainer
                      config={{
                        value: {
                          label: "Response Time (minutes)",
                          color: "hsl(var(--chart-3))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={responseTimeData}
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
                          <Bar dataKey="value" name="Response Time" fill="var(--color-value)" />
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
              <CardTitle>Average Response Time</CardTitle>
              <CardDescription>Average time to respond to tasks for each executor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    value: {
                      label: "Response Time (minutes)",
                      color: "hsl(var(--chart-3))",
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
        )}

        {isMobile ? (
          <Collapsible
            open={openSections.completionTime}
            onOpenChange={() => toggleSection("completionTime")}
            className="w-full mb-6"
          >
            <Card>
              <CardHeader className="pb-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <CardTitle className="text-base">Average Completion Time</CardTitle>
                  {openSections.completionTime ? (
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
                        value: {
                          label: "Completion Time (minutes)",
                          color: "hsl(var(--chart-4))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={completionTimeData}
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
                          <Bar dataKey="value" name="Completion Time" fill="var(--color-value)" />
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
              <CardTitle>Average Completion Time</CardTitle>
              <CardDescription>Average time to complete tasks for each executor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    value: {
                      label: "Completion Time (minutes)",
                      color: "hsl(var(--chart-4))",
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
        )}
      </div>

      {isMobile ? (
        <Collapsible open={openSections.scatter} onOpenChange={() => toggleSection("scatter")} className="w-full mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <CardTitle className="text-base">Executor Performance</CardTitle>
                {openSections.scatter ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-4">
                  {scatterData.map((data, index) => (
                    <Card key={index} className="p-3 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{data.name}</span>
                        <Badge variant="outline" className="ml-1">
                          {data.onTimeRate.toFixed(1)}% on-time
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Response Time:</span>
                          <span className="float-right">{formatTime(data.x)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Completion Time:</span>
                          <span className="float-right">{formatTime(data.y)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tasks Completed:</span>
                          <span className="float-right">{data.z}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Response Time vs Completion Time</CardTitle>
            <CardDescription>
              Scatter plot showing relationship between response time and completion time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ChartContainer
                config={{
                  scatter: {
                    label: "Executors",
                    color: "hsl(var(--chart-5))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{
                      top: 20,
                      right: 20,
                      bottom: 20,
                      left: 20,
                    }}
                  >
                    <CartesianGrid />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Response Time"
                      label={{ value: "Response Time (minutes)", position: "bottom" }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Completion Time"
                      label={{ value: "Completion Time (minutes)", angle: -90, position: "insideLeft" }}
                    />
                    <ZAxis type="number" dataKey="z" range={[50, 400]} />
                    <ChartTooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={(props) => {
                        if (!props.active || !props.payload || props.payload.length === 0) {
                          return null
                        }
                        const data = props.payload[0].payload
                        return (
                          <div className="bg-white p-2 border rounded shadow-sm">
                            <p className="font-medium">{data.name}</p>
                            <p>Response Time: {formatTime(data.x)}</p>
                            <p>Completion Time: {formatTime(data.y)}</p>
                            <p>Tasks Completed: {data.z}</p>
                            <p>On-Time Rate: {data.onTimeRate.toFixed(1)}%</p>
                          </div>
                        )
                      }}
                    />
                    <Scatter name="Executors" data={scatterData} fill="var(--color-scatter)" />
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

