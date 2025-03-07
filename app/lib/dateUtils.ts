import { format, parseISO } from 'date-fns';

// Format a date string (YYYY-MM-DD) to a more readable format (e.g., March 07, 2025)
export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMMM dd, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

// Format a date string to show only the month and year (e.g., March 2025)
export function formatMonthYear(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMMM yyyy');
  } catch (error) {
    console.error('Error formatting month/year:', error);
    return dateString;
  }
}

// Get the current date in YYYY-MM-DD format
export function getCurrentDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

// Get the day of the week from a date string (e.g., Monday, Tuesday, etc.)
export function getDayOfWeek(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'EEEE');
  } catch (error) {
    console.error('Error getting day of week:', error);
    return '';
  }
}

// Get the week range for a given date (e.g., "March 03–09, 2025")
export function getWeekRange(dateString: string): string {
  try {
    const date = parseISO(dateString);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate the start of the week (Sunday)
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - dayOfWeek);
    
    // Calculate the end of the week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    // Format the week range
    const startMonth = format(startOfWeek, 'MMMM');
    const endMonth = format(endOfWeek, 'MMMM');
    
    if (startMonth === endMonth) {
      // Same month (e.g., "March 03–09, 2025")
      return `${startMonth} ${format(startOfWeek, 'dd')}–${format(endOfWeek, 'dd')}, ${format(endOfWeek, 'yyyy')}`;
    } else {
      // Different months (e.g., "March 29–April 04, 2025")
      return `${format(startOfWeek, 'MMMM dd')}–${format(endOfWeek, 'MMMM dd')}, ${format(endOfWeek, 'yyyy')}`;
    }
  } catch (error) {
    console.error('Error getting week range:', error);
    return '';
  }
}

// Convert cents to dollars with proper formatting (e.g., $120)
export function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toFixed(0)}`;
} 