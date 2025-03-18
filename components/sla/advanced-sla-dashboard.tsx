"use client"

import { useState } from "react"
import { useData } from "@/components/providers/data-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppLogo } from "@/components/app-logo"
import { ArrowLeft, Download, Menu } from "lucide-react"
import Link from "next/link"
import PerformanceOverview from "@/components/sla/performance-overview"
import ResponseTimeAnalysis from "@/components/sla/response-time-analysis"
import CompletionRateAnalysis from "@/components/sla/completion-rate-analysis"
import CategoryPerformance from "@/components/sla/category-performance"
import ExecutorComparison from "@/components/sla/executor-comparison"
import { useMobileScreen } from "@/hooks/use-mobile-screen"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function AdvancedSLADashboard() {
  const { tasks } = useData()
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days" | "all">("30days")
  const { isMobile, isTablet } = useMobileScreen()
  const [activeTab, setActiveTab] = useState<
    "overview" | "response-time" | "completion-rate" | "categories" | "executors"
  >("overview")

  // Filter tasks based on selected time range
  const getFilteredTasks = () => {
    if (timeRange === "all") return tasks

    const now = new Date()
    const daysToSubtract = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 90
    const cutoffDate = new Date(now.setDate(now.getDate() - daysToSubtract))

    return tasks.filter((task) => new Date(task.createdAt) >= cutoffDate)
  }

  const filteredTasks = getFilteredTasks()

  const handleExportData = () => {
    // In a real application, this would generate a CSV or Excel file
    alert("Data export functionality would be implemented here")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold`}>
            {isMobile ? "SLA Dashboard" : "Advanced SLA Dashboard"}
          </h1>
        </div>
        {!isMobile && (
          <div className="flex items-center gap-2">
            <AppLogo />
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        {!isMobile && (
          <p className="text-muted-foreground">Comprehensive analysis of Service Level Agreement performance metrics</p>
        )}
        <div className={`flex ${isMobile ? "flex-col w-full" : ""} items-center gap-2`}>
          <Select
            value={timeRange}
            onValueChange={(value: "7days" | "30days" | "90days" | "all") => setTimeRange(value)}
          >
            <SelectTrigger className={isMobile ? "w-full" : "w-[180px]"}>
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleExportData}
            className={`flex items-center gap-2 ${isMobile ? "w-full mt-2" : ""}`}
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        {isMobile ? (
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace("-", " ")}
            </h3>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <div className="py-4">
                  <h3 className="text-lg font-medium mb-4">Dashboard Sections</h3>
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant={activeTab === "overview" ? "default" : "ghost"}
                      className="justify-start"
                      onClick={() => setActiveTab("overview")}
                    >
                      Overview
                    </Button>
                    <Button
                      variant={activeTab === "response-time" ? "default" : "ghost"}
                      className="justify-start"
                      onClick={() => setActiveTab("response-time")}
                    >
                      Response Time
                    </Button>
                    <Button
                      variant={activeTab === "completion-rate" ? "default" : "ghost"}
                      className="justify-start"
                      onClick={() => setActiveTab("completion-rate")}
                    >
                      Completion Rate
                    </Button>
                    <Button
                      variant={activeTab === "categories" ? "default" : "ghost"}
                      className="justify-start"
                      onClick={() => setActiveTab("categories")}
                    >
                      Categories
                    </Button>
                    <Button
                      variant={activeTab === "executors" ? "default" : "ghost"}
                      className="justify-start"
                      onClick={() => setActiveTab("executors")}
                    >
                      Executors
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="response-time">Response Time</TabsTrigger>
            <TabsTrigger value="completion-rate">Completion Rate</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="executors">Executors</TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="overview" className="mt-6">
          <PerformanceOverview tasks={filteredTasks} timeRange={timeRange} isMobile={isMobile} isTablet={isTablet} />
        </TabsContent>

        <TabsContent value="response-time" className="mt-6">
          <ResponseTimeAnalysis tasks={filteredTasks} timeRange={timeRange} isMobile={isMobile} isTablet={isTablet} />
        </TabsContent>

        <TabsContent value="completion-rate" className="mt-6">
          <CompletionRateAnalysis tasks={filteredTasks} timeRange={timeRange} isMobile={isMobile} isTablet={isTablet} />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoryPerformance tasks={filteredTasks} timeRange={timeRange} isMobile={isMobile} isTablet={isTablet} />
        </TabsContent>

        <TabsContent value="executors" className="mt-6">
          <ExecutorComparison tasks={filteredTasks} timeRange={timeRange} isMobile={isMobile} isTablet={isTablet} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

