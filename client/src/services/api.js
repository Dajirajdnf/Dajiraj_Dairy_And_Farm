import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dajiraj_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dajiraj_token');
      localStorage.removeItem('dajiraj_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Customer API
export const customerAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  reorder: (orders) => api.put('/customers/reorder', { orders }),
};

// Staff API
export const staffAPI = {
  getAll: (params) => api.get('/staff', { params }),
  getById: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
};

// Delivery Boy API
export const deliveryBoyAPI = {
  getAll: (params) => api.get('/delivery-boys', { params }),
  getById: (id) => api.get(`/delivery-boys/${id}`),
  create: (data) => api.post('/delivery-boys', data),
  update: (id, data) => api.put(`/delivery-boys/${id}`, data),
  delete: (id) => api.delete(`/delivery-boys/${id}`),
};

// Product API
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getPublic: () => api.get('/products/public', { params: { publicOnly: 'true' } }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  adjustStock: (id, data) => api.post(`/products/${id}/stock`, data),
  getStockHistory: (id, params) => api.get(`/products/${id}/stock-history`, { params }),
  getLowStock: () => api.get('/products/low-stock'),
};

// Delivery API
export const deliveryAPI = {
  getAll: (params) => api.get('/deliveries', { params }),
  getToday: (params) => api.get('/deliveries/today', { params }),
  generateToday: () => api.post('/deliveries/generate-today'),
  adjustQuantity: (id, action) => api.patch(`/deliveries/${id}/quantity`, { action }),
  markComplete: (id, data) => api.patch(`/deliveries/${id}/complete`, data),
  updateStatus: (id, data) => api.patch(`/deliveries/${id}/status`, data),
  getMyDashboard: () => api.get('/deliveries/my-dashboard'),
};

// Invoice API
export const invoiceAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  generate: (data) => api.post('/invoices/generate', data),
  updatePayment: (id, data) => api.patch(`/invoices/${id}/payment`, data),
  downloadPdf: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  sendEmail: (id) => api.post(`/invoices/${id}/email`),
};

// Inquiry API
export const inquiryAPI = {
  getAll: (params) => api.get('/inquiries', { params }),
  create: (data) => api.post('/inquiries', data),
  update: (id, data) => api.patch(`/inquiries/${id}`, data),
  delete: (id) => api.delete(`/inquiries/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
  getCharts: () => api.get('/dashboard/charts'),
};

// Report API
export const reportAPI = {
  milk: (params) => api.get('/reports/milk', { params }),
  revenue: (params) => api.get('/reports/revenue', { params }),
  customers: () => api.get('/reports/customers'),
  delivery: (params) => api.get('/reports/delivery', { params }),
  stock: () => api.get('/reports/stock'),
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/settings'),
  getPublic: () => api.get('/settings/public'),
  update: (data) => api.put('/settings', data),
  testSmtp: () => api.post('/settings/test-smtp'),
};
