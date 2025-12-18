// Template categories for the certificate generator
export const TEMPLATE_CATEGORIES = {
  CORPORATE: 'Corporate',
  EDUCATION: 'Education',
  CREATIVE: 'Creative',
  MINIMAL: 'Minimal',
  ACHIEVEMENT: 'Achievement',
};

// Backend API base URL for certificate generation
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
