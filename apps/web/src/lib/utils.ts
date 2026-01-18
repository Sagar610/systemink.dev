import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'N/A';
  }
  
  try {
    return format(dateObj, 'MMMM d, yyyy');
  } catch {
    return 'N/A';
  }
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'N/A';
  }
  
  try {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch {
    return 'N/A';
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function extractHeadings(html: string): Array<{ id: string; text: string; level: number }> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const result: Array<{ id: string; text: string; level: number }> = [];

  headings.forEach((heading) => {
    const id = heading.id || slugify(heading.textContent || '');
    const level = parseInt(heading.tagName.substring(1), 10);
    const text = heading.textContent || '';
    result.push({ id, text, level });
  });

  return result;
}

export function getInitials(name: string): string {
  if (!name || !name.trim()) return 'U';
  
  // Split by spaces and filter out empty strings
  const parts = name.trim().split(/\s+/).filter(part => part.length > 0);
  
  if (parts.length === 0) return 'U';
  
  if (parts.length === 1) {
    // Single name - take first 2 letters
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  // Multiple names - take first letter of first and last name
  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
}

/**
 * Get full image URL from a relative path
 * Handles both relative paths (/uploads/...) and full URLs (http://...)
 * 
 * @param imageUrl - Relative path (e.g., /uploads/avatar/abc123.jpg) or full URL
 * @returns Full URL to the image
 */
export function getImageUrl(imageUrl: string | null | undefined): string | undefined {
  if (!imageUrl) return undefined;
  
  // If it's already a full URL (http:// or https://), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative path starting with /uploads, construct full URL
  if (imageUrl.startsWith('/uploads/')) {
    // In development, images are served from backend at localhost:3000
    // In production, you might want to use an env variable
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${apiUrl}${imageUrl}`;
  }
  
  // If it's already a full path, return as is
  return imageUrl;
}
