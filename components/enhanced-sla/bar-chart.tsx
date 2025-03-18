"use client"

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card } from "@/components/ui/card"

interface BarChartProps {
  data: any[]
  bars: Array<{
    dataKey: string
    name: string
    color: string
  }>
  xAxisKey: string
  yAxisLabel?: string
  showGrid?: boolean
  showLegend?: boolean
  showTooltip?: boolean
  valueFormatter?: (value: number) => string
  height?: number
  layout?: "vertical" | "horizontal"
}

export function BarChart({
  data,
  bars,
  xAxisKey,
  yAxisLabel,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  valueFormatter = (value: number) => value.toString(),
  height = 300,
  layout = "horizontal",
}: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">No data available</div>
    )
  }

  return (
    <div className={`h-[${height}px] w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis
            dataKey={layout === "horizontal" ? xAxisKey : undefined}
            type={layout === "horizontal" ? "category" : "number"}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            dataKey={layout === "vertical" ? xAxisKey : undefined}
            type={layout === "vertical" ? "category" : "number"}
            tick={{ fontSize: 12 }}
            label={
              yAxisLabel
                ? { value: yAxisLabel, angle: -90, position: "insideLeft", style: { fontSize: 12 } }
                : undefined
            }
          />
          {showTooltip && (
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <Card className="p-2 shadow-md border">
                      <div className="font-medium">{label}</div>
                      {payload.map((entry, index) => (
                        <div key={`tooltip-${index}`} className="flex items-center gap-2">
                          <div className="w-3 h-3" style={{ backgroundColor: entry.color }}></div>
                          <span>
                            {entry.name}: {valueFormatter(entry.value as number)}
                          </span>
                        </div>
                      ))}
                    </Card>
                  )
                }
                return null
              }}
            />
          )}
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              formatter={(value, entry, index) => <span className="text-xs">{value}</span>}
            />
          )}
          {bars.map((bar, index) => (
            <Bar
              key={`bar-${index}`}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color}
              isAnimationActive={false}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

