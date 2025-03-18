"use client"

import { useState } from "react"
import { useData } from "@/components/providers/data-provider"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Wrench, Trash2, Shield, AlertTriangle, Lightbulb } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  location: z.string().min(3, {
    message: "Location must be at least 3 characters.",
  }),
  category: z.enum(["maintenance", "cleaning", "security", "safety", "utility"], {
    required_error: "Please select a category.",
  }),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Please select a priority level.",
  }),
  assignedTo: z.string().optional(),
})

interface CreateTaskFormProps {
  onSuccess?: () => void
}

export default function CreateTaskForm({ onSuccess }: CreateTaskFormProps) {
  const { addTask, executors } = useData()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      category: "maintenance",
      priority: "medium",
      assignedTo: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    // Simulate a delay for better UX
    setTimeout(() => {
      addTask(values)
      form.reset()
      setIsSubmitting(false)
      if (onSuccess) onSuccess()
    }, 500)
  }

  // Get category icon based on selected category
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

  const selectedCategory = form.watch("category")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
              </FormControl>
              <FormDescription>A clear and concise title for the task.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="maintenance" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        <span>Maintenance</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="cleaning" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        <span>Cleaning</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="security" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Security</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="safety" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Safety</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="utility" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        <span>Utility</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {selectedCategory === "maintenance" && "Equipment repairs, HVAC issues, plumbing fixes"}
                  {selectedCategory === "cleaning" && "General cleaning, sanitation, waste disposal"}
                  {selectedCategory === "security" && "CCTV checks, door access, patrol reports"}
                  {selectedCategory === "safety" && "Fire extinguisher inspections, hazard removal"}
                  {selectedCategory === "utility" && "Power, water, internet, lighting issues"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Set the urgency level of this task.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the task in detail" className="min-h-[100px]" {...field} />
              </FormControl>
              <FormDescription>Provide detailed information about what needs to be done.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Building A, Floor 3, Room 302" {...field} />
                </FormControl>
                <FormDescription>Where the task needs to be performed.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign To (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Random assignment" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {executors.map((executor) => (
                      <SelectItem key={executor.id} value={executor.id}>
                        {executor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Leave empty for random assignment.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Task"}
        </Button>
      </form>
    </Form>
  )
}

