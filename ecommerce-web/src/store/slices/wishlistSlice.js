import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { MAINURL } from '../../config/Api';

// Async thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${MAINURL}wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.wishlist || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${MAINURL}wishlist/add`,
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.wishlist || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to wishlist');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${MAINURL}wishlist/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.wishlist || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  success: false,
  hydrated: false,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetWishlist: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
      state.success = false;
      state.hydrated = false;
    },

    // Optimistic UI reducers
    optimisticAddToWishlist: (state, action) => {
      const { productId, productSnapshot } = action.payload || {};
      if (!productId) return;
      const exists = state.items.some((p) => (p?._id ?? p?.id) === productId);
      if (exists) return;
      state.items.unshift({ _id: productId, ...(productSnapshot || {}) });
    },
    optimisticRemoveFromWishlist: (state, action) => {
      const productId = action.payload;
      if (!productId) return;
      state.items = state.items.filter((p) => (p?._id ?? p?.id) !== productId);
    },
    hydrateWishlist: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : [];
      state.hydrated = true;
    },
  },
  extraReducers: (builder) => {
    // Fetch Wishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.hydrated = true;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add to Wishlist
    builder
      .addCase(addToWishlist.pending, (state) => {
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.success = true;
        state.hydrated = true;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Remove from Wishlist
    builder
      .addCase(removeFromWishlist.pending, (state) => {
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.success = true;
        state.hydrated = true;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  resetWishlist,
  optimisticAddToWishlist,
  optimisticRemoveFromWishlist,
  hydrateWishlist,
} = wishlistSlice.actions;
export default wishlistSlice.reducer;
