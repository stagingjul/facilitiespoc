"use client"

import { useMemo } from "react"
import { useData } from "@/components/providers/data-provider"
import { formatDateForDisplay, getDateRangeArray } from "@/lib/date-utils"
import { formatTime } from "@/lib/format-time"
import { differenceInMinutes, differenceInHours } from "date-fns"

// Add these imports at the top
import { generateEnhancedSLAMetrics } from "@/lib/generate-sla-metrics"

export type DateRange = "7days" | "30days" | "90days" | "all"
export type TaskType = "maintenance" | "cleaning" | "security" | "safety" | "utility"
export type TaskStatus = "pending" | "in_progress" | "completed"

export interface FilterOptions {
  dateRange: DateRange
  executors: string[]
  taskTypes: TaskType[]
  statuses: TaskStatus[]
}

export interface SLABreachInfo {
  taskId: string
  taskTitle: string
  executorName: string
  category: TaskType
  priority: "high" | "medium" | "low"
  createdAt: string
  completedAt?: string
  breachType: "response" | "completion"
  expectedTime: number
  actualTime: number
  breachSeverity: "minor" | "moderate" | "severe"
}

export function useSLAData(filters: FilterOptions) {
  const { tasks, executors, slaMetrics } = useData()

  // Filter tasks based on selected filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Filter by date range
      if (filters.dateRange !== "all") {
        const days = filters.dateRange === "7days" ? 7 : filters.dateRange === "30days" ? 30 : 90
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)
        if (new Date(task.createdAt) < cutoffDate) {
          return false
        }
      }

      // Filter by executor
      if (filters.executors.length > 0) {
        if (!task.assignedTo || !filters.executors.includes(task.assignedTo)) {
          return false
        }
      }

      // Filter by task type
      if (filters.taskTypes.length > 0 && !filters.taskTypes.includes(task.category)) {
        return false
      }

      // Filter by status
      if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) {
        return false
      }

      return true
    })
  }, [tasks, filters])

  // Calculate KPI metrics
  const kpiMetrics = useMemo(() => {
    const totalTasks = filteredTasks.length
    const completedTasks = filteredTasks.filter((task) => task.status === "completed").length
    const inProgressTasks = filteredTasks.filter((task) => task.status === "in_progress").length
    const pendingTasks = filteredTasks.filter((task) => task.status === "pending").length

    // Calculate SLA compliance
    let onTimeCount = 0
    let totalCompletedWithSLA = 0

    filteredTasks.forEach((task) => {
      if (task.status === "completed" && task.completedAt && task.createdAt) {
        totalCompletedWithSLA++

        const createdDate = new Date(task.createdAt)
        const completedDate = new Date(task.completedAt)
        const completionTimeHours = differenceInHours(completedDate, createdDate)

        // Define SLA thresholds based on priority
        let slaThreshold = 24 // Default
        if (task.priority === "high") slaThreshold = 4
        else if (task.priority === "medium") slaThreshold = 12

        if (completionTimeHours <= slaThreshold) {
          onTimeCount++
        }
      }
    })

    const slaCompliancePercentage = totalCompletedWithSLA > 0 ? (onTimeCount / totalCompletedWithSLA) * 100 : 100

    // Calculate average response time
    let totalResponseTime = 0
    let responseCount = 0

    filteredTasks.forEach((task) => {
      if ((task.status === "in_progress" || task.status === "completed") && task.updatedAt && task.createdAt) {
        const createdDate = new Date(task.createdAt)
        const updatedDate = new Date(task.updatedAt)
        totalResponseTime += differenceInMinutes(updatedDate, createdDate)
        responseCount++
      }
    })

    const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0

    // Calculate average completion time
    let totalCompletionTime = 0
    let completionCount = 0

    filteredTasks.forEach((task) => {
      if (task.status === "completed" && task.completedAt && task.createdAt) {
        const createdDate = new Date(task.createdAt)
        const completedDate = new Date(task.completedAt)
        totalCompletionTime += differenceInMinutes(completedDate, createdDate)
        completionCount++
      }
    })

    const avgCompletionTime = completionCount > 0 ? totalCompletionTime / completionCount : 0

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      slaCompliancePercentage,
      avgResponseTime,
      avgCompletionTime,
      formattedResponseTime: formatTime(avgResponseTime),
      formattedCompletionTime: formatTime(avgCompletionTime),
    }
  }, [filteredTasks])

  // Generate trend data for sparklines and charts
  const trendData = useMemo(() => {
    const days = filters.dateRange === "7days" ? 7 : filters.dateRange === "30days" ? 30 : 90
    if (filters.dateRange === "all") return [] // No trend data for "all" range

    const dateRange = getDateRangeArray(days)

    return dateRange.map((date) => {
      const dayTasks = filteredTasks.filter((task) => {
        const taskDate = new Date(task.createdAt)
        return taskDate.toDateString() === date.toDateString()
      })

      const dayCompletedTasks = dayTasks.filter((task) => task.status === "completed")

      // Calculate SLA compliance for the day
      let onTimeCount = 0
      let totalCompletedWithSLA = 0

      dayCompletedTasks.forEach((task) => {
        if (task.completedAt && task.createdAt) {
          totalCompletedWithSLA++

          const createdDate = new Date(task.createdAt)
          const completedDate = new Date(task.completedAt)
          const completionTimeHours = differenceInHours(completedDate, createdDate)

          // Define SLA thresholds based on priority
          let slaThreshold = 24 // Default
          if (task.priority === "high") slaThreshold = 4
          else if (task.priority === "medium") slaThreshold = 12

          if (completionTimeHours <= slaThreshold) {
            onTimeCount++
          }
        }
      })

      const daySlaCompliance = totalCompletedWithSLA > 0 ? (onTimeCount / totalCompletedWithSLA) * 100 : 100

      // Calculate average response time for the day
      let totalResponseTime = 0
      let responseCount = 0

      dayTasks.forEach((task) => {
        if ((task.status === "in_progress" || task.status === "completed") && task.updatedAt && task.createdAt) {
          const createdDate = new Date(task.createdAt)
          const updatedDate = new Date(task.updatedAt)
          totalResponseTime += differenceInMinutes(updatedDate, createdDate)
          responseCount++
        }
      })

      const dayAvgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0

      // Calculate average completion time for the day
      let totalCompletionTime = 0
      let completionCount = 0

      dayCompletedTasks.forEach((task) => {
        if (task.completedAt && task.createdAt) {
          const createdDate = new Date(task.createdAt)
          const completedDate = new Date(task.completedAt)
          totalCompletionTime += differenceInMinutes(completedDate, createdDate)
          completionCount++
        }
      })

      const dayAvgCompletionTime = completionCount > 0 ? totalCompletionTime / completionCount : 0

      return {
        date: formatDateForDisplay(date),
        rawDate: date,
        totalTasks: dayTasks.length,
        completedTasks: dayCompletedTasks.length,
        inProgressTasks: dayTasks.filter((task) => task.status === "in_progress").length,
        pendingTasks: dayTasks.filter((task) => task.status === "pending").length,
        slaCompliance: daySlaCompliance,
        avgResponseTime: dayAvgResponseTime,
        avgCompletionTime: dayAvgCompletionTime,
      }
    })
  }, [filteredTasks, filters.dateRange])

  // Generate executor performance data
  const executorPerformance = useMemo(() => {
    const executorData = executors.map((executor) => {
      const executorTasks = filteredTasks.filter(
        (task) => task.assignedTo === executor.id || task.claimedBy === executor.id,
      )

      const completedTasks = executorTasks.filter((task) => task.status === "completed")

      // Calculate SLA compliance
      let onTimeCount = 0
      let totalCompletedWithSLA = 0

      completedTasks.forEach((task) => {
        if (task.completedAt && task.createdAt) {
          totalCompletedWithSLA++

          const createdDate = new Date(task.createdAt)
          const completedDate = new Date(task.completedAt)
          const completionTimeHours = differenceInHours(completedDate, createdDate)

          // Define SLA thresholds based on priority
          let slaThreshold = 24 // Default
          if (task.priority === "high") slaThreshold = 4
          else if (task.priority === "medium") slaThreshold = 12

          if (completionTimeHours <= slaThreshold) {
            onTimeCount++
          }
        }
      })

      const slaCompliance = totalCompletedWithSLA > 0 ? (onTimeCount / totalCompletedWithSLA) * 100 : 100

      // Calculate average response time
      let totalResponseTime = 0
      let responseCount = 0

      executorTasks.forEach((task) => {
        if ((task.status === "in_progress" || task.status === "completed") && task.updatedAt && task.createdAt) {
          const createdDate = new Date(task.createdAt)
          const updatedDate = new Date(task.updatedAt)
          totalResponseTime += differenceInMinutes(updatedDate, createdDate)
          responseCount++
        }
      })

      const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0

      // Calculate average completion time
      let totalCompletionTime = 0
      let completionCount = 0

      completedTasks.forEach((task) => {
        if (task.completedAt && task.createdAt) {
          const createdDate = new Date(task.createdAt)
          const completedDate = new Date(task.completedAt)
          totalCompletionTime += differenceInMinutes(completedDate, createdDate)
          completionCount++
        }
      })

      const avgCompletionTime = completionCount > 0 ? totalCompletionTime / completionCount : 0

      return {
        id: executor.id,
        name: executor.name,
        totalTasks: executorTasks.length,
        completedTasks: completedTasks.length,
        inProgressTasks: executorTasks.filter((task) => task.status === "in_progress").length,
        pendingTasks: executorTasks.filter((task) => task.status === "pending").length,
        slaCompliance,
        avgResponseTime,
        avgCompletionTime,
        formattedResponseTime: formatTime(avgResponseTime),
        formattedCompletionTime: formatTime(avgCompletionTime),
      }
    })

    // Sort by number of completed tasks (descending)
    return executorData.sort((a, b) => b.completedTasks - a.completedTasks)
  }, [filteredTasks, executors])

  // Generate task type performance data
  const taskTypePerformance = useMemo(() => {
    const taskTypes: TaskType[] = ["maintenance", "cleaning", "security", "safety", "utility"]

    return taskTypes.map((type) => {
      const typeTasks = filteredTasks.filter((task) => task.category === type)
      const completedTasks = typeTasks.filter((task) => task.status === "completed")

      // Calculate SLA compliance
      let onTimeCount = 0
      let totalCompletedWithSLA = 0

      completedTasks.forEach((task) => {
        if (task.completedAt && task.createdAt) {
          totalCompletedWithSLA++

          const createdDate = new Date(task.createdAt)
          const completedDate = new Date(task.completedAt)
          const completionTimeHours = differenceInHours(completedDate, createdDate)

          // Define SLA thresholds based on priority
          let slaThreshold = 24 // Default
          if (task.priority === "high") slaThreshold = 4
          else if (task.priority === "medium") slaThreshold = 12

          if (completionTimeHours <= slaThreshold) {
            onTimeCount++
          }
        }
      })

      const slaCompliance = totalCompletedWithSLA > 0 ? (onTimeCount / totalCompletedWithSLA) * 100 : 100

      // Calculate average response time
      let totalResponseTime = 0
      let responseCount = 0

      typeTasks.forEach((task) => {
        if ((task.status === "in_progress" || task.status === "completed") && task.updatedAt && task.createdAt) {
          const createdDate = new Date(task.createdAt)
          const updatedDate = new Date(task.updatedAt)
          totalResponseTime += differenceInMinutes(updatedDate, createdDate)
          responseCount++
        }
      })

      const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0

      // Calculate average completion time
      let totalCompletionTime = 0
      let completionCount = 0

      completedTasks.forEach((task) => {
        if (task.completedAt && task.createdAt) {
          const createdDate = new Date(task.createdAt)
          const completedDate = new Date(task.completedAt)
          totalCompletionTime += differenceInMinutes(completedDate, createdDate)
          completionCount++
        }
      })

      const avgCompletionTime = completionCount > 0 ? totalCompletionTime / completionCount : 0

      return {
        type,
        totalTasks: typeTasks.length,
        completedTasks: completedTasks.length,
        inProgressTasks: typeTasks.filter((task) => task.status === "in_progress").length,
        pendingTasks: typeTasks.filter((task) => task.status === "pending").length,
        slaCompliance,
        avgResponseTime,
        avgCompletionTime,
        formattedResponseTime: formatTime(avgResponseTime),
        formattedCompletionTime: formatTime(avgCompletionTime),
      }
    })
  }, [filteredTasks])

  // Generate SLA breach data
  const slaBreaches = useMemo(() => {
    const breaches: SLABreachInfo[] = []

    filteredTasks.forEach((task) => {
      // Check for response time breaches
      if ((task.status === "in_progress" || task.status === "completed") && task.updatedAt && task.createdAt) {
        const createdDate = new Date(task.createdAt)
        const updatedDate = new Date(task.updatedAt)
        const responseTimeHours = differenceInHours(updatedDate, createdDate)

        // Define response time SLA thresholds based on priority
        let responseThreshold = 8 // Default
        if (task.priority === "high") responseThreshold = 1
        else if (task.priority === "medium") responseThreshold = 4

        if (responseTimeHours > responseThreshold) {
          // Calculate breach severity
          let breachSeverity: "minor" | "moderate" | "severe" = "minor"
          if (responseTimeHours > responseThreshold * 2) breachSeverity = "moderate"
          if (responseTimeHours > responseThreshold * 3) breachSeverity = "severe"

          const executorName = executors.find((e) => e.id === (task.claimedBy || task.assignedTo))?.name || "Unknown"

          breaches.push({
            taskId: task.id,
            taskTitle: task.title,
            executorName,
            category: task.category,
            priority: task.priority,
            createdAt: task.createdAt,
            completedAt: task.completedAt || undefined,
            breachType: "response",
            expectedTime: responseThreshold * 60, // Convert to minutes
            actualTime: responseTimeHours * 60, // Convert to minutes
            breachSeverity,
          })
        }
      }

      // Check for completion time breaches
      if (task.status === "completed" && task.completedAt && task.createdAt) {
        const createdDate = new Date(task.createdAt)
        const completedDate = new Date(task.completedAt)
        const completionTimeHours = differenceInHours(completedDate, createdDate)

        // Define completion time SLA thresholds based on priority
        let completionThreshold = 24 // Default
        if (task.priority === "high") completionThreshold = 4
        else if (task.priority === "medium") completionThreshold = 12

        if (completionTimeHours > completionThreshold) {
          // Calculate breach severity
          let breachSeverity: "minor" | "moderate" | "severe" = "minor"
          if (completionTimeHours > completionThreshold * 1.5) breachSeverity = "moderate"
          if (completionTimeHours > completionThreshold * 2) breachSeverity = "severe"

          const executorName = executors.find((e) => e.id === (task.claimedBy || task.assignedTo))?.name || "Unknown"

          breaches.push({
            taskId: task.id,
            taskTitle: task.title,
            executorName,
            category: task.category,
            priority: task.priority,
            createdAt: task.createdAt,
            completedAt: task.completedAt,
            breachType: "completion",
            expectedTime: completionThreshold * 60, // Convert to minutes
            actualTime: completionTimeHours * 60, // Convert to minutes
            breachSeverity,
          })
        }
      }
    })

    // Sort by breach severity (severe first)
    return breaches.sort((a, b) => {
      const severityOrder = { severe: 0, moderate: 1, minor: 2 }
      return severityOrder[a.breachSeverity] - severityOrder[b.breachSeverity]
    })
  }, [filteredTasks, executors])

  // Add this to the return object of the useSLAData function
  const enhancedExecutorMetrics = useMemo(() => {
    return executors.map((executor) => generateEnhancedSLAMetrics(filteredTasks, executor.id, executor.name))
  }, [filteredTasks, executors])

  // Update the return statement to include enhancedExecutorMetrics
  return {
    filteredTasks,
    kpiMetrics,
    trendData,
    executorPerformance,
    taskTypePerformance,
    slaBreaches,
    enhancedExecutorMetrics,
  }
}

