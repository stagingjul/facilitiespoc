"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkline } from "@/components/enhanced-sla/sparkline"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const kpiVariants = cva("", {
  variants: {
    trend: {
      positive: "text-success",
      negative: "text-destructive",
      neutral: "text-muted-foreground",
    },
  },
  defaultVariants: {
    trend: "neutral",
  },
})

interface KPICardProps {
  title: string
  value: string | number
  description?: string
  info?: string
  sparklineData?: Array<{ date: string; value: number }>
  sparklineColor?: string
  trend?: "positive" | "negative" | "neutral"
  trendValue?: string
  valueFormatter?: (value: number) => string
  className?: string
}

export function KPICard({
  title,
  value,
  description,
  info,
  sparklineData,
  sparklineColor,
  trend = "neutral",
  trendValue,
  valueFormatter,
  className,
}: KPICardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {title}
            {info && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 ml-1 inline-block text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">{info}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardTitle>
          {trendValue && <span className={cn("text-xs font-medium", kpiVariants({ trend }))}>{trendValue}</span>}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sparklineData && (
          <div className="mt-2">
            <Sparkline data={sparklineData} color={sparklineColor} valueFormatter={valueFormatter} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

