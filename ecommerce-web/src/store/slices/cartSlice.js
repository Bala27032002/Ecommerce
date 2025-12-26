import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { MAINURL } from '../../config/Api';

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${MAINURL}cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.cart || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${MAINURL}cart/add`,
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.cart || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${MAINURL}cart/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.cart || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${MAINURL}cart/${productId}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.cart || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${MAINURL}cart/clear`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  success: false,
  totalPrice: 0,
  hydrated: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetCart: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
      state.success = false;
      state.totalPrice = 0;
      state.hydrated = false;
    },
    calculateTotal: (state) => {
      state.totalPrice = state.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    },

    // Optimistic UI reducers
    optimisticAddToCart: (state, action) => {
      const { productId, quantity = 1, productSnapshot } = action.payload || {};
      if (!productId) return;

      const idx = state.items.findIndex((it) => (it?._id ?? it?.id) === productId);
      if (idx >= 0) {
        state.items[idx].quantity = Number(state.items[idx].quantity || 0) + Number(quantity || 1);
      } else {
        state.items.unshift({
          _id: productId,
          quantity: Number(quantity || 1),
          ...(productSnapshot || {}),
        });
      }

      state.totalPrice = state.items.reduce((total, item) => {
        return total + (Number(item.price || 0) * Number(item.quantity || 0));
      }, 0);
    },
    optimisticRemoveFromCart: (state, action) => {
      const productId = action.payload;
      if (!productId) return;
      state.items = state.items.filter((it) => (it?._id ?? it?.id) !== productId);
      state.totalPrice = state.items.reduce((total, item) => {
        return total + (Number(item.price || 0) * Number(item.quantity || 0));
      }, 0);
    },
    optimisticUpdateQuantity: (state, action) => {
      const { productId, quantity } = action.payload || {};
      if (!productId) return;
      const idx = state.items.findIndex((it) => (it?._id ?? it?.id) === productId);
      if (idx === -1) return;
      state.items[idx].quantity = Number(quantity || 1);
      state.totalPrice = state.items.reduce((total, item) => {
        return total + (Number(item.price || 0) * Number(item.quantity || 0));
      }, 0);
    },
    hydrateCart: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : [];
      state.totalPrice = state.items.reduce((total, item) => {
        return total + (Number(item.price || 0) * Number(item.quantity || 0));
      }, 0);
      state.hydrated = true;
    },
  },
  extraReducers: (builder) => {
    // Fetch Cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.totalPrice = action.payload.reduce((total, item) => {
          return total + (item.price * item.quantity);
        }, 0);
        state.hydrated = true;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add to Cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.success = true;
        state.totalPrice = action.payload.reduce((total, item) => {
          return total + (item.price * item.quantity);
        }, 0);
        state.hydrated = true;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Remove from Cart
    builder
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.success = true;
        state.totalPrice = action.payload.reduce((total, item) => {
          return total + (item.price * item.quantity);
        }, 0);
        state.hydrated = true;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Quantity
    builder
      .addCase(updateCartQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.totalPrice = action.payload.reduce((total, item) => {
          return total + (item.price * item.quantity);
        }, 0);
        state.hydrated = true;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Clear Cart
    builder
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.totalPrice = 0;
        state.success = true;
        state.hydrated = true;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  resetCart,
  calculateTotal,
  optimisticAddToCart,
  optimisticRemoveFromCart,
  optimisticUpdateQuantity,
  hydrateCart,
} = cartSlice.actions;
export default cartSlice.reducer;
