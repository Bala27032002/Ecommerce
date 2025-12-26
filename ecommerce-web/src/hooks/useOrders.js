import { useState, useEffect } from 'react';
import { orderService } from '../services/api';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user orders
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderService.getUserOrders();
      if (response.success) {
        setOrders(response.orders);
      } else {
        setError(response.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Get order by ID
  const getOrderById = async (orderId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderService.getOrderById(orderId);
      if (response.success) {
        return response.order;
      } else {
        setError(response.message || 'Failed to fetch order');
        return null;
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch order');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create new order
  const createOrder = async (orderData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderService.createOrder(orderData);
      if (response.success) {
        await fetchOrders(); // Refresh orders list
        return response.order;
      } else {
        setError(response.message || 'Failed to create order');
        return null;
      }
    } catch (err) {
      setError(err.message || 'Failed to create order');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Filter orders by status
  const getFilteredOrders = (status) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.orderStatus === status);
  };

  // Search orders
  const searchOrders = (query) => {
    if (!query) return orders;
    
    const searchTerm = query.toLowerCase();
    return orders.filter(order => 
      order.orderNumber?.toLowerCase().includes(searchTerm) ||
      order.customerInfo?.fullName?.toLowerCase().includes(searchTerm) ||
      order.items?.some(item => 
        item.productId?.name?.toLowerCase().includes(searchTerm)
      )
    );
  };

  // Get order statistics
  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach(order => {
      const status = order.orderStatus;
      if (stats.hasOwnProperty(status)) {
        stats[status]++;
      }
    });

    return stats;
  };

  // Load orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    getOrderById,
    createOrder,
    getFilteredOrders,
    searchOrders,
    getOrderStats,
  };
};
