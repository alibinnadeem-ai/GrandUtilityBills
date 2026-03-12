// API Client for Grand City Dashboard
// Handles all API communication with the Neon database via Vercel serverless functions

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper function for API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Bills API
export const billsApi = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/bills${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id) => apiRequest(`/api/bills?id=${id}`),

  create: (data) => apiRequest('/api/bills', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => apiRequest(`/api/bills?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/api/bills?id=${id}`, {
    method: 'DELETE',
  }),
};

// Owners API
export const ownersApi = {
  getAll: () => apiRequest('/api/owners'),

  getById: (id) => apiRequest(`/api/owners?id=${id}`),

  create: (data) => apiRequest('/api/owners', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => apiRequest(`/api/owners?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/api/owners?id=${id}`, {
    method: 'DELETE',
  }),
};

// Maintenance API
export const maintenanceApi = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/maintenance${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id) => apiRequest(`/api/maintenance?id=${id}`),

  create: (data) => apiRequest('/api/maintenance', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => apiRequest(`/api/maintenance?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/api/maintenance?id=${id}`, {
    method: 'DELETE',
  }),
};

// Communications API
export const communicationsApi = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/communications${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id) => apiRequest(`/api/communications?id=${id}`),

  create: (data) => apiRequest('/api/communications', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/api/communications?id=${id}`, {
    method: 'DELETE',
  }),
};

// Rent Tracking API
export const rentApi = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/rent${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id) => apiRequest(`/api/rent?id=${id}`),

  create: (data) => apiRequest('/api/rent', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => apiRequest(`/api/rent?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/api/rent?id=${id}`, {
    method: 'DELETE',
  }),
};

// Health Check API
export const healthApi = {
  check: () => apiRequest('/api/health'),
};

// Seed API (for initial data)
export const seedApi = {
  seed: () => apiRequest('/api/seed', {
    method: 'POST',
  }),
};

// Export all APIs
export default {
  bills: billsApi,
  owners: ownersApi,
  maintenance: maintenanceApi,
  communications: communicationsApi,
  rent: rentApi,
  health: healthApi,
  seed: seedApi,
};
