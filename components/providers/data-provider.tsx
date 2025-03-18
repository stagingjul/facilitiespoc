"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/components/ui/use-toast"

// Define types
export type TaskStatus = "pending" | "in_progress" | "completed"

export interface TaskEvidence {
  id: string
  imageUrl: string
  timestamp: string
}

// Update the Task interface to include a category field
export interface Task {
  id: string
  title: string
  description: string
  location: string
  category: "maintenance" | "cleaning" | "security" | "safety" | "utility"
  priority: "low" | "medium" | "high"
  status: TaskStatus
  createdAt: string
  updatedAt: string
  assignedTo: string | null
  claimedBy: string | null
  completedAt: string | null
  evidence: TaskEvidence[]
  resolution: string | null
}

export interface Executor {
  id: string
  name: string
  email: string
  tasksCompleted: number
  tasksInProgress: number
  avgCompletionTime: number // in minutes
}

export interface SLAMetrics {
  executorId: string
  executorName: string
  tasksCompleted: number
  tasksInProgress: number
  avgResponseTime: number // in minutes
  avgCompletionTime: number // in minutes
  onTimeCompletion: number // percentage
}

interface DataContextType {
  tasks: Task[]
  executors: Executor[]
  slaMetrics: SLAMetrics[]
  currentRole: "admin" | "executor" | null
  currentExecutor: string | null
  setCurrentRole: (role: "admin" | "executor" | null) => void
  setCurrentExecutor: (executorId: string | null) => void
  addTask: (
    task: Omit<
      Task,
      "id" | "createdAt" | "updatedAt" | "status" | "claimedBy" | "completedAt" | "evidence" | "resolution"
    >,
  ) => void
  updateTaskStatus: (taskId: string, status: TaskStatus, resolution?: string, evidence?: TaskEvidence) => void
  claimTask: (taskId: string, executorId: string) => void
  generateDummyData: () => void
  resetSystem: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// List of executor names for dummy data
const executorNames = [
  { name: "John Smith", email: "john.smith@example.com" },
  { name: "Emma Johnson", email: "emma.johnson@example.com" },
  { name: "Michael Brown", email: "michael.brown@example.com" },
  { name: "Sophia Davis", email: "sophia.davis@example.com" },
  { name: "William Wilson", email: "william.wilson@example.com" },
]

// List of locations for dummy data
const locations = [
  "Building A - Floor 1",
  "Building A - Floor 2",
  "Building B - Lobby",
  "Building B - Cafeteria",
  "Building C - Conference Room",
  "Parking Garage - Level 1",
  "Parking Garage - Level 2",
  "Outdoor Plaza",
  "Main Entrance",
  "Security Office",
]

// List of task titles for dummy data
const taskTitles = [
  "Fix leaking pipe",
  "Replace light bulbs",
  "Clean air conditioning filters",
  "Repair broken door handle",
  "Inspect fire extinguishers",
  "Clear blocked drain",
  "Fix malfunctioning elevator",
  "Repair damaged ceiling tile",
  "Replace worn carpet",
  "Fix faulty electrical outlet",
  "Clean graffiti from wall",
  "Repair broken window",
  "Replace damaged furniture",
  "Fix malfunctioning thermostat",
  "Clear debris from roof",
]

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [executors, setExecutors] = useState<Executor[]>([])
  const [slaMetrics, setSlaMetrics] = useState<SLAMetrics[]>([])
  const [currentRole, setCurrentRole] = useState<"admin" | "executor" | null>(null)
  const [currentExecutor, setCurrentExecutor] = useState<string | null>(null)
  const { toast } = useToast()

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedTasks = localStorage.getItem("fms-tasks")
    const storedExecutors = localStorage.getItem("fms-executors")
    const storedSlaMetrics = localStorage.getItem("fms-sla-metrics")
    const storedCurrentRole = localStorage.getItem("fms-current-role")
    const storedCurrentExecutor = localStorage.getItem("fms-current-executor")

    if (storedTasks) setTasks(JSON.parse(storedTasks))
    if (storedExecutors) setExecutors(JSON.parse(storedExecutors))
    if (storedSlaMetrics) setSlaMetrics(JSON.parse(storedSlaMetrics))
    if (storedCurrentRole) setCurrentRole(JSON.parse(storedCurrentRole))
    if (storedCurrentExecutor) setCurrentExecutor(JSON.parse(storedCurrentExecutor))

