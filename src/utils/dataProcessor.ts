
import { read, utils } from 'xlsx';

/**
 * Parses an Excel file and returns the data as an array of objects
 * @param file - The Excel file to parse
 * @returns Promise that resolves to an array of objects representing the Excel data
 */
export const parseExcelFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = read(data, { type: 'binary' });
        
        // Assume first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON with headers
        const jsonData = utils.sheet_to_json(worksheet, { 
          header: 'A',
          range: 0,
          raw: false,
          defval: null
        });
        
        // Get headers from the first row
        const headers = jsonData[0];
        
        // Remove header row and map data to objects with proper keys
        const result = jsonData.slice(1).map((row: any) => {
          const obj: any = {};
          Object.keys(row).forEach((key) => {
            const header = headers[key];
            if (header) {
              obj[header] = row[key];
            }
          });
          return obj;
        });
        
        console.log('Parsed Excel headers:', headers);
        console.log('Sample data:', result.slice(0, 1));
        
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsBinaryString(file);
  });
};
/**
  data processing for the open and lcosed tickets 
 */


/**
 * Calculates metrics from ticket data
 * @param data - Array of ticket data
 * @returns Object containing calculated metrics
 */
export const calculateMetrics = (data: any[]) => {
  if (!data || data.length === 0) {
    return {
      totalTickets: 0,
      openTickets: 0,
      resolvedTickets: 0
    };
  }

  const totalTickets = data.length;

  const openStatuses = ['open', 'in review', 'hold', 'in progress'];
  const resolvedStatuses = ['closed'];

  const openTickets = data.filter(item => {
    const status = (item.Status || item.status || '').toLowerCase();
    return openStatuses.includes(status);
  }).length;

  const resolvedTickets = data.filter(item => {
    const status = (item.Status || item.status || '').toLowerCase();
    return resolvedStatuses.includes(status);
  }).length;

  return {
    totalTickets,
    openTickets,
    resolvedTickets
  };
};



/**
 * Prepare data for time series chart
 * @param data - Array of ticket data
 * @returns Prepared data for time series chart
 */
export const prepareTimeSeriesData = (data: any[]) => {
  if (!data || data.length === 0) return [];
  
  // Group tickets by date - look for both 'Date' and 'date' fields
  const ticketsByDate: Record<string, number> = {};
  
  data.forEach(ticket => {
    const dateValue = ticket.Date || ticket.date;
    if (dateValue) {
      // Format the date as YYYY-MM-DD
      const dateKey = new Date(dateValue).toISOString().split('T')[0];
      
      if (ticketsByDate[dateKey]) {
        ticketsByDate[dateKey]++;
      } else {
        ticketsByDate[dateKey] = 1;
      }
    }
  });
  
  // Convert to array format for chart
  return Object.entries(ticketsByDate)
    .map(([date, count]) => ({ 
      date, 
      tickets: count 
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

/**
 * Prepare data for categorical charts (bar, pie, etc)
 * @param data - Array of ticket data
 * @param category - The category to group by
 * @returns Prepared data for categorical chart
 */
export const prepareCategoryData = (data: any[], category: string) => {
  if (!data || data.length === 0) return [];
  
  // Group tickets by the specified category
  const ticketsByCategory: Record<string, number> = {};
  
  data.forEach(ticket => {
    // Try to get the value with the exact category name first,
    // then try lowercase, then try with spaces removed
    let categoryValue;
    
    if (category === 'technology') {
      // Special handling for technology field which might be "Technology/Platform" in the data
      categoryValue = ticket['Technology/Platform'] || ticket.Technology || ticket.technology;
    } else if (category === 'assignedTo') {
      // Special handling for assignedTo field which might be "Assigned to" in the data
      categoryValue = ticket['Assigned to'] || ticket.AssignedTo || ticket['Assigned To'] || ticket.assignedTo;
    } else {
      categoryValue = ticket[category];
      
      if (categoryValue === undefined) {
        // Try lowercase version
        categoryValue = ticket[category.toLowerCase()];
      }
      
      if (categoryValue === undefined) {
        // Try converting "ticketType" to "Ticket Type" format and check
        const spaced = category.replace(/([A-Z])/g, ' $1').trim();
        const capitalized = spaced.charAt(0).toUpperCase() + spaced.slice(1);
        categoryValue = ticket[capitalized];
      }
      
      // If still undefined, try the "Ticket Type" to "TicketType" conversion
      if (categoryValue === undefined && category.includes(' ')) {
        const camelCase = category.replace(/ ([a-z])/g, (match) => match[1].toUpperCase());
        categoryValue = ticket[camelCase];
      }
    }
    
    // Normalize to a string or use 'Unknown'
    const value = (categoryValue !== undefined && categoryValue !== null) 
      ? String(categoryValue) 
      : 'Unknown';
    
    if (ticketsByCategory[value]) {
      ticketsByCategory[value]++;
    } else {
      ticketsByCategory[value] = 1;
    }
  });
  
  // Convert to array format for chart
  return Object.entries(ticketsByCategory)
    .map(([name, value]) => ({ 
      name, 
      value 
    }));
};
