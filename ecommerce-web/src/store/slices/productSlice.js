import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { MAINURL } from '../../config/Api';

// Async thunks
export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${MAINURL}products/featured/all`);
      return response.data.products || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured products');
    }
  }
);

export const fetchPopularProducts = createAsyncThunk(
  'products/fetchPopular',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${MAINURL}products`);
      return response.data.products || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch popular products');
    }
  }
);

export const fetchTodaysSpecialProducts = createAsyncThunk(
  'products/fetchTodaysSpecial',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${MAINURL}products/special/today`);
      return response.data.products || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch today's special products");
    }
  }
);

export const fetchAllProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${MAINURL}products`);
      return response.data.products || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all products');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${MAINURL}categories`);
      return response.data.categories || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchRecentlyViewedProducts = createAsyncThunk(
  'products/fetchRecentlyViewed',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${MAINURL}products/recently-viewed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.products || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recently viewed products');
    }
  }
);

export const addProductReview = createAsyncThunk(
  'products/addReview',
  async ({ productId, rating, comment }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${MAINURL}products/${productId}/review`,
        { rating, comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add review');
    }
  }
);

export const fetchRelatedProducts = createAsyncThunk(
  'products/fetchRelated',
  async ({ productId, categorySlug }, { rejectWithValue }) => {
    try {
      // First try to get products from the same category using category slug
      if (categorySlug) {
        const categoryResponse = await axios.get(`${MAINURL}products/category/${categorySlug}`);
        const categoryProducts = categoryResponse.data.products || [];
        // Filter out the current product and limit to 8 related products
        return categoryProducts.filter(product => product._id !== productId).slice(0, 8);
      }
      return [];
    } catch (error) {
      // If category fetch fails, try to get all products and filter
      try {
        const allProductsResponse = await axios.get(`${MAINURL}products`);
        const allProducts = allProductsResponse.data.products || [];
        // Return some random products as fallback
        return allProducts.filter(product => product._id !== productId).slice(0, 8);
      } catch (fallbackError) {
        return rejectWithValue('Failed to fetch related products');
      }
    }
  }
);

export const fetchCategoryProducts = createAsyncThunk(
  'products/fetchCategoryProducts',
  async (categorySlug, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${MAINURL}products/category/${categorySlug}`);
      return response.data.products || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category products');
    }
  }
);

const initialState = {
  featured: [],
  popular: [],
  todaysSpecial: [],
  recentlyViewed: [],
  categories: [],
  allProducts: [],
  relatedProducts: [],
  categoryProducts: [],
  loading: false,
  error: null,
  success: false,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    updateProductRating: (state, action) => {
      const { productId, updatedProduct } = action.payload;
      const featuredIndex = state.featured.findIndex(p => p._id === productId);
      if (featuredIndex !== -1) state.featured[featuredIndex] = updatedProduct;
      const popularIndex = state.popular.findIndex(p => p._id === productId);
      if (popularIndex !== -1) state.popular[popularIndex] = updatedProduct;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false; state.featured = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
      .addCase(fetchPopularProducts.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchPopularProducts.fulfilled, (state, action) => {
        state.loading = false; state.popular = action.payload;
      })
      .addCase(fetchPopularProducts.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
      .addCase(fetchTodaysSpecialProducts.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchTodaysSpecialProducts.fulfilled, (state, action) => {
        state.loading = false; state.todaysSpecial = action.payload;
      })
      .addCase(fetchTodaysSpecialProducts.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
      .addCase(fetchRecentlyViewedProducts.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchRecentlyViewedProducts.fulfilled, (state, action) => {
        state.loading = false; state.recentlyViewed = action.payload;
      })
      .addCase(fetchRecentlyViewedProducts.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false; state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false; state.allProducts = action.payload;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
      .addCase(addProductReview.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(addProductReview.fulfilled, (state) => {
        state.loading = false; state.success = true;
      })
      .addCase(addProductReview.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
      .addCase(fetchRelatedProducts.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.loading = false; state.relatedProducts = action.payload;
      })
      .addCase(fetchRelatedProducts.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
      .addCase(fetchCategoryProducts.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchCategoryProducts.fulfilled, (state, action) => {
        state.loading = false; state.categoryProducts = action.payload;
      })
      .addCase(fetchCategoryProducts.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, updateProductRating } = productSlice.actions;
export default productSlice.reducer;
