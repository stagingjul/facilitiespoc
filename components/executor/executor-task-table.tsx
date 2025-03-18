"use client"

import { useState, useEffect } from "react"
import { useData, type Task } from "@/components/providers/data-provider"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Wrench,
  Trash2,
  Shield,
  AlertTriangle,
  Lightbulb,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import TaskActionForm from "@/components/executor/task-action-form"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ExecutorTaskTableProps {
  tasks: Task[]
  type: "assigned" | "in-progress" | "completed"
}

export default function ExecutorTaskTable({ tasks, type }: ExecutorTaskTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [actionType, setActionType] = useState<"claim" | "complete" | "view">("view")
  const { currentExecutor, claimTask, updateTaskStatus } = useData()

  const handleAction = (task: Task, action: "claim" | "complete" | "view") => {
    setSelectedTask(task)
    setActionType(action)
  }

  const handleClaimTask = () => {
    if (selectedTask && currentExecutor) {
      claimTask(selectedTask.id, currentExecutor)
      updateTaskStatus(selectedTask.id, "in_progress")
      setSelectedTask(null)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500"
      case "medium":
        return "bg-yellow-500/10 text-yellow-500"
      case "low":
        return "bg-green-500/10 text-green-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "maintenance":
        return <Wrench className="h-4 w-4" />
      case "cleaning":
        return <Trash2 className="h-4 w-4" />
      case "security":
        return <Shield className="h-4 w-4" />
      case "safety":
        return <AlertTriangle className="h-4 w-4" />
      case "utility":
        return <Lightbulb className="h-4 w-4" />
      default:
        return null
    }
  }

  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Title
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "priority",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Priority
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        )
      },
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string
        return (
          <Badge variant="outline" className={getPriorityColor(priority)}>
            <span className="capitalize">{priority}</span>
          </Badge>
        )
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Category
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        )
      },
      cell: ({ row }) => {
        const category = row.getValue("category") as string
        return (
          <div className="flex items-center gap-1">
            {getCategoryIcon(category)}
            <span className="capitalize">{category}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "location",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Location
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("location")}</div>,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Created
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt") as string)
        return <div>{format(date, "MMM d, yyyy")}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const task = row.original

        if (type === "assigned") {
          return (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleAction(task, "claim")
              }}
            >
              Claim Task
            </Button>
          )
        } else if (type === "in-progress") {
          return (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleAction(task, "complete")
              }}
            >
              Complete Task
            </Button>
          )
        } else {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleAction(task, "view")
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          )
        }
      },
    },
  ]

  const table = useReactTable({
    data: tasks,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  // Set default pagination
  useEffect(() => {
    table.setPageSize(10)
  }, [table])

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-full bg-muted p-3">
          {type === "assigned" ? (
            <Wrench className="h-4 w-4" />
          ) : type === "in-progress" ? (
            <Shield className="h-4 w-4" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </div>
        <h3 className="mt-4 text-lg font-medium">No {type.replace("-", " ")} tasks</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {type === "assigned"
            ? "You don't have any assigned tasks waiting to be claimed."
            : type === "in-progress"
              ? "You don't have any tasks in progress."
              : "You haven't completed any tasks yet."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter tasks..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span>Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id === "createdAt" ? "Created" : column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    if (type === "assigned") {
                      handleAction(row.original, "claim")
                    } else if (type === "in-progress") {
                      handleAction(row.original, "complete")
                    } else {
                      handleAction(row.original, "view")
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length,
          )}{" "}
          of {table.getFilteredRowModel().rows.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        {selectedTask && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {actionType === "claim" ? "Claim Task" : actionType === "complete" ? "Complete Task" : "Task Details"}
              </DialogTitle>
            </DialogHeader>
            {actionType === "claim" ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{selectedTask.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selectedTask.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getPriorityColor(selectedTask.priority)}>
                    {selectedTask.priority}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{selectedTask.location}</span>
                </div>
                <p className="text-sm">
                  Are you sure you want to claim this task? Once claimed, you will be responsible for completing it.
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedTask(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleClaimTask}>Claim Task</Button>
                </div>
              </div>
            ) : actionType === "complete" ? (
              <TaskActionForm task={selectedTask} onClose={() => setSelectedTask(null)} />
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{selectedTask.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selectedTask.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getPriorityColor(selectedTask.priority)}>
                    {selectedTask.priority}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{selectedTask.location}</span>
                </div>
                {selectedTask.resolution && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Resolution</h4>
                    <p className="text-sm">{selectedTask.resolution}</p>
                  </div>
                )}
                {selectedTask.evidence.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Evidence Photos</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedTask.evidence.map((evidence) => (
                        <div key={evidence.id} className="space-y-1">
                          <div className="aspect-video relative rounded-md overflow-hidden border">
                            <img
                              src={evidence.imageUrl || "/placeholder.svg"}
                              alt="Task evidence"
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setSelectedTask(null)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