    // If no executors exist, create default ones
    if (!storedExecutors) {
      const defaultExecutors = executorNames.map((executor) => ({
        id: uuidv4(),
        name: executor.name,
        email: executor.email,
        tasksCompleted: 0,
        tasksInProgress: 0,
        avgCompletionTime: 0,
      }))
      setExecutors(defaultExecutors)
      localStorage.setItem("fms-executors", JSON.stringify(defaultExecutors))

      // Create initial SLA metrics
      const initialSlaMetrics = defaultExecutors.map((executor) => ({
        executorId: executor.id,
        executorName: executor.name,
        tasksCompleted: 0,
        tasksInProgress: 0,
        avgResponseTime: 0,
        avgCompletionTime: 0,
        onTimeCompletion: 100,
      }))
      setSlaMetrics(initialSlaMetrics)
      localStorage.setItem("fms-sla-metrics", JSON.stringify(initialSlaMetrics))
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("fms-tasks", JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem("fms-executors", JSON.stringify(executors))
  }, [executors])

  useEffect(() => {
    localStorage.setItem("fms-sla-metrics", JSON.stringify(slaMetrics))
  }, [slaMetrics])

  useEffect(() => {
    if (currentRole) {
      localStorage.setItem("fms-current-role", JSON.stringify(currentRole))
    } else {
      localStorage.removeItem("fms-current-role")
    }
  }, [currentRole])

  useEffect(() => {
    if (currentExecutor) {
      localStorage.setItem("fms-current-executor", JSON.stringify(currentExecutor))
    } else {
      localStorage.removeItem("fms-current-executor")
    }
  }, [currentExecutor])

  // Update SLA metrics whenever tasks change
  useEffect(() => {
    if (executors.length === 0) return

    // Calculate new SLA metrics without updating executors inside this effect
    const newSlaMetrics = executors.map((executor) => {
      const executorTasks = tasks.filter((task) => task.assignedTo === executor.id || task.claimedBy === executor.id)

      const completedTasks = executorTasks.filter((task) => task.status === "completed")
      const inProgressTasks = executorTasks.filter((task) => task.status === "in_progress")

      // Calculate average completion time
      let totalCompletionTime = 0
      let onTimeCount = 0

      completedTasks.forEach((task) => {
        if (task.completedAt && task.createdAt) {
          const createdDate = new Date(task.createdAt)
          const completedDate = new Date(task.completedAt)
          const completionTime = (completedDate.getTime() - createdDate.getTime()) / (1000 * 60) // in minutes

          totalCompletionTime += completionTime

          // Consider "on time" if completed within 24 hours (1440 minutes)
          if (completionTime <= 1440) {
            onTimeCount++
          }
        }
      })

      const avgCompletionTime = completedTasks.length > 0 ? totalCompletionTime / completedTasks.length : 0
      const onTimeCompletion = completedTasks.length > 0 ? (onTimeCount / completedTasks.length) * 100 : 100

      // Calculate average response time (time to claim a task)
      let totalResponseTime = 0

      inProgressTasks.concat(completedTasks).forEach((task) => {
        if (task.updatedAt && task.createdAt) {
          const createdDate = new Date(task.createdAt)
          const updatedDate = new Date(task.updatedAt)
          const responseTime = (updatedDate.getTime() - createdDate.getTime()) / (1000 * 60) // in minutes

          totalResponseTime += responseTime
        }
      })

      const avgResponseTime = executorTasks.length > 0 ? totalResponseTime / executorTasks.length : 0

      return {
        executorId: executor.id,
        executorName: executor.name,
        tasksCompleted: completedTasks.length,
        tasksInProgress: inProgressTasks.length,
        avgResponseTime,
        avgCompletionTime,
        onTimeCompletion,
      }
    })

    setSlaMetrics(newSlaMetrics)
  }, [tasks, executors])

