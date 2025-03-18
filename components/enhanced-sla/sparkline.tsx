"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts"
import { Card } from "@/components/ui/card"

interface SparklineProps {
  data: Array<{ date: string; value: number }>
  color?: string
  height?: number
  showTooltip?: boolean
  valueFormatter?: (value: number) => string
}

export function Sparkline({
  data,
  color = "hsl(var(--primary))",
  height = 40,
  showTooltip = false,
  valueFormatter = (value: number) => value.toFixed(1),
}: SparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[40px] text-xs text-muted-foreground">No data available</div>
    )
  }

  return (
    <div className="h-[40px] w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
          {showTooltip && (
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <Card className="p-2 shadow-md border text-xs">
                      <div className="font-medium">{payload[0].payload.date}</div>
                      <div>{valueFormatter(payload[0].value as number)}</div>
                    </Card>
                  )
                }
                return null
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

