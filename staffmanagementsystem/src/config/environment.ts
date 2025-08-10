// Environment configuration
export const environment = {
  // API Configuration  
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5098/api',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),

  // Authentication Configuration
  TOKEN_STORAGE_KEY: 'authToken',
  REFRESH_TOKEN_STORAGE_KEY: 'refreshToken',
  TOKEN_STORAGE_TYPE: 'localStorage', // 'localStorage' or 'sessionStorage'

  // UI Configuration
  MOBILE_BREAKPOINT: 768,
  DEFAULT_PAGE_SIZE: 10,

  // Validation Configuration
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  MAX_PHONE_LENGTH: 20,
  MAX_ADDRESS_LENGTH: 500,

  // File Upload Configuration
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],

  // Feature Flags
  ENABLE_EXPORT: true,
  ENABLE_BULK_OPERATIONS: true,
  ENABLE_STATISTICS: true,

  // Development Settings
  ENABLE_LOGGING: import.meta.env.MODE === 'development',
  ENABLE_DEBUG_MODE: import.meta.env.MODE === 'development',
};

// Validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

// API endpoints
export const apiEndpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
  employees: {
    base: '/employees',
    bulkDelete: '/employees/bulk-delete',
    export: '/employees/export',
    statistics: '/employees/statistics',
  },
  departments: {
    base: '/departments',
    statistics: '/departments/statistics',
  },
  approvals: {
    base: '/approvals',
    statistics: '/approvals/statistics',
    bulkAction: '/approvals/bulk-action',
  },
  roles: {
    base: '/roles',
    statistics: '/roles/statistics',
  },
  permissions: {
    base: '/permissions',
    resources: '/permissions/resources',
    actions: '/permissions/actions',
    seed: '/permissions/seed',
  },
};

// Status and priority options
export const statusOptions = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'secondary' },
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'suspended', label: 'Suspended', color: 'error' },
];

export const priorityOptions = [
  { value: 'low', label: 'Low', color: 'info' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'high', label: 'High', color: 'error' },
  { value: 'urgent', label: 'Urgent', color: 'error' },
];

export const approvalStatusOptions = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'approved', label: 'Approved', color: 'success' },
  { value: 'rejected', label: 'Rejected', color: 'error' },
  { value: 'cancelled', label: 'Cancelled', color: 'secondary' },
];

// Utility functions
export const getApiUrl = (endpoint: string): string => {
  return `${environment.API_BASE_URL}${endpoint}`;
};

export const isProduction = (): boolean => {
  return import.meta.env.MODE === 'production';
};

export const isDevelopment = (): boolean => {
  return import.meta.env.MODE === 'development';
};
