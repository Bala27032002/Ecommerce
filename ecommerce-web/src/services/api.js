// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ecommerce-api-1-mnux.onrender.com/api';

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Order API services
export const orderService = {
  // Get user orders
  getUserOrders: async () => {
    return await apiRequest('/orders/my-orders');
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    return await apiRequest(`/orders/${orderId}`);
  },

  // Create new order
  createOrder: async (orderData) => {
    return await apiRequest('/orders/create', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Create Razorpay order
  createRazorpayOrder: async (paymentData) => {
    return await apiRequest('/orders/razorpay-order', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    return await apiRequest('/orders/verify-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },
};

// Auth API services
export const authService = {
  login: async (credentials) => {
    return await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData) => {
    return await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getProfile: async () => {
    return await apiRequest('/auth/profile');
  },
};

// Product API services
export const productService = {
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getProductById: async (productId) => {
    return await apiRequest(`/products/${productId}`);
  },

  searchProducts: async (query) => {
    return await apiRequest(`/products/search?q=${encodeURIComponent(query)}`);
  },
};

// Cart API services
export const cartService = {
  getCart: async () => {
    return await apiRequest('/cart');
  },

  addToCart: async (itemData) => {
    return await apiRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },

  updateCartItem: async (itemId, quantity) => {
    return await apiRequest(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  removeFromCart: async (itemId) => {
    return await apiRequest(`/cart/${itemId}`, {
      method: 'DELETE',
    });
  },

  clearCart: async () => {
    return await apiRequest('/cart/clear', {
      method: 'DELETE',
    });
  },
};

// Wishlist API services
export const wishlistService = {
  getWishlist: async () => {
    return await apiRequest('/wishlist');
  },

  addToWishlist: async (productId) => {
    return await apiRequest('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  removeFromWishlist: async (productId) => {
    return await apiRequest(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
  },
};

export default apiRequest;
