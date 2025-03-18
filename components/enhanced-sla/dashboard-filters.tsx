"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FilterX, SlidersHorizontal } from "lucide-react"
import { useData } from "@/components/providers/data-provider"
import type { DateRange, FilterOptions, TaskStatus, TaskType } from "@/hooks/use-sla-data"

interface DashboardFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
}

export function DashboardFilters({ filters, onFiltersChange }: DashboardFiltersProps) {
  const { executors } = useData()
  const [isOpen, setIsOpen] = useState(false)

  const handleDateRangeChange = (value: DateRange) => {
    onFiltersChange({
      ...filters,
      dateRange: value,
    })
  }

  const handleExecutorToggle = (executorId: string) => {
    const newExecutors = filters.executors.includes(executorId)
      ? filters.executors.filter((id) => id !== executorId)
      : [...filters.executors, executorId]

    onFiltersChange({
      ...filters,
      executors: newExecutors,
    })
  }

  const handleTaskTypeToggle = (type: TaskType) => {
    const newTaskTypes = filters.taskTypes.includes(type)
      ? filters.taskTypes.filter((t) => t !== type)
      : [...filters.taskTypes, type]

    onFiltersChange({
      ...filters,
      taskTypes: newTaskTypes,
    })
  }

  const handleStatusToggle = (status: TaskStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status]

    onFiltersChange({
      ...filters,
      statuses: newStatuses,
    })
  }

  const resetFilters = () => {
    onFiltersChange({
      dateRange: "30days",
      executors: [],
      taskTypes: [],
      statuses: [],
    })
    setIsOpen(false)
  }

  const hasActiveFilters = filters.executors.length > 0 || filters.taskTypes.length > 0 || filters.statuses.length > 0

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
      <Select value={filters.dateRange} onValueChange={(value) => handleDateRangeChange(value as DateRange)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select time range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7days">Last 7 days</SelectItem>
          <SelectItem value="30days">Last 30 days</SelectItem>
          <SelectItem value="90days">Last 90 days</SelectItem>
          <SelectItem value="all">All time</SelectItem>
        </SelectContent>
      </Select>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-10">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-primary w-5 h-5 text-[10px] flex items-center justify-center text-primary-foreground">
                {filters.executors.length + filters.taskTypes.length + filters.statuses.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2">
                  <FilterX className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <h5 className="text-sm font-medium">Executors</h5>
              <div className="grid grid-cols-2 gap-2">
                {executors.map((executor) => (
                  <div key={executor.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`executor-${executor.id}`}
                      checked={filters.executors.includes(executor.id)}
                      onCheckedChange={() => handleExecutorToggle(executor.id)}
                    />
                    <Label htmlFor={`executor-${executor.id}`} className="text-sm">
                      {executor.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-sm font-medium">Task Types</h5>
              <div className="grid grid-cols-2 gap-2">
                {["maintenance", "cleaning", "security", "safety", "utility"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filters.taskTypes.includes(type as TaskType)}
                      onCheckedChange={() => handleTaskTypeToggle(type as TaskType)}
                    />
                    <Label htmlFor={`type-${type}`} className="text-sm capitalize">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-sm font-medium">Status</h5>
              <div className="grid grid-cols-2 gap-2">
                {["pending", "in_progress", "completed"].map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.statuses.includes(status as TaskStatus)}
                      onCheckedChange={() => handleStatusToggle(status as TaskStatus)}
                    />
                    <Label htmlFor={`status-${status}`} className="text-sm capitalize">
                      {status.replace("_", " ")}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

