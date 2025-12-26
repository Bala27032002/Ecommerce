import React, { useState, useEffect } from 'react'
import { TableContainer, Paper } from "@mui/material";
import { MAINURL } from '../../config/Api';

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  Avatar,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Tabs,
  Tab,
  TextField,
  Button,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  IconButton
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import logo from "../../assets/Navbar-icons/Logo.svg";
import Dash from '../../assets/Dashboard-icons/image-dash.svg'
import Footer from '../Footer/Footer';

const StockAndPricing = () => {
  const [dateFilter, setDateFilter] = useState("Daily");
  const [totalSale, setTotalSale] = useState({
    todaySales: 0,
    totalOrders: 0,
  });

  // Product form state
  const [openproductModal, setOpenproductModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    discount: '',
    stock: '',
    quantity: {
      value: '',
      unit: 'g'
    },
    isFeatured: false,
    isActive: true,
    sku: '',
    image: ''
  });

  const orders = Array(9).fill({
    Image: Dash,
    Product: "Maggi",
    Category: "Kids",
    Date: "16.04.2025",
    Price: "15",
    status: "Low stock",
  });
  const [statusTab, setStatusTab] = useState("All");

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${MAINURL}categories`);
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products on component mount and after creation
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${MAINURL}products`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProductForm({
        ...productForm,
        [parent]: {
          ...productForm[parent],
          [child]: value
        }
      });
    } else if (name === 'isFeatured' || name === 'isActive') {
      setProductForm({
        ...productForm,
        [name]: e.target.checked
      });
    } else {
      setProductForm({
        ...productForm,
        [name]: value
      });
    }
  };

  const handleSubmitProduct = async () => {
    try {
      const payload = {
        ...productForm,
        price: productForm.price === '' ? '' : Number(productForm.price),
        originalPrice: productForm.originalPrice === '' ? null : Number(productForm.originalPrice),
        discount: productForm.discount === '' ? 0 : Number(productForm.discount),
        stock: productForm.stock === '' ? '' : Number(productForm.stock),
        quantity: {
          ...productForm.quantity,
          value: productForm.quantity?.value === '' ? '' : Number(productForm.quantity?.value),
        },
      };

      const url = editingProduct
        ? `${MAINURL}products/${editingProduct._id}`
        : `${MAINURL}products`;

      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        // Reset form
        setProductForm({
          name: '',
          description: '',
          category: '',
          price: '',
          originalPrice: '',
          discount: '',
          stock: '',
          quantity: { value: '', unit: 'g' },
          isFeatured: false,
          isActive: true,
          sku: '',
          image: ''
        });
        setOpenproductModal(false);
        setEditingProduct(null);

        // Refresh products list
        fetchProducts();

        alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
      } else {
        alert(data.message || 'Error saving product');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      category: product.category?._id || product.category,
      price: product.price,
      originalPrice: product.originalPrice || '',
      discount: product.discount || '',
      stock: product.stock,
      quantity: product.quantity || { value: '', unit: 'g' },
      isFeatured: product.isFeatured || false,
      isActive: product.isActive !== undefined ? product.isActive : true,
      sku: product.sku || '',
      image: product.image || ''
    });
    setOpenproductModal(true);
  };

  const handleCloseProductModal = () => {
    setOpenproductModal(false);
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      category: '',
      price: '',
      originalPrice: '',
      discount: '',
      stock: '',
      quantity: { value: '', unit: 'g' },
      isFeatured: false,
      isActive: true,
      sku: '',
      image: ''
    });
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${MAINURL}products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        const data = await response.json();

        if (data.success) {
          fetchProducts();
          alert('Product deleted successfully!');
        } else {
          alert(data.message || 'Error deleting product');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error deleting product');
      }
    }
  };

  const handleOpenProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      category: '',
      price: '',
      originalPrice: '',
      discount: '',
      stock: '',
      quantity: { value: '', unit: 'g' },
      isFeatured: false,
      isActive: true,
      sku: '',
      image: ''
    });
    setOpenproductModal(true);
  };

  return (
    <Box
      sx={{
        p: 3,
        width: "100%",
        maxWidth: "100%",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Stocks and Pricing
          </Typography>
          <Typography color="text.secondary">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography>Date display:</Typography>
          <Select
            size="small"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <MenuItem value="Daily">Daily</MenuItem>
            <MenuItem value="Weekly">Weekly</MenuItem>
            <MenuItem value="Monthly">Monthly</MenuItem>
            <MenuItem value="Yearly">Yearly</MenuItem>
          </Select>
        </Stack>
      </Stack>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Today's Sales"
            value={totalSale.todaySales}
            icon={logo}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Today's Revenue"
            value="₹45,230"
            icon={logo}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Total Orders"
            value={totalSale.totalOrders}
            icon={logo}
          />
        </Grid>
      </Grid>

      <Box mt={2}>
        <Card>
          <Dialog
            open={openproductModal}
            onClose={handleCloseProductModal}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                {/* Image Upload */}
                <TextField
                  fullWidth
                  size="small"
                  label="Image URL"
                  name="image"
                  value={productForm.image}
                  onChange={handleInputChange}
                  required
                />

                {/* Basic Info */}
                <TextField
                  fullWidth
                  size="small"
                  label="Product Name"
                  name="name"
                  value={productForm.name}
                  onChange={handleInputChange}
                  required
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Description"
                  name="description"
                  value={productForm.description}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  required
                />

                {/* Category */}
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={productForm.category}
                    onChange={handleInputChange}
                    label="Category"
                    required
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Pricing */}
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Price"
                    name="price"
                    value={productForm.price}
                    onChange={handleInputChange}
                    type="number"
                    inputProps={{ min: 0 }}
                    required
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Original Price"
                    name="originalPrice"
                    value={productForm.originalPrice}
                    onChange={handleInputChange}
                    type="number"
                    inputProps={{ min: 0 }}
                  />
                </Stack>

                <TextField
                  fullWidth
                  size="small"
                  label="Discount (%)"
                  name="discount"
                  value={productForm.discount}
                  onChange={handleInputChange}
                  type="number"
                  inputProps={{ min: 0, max: 100 }}
                />

                {/* Stock & Quantity */}
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Stock"
                    name="stock"
                    value={productForm.stock}
                    onChange={handleInputChange}
                    type="number"
                    inputProps={{ min: 0 }}
                    required
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Quantity Value"
                    name="quantity.value"
                    value={productForm.quantity.value}
                    onChange={handleInputChange}
                    type="number"
                    inputProps={{ min: 0 }}
                    required
                  />
                </Stack>

                <FormControl fullWidth size="small">
                  <InputLabel>Unit</InputLabel>
                  <Select
                    name="quantity.unit"
                    value={productForm.quantity.unit}
                    onChange={handleInputChange}
                    label="Unit"
                  >
                    <MenuItem value="g">Grams (g)</MenuItem>
                    <MenuItem value="kg">Kilograms (kg)</MenuItem>
                    <MenuItem value="ml">Milliliters (ml)</MenuItem>
                    <MenuItem value="l">Liters (l)</MenuItem>
                    <MenuItem value="pc">Pieces (pc)</MenuItem>
                    <MenuItem value="pack">Packs (pack)</MenuItem>
                  </Select>
                </FormControl>

                {/* SKU */}
                <TextField
                  fullWidth
                  size="small"
                  label="SKU"
                  name="sku"
                  value={productForm.sku}
                  onChange={handleInputChange}
                  required
                />

                {/* Switches */}
                <Stack direction="row" spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="isFeatured"
                        checked={productForm.isFeatured}
                        onChange={handleInputChange}
                      />
                    }
                    label="Featured Product"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        name="isActive"
                        checked={productForm.isActive}
                        onChange={handleInputChange}
                      />
                    }
                    label="Active"
                  />
                </Stack>
              </Stack>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleCloseProductModal} color="dark" sx={{ border: '1px solid rgb(0 0 0 / 44%)' }}>
                Discard
              </Button>
              <Button variant="contained" color="success" onClick={handleSubmitProduct}>
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </DialogActions>
          </Dialog>

          <Box
            sx={{
              mb: 2,
              p: 2,
              backgroundColor: "#fff",
              borderRadius: 2,
              boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
            }}
          >
            <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'space-between' }}>

              <Grid item xs={12} md={9}>
                <Grid container spacing={2} alignItems="center">
                  <Grid sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>

                    {/* <Grid item xs={6} sm={3}>
                      <TextField
                        type="date"
                        size="small"
                        fullWidth
                        sx={{
                          backgroundColor: "#F7F7F7",
                          borderRadius: 2,
                          "& fieldset": { border: "none" },
                        }}
                      />
                    </Grid>

                    <Grid item xs={6} sm={3}>
                      <TextField
                        type="date"
                        size="small"
                        fullWidth
                        sx={{
                          backgroundColor: "#F7F7F7",
                          borderRadius: 2,
                          "& fieldset": { border: "none" },
                        }}
                      />
                    </Grid> */}

                    <Grid item xs={6} sm={4} sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                      <TextField
                        size="small"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        fullWidth
                        sx={{
                          backgroundColor: "#F7F7F7",
                          borderRadius: 2,
                          "& fieldset": { border: "none" },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <Grid item xs={6} sm={2}>
                        <Button
                          fullWidth
                          variant="contained"
                          sx={{
                            backgroundColor: "#DFF3E6",
                            color: "#2E7D32",
                            textTransform: "none",
                            boxShadow: "none",
                            borderRadius: 2,
                            height: 40,
                            "&:hover": {
                              backgroundColor: "#C8EAD6",
                            },
                          }}
                        >
                          Search
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>


              <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    window.location.href = '/categories';
                  }}
                  sx={{
                    backgroundColor: "#DFF3E6",
                    textTransform: "none",
                    color: "#2E7D32",
                    borderRadius: 2,
                    height: 40,
                    whiteSpace: "nowrap",
                    "&:hover": {
                      backgroundColor: "#DFF3E6",
                    },
                  }}
                >
                  New Category
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenProductModal}
                  sx={{
                    backgroundColor: "#28A745",
                    textTransform: "none",
                    borderRadius: 2,
                    height: 40,
                    "&:hover": {
                      backgroundColor: "#218838",
                    },
                  }}
                >
                  New Product
                </Button>

              </Grid>

            </Grid>

          </Box>

          <Tabs
            value={statusTab}
            onChange={(e, newValue) => setStatusTab(newValue)}
            sx={{
              mb: 2,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
              },
              "& .Mui-selected": {
                color: "#2E7D32",
                fontWeight: 600,
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#2E7D32",
              },
            }}
          >
            <Tab label="All" value="All" />
            <Tab label="In stock" value="In Stock" />
            <Tab label="Low Stock" value="Low Stock" />
            <Tab label="Out of Stock" value="Out of Stock" />
            <Tab label="Removed from sale" value="Removed" />
          </Tabs>

          <TableContainer
            component={Paper}
            sx={{
              width: "100%",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              pb: 2,
            }}
          >
            <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

           <TableBody>
 {products
  .filter((product) =>
    statusTab === "All" ? true :
    (statusTab === "Removed" && product.isActive === false) ||
    (statusTab === "In Stock" && product.stock >= 10) ||
    (statusTab === "Low Stock" && product.stock <= 5 && product.stock > 0) ||
    (statusTab === "Out of Stock" && product.stock === 0)
  )
  .filter((product) => {
    const q = String(searchQuery || '').trim().toLowerCase();
    if (!q) return true;

    const categoryName =
      product.category?.name ||
      categories.find(cat => cat._id === product.category)?.name ||
      '';

    return [product?.name, product?.sku, categoryName]
      .some((v) => String(v || '').toLowerCase().includes(q));
  })
  .map((product, index) => (
    <TableRow
      key={product._id}
      sx={{
        "& td": { borderBottom: "1px solid #f0f0f0" },
      }}
    >
    
      <TableCell sx={{ pl: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={product.image}
            alt={product.name}
            sx={{ width: 40, height: 40 }}
            variant="rounded"
          >
            <AddIcon />
          </Avatar>
          <Box>
            <Typography fontWeight={500}>
              {product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              SKU: {product.sku || 'N/A'}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      <TableCell>
        {product.category?.name || categories.find(cat => cat._id === product.category)?.name || 'Unknown'}
      </TableCell>
      
      <TableCell>
        <Typography fontWeight={500}>
          ₹{product.price}
        </Typography>
        {product.originalPrice && (
          <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
            ₹{product.originalPrice}
          </Typography>
        )}
      </TableCell>

      <TableCell>
        <Typography color={product.stock < 10 ? 'error' : 'text.primary'}>
          {product.stock}
        </Typography>
      </TableCell>

      <TableCell>
        <Chip
          label={product.stock === 0 ? "Out of Stock" : 
                 product.stock < 10 ? "Low Stock" : "In Stock"}
          size="small"
          sx={{
            borderRadius: "10px",
            px: 1.5,
            backgroundColor:
              product.stock === 0 ? "#FDECEA" :
              product.stock < 10 ? "#FFF3C4" : "#E8F5E9",
            color:
              product.stock === 0 ? "#C62828" :
              product.stock < 10 ? "#8D6E00" : "#2E7D32",
          }}
        />
      </TableCell>

      <TableCell>
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEditProduct(product)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteProduct(product._id)}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
    
  ))}
 

</TableBody>
  
          </Table>
          <Box sx={{ pl: 3, py: 2,px:3 }}>
    <Footer/>
  </Box>
        </TableContainer>
        </Card>
  </Box>
        </Box>
        
  )
}

export default StockAndPricing;const StatCard = ({ title, value, icon }) => (
  <Card
    sx={{
      borderRadius: 3,
      height: "100%",
      width: "100%",
      boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Typography color="text.secondary" fontSize={14}>
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {value}
          </Typography>
        </Box>

        <Avatar
          src={icon}
          variant="rounded"
          sx={{
            bgcolor: "#E3F2FD",
            width: 48,
            height: 48,
          }}
        />
      </Stack>
    </CardContent>
  </Card>
);
