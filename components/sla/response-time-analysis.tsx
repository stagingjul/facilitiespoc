"use client"

import { useData, type Task } from "@/components/providers/data-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { format, differenceInMinutes } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface ResponseTimeAnalysisProps {
  tasks: Task[]
  timeRange: "7days" | "30days" | "90days" | "all"
  isMobile: boolean
  isTablet: boolean
}

export default function ResponseTimeAnalysis({ tasks, timeRange, isMobile, isTablet }: ResponseTimeAnalysisProps) {
  const { slaMetrics, executors } = useData()

  // Format time (minutes) to hours and minutes
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours} hr${hours !== 1 ? "s" : ""} ${mins} min`
  }

  // Calculate response times for each task
  const calculateResponseTimes = () => {
    return tasks
      .filter((task) => task.status === "in_progress" || task.status === "completed")
      .map((task) => {
        const createdDate = new Date(task.createdAt)
        const updatedDate = new Date(task.updatedAt)
        const responseTime = differenceInMinutes(updatedDate, createdDate)

        const executor = executors.find((e) => e.id === task.assignedTo || e.id === task.claimedBy)

        return {
          id: task.id,
          title: task.title,
          category: task.category,
          priority: task.priority,
          responseTime,
          formattedResponseTime: formatTime(responseTime),
          date: format(createdDate, "MMM dd"),
          executor: executor?.name || "Unknown",
        }
      })
      .sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateA.getTime() - dateB.getTime()
      })
  }

  const responseTimeData = calculateResponseTimes()

  // Calculate average response time by priority
  const responseTimeByPriority = [
    {
      name: "High",
      value:
        responseTimeData.filter((item) => item.priority === "high").reduce((sum, item) => sum + item.responseTime, 0) /
        (responseTimeData.filter((item) => item.priority === "high").length || 1),
    },
    {
      name: "Medium",
      value:
        responseTimeData
          .filter((item) => item.priority === "medium")
          .reduce((sum, item) => sum + item.responseTime, 0) /
        (responseTimeData.filter((item) => item.priority === "medium").length || 1),
    },
    {
      name: "Low",
      value:
        responseTimeData.filter((item) => item.priority === "low").reduce((sum, item) => sum + item.responseTime, 0) /
        (responseTimeData.filter((item) => item.priority === "low").length || 1),
    },
  ]

  // Calculate average response time by category
  const responseTimeByCategory = [
    {
      name: "Maintenance",
      value:
        responseTimeData
          .filter((item) => item.category === "maintenance")
          .reduce((sum, item) => sum + item.responseTime, 0) /
        (responseTimeData.filter((item) => item.category === "maintenance").length || 1),
    },
    {
      name: "Cleaning",
      value:
        responseTimeData
          .filter((item) => item.category === "cleaning")
          .reduce((sum, item) => sum + item.responseTime, 0) /
        (responseTimeData.filter((item) => item.category === "cleaning").length || 1),
    },
    {
      name: "Security",
      value:
        responseTimeData
          .filter((item) => item.category === "security")
          .reduce((sum, item) => sum + item.responseTime, 0) /
        (responseTimeData.filter((item) => item.category === "security").length || 1),
    },
    {
      name: "Safety",
      value:
        responseTimeData
          .filter((item) => item.category === "safety")
          .reduce((sum, item) => sum + item.responseTime, 0) /
        (responseTimeData.filter((item) => item.category === "safety").length || 1),
    },
    {
      name: "Utility",
      value:
        responseTimeData
          .filter((item) => item.category === "utility")
          .reduce((sum, item) => sum + item.responseTime, 0) /
        (responseTimeData.filter((item) => item.category === "utility").length || 1),
    },
  ]

  // Calculate response time distribution
  const responseTimeDistribution = [
    { name: "< 30 min", value: responseTimeData.filter((item) => item.responseTime < 30).length },
    {
      name: "30-60 min",
      value: responseTimeData.filter((item) => item.responseTime >= 30 && item.responseTime < 60).length,
    },
    {
      name: "1-2 hrs",
      value: responseTimeData.filter((item) => item.responseTime >= 60 && item.responseTime < 120).length,
    },
    {
      name: "2-4 hrs",
      value: responseTimeData.filter((item) => item.responseTime >= 120 && item.responseTime < 240).length,
    },
    {
      name: "4-8 hrs",
      value: responseTimeData.filter((item) => item.responseTime >= 240 && item.responseTime < 480).length,
    },
    { name: "> 8 hrs", value: responseTimeData.filter((item) => item.responseTime >= 480).length },
  ]

  // Prepare data for scatter plot (response time vs priority)
  const scatterData = responseTimeData.map((item) => ({
    x: item.priority === "high" ? 3 : item.priority === "medium" ? 2 : 1,
    y: item.responseTime,
    z: 1,
    name: item.title,
    priority: item.priority,
    category: item.category,
    responseTime: item.formattedResponseTime,
  }))

  // State for collapsible sections on mobile
  const [openSections, setOpenSections] = useState({
    trend: true,
    priority: false,
    category: false,
    distribution: false,
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
      <div className={`${isMobile ? "" : "grid grid-cols-1 lg:grid-cols-2"} gap-6`}>
        {isMobile ? (
          <Collapsible open={openSections.trend} onOpenChange={() => toggleSection("trend")} className="w-full mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <CardTitle className="text-base">Response Time Trend</CardTitle>
                  {openSections.trend ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="h-[250px]">
                    <ChartContainer
                      config={{
                        responseTime: {
                          label: "Response Time (minutes)",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={responseTimeData.filter((_, i) => i % 2 === 0)} // Show fewer data points on mobile
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
                            dataKey="responseTime"
                            name="Response Time"
                            stroke="var(--color-responseTime)"
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
              <CardTitle>Response Time Trend</CardTitle>
              <CardDescription>Average time to respond to tasks over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    responseTime: {
                      label: "Response Time (minutes)",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={responseTimeData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="responseTime"
                        name="Response Time"
                        stroke="var(--color-responseTime)"
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
          <Collapsible
            open={openSections.priority}
            onOpenChange={() => toggleSection("priority")}
            className="w-full mb-6"
          >
            <Card>
              <CardHeader className="pb-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <CardTitle className="text-base">Response Time by Priority</CardTitle>
                  {openSections.priority ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="h-[250px]">
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
                          data={responseTimeByPriority}
                          margin={{
                            top: 5,
                            right: 10,
                            left: 0,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} width={25} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
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
              <CardTitle>Response Time by Priority</CardTitle>
              <CardDescription>Average response time for each priority level</CardDescription>
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
                      data={responseTimeByPriority}
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
                  <CardTitle className="text-base">Response Time by Category</CardTitle>
                  {openSections.category ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
                          data={responseTimeByCategory}
                          margin={{
                            top: 5,
                            right: 10,
                            left: 0,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} width={25} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
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
              <CardTitle>Response Time by Category</CardTitle>
              <CardDescription>Average response time for each task category</CardDescription>
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
                      data={responseTimeByCategory}
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
            open={openSections.distribution}
            onOpenChange={() => toggleSection("distribution")}
            className="w-full mb-6"
          >
            <Card>
              <CardHeader className="pb-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <CardTitle className="text-base">Response Time Distribution</CardTitle>
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
                          color: "hsl(var(--chart-4))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={responseTimeDistribution}
                          margin={{
                            top: 5,
                            right: 10,
                            left: 0,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} width={25} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
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
              <CardTitle>Response Time Distribution</CardTitle>
              <CardDescription>Distribution of response times across all tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    value: {
                      label: "Number of Tasks",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={responseTimeDistribution}
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

      {isMobile ? (
        <Collapsible open={openSections.scatter} onOpenChange={() => toggleSection("scatter")} className="w-full mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <CardTitle className="text-base">Response Time vs Priority</CardTitle>
                {openSections.scatter ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <div className="h-[250px]">
                  <ChartContainer
                    config={{
                      scatter: {
                        label: "Response Time",
                        color: "hsl(var(--chart-5))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: "High", value: responseTimeByPriority[0].value },
                          { name: "Medium", value: responseTimeByPriority[1].value },
                          { name: "Low", value: responseTimeByPriority[2].value },
                        ]}
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
                        <Bar dataKey="value" name="Avg. Response Time" fill="var(--color-scatter)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="mt-2 text-xs text-center text-muted-foreground">
                  Simplified view: Average response time by priority
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Response Time vs Priority</CardTitle>
            <CardDescription>Scatter plot showing relationship between priority and response time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ChartContainer
                config={{
                  scatter: {
                    label: "Response Time",
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
                      name="Priority"
                      domain={[0, 4]}
                      tickFormatter={(value) =>
                        value === 3 ? "High" : value === 2 ? "Medium" : value === 1 ? "Low" : ""
                      }
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Response Time"
                      label={{ value: "Minutes", angle: -90, position: "insideLeft" }}
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
                            <p>
                              Priority:{" "}
                              <Badge variant="outline" className="ml-1">
                                {data.priority}
                              </Badge>
                            </p>
                            <p>
                              Category:{" "}
                              <Badge variant="outline" className="ml-1">
                                {data.category}
                              </Badge>
                            </p>
                            <p>Response Time: {data.responseTime}</p>
                          </div>
                        )
                      }}
                    />
                    <Scatter name="Tasks" data={scatterData} fill="var(--color-scatter)" />
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

