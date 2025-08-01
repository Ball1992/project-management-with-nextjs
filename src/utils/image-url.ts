/**
 * Utility function to handle image URLs from the API
 * Ensures proper formatting for both relative and absolute URLs
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // If it's already a full URL, check if it's from localhost:3000 and needs proxying
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // If it's from localhost:3000/uploads, use the proxy
    if (url.includes('localhost:3000/uploads/')) {
      return url.replace('http://localhost:3000/uploads/', '/api/uploads/');
    }
    return url;
  }
  
  // If it starts with /uploads, use the proxy path
  if (url.startsWith('/uploads/')) {
    return `/api${url}`;
  }
  
  // If it starts with /, it's a relative path from the API
  if (url.startsWith('/')) {
    // Check if it's an upload path
    if (url.includes('/uploads/')) {
      return `/api${url}`;
    }
    const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
    // Remove /api/v1 from the end if present
    const baseUrl = apiUrl.replace(/\/api\/v\d+$/, '');
    return `${baseUrl}${url}`;
  }
  
  // Otherwise, assume it's a relative path that needs the full API URL
  const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
  const baseUrl = apiUrl.replace(/\/api\/v\d+$/, '');
  return `${baseUrl}/${url}`;
}

/**
 * Check if a value is a valid image URL or File
 */
export function isValidImageSource(value: any): boolean {
  if (!value) return false;
  
  // Check if it's a File object
  if (value instanceof File) return true;
  
  // Check if it's a string (URL)
  if (typeof value === 'string' && value.length > 0) return true;
  
  return false;
}
