// Central API configuration
// In development, this uses localhost. In production, it uses your Render backend URL.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_BASE_URL;
