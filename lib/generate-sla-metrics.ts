import type { Task } from "@/components/providers/data-provider"
import { differenceInMinutes, parseISO } from "date-fns"

export interface EnhancedSLAMetrics {
  executorId: string
  executorName: string

  // Task counts
  tasksCompleted: number
  tasksInProgress: number
  tasksPending: number
  totalTasks: number

  // Time metrics
  avgResponseTime: number // in minutes
  avgCompletionTime: number // in minutes
  minResponseTime: number // in minutes
  maxResponseTime: number // in minutes
  minCompletionTime: number // in minutes
  maxCompletionTime: number // in minutes

  // SLA metrics
  onTimeCompletion: number // percentage
  responseTimeSLA: number // percentage meeting response time SLA

  // Category breakdown
  categoryCounts: Record<string, number>
  categoryCompletionRates: Record<string, number>

  // Priority breakdown
  priorityCounts: Record<string, number>
  priorityCompletionRates: Record<string, number>

  // Trend data (last 7 days)
  dailyCompletionTrend: Array<{ date: string; count: number }>

  // Performance score (0-100)
  performanceScore: number
}

export function generateEnhancedSLAMetrics(
  tasks: Task[],
  executorId: string,
  executorName: string,
): EnhancedSLAMetrics {
  // Filter tasks for this executor
  const executorTasks = tasks.filter((task) => task.assignedTo === executorId || task.claimedBy === executorId)

  // Basic counts
  const completedTasks = executorTasks.filter((task) => task.status === "completed")
  const inProgressTasks = executorTasks.filter((task) => task.status === "in_progress")
  const pendingTasks = executorTasks.filter((task) => task.status === "pending" && task.assignedTo === executorId)

  // Time metrics
  let totalResponseTime = 0
  let responseCount = 0
  let minResponseTime = Number.MAX_VALUE
  let maxResponseTime = 0

  let totalCompletionTime = 0
  let completionCount = 0
  let minCompletionTime = Number.MAX_VALUE
  let maxCompletionTime = 0

  // SLA metrics
  let onTimeCount = 0
  let responseTimeSLACount = 0

  // Process tasks for time metrics
  executorTasks.forEach((task) => {
    // Response time calculations
    if ((task.status === "in_progress" || task.status === "completed") && task.updatedAt && task.createdAt) {
      const createdDate = parseISO(task.createdAt)
      const updatedDate = parseISO(task.updatedAt)
      const responseTime = differenceInMinutes(updatedDate, createdDate)

      totalResponseTime += responseTime
      responseCount++

      if (responseTime < minResponseTime) minResponseTime = responseTime
      if (responseTime > maxResponseTime) maxResponseTime = responseTime

      // Check if response time meets SLA
      let responseTimeSLAThreshold = 240 // 4 hours default
      if (task.priority === "high")
        responseTimeSLAThreshold = 60 // 1 hour
      else if (task.priority === "medium") responseTimeSLAThreshold = 120 // 2 hours

      if (responseTime <= responseTimeSLAThreshold) {
        responseTimeSLACount++
      }
    }

    // Completion time calculations
    if (task.status === "completed" && task.completedAt && task.createdAt) {
      const createdDate = parseISO(task.createdAt)
      const completedDate = parseISO(task.completedAt)
      const completionTime = differenceInMinutes(completedDate, createdDate)

      totalCompletionTime += completionTime
      completionCount++

      if (completionTime < minCompletionTime) minCompletionTime = completionTime
      if (completionTime > maxCompletionTime) maxCompletionTime = completionTime

      // Check if completion time meets SLA
      let completionTimeSLAThreshold = 1440 // 24 hours default
      if (task.priority === "high")
        completionTimeSLAThreshold = 240 // 4 hours
      else if (task.priority === "medium") completionTimeSLAThreshold = 720 // 12 hours

      if (completionTime <= completionTimeSLAThreshold) {
        onTimeCount++
      }
    }
  })

  // Calculate averages
  const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0
  const avgCompletionTime = completionCount > 0 ? totalCompletionTime / completionCount : 0

  // Calculate SLA percentages
  const onTimeCompletion = completionCount > 0 ? (onTimeCount / completionCount) * 100 : 100
  const responseTimeSLA = responseCount > 0 ? (responseTimeSLACount / responseCount) * 100 : 100

  // Category breakdown
  const categories = ["maintenance", "cleaning", "security", "safety", "utility"]
  const categoryCounts: Record<string, number> = {}
  const categoryCompletionRates: Record<string, number> = {}

  categories.forEach((category) => {
    const categoryTasks = executorTasks.filter((task) => task.category === category)
    const completedCategoryTasks = categoryTasks.filter((task) => task.status === "completed")

    categoryCounts[category] = categoryTasks.length
    categoryCompletionRates[category] =
      categoryTasks.length > 0 ? (completedCategoryTasks.length / categoryTasks.length) * 100 : 0
  })

  // Priority breakdown
  const priorities = ["high", "medium", "low"]
  const priorityCounts: Record<string, number> = {}
  const priorityCompletionRates: Record<string, number> = {}

  priorities.forEach((priority) => {
    const priorityTasks = executorTasks.filter((task) => task.priority === priority)
    const completedPriorityTasks = priorityTasks.filter((task) => task.status === "completed")

    priorityCounts[priority] = priorityTasks.length
    priorityCompletionRates[priority] =
      priorityTasks.length > 0 ? (completedPriorityTasks.length / priorityTasks.length) * 100 : 0
  })

  // Generate daily completion trend (last 7 days)
  const dailyCompletionTrend: Array<{ date: string; count: number }> = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateString = date.toISOString().split("T")[0]

    const dayCompletions = completedTasks.filter((task) => {
      if (!task.completedAt) return false
      const completedDate = parseISO(task.completedAt)
      return completedDate.toISOString().split("T")[0] === dateString
    }).length

    dailyCompletionTrend.push({
      date: dateString,
      count: dayCompletions,
    })
  }

  // Calculate performance score (0-100)
  // Based on on-time completion, response time SLA, and task completion rate
  const completionRate = executorTasks.length > 0 ? (completedTasks.length / executorTasks.length) * 100 : 0

  const performanceScore = Math.round(onTimeCompletion * 0.4 + responseTimeSLA * 0.3 + completionRate * 0.3)

  return {
    executorId,
    executorName,

    tasksCompleted: completedTasks.length,
    tasksInProgress: inProgressTasks.length,
    tasksPending: pendingTasks.length,
    totalTasks: executorTasks.length,

    avgResponseTime,
    avgCompletionTime,
    minResponseTime: minResponseTime === Number.MAX_VALUE ? 0 : minResponseTime,
    maxResponseTime,
    minCompletionTime: minCompletionTime === Number.MAX_VALUE ? 0 : minCompletionTime,
    maxCompletionTime,

    onTimeCompletion,
    responseTimeSLA,

    categoryCounts,
    categoryCompletionRates,

    priorityCounts,
    priorityCompletionRates,

    dailyCompletionTrend,

    performanceScore,
  }
}