  // Add a separate effect to update executor stats based on SLA metrics
  // This breaks the circular dependency
  useEffect(() => {
    if (slaMetrics.length === 0 || executors.length === 0) return

    const newExecutors = executors.map((executor) => {
      const metric = slaMetrics.find((m) => m.executorId === executor.id)

      if (!metric) return executor

      return {
        ...executor,
        tasksCompleted: metric.tasksCompleted,
        tasksInProgress: metric.tasksInProgress,
        avgCompletionTime: metric.avgCompletionTime,
      }
    })

    // Use functional update to avoid dependency on executors
    setExecutors((prev) => {
      // Only update if there's an actual change to avoid infinite loops
      if (JSON.stringify(prev) === JSON.stringify(newExecutors)) {
        return prev
      }
      return newExecutors
    })
  }, [slaMetrics])

  // Update the addTask function to handle manual executor assignment
  const addTask = (
    taskData: Omit<
      Task,
      "id" | "createdAt" | "updatedAt" | "status" | "claimedBy" | "completedAt" | "evidence" | "resolution"
    >,
  ) => {
    // Use the assigned executor from taskData or randomly select one if not provided
    let assignedExecutorId = taskData.assignedTo
    let assignedExecutor

    if (!assignedExecutorId) {
      // Randomly select an executor
      const randomIndex = Math.floor(Math.random() * executors.length)
      assignedExecutor = executors[randomIndex]
      assignedExecutorId = assignedExecutor.id
    } else {
      assignedExecutor = executors.find((e) => e.id === assignedExecutorId)
    }

    const newTask: Task = {
      id: uuidv4(),
      ...taskData,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: assignedExecutorId,
      claimedBy: null,
      completedAt: null,
      evidence: [],
      resolution: null,
    }

    setTasks((prevTasks) => [...prevTasks, newTask])

    toast({
      title: "Task Created",
      description: `Task "${taskData.title}" has been assigned to ${assignedExecutor?.name || "an executor"}`,
    })
  }

  const updateTaskStatus = (taskId: string, status: TaskStatus, resolution?: string, evidence?: TaskEvidence) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const updatedTask = {
            ...task,
            status,
            updatedAt: new Date().toISOString(),
          }

          if (status === "completed") {
            updatedTask.completedAt = new Date().toISOString()
            updatedTask.resolution = resolution || null
          }

          if (evidence) {
            updatedTask.evidence = [...task.evidence, evidence]
          }

