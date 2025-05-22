"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useDashboard } from "@/context/DashboardContext"
import { calculateMetrics } from "@/utils/dataProcessor"
import { Badge } from "@/components/ui/badge"
import { Ticket, CheckCircle, AlertCircle, Filter } from "lucide-react"

const SummaryCards = () => {
  const { filteredData, isLoading, filters, selectTicketsByCategory } = useDashboard()

  const metrics = React.useMemo(() => {
    if (!filteredData)
      return {
        totalTickets: 0,
        openTickets: 0,
        resolvedTickets: 0,
      }
    return calculateMetrics(filteredData)
  }, [filteredData])

  const handleOpenTicketsClick = () => {
    selectTicketsByCategory("status", "Open")
  }

  const handleResolvedTicketsClick = () => {
    selectTicketsByCategory("status", "Closed")
  }

  const getActiveFilters = () => {
    const activeFilters = []

    // Technology Filter
    activeFilters.push({
      label: "Technology",
      value: filters.technology && filters.technology !== "All" ? filters.technology : "All"
    })

    // Client Filter
    activeFilters.push({
      label: "Client",
      value: filters.client && filters.client !== "All" ? filters.client : "All"
    })

    // Ticket Type Filter
    activeFilters.push({
      label: "Ticket Type",
      value: filters.ticketType && filters.ticketType !== "All" ? filters.ticketType : "All"
    })

    // Status Filter
    activeFilters.push({
      label: "Status",
      value: filters.status && filters.status !== "All" ? filters.status : "All"
    })

    // Assigned To Filter
    activeFilters.push({
      label: "Assigned To",
      value: filters.assignedTo && filters.assignedTo !== "All" ? filters.assignedTo : "All"
    })

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
        <MetricCard
          title="Total Tickets"
          value={isLoading ? "..." : metrics.totalTickets}
          icon={<Ticket className="h-5 w-5" />}
          color="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/30"
          iconColor="text-violet-500 dark:text-violet-400"
        />

        <div onClick={handleOpenTicketsClick} className="cursor-pointer">
          <MetricCard
            title="Open Tickets"
            value={isLoading ? "..." : metrics.openTickets || 0}
            icon={<AlertCircle className="h-5 w-5" />}
            color="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30"
            iconColor="text-amber-500 dark:text-amber-400"
          />
        </div>

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

      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        {/* Reset CardContent padding to p-0, and apply padding to its children */}
        <CardContent className="p-0">
          {/* Header section with increased padding and bold font */}
          <div className="p-4 sm:p-6 border-b border-border/50 bg-muted/30 dark:bg-muted/10">
            <h3 className="text-base sm:text-lg font-medium flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              Active Filters
            </h3>
          </div>
          {/* Content section with increased padding and larger filter values */}
          <div className="p-4 sm:p-6 flex flex-wrap gap-4">
            {activeFilters.map((filter, index) => (
              <div
                key={index}
                className="flex flex-col px-5 py-3 rounded-lg border border-border/50 bg-background dark:bg-gray-800 hover:shadow-sm transition-all"
              >
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{filter.label}</span>
                <span className="text-base sm:text-lg font-semibold">{filter.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
