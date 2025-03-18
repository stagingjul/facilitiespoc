import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns"

export function getDateRangeArray(days: number): Date[] {
  const result = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    result.push(subDays(today, i))
  }

  return result
}

export function formatDateForDisplay(date: Date): string {
  return format(date, "MMM dd")
}

export function formatDateForAxis(date: Date): string {
  return format(date, "dd")
}

export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  return isWithinInterval(date, {
    start: startOfDay(startDate),
    end: endOfDay(endDate),
  })
}

