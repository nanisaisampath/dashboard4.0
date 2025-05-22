import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useDashboard } from '@/context/DashboardContext';
import { CalendarIcon } from 'lucide-react';
import FileUpload from './FileUpload';

const Sidebar = () => {
  const {
    filters,
    uniqueValues,
    updateFilters,
    resetFilters,
    applyFilters,
  } = useDashboard();

  // Local state to track changes before applying
  const [localFilters, setLocalFilters] = useState(filters);
  
  // State to trigger applyFilters after filters update
  const [shouldApply, setShouldApply] = useState(false);

  // Sync localFilters whenever global filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Effect to call applyFilters once after filters update
  useEffect(() => {
    if (shouldApply) {
      applyFilters();
      setShouldApply(false);
    }
  }, [filters, shouldApply, applyFilters]);

  // Handle filter changes in local state
  const handleFilterChange = (name: string, value: string | Date) => {
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // When clicking apply, update global filters and trigger applyFilters
  const handleApplyFilters = () => {
    updateFilters(localFilters);
    setShouldApply(true);
  };
  
  const handleRemoveFilter = (key: string) => {
  const updated = {
    ...localFilters,
    [key]: '', // or null for dates
  };

  // Reset date fields appropriately
  if (key === 'startDate' || key === 'endDate') {
    updated[key] = null;
  }

  setLocalFilters(updated);
  updateFilters(updated);
  applyFilters();
};


  return (
    <aside className="bg-sidebar text-sidebar-foreground w-80 lg:w-96 shrink-0 border-r border-sidebar-border h-screen overflow-y-auto p-4 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold">Excel Insights</h3>
        <p className="text-sm text-sidebar-foreground/70">
          Upload and analyze ticket data
        </p>
      </div>
      
      <FileUpload />
      
      <div className="flex flex-col gap-5">
        <h3 className="text-lg font-medium">Filters</h3>
        
        {/* Date Range Filters */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !localFilters.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {localFilters.startDate ? (
                    format(localFilters.startDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover" align="start">
                <Calendar
                  mode="single"
                  selected={localFilters.startDate}
                  onSelect={(date) => date && handleFilterChange("startDate", date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !localFilters.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {localFilters.endDate ? (
                    format(localFilters.endDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover" align="start">
                <Calendar
                  mode="single"
                  selected={localFilters.endDate}
                  onSelect={(date) => date && handleFilterChange("endDate", date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {/* Dropdown filters */}
        <div className="space-y-4">
          {/* Technology filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Technology</label>
            <Select
              value={localFilters.technology}
              onValueChange={(value) => handleFilterChange("technology", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {uniqueValues.technology.map((tech) => (
                  <SelectItem key={tech} value={tech}>
                    {tech}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Client filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Client</label>
            <Select
              value={localFilters.client}
              onValueChange={(value) => handleFilterChange("client", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {uniqueValues.client.map((client) => (
                  <SelectItem key={client} value={client}>
                    {client}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Ticket Type filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Ticket Type</label>
            <Select
              value={localFilters.ticketType}
              onValueChange={(value) => handleFilterChange("ticketType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {uniqueValues.ticketType.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Assigned To filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Assigned To</label>
            <Select
              value={localFilters.assignedTo}
              onValueChange={(value) => handleFilterChange("assignedTo", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {uniqueValues.assignedTo.map((assignee) => (
                  <SelectItem key={assignee} value={assignee}>
                    {assignee}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Status filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={localFilters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {uniqueValues.status.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Filter buttons */}
        <div className="flex flex-col gap-2 pt-4">
          <Button
            onClick={handleApplyFilters}
            size="lg"
            className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          >
            Apply 
          </Button>
          <Button
            onClick={resetFilters}
            variant="outline"
            size="lg"
            className="w-full border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            Show All
          </Button>
        </div>
      </div>
      
      {/* Push the dark mode toggle to the bottom */}
      <div className="mt-auto text-xs text-sidebar-foreground/50 text-center">
        it soli Dashboard v1.0
      </div>
    </aside>
  );
};

export default Sidebar;
