export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return `${hours} hr${hours !== 1 ? "s" : ""} ${mins > 0 ? ` ${mins} min` : ""}`
}

export function formatTimeShort(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`
  }
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`
}

