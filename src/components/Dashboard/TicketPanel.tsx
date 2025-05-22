// TicketPanel.tsx
import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const TicketPanel = () => {
  const { 
    selectedTickets, 
    isPanelOpen, 
    selectedCategory, 
    selectedValue,
    togglePanel, 
    clearSelectedTickets,
    isLoading,
  } = useDashboard();

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString();
  };

  const generateTitle = () => {
    if (!selectedCategory || !selectedValue) return 'Selected Tickets';
    return `${selectedValue} ${selectedCategory} Tickets`; // Generates title like "Open Status Tickets"
  };

  const getDisplayFields = () => {
    if (!selectedTickets || selectedTickets.length === 0) return [];

    // Fields to display
    const fields = ['ticketNumber', 'date', 'client', 'technology', 'ticketType', 'status', 'assignedTo'];
    if (selectedCategory) {
      const categoryToFieldMap: { [key: string]: string } = {
        technology: 'technology',
        client: 'client',
        tickettype: 'ticketType',
        status: 'status',
        assignedto: 'assignedTo',
        date: 'date',
        ticketnumber: 'ticketNumber',
      };

      const categoryKey = selectedCategory.toLowerCase();
      const fieldToExclude = categoryToFieldMap[categoryKey];

      // Exclude the category column if tickets are already filtered by that category
      if (fieldToExclude) {
        return fields.filter(field => field !== fieldToExclude); // Excludes the 'status' column when status tickets are shown
      }
    }
    return fields;
  };

  const formatFieldName = (field: string) => {
    switch (field) {
      case 'ticketNumber': return 'Ticket Number';
      case 'ticketType': return 'Ticket Type';
      case 'assignedTo': return 'Assigned To';
      default:
        return field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
    }
  };

  const getCellValue = (ticket: any, field: string) => {
    if (field === 'date') {
      return formatDate(ticket.date);
    }
    // Since context normalizes data, use normalized keys directly:
    return ticket[field] ?? 'N/A';
  };

  const displayFields = getDisplayFields();

  return (
    <Sheet open={isPanelOpen} onOpenChange={togglePanel}>
      <SheetContent
        className="sm:max-w-4xl max-w-full flex flex-col overflow-auto min-w-[400px]"
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="flex justify-between items-center">
            <span>{generateTitle()}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={clearSelectedTickets} // Closes the panel and clears selected tickets
              aria-label="Close ticket panel"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            Loading tickets...
          </div>
        ) : selectedTickets && selectedTickets.length > 0 ? (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              Showing {selectedTickets.length} tickets
            </div>

            <div className="flex-1 overflow-auto">
              <Table className="table-auto min-w-[400px] break-words">
                <TableHeader>
                  <TableRow>
                    {displayFields.map(field => (
                      <TableHead 
                        key={field} 
                        className="sticky top-0 bg-white z-20 border-b border-gray-200"
                      >
                        {formatFieldName(field)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedTickets.map((ticket, index) => (
                    <TableRow key={ticket.id ?? `${ticket.ticketNumber}-${index}`}>
                      {displayFields.map(field => (
                        <TableCell key={`${ticket.id ?? ticket.ticketNumber}-${field}`} className="break-words max-w-xs">
                          {getCellValue(ticket, field)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            No tickets selected
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default TicketPanel;