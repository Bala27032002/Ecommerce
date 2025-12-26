import { createSlice } from '@reduxjs/toolkit';

// Helper function to detect if running in WebView
const isWebView = () => {
  return window.ReactNativeWebView || 
         window.webkit?.messageHandlers?.ReactNativeWebView ||
         navigator.userAgent.includes('wv') ||
         navigator.userAgent.includes('WebView');
};

// Helper function for localStorage operations with WebView support
const storage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error getting from localStorage:', error);
      return null;
    }
  },
  
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  },
  
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

const initialState = {
  user: storage.getItem('user') ? JSON.parse(storage.getItem('user')) : null,
  token: storage.getItem('token') || null,
  isAuthenticated: !!storage.getItem('token'),
  isWebView: isWebView(),
  authProvider: storage.getItem('authProvider') || 'web',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.authProvider = action.payload.provider || 'web';
      
      // Store in localStorage
      storage.setItem('user', JSON.stringify(action.payload.user));
      storage.setItem('token', action.payload.token);
      storage.setItem('authProvider', action.payload.provider || 'web');
      
      // Notify React Native WebView if available
      if (window.ReactNativeWebView) {
        try {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'authSuccess',
            user: action.payload.user,
            token: action.payload.token,
            provider: action.payload.provider || 'web'
          }));
        } catch (error) {
          console.error('Error notifying WebView:', error);
        }
      }
      
      console.log('User authenticated:', {
        user: action.payload.user,
        provider: action.payload.provider || 'web',
        isWebView: state.isWebView
      });
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.authProvider = null;
      
      // Clear localStorage
      storage.removeItem('user');
      storage.removeItem('token');
      storage.removeItem('authProvider');
      
      // Notify React Native WebView if available
      if (window.ReactNativeWebView) {
        try {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'authLogout'
          }));
        } catch (error) {
          console.error('Error notifying WebView of logout:', error);
        }
      }
      
      console.log('User logged out');
    },
    
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      storage.setItem('user', JSON.stringify(state.user));
      
      // Notify React Native WebView if available
      if (window.ReactNativeWebView) {
        try {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'userUpdated',
            user: state.user
          }));
        } catch (error) {
          console.error('Error notifying WebView of user update:', error);
        }
      }
    },
    
    setWebViewMode: (state, action) => {
      state.isWebView = action.payload;
      console.log('WebView mode set to:', action.payload);
    },
  },
});

export const { setUser, logout, updateUser, setWebViewMode } = authSlice.actions;
export default authSlice.reducer;
