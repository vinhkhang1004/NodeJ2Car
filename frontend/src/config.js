// Production (Docker/Nginx): use relative /api — same origin, no CORS issues.
// Local dev: set VITE_API_URL in .env or use Vite proxy (vite.config.js).
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';
