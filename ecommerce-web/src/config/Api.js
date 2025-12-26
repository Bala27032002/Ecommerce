// Central API base URL
// Prefer env var VITE_API_URL (e.g. http://localhost:5000/api/)
export const MAINURL = import.meta?.env?.VITE_API_URL?.replace(/\/?$/, '/') || 'https://ecommerce-api-1-mnux.onrender.com/api/';
