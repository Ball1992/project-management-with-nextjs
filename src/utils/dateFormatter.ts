/**
 * Date formatting utilities for consistent date display across the application
 */

/**
 * Format date to dd/MM/yyyy format
 * @param date - Date object, string, or null/undefined
 * @returns Formatted date string in dd/MM/yyyy format or fallback text
 */
export const formatDateToDDMMYYYY = (date: Date | string | null | undefined, fallback: string = 'N/A'): string => {
  if (!date) return fallback;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }
    
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.warn('Error formatting date:', error);
    return fallback;
  }
};

/**
 * Format date to dd/MM/yyyy format for display in tables
 * @param date - Date object, string, or null/undefined
 * @returns Formatted date string in dd/MM/yyyy format or 'Not set'
 */
export const formatDateForTable = (date: Date | string | null | undefined): string => {
  return formatDateToDDMMYYYY(date, 'Not set');
};

/**
 * Format date to dd/MM/yyyy format for general display
 * @param date - Date object, string, or null/undefined
 * @returns Formatted date string in dd/MM/yyyy format or 'N/A'
 */
export const formatDateForDisplay = (date: Date | string | null | undefined): string => {
  return formatDateToDDMMYYYY(date, 'N/A');
};

/**
 * Format current date to dd/MM/yyyy format (Thai locale)
 * @returns Current date in dd/MM/yyyy format
 */
export const getCurrentDateFormatted = (): string => {
  return formatDateToDDMMYYYY(new Date());
};