          return updatedTask
        }
        return task
      }),
    )

    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      toast({
        title: `Task ${status === "in_progress" ? "Started" : "Completed"}`,
        description: `Task "${task.title}" has been ${status === "in_progress" ? "started" : "completed"}`,
      })
    }
  }

  const claimTask = (taskId: string, executorId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            claimedBy: executorId,
            updatedAt: new Date().toISOString(),
          }
        }
        return task
      }),
    )

    const task = tasks.find((t) => t.id === taskId)
    const executor = executors.find((e) => e.id === executorId)

    if (task && executor) {
      toast({
        title: "Task Claimed",
        description: `Task "${task.title}" has been claimed by ${executor.name}`,
      })
    }
  }

  // Update the generateDummyData function to include categories
  const generateDummyData = () => {
    // Generate random tasks with more varied and realistic patterns
    const dummyTasks: Task[] = []

    // Add categories array
    const categories = ["maintenance", "cleaning", "security", "safety", "utility"]

    // Define time periods for more realistic data distribution
    const now = new Date()
    const oneMonthAgo = new Date(now)
    oneMonthAgo.setMonth(now.getMonth() - 1)

    const twoWeeksAgo = new Date(now)
    twoWeeksAgo.setDate(now.getDate() - 14)

    const oneWeekAgo = new Date(now)
    oneWeekAgo.setDate(now.getDate() - 7)

    // Create a distribution of tasks over time
    // More tasks in recent days, fewer in the past
    const timeDistribution = [
      { startDate: oneMonthAgo, endDate: twoWeeksAgo, count: 20, completionRate: 0.9 },
      { startDate: twoWeeksAgo, endDate: oneWeekAgo, count: 25, completionRate: 0.8 },
      { startDate: oneWeekAgo, endDate: now, count: 35, completionRate: 0.6 },
    ]

    // Generate tasks for each time period
    timeDistribution.forEach((period) => {
      for (let i = 0; i < period.count; i++) {
        // Create date within the period
        const dayRange = (period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24)
        const randomDayOffset = Math.floor(Math.random() * dayRange)
        const createdDate = new Date(period.startDate)
        createdDate.setDate(createdDate.getDate() + randomDayOffset)

        // Add time variance to created date
        createdDate.setHours(Math.floor(Math.random() * 12) + 8) // Between 8 AM and 8 PM
        createdDate.setMinutes(Math.floor(Math.random() * 60))

        // Randomly assign executor with weighted distribution
        // Some executors should have more tasks than others
        const executorWeights = [0.3, 0.25, 0.2, 0.15, 0.1]
        let randomValue = Math.random()
        let cumulativeWeight = 0
        let selectedExecutorIndex = 0

        for (let j = 0; j < executorWeights.length; j++) {
          cumulativeWeight += executorWeights[j]
          if (randomValue <= cumulativeWeight) {
            selectedExecutorIndex = j
            break
          }
        }

        const assignedExecutor = executors[selectedExecutorIndex]

        // Randomly select category with weighted distribution
        // Some categories should be more common than others
        const categoryWeights = {
          maintenance: 0.35,
          cleaning: 0.25,
          security: 0.2,
          safety: 0.15,
          utility: 0.05,
        }

        randomValue = Math.random()
        cumulativeWeight = 0
        let selectedCategory = categories[0]

        for (const category of categories) {
          cumulativeWeight += categoryWeights[category as keyof typeof categoryWeights]
          if (randomValue <= cumulativeWeight) {
            selectedCategory = category
            break
          }
        }

        // Randomly determine priority with weighted distribution based on category
        // Different categories have different priority distributions
        const priorityWeightsByCategory = {
          maintenance: { high: 0.3, medium: 0.5, low: 0.2 },
          cleaning: { high: 0.1, medium: 0.4, low: 0.5 },
          security: { high: 0.5, medium: 0.4, low: 0.1 },
          safety: { high: 0.6, medium: 0.3, low: 0.1 },
          utility: { high: 0.2, medium: 0.5, low: 0.3 },
        }

        const priorityWeights = priorityWeightsByCategory[selectedCategory as keyof typeof priorityWeightsByCategory]
        randomValue = Math.random()
        let selectedPriority: "high" | "medium" | "low" = "medium"

        if (randomValue <= priorityWeights.high) {
          selectedPriority = "high"
        } else if (randomValue <= priorityWeights.high + priorityWeights.medium) {
          selectedPriority = "medium"
        } else {
          selectedPriority = "low"
        }

        // Generate task titles based on category
        const taskTitlesByCategory = {
          maintenance: [
            "Fix leaking pipe in restroom",
            "Replace broken light fixture",
            "Repair damaged door handle",
            "Fix malfunctioning HVAC unit",
            "Repair elevator control panel",
            "Fix broken window",
            "Replace worn carpet in conference room",
            "Repair damaged ceiling tile",
            "Fix faulty electrical outlet",
            "Repair broken furniture",
          ],
          cleaning: [
            "Clean conference room after event",
            "Deep clean kitchen area",
            "Remove graffiti from exterior wall",
            "Clean air conditioning vents",
            "Sanitize restrooms",
            "Clean windows on ground floor",
            "Remove trash from parking area",
            "Clean spill in lobby",
            "Vacuum all office areas",
            "Clean and polish floors in main hall",
          ],
          security: [
            "Investigate unauthorized access attempt",
            "Check malfunctioning security camera",
            "Secure unlocked entrance",
            "Update security badge access",
            "Investigate suspicious activity report",
            "Test emergency alarm system",
            "Escort unauthorized visitor out",
            "Secure sensitive documents left out",
            "Investigate missing equipment report",
            "Check perimeter fence damage",
          ],
          safety: [
            "Remove tripping hazard in hallway",
            "Inspect fire extinguishers",
            "Clear blocked emergency exit",
            "Replace damaged safety signage",
            "Investigate chemical spill",
            "Test smoke detectors",
            "Repair damaged handrail",
            "Clear ice from walkway",
            "Inspect safety equipment",
            "Address exposed wiring hazard",
          ],
          utility: [
            "Check power fluctuation in east wing",
            "Investigate water pressure issue",
            "Reset tripped circuit breaker",
            "Check gas leak report",
            "Restore internet connectivity",
            "Fix phone line static issue",
            "Adjust building temperature",
            "Check water quality complaint",
            "Restore hot water to restrooms",
            "Fix flickering lights in hallway",
          ],
        }

        const titles = taskTitlesByCategory[selectedCategory as keyof typeof taskTitlesByCategory]
        const randomTitleIndex = Math.floor(Math.random() * titles.length)

        // Generate locations with weighted distribution
        const locations = [
          "Building A - Floor 1",
          "Building A - Floor 2",
          "Building B - Lobby",
          "Building B - Cafeteria",
          "Building C - Conference Room",
          "Parking Garage - Level 1",
          "Parking Garage - Level 2",
          "Outdoor Plaza",
          "Main Entrance",
          "Security Office",
        ]

        const randomLocationIndex = Math.floor(Math.random() * locations.length)

        // Determine if task is completed, in progress, or pending based on time period
        let status: TaskStatus
        const completionRandom = Math.random()

        if (completionRandom < period.completionRate) {
          status = "completed"
        } else if (completionRandom < period.completionRate + (1 - period.completionRate) * 0.6) {
          status = "in_progress"
        } else {
          status = "pending"
        }

        // Set up variables for task details
        let completedAt = null
        let updatedAt = createdDate.toISOString()
        let claimedBy = null
        let resolution = null
        let evidence: TaskEvidence[] = []

        // For in_progress and completed tasks, add realistic timing
        if (status === "in_progress" || status === "completed") {
          claimedBy = assignedExecutor.id

          // Response time varies by priority and executor
          // High priority = faster response, with some variability by executor
          let responseMinHours = 0.5
          let responseMaxHours = 4

          if (selectedPriority === "high") {
            responseMinHours = 0.25
            responseMaxHours = 2
          } else if (selectedPriority === "medium") {
            responseMinHours = 0.5
            responseMaxHours = 6
          } else {
            responseMinHours = 1
            responseMaxHours = 12
          }

          // Add executor-specific variability
          const executorEfficiency = 1 - selectedExecutorIndex * 0.1 // First executor is most efficient
          responseMinHours *= executorEfficiency
          responseMaxHours *= executorEfficiency

          // Calculate response time with some randomness
          const responseHours = responseMinHours + Math.random() * (responseMaxHours - responseMinHours)

          // Set updated date to be after created date by response time
          const updatedDate = new Date(createdDate)
          updatedDate.setHours(updatedDate.getHours() + responseHours)
          updatedAt = updatedDate.toISOString()

          // For completed tasks, add completion time and details
          if (status === "completed") {
            // Completion time varies by priority, category, and executor
            let completionMinHours = 1
            let completionMaxHours = 24

            // Adjust by priority
            if (selectedPriority === "high") {
              completionMinHours = 1
              completionMaxHours = 8
            } else if (selectedPriority === "medium") {
              completionMinHours = 2
              completionMaxHours = 24
            } else {
              completionMinHours = 4
              completionMaxHours = 48
            }

            // Adjust by category
            const categoryCompletionMultipliers = {
              maintenance: 1.2,
              cleaning: 0.8,
              security: 0.7,
              safety: 0.9,
              utility: 1.1,
            }

            const categoryMultiplier =
              categoryCompletionMultipliers[selectedCategory as keyof typeof categoryCompletionMultipliers]
            completionMinHours *= categoryMultiplier
            completionMaxHours *= categoryMultiplier

            // Add executor-specific variability
            completionMinHours *= executorEfficiency
            completionMaxHours *= executorEfficiency

            // Calculate completion time with some randomness
            const completionHours = completionMinHours + Math.random() * (completionMaxHours - completionMinHours)

            // Set completed date to be after updated date by completion time
            const completedDate = new Date(updatedDate)
            completedDate.setHours(completedDate.getHours() + completionHours)
            completedAt = completedDate.toISOString()

            // Add resolution with category-specific text
            const resolutionsByCategory = {
              maintenance: [
                "Repaired the issue and tested functionality. All systems working properly now.",
                "Replaced damaged component and verified operation.",
                "Fixed the problem by adjusting and lubricating the mechanism.",
                "Completed maintenance as requested. Unit is now functioning correctly.",
                "Repaired and tested. Issue resolved successfully.",
              ],
              cleaning: [
                "Area thoroughly cleaned and sanitized according to standards.",
                "Completed deep cleaning of the specified area.",
                "Removed all debris and sanitized surfaces.",
                "Cleaned and restored area to proper condition.",
                "Completed cleaning task and verified with supervisor.",
              ],
              security: [
                "Investigated and resolved security concern. Area is now secure.",
                "Addressed security issue and updated access controls.",
                "Completed security check and documented findings.",
                "Resolved security vulnerability and tested systems.",
                "Security issue addressed and preventive measures implemented.",
              ],
              safety: [
                "Hazard removed and area made safe for normal use.",
                "Safety issue resolved and area inspected for compliance.",
                "Completed safety repairs and tested functionality.",
                "Addressed safety concern and updated warning signage.",
                "Safety issue mitigated and documented per protocol.",
              ],
              utility: [
                "Utility service restored and tested for proper operation.",
                "Fixed utility issue and verified with building management.",
                "Restored service and confirmed functionality with users.",
                "Repaired utility problem and documented solution.",
                "Utility issue resolved and systems are now functioning normally.",
              ],
            }

            const resolutions = resolutionsByCategory[selectedCategory as keyof typeof resolutionsByCategory]
            const randomResolutionIndex = Math.floor(Math.random() * resolutions.length)
            resolution = resolutions[randomResolutionIndex]

            // Add evidence with 80% probability
            if (Math.random() < 0.8) {
              evidence = [
                {
                  id: uuidv4(),
                  imageUrl: `/placeholder.svg?height=300&width=400&text=Evidence+Photo+${selectedCategory}`,
                  timestamp: completedAt,
                },
              ]

              // Add second evidence with 30% probability
              if (Math.random() < 0.3) {
                evidence.push({
                  id: uuidv4(),
                  imageUrl: `/placeholder.svg?height=300&width=400&text=Additional+Evidence+${selectedCategory}`,
                  timestamp: completedAt,
                })
              }
            }
          }
        }

        // Create the task with all the generated data
        dummyTasks.push({
          id: uuidv4(),
          title: titles[randomTitleIndex],
          description: `This is a ${selectedPriority} priority ${selectedCategory} task that needs attention at ${locations[randomLocationIndex]}.`,
          location: locations[randomLocationIndex],
          category: selectedCategory as "maintenance" | "cleaning" | "security" | "safety" | "utility",
          priority: selectedPriority,
          status,
          createdAt: createdDate.toISOString(),
          updatedAt,
          assignedTo: assignedExecutor.id,
          claimedBy,
          completedAt,
          evidence,
          resolution,
        })
      }
    })

    // Sort tasks by creation date (newest first)
    dummyTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setTasks(dummyTasks)

    toast({
      title: "Enhanced Demo Data Generated",
      description: `${dummyTasks.length} sample tasks have been created with realistic patterns and varied metrics`,
    })
  }

  const resetSystem = () => {
    // Reset tasks
    setTasks([])

    // Reset executor stats but keep the executors
    const resetExecutors = executors.map((executor) => ({
      ...executor,
      tasksCompleted: 0,
      tasksInProgress: 0,
      avgCompletionTime: 0,
    }))
    setExecutors(resetExecutors)

    // Reset SLA metrics
    const resetSlaMetrics = slaMetrics.map((metric) => ({
      ...metric,
      tasksCompleted: 0,
      tasksInProgress: 0,
      avgResponseTime: 0,
      avgCompletionTime: 0,
      onTimeCompletion: 100,
    }))
    setSlaMetrics(resetSlaMetrics)

    toast({
      title: "System Reset",
      description: "All tasks and metrics have been cleared",
    })
  }

  return (
    <DataContext.Provider
      value={{
        tasks,
        executors,
        slaMetrics,
        currentRole,
        currentExecutor,
        setCurrentRole,
        setCurrentExecutor,
        addTask,
        updateTaskStatus,
        claimTask,
        generateDummyData,
        resetSystem,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

