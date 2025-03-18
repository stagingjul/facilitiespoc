"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card } from "@/components/ui/card"

interface DonutChartProps {
  data: Array<{
    name: string
    value: number
    color: string
  }>
  innerRadius?: number
  outerRadius?: number
  showLegend?: boolean
  showTooltip?: boolean
  valueFormatter?: (value: number) => string
}

export function DonutChart({
  data,
  innerRadius = 60,
  outerRadius = 80,
  showLegend = true,
  showTooltip = true,
  valueFormatter = (value: number) => value.toString(),
}: DonutChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">No data available</div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              formatter={(value, entry, index) => <span className="text-xs">{value}</span>}
            />
          )}
          {showTooltip && (
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <Card className="p-2 shadow-md border">
                      <div className="font-medium">{payload[0].name}</div>
                      <div>{valueFormatter(payload[0].value as number)}</div>
                    </Card>
                  )
                }
                return null
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

