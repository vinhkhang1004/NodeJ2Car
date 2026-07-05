import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BACKEND_BASE_URL } from '../config.js';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Robustly resolve image URLs from database paths.
 * @param {string} path - The image path from database (may be filename, relative path, or absolute path)
 * @returns {string} - The full URL to the image
 */
export function getFileUrl(path) {
  if (!path) return 'https://placehold.co/400x400/27272a/71717a?text=No+Image';
  if (path.startsWith('http')) return path;

  // Standardization: If it contains 'uploads', get the part from 'uploads' onwards
  const uploadsIndex = path.toLowerCase().indexOf('uploads');
  let cleanPath = path;
  if (uploadsIndex !== -1) {
    cleanPath = path.substring(uploadsIndex);
  } else {
    // If it's just a filename or does not contain uploads, assume it belongs in uploads
    if (!path.startsWith('/')) {
       cleanPath = 'uploads/' + path;
    }
  }

  const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  return `${BACKEND_BASE_URL}${finalPath}`;
}
