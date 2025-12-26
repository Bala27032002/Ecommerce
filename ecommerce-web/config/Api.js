// Local Development API
export const LOCAL_API = "http://localhost:5000/api/";

// Production/Deployment API
export const DEPLOYMENT_API = "https://ecommerce-api-1-mnux.onrender.com/api/";

// Default URL (automatically uses environment variable or falls back to deployment API)
export const MAINURL = import.meta?.env?.VITE_API_URL?.replace(/\/?$/, '/') || DEPLOYMENT_API;