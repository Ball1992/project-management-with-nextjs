export function transformValue(value: any): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  return String(value);
}

export function transformValueOnChange(value: string): number | string {
  // Remove non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.]/g, '');
  
  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  
  return cleaned;
}

export function transformValueOnBlur(value: string): number | string {
  if (value === '' || value === null || value === undefined) {
    return '';
  }
  
  const num = parseFloat(value);
  if (isNaN(num)) {
    return '';
  }
  
  return num;
}
