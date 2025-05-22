// SummaryCards.tsx
"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useDashboard } from "@/context/DashboardContext"
import { calculateMetrics } from "@/utils/dataProcessor" // Assuming this utility exists
import { Badge } from "@/components/ui/badge"
import { Ticket, CheckCircle, AlertCircle, Filter } from "lucide-react"

const SummaryCards = () => {
  const { filteredData, isLoading, filters, selectTicketsByCategory } = useDashboard()

  const metrics = React.useMemo(() => {
    if (!filteredData) return {
      totalTickets: 0,
      openTickets: 0,
      resolvedTickets: 0,
    }

    return calculateMetrics(filteredData)
  }, [filteredData])

  // Call selectTicketsByCategory with lowercase keys to match your dataProcessor
  const handleOpenTicketsClick = () => {
    selectTicketsByCategory("status", "Open")  // "Open" handled inside context filtering
  }

  const handleResolvedTicketsClick = () => {
    selectTicketsByCategory("status", "Closed") // "Closed" handled inside context filtering
  }

  const getActiveFilters = () => {
    const activeFilters = []

    if (filters.technology && filters.technology !== "All") {
      activeFilters.push({ label: "Technology", value: filters.technology })
    }

    if (filters.client && filters.client !== "All") {
      activeFilters.push({ label: "Client", value: filters.client })
    }

    if (filters.ticketType && filters.ticketType !== "All") {
      activeFilters.push({ label: "Ticket Type", value: filters.ticketType })
    }

    if (filters.status && filters.status !== "All") {
      activeFilters.push({ label: "Status", value: filters.status })
    }

    if (filters.assignedTo && filters.assignedTo !== "All") {
      activeFilters.push({ label: "Assigned To", value: filters.assignedTo })
    }

    return activeFilters
  }

  const activeFilters = getActiveFilters()

  return (
    <div className="mb-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold">Quick Summary</h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time ticket analytics</p>
        </div>
        <Badge variant="outline" className="px-3 py-1.5 gap-1.5 self-start">
          <Filter className="h-3.5 w-3.5" />
          <span>{activeFilters.length} active filters</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Tickets - No specific click action to open panel for all tickets,
            as the panel is for categorized views. You could add one if desired. */}
        <MetricCard
          title="Total Tickets"
          value={isLoading ? "..." : metrics.totalTickets}
          icon={<Ticket className="h-5 w-5" />}
          color="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/30"
          iconColor="text-violet-500 dark:text-violet-400"
        />

        {/* Open Tickets Card - Clickable to show open tickets in the panel */}
        <div onClick={handleOpenTicketsClick} className="cursor-pointer">
          <MetricCard
            title="Open Tickets"
            value={isLoading ? "..." : metrics.openTickets || 0}
            icon={<AlertCircle className="h-5 w-5" />}
            color="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30"
            iconColor="text-amber-500 dark:text-amber-400"
          />
        </div>

        {/* Resolved Tickets Card - Clickable to show resolved tickets in the panel */}
        <div onClick={handleResolvedTicketsClick} className="cursor-pointer">
          <MetricCard
            title="Resolved Tickets"
            value={isLoading ? "..." : metrics.resolvedTickets || 0}
            icon={<CheckCircle className="h-5 w-5" />}
            color="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/30"
            iconColor="text-emerald-500 dark:text-emerald-400"
          />
        </div>
      </div>

      {activeFilters.length > 0 && (
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardContent className="p-0">
            <div className="p-4 border-b border-border/50 bg-muted/30 dark:bg-muted/10">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                Active Filters
              </h3>
            </div>
            <div className="p-4 flex flex-wrap gap-3">
              {activeFilters.map((filter, index) => (
                <div
                  key={index}
                  className="flex flex-col px-4 py-2 rounded-lg border border-border/50 bg-background dark:bg-gray-800 hover:shadow-sm transition-all"
                >
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{filter.label}</span>
                  <span className="text-sm font-semibold">{filter.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

const MetricCard = ({ title, value, icon, color, iconColor }) => (
  <Card className={`border-none shadow-md hover:scale-[1.02] transition-transform duration-200 ease-in-out overflow-hidden ${color}`}>
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`p-2.5 rounded-full bg-background/80 dark:bg-gray-800/80 ${iconColor}`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
)

export default SummaryCards