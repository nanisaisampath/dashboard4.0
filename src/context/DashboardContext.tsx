// DashboardContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { addMonths } from 'date-fns';

// --- Types ---
export interface FilterState {
  startDate: Date;
  endDate: Date;
  technology: string;
  client: string;
  ticketType: string;
  assignedTo: string;
  status: string;
  ticketNumber: string;
}

export interface TicketData {
  id: string | number;
  date: Date | string;
  technology: string;
  client: string;
  ticketType: string;
  assignedTo: string;
  status: string; // This is where the normalized status is stored
  ticketNumber: string;
  responseTime?: number;
  satisfaction?: number;
  [key: string]: any;
}

interface DashboardContextType {
  rawData: any[] | null;
  processedData: TicketData[] | null;
  filteredData: TicketData[] | null;
  selectedTickets: TicketData[] | null;
  selectedCategory: string | null;
  selectedValue: string | null;
  filters: FilterState;
  uniqueValues: Record<keyof Omit<FilterState, 'startDate' | 'endDate'>, string[]>;
  isLoading: boolean;
  isDarkMode: boolean;
  isPanelOpen: boolean;
  updateFilters: (newFilters: Partial<FilterState>, applyImmediately?: boolean) => void;
  resetFilters: () => void;
  applyFilters: (filtersToApply?: FilterState) => void;
  loadExcelData: (data: any[]) => void;
  toggleDarkMode: () => void;
  selectTicketsByCategory: (category: string, value: string) => void;
  clearSelectedTickets: () => void;
  togglePanel: () => void;
  setSelectedTickets: (tickets: TicketData[]) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedValue: (value: string) => void;
}

// --- Context ---
export const DashboardContext = createContext<DashboardContextType>({} as DashboardContextType);

// --- Helper to normalize statuses ---

// --- Provider Component ---
export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const defaultStartDate = addMonths(new Date(), -3);
  const defaultEndDate = new Date();

  const [rawData, setRawData] = useState<any[] | null>(null);
  const [processedData, setProcessedData] = useState<TicketData[] | null>(null);
  const [filteredData, setFilteredData] = useState<TicketData[] | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<TicketData[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);

  const [filters, setFilters] = useState<FilterState>({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    technology: 'All',
    client: 'All',
    ticketType: 'All',
    assignedTo: 'All',
    status: 'All',
    ticketNumber: 'All',
  });

  const [uniqueValues, setUniqueValues] = useState<DashboardContextType['uniqueValues']>({
    technology: ['All'],
    client: ['All'],
    ticketType: ['All'],
    assignedTo: ['All'],
    status: ['All'],
    ticketNumber: ['All'],
  });

  const extractUniqueValues = (data: TicketData[]) => {
    const unique = {
      technology: ['All'],
      client: ['All'],
      ticketType: ['All'],
      assignedTo: ['All'],
      status: ['All'],
      ticketNumber: ['All'],
    };

    data.forEach(ticket => {
      (Object.keys(unique) as Array<keyof typeof unique>).forEach(key => {
        // Use the normalized 'status' field directly for unique values
        const val = (key === 'status' ? ticket.status : ticket[key]) || ticket[key.charAt(0).toUpperCase() + key.slice(1)];
        if (val && !unique[key].includes(val)) {
          unique[key].push(val);
        }
      });
    });

    return unique;
  };

  const processRawData = (data: any[]): TicketData[] => {
    return data.map((row, index) => ({
      id: row.ID || `ticket-${index}`,
      ticketNumber: row['Ticket Number'] || 'Unknown',
      date: row['Assigned Date'] || 'Unknown',
      technology: row['Technology/Platform'] || 'Unknown',
      client: row.Client || 'Unknown',
      ticketType: row['Ticket Type'] || 'Unknown',
      assignedTo: row.AssignedTo || row['Assigned to'] || 'Unassigned',
      status: row.Status || 'Unknown', // Ensure we normalize whatever status field is present
      responseTime: null,
      satisfaction: null,
      ...row,
    }));
  };

  const applyFilters = (filtersToApply?: FilterState) => {
    if (!processedData) return;

    const current = filtersToApply || filters;
    setFilteredData([]);
    setSelectedTickets(null);
    setSelectedCategory(null);
    setSelectedValue(null);

    // The openStatuses and closedStatuses arrays here define the *normalized* values
    const openStatusesFilter = ['Open'];
    const closedStatusesFilter = ['Closed'];

    const filtered = processedData.filter(ticket => {
      const ticketDate = new Date(ticket.date);
      return (
        ticketDate >= current.startDate &&
        ticketDate <= current.endDate &&
        (current.technology === 'All' || ticket.technology === current.technology) &&
        (current.client === 'All' || ticket.client === current.client) &&
        (current.ticketType === 'All' || ticket.ticketType === current.ticketType) &&
        (current.assignedTo === 'All' || ticket.assignedTo === current.assignedTo) &&
        (current.status === 'All' ||
          // Use the normalized ticket.status directly for filtering
          (current.status === 'Open' && openStatusesFilter.includes(ticket.status)) ||
          (current.status === 'Closed' && closedStatusesFilter.includes(ticket.status)) ||
          ticket.status === current.status) &&
        (current.ticketNumber === 'All' || ticket.ticketNumber === current.ticketNumber)
      );
    });

    setFilteredData(filtered);
  };

  const updateFilters = (newFilters: Partial<FilterState>, applyImmediately = false) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      if (applyImmediately) applyFilters(updated);
      return updated;
    });
  };

  const resetFilters = () => {
    const reset = {
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      technology: 'All',
      client: 'All',
      ticketType: 'All',
      assignedTo: 'All',
      status: 'All',
      ticketNumber: 'All',
    };
    setFilters(reset);
    setFilteredData(processedData);
  };

  const loadExcelData = (data: any[]) => {
    setIsLoading(true);
    const processed = processRawData(data);
    const unique = extractUniqueValues(processed);
    setRawData(data);
    setProcessedData(processed);
    setUniqueValues(unique);
    applyFilters(filters);
    setIsLoading(false);
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

// These arrays are now defined within normalizeStatus, as they are used for raw status mapping.
// The filtering in selectTicketsByCategory will continue to use the *normalized* status.
const selectTicketsByCategory = (category: string, value: string) => {
  let filteredTickets = [];

  const normalizedStatus = (status: string) => (status || '').toLowerCase();

  if (category.toLowerCase() === "status") {
    if (value.toLowerCase() === "open") {
      // Open = anything NOT resolved or closed
      filteredTickets = filteredData.filter(item => {
        const status = normalizedStatus(item.status);
        return status !== 'resolved' && status !== 'closed';
      });
    } else if (value.toLowerCase() === "closed") {
      filteredTickets = filteredData.filter(item => normalizedStatus(item.status) === 'closed');
    } else if (value.toLowerCase() === "resolved") {
      filteredTickets = filteredData.filter(item => normalizedStatus(item.status) === 'resolved');
    } else {
      // Match other status types exactly
      filteredTickets = filteredData.filter(item =>
        normalizedStatus(item.status) === value.toLowerCase()
      );
    }
  } else {
    // For non-status fields
    filteredTickets = filteredData.filter(item =>
      ((item[category] || '').toLowerCase() === value.toLowerCase())
    );
  }

  setSelectedTickets(filteredTickets);
  setSelectedCategory(category);
  setSelectedValue(value);
  setIsPanelOpen(true);
};



const clearSelectedTickets = () => {
  setSelectedTickets(null);
  setSelectedCategory(null);
  setSelectedValue(null);
  setIsPanelOpen(false);
};


  const togglePanel = () => setIsPanelOpen(prev => !prev);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    if (prefersDark) document.documentElement.classList.add('dark');
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        rawData,
        processedData,
        filteredData,
        selectedTickets,
        selectedCategory,
        selectedValue,
        filters,
        uniqueValues,
        isLoading,
        isDarkMode,
        isPanelOpen,
        updateFilters,
        resetFilters,
        applyFilters,
        loadExcelData,
        toggleDarkMode,
        selectTicketsByCategory,
        clearSelectedTickets,
        togglePanel,
        setSelectedTickets,
        setSelectedCategory,
        setSelectedValue,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

// --- Hook ---
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
  return context;
};
