import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  Avatar,
  IconButton,
  Alert,
  Snackbar,
  Stack,
  Select,
  MenuItem
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon
} from "@mui/icons-material";
import { MAINURL } from '../../config/Api';
import io from 'socket.io-client';
import logo from "../../assets/Navbar-icons/Logo.svg";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
    const [dateFilter, setDateFilter] = useState("Daily");
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
const [totalSale, setTotalSale] = useState({
    todaySales: 0,
    totalOrders: 0,
  });
  // Socket connection
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(MAINURL.replace('/api/', ''));
    setSocket(newSocket);

    // Listen for real-time category updates
    newSocket.on('categoryCreated', (data) => {
      setCategories(prev => [data.category, ...prev]);
      showNotification('New category added successfully!', 'success');
    });

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${MAINURL}categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showNotification('Error fetching categories', 'error');
    }
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const handleOpenDialog = (category = null) => {
    setEditingCategory(category);
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        image: category.image
      });
    } else {
      setFormData({ name: '', description: '', image: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', image: '' });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingCategory 
        ? `${MAINURL}categories/${editingCategory._id}`
        : `${MAINURL}categories`;
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        if (!editingCategory) {
          // Real-time update will be handled by socket
          setFormData({ name: '', description: '', image: '' });
        } else {
          // For updates, refresh the list
          fetchCategories();
          showNotification('Category updated successfully!', 'success');
        }
        handleCloseDialog();
      } else {
        showNotification(data.message || 'Error occurred', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`${MAINURL}categories/${categoryId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        const data = await response.json();
        
        if (data.success) {
          setCategories(categories.filter(cat => cat._id !== categoryId));
          showNotification('Category deleted successfully!', 'success');
        } else {
          showNotification(data.message || 'Error occurred', 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        showNotification('Error occurred', 'error');
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Category Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
        >
          Add New Category
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>
                      <Avatar
                        src={category.image}
                        alt={category.name}
                        sx={{ width: 50, height: 50 }}
                      >
                        <ImageIcon />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">{category.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {category.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {category.slug}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={category.isActive ? 'Active' : 'Inactive'}
                        color={category.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(category)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(category._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Category Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Category Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.description}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="image"
              label="Image URL"
              type="url"
              fullWidth
              variant="outlined"
              value={formData.image}
              onChange={handleInputChange}
              required
              helperText="Enter the complete URL of the category image"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
            >
              {loading ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoryManagement;

const StatCard = ({ title, value, icon }) => (
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
