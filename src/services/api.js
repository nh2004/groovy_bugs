import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clerk-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Products API
export const productAPI = {
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  getByCategory: async (category) => {
  console.log("Fetching category:", category); // debug log
  const response = await api.get(`/products/category/${category}`);
  return response.data;
},
  
  getFeatured: async () => {
    const response = await api.get('/products/featured');
    return response.data;
  },
  
  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

// Cart API
export const cartAPI = {
  getCart: async (userId) => {
    const response = await api.get(`/cart/${userId}`);
    return response.data;
  },
  
  updateCart: async (userId, items) => {
    const response = await api.put(`/cart/${userId}`, { items });
    return response.data;
  },
  
  addToCart: async (userId, productId, quantity = 1, options = {}) => {
    const response = await api.post(`/cart/${userId}/add`, {
      productId,
      quantity,
      options
    });
    return response.data;
  },
  
  removeFromCart: async (userId, itemId) => {
    const response = await api.delete(`/cart/${userId}/remove/${itemId}`);
    return response.data;
  },
  
  clearCart: async (userId) => {
    const response = await api.delete(`/cart/${userId}/clear`);
    return response.data;
  }
};

// Orders API
export const orderAPI = {
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  getByUserId: async (userId) => {
    const response = await api.get(`/orders/user/${userId}`);
    return response.data;
  },
  
  getById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
  
  updateStatus: async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  }
};

// Users API
// api.jsx

// Assuming 'api' is your Axios instance already configured (e.g., with a base URL)
// import axios from 'axios';
// const api = axios.create({ baseURL: '/api' }); // Example setup

export const userAPI = {
  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  getById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  update: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  // --- Additional User API Calls ---

  // Get all users
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Delete a user by ID
  delete: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data; // Often returns a success message or confirmation
  },

  // Save/Complete user profile details (as used in CompleteProfile component)
  // This typically sends clerkId along with other form data
  completeProfile: async (profileData) => {
    const response = await api.post('/users/profile-details', profileData);
    return response.data;
  }
};

export default api;