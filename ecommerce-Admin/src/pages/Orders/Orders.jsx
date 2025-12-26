import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  useMediaQuery,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
} from "@mui/material";
import Footer from "../Footer/Footer";
import axios from "axios";
import { MAINURL } from "../../config/Api";

const Orders = () => {
  const [dateFilter, setDateFilter] = useState("Daily");
  const isMobile = useMediaQuery("(max-width:768px)");

  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState({ order: null, nextStatus: "" });
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selectedDeliveryBoyId, setSelectedDeliveryBoyId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const PAGE_SIZE = 10;
  const fetchOrders = async (pageNumber = 1) => {
    try {
      const authToken = localStorage.getItem("auth_token") || localStorage.getItem("token");
      const response = await axios.get(`${MAINURL}orders`, {
        params: {
          page: pageNumber,
          limit: PAGE_SIZE,
          dateFilter,
        },
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      });

      setAllOrders(response.data.orders);
      setFilteredOrders(response.data.orders);
      setTotalOrders(response.data.totalOrders);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.log("Error fetching orders", error);
    }
  };


  useEffect(() => {
    setPage(1);
    fetchOrders(1);
  }, [dateFilter]);


  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const fetchDeliveryBoys = async () => {
    try {
      const authToken = localStorage.getItem("auth_token") || localStorage.getItem("token");
      const res = await axios.get(`${MAINURL}delivery-boy/all`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      });
      setDeliveryBoys(res.data?.deliveryBoys || res.data?.data || res.data || []);
    } catch (e) {
      console.error("Error fetching delivery boys", e);
      setDeliveryBoys([]);
    }
  };

  const requestStatusChange = (order, nextStatus) => {
    if (!order?._id) return;
    if (order.orderStatus === nextStatus) return;
    setStatusTarget({ order, nextStatus });
    setStatusDialogOpen(true);
  };

  const updateOrderStatus = async ({ orderId, orderStatus }) => {
    const authToken = localStorage.getItem("auth_token") || localStorage.getItem("token");
    return axios.put(
      `${MAINURL}orders/${orderId}/status`,
      { orderStatus },
      { headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined }
    );
  };

  const assignDeliveryBoy = async ({ orderId, assignedDeliveryBoy }) => {
    const authToken = localStorage.getItem("auth_token") || localStorage.getItem("token");
    return axios.put(
      `${MAINURL}orders/${orderId}/assign-delivery-boy`,
      { assignedDeliveryBoy },
      { headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined }
    );
  };

  const confirmStatusChange = async () => {
    const order = statusTarget?.order;
    const nextStatus = statusTarget?.nextStatus;
    if (!order?._id || !nextStatus) return;

    setIsSubmitting(true);
    try {
      await updateOrderStatus({ orderId: order._id, orderStatus: nextStatus });
      setStatusDialogOpen(false);

      if (nextStatus === "confirmed") {
        setSelectedDeliveryBoyId("");
        await fetchDeliveryBoys();
        setAssignDialogOpen(true);
      } else {
        await fetchOrders(page);
      }
    } catch (e) {
      console.error("Failed to update order status", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitAssignDeliveryBoy = async () => {
    const order = statusTarget?.order;
    if (!order?._id || !selectedDeliveryBoyId) return;

    setIsSubmitting(true);
    try {
      await assignDeliveryBoy({ orderId: order._id, assignedDeliveryBoy: selectedDeliveryBoyId });
      setAssignDialogOpen(false);
      await fetchOrders(page);
    } catch (e) {
      console.error("Failed to assign delivery boy", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColor = (s) => {
    if (s === "confirmed" || s === "delivered") return "success";
    if (s === "cancelled") return "error";
    if (s === "pending") return "warning";
    return "info";
  };

  return (
    <Box p={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6">
          {isMobile ? "Dashboard" : "Overall Orders"}
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2">Date display:</Typography>
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
        </Box>
      </Box>


      <Grid container spacing={2} mb={4} sx={{ display: 'flex', justifyContent: 'space-between' }}> 
        <Grid item xs={12} sm={6} md={3}> 
          <Card sx={{ backgroundColor: "transparent", boxShadow: "none" }}> 
             <CardContent>
              <Typography color="text.secondary">Total Orders</Typography>
              <Typography variant="h5">{totalOrders}</Typography>
              <Typography variant="caption">
                Last{" "}
                {dateFilter === "Daily"
                  ? "1 Day"
                  : dateFilter === "Weekly"
                  ? "Week"
                  : dateFilter === "Monthly"
                  ? "Month"
                  : "Year"}
              </Typography>
            </CardContent> </Card> </Grid>
              <Grid item xs={12} sm={6} md={3}> 
                <Card sx={{ backgroundColor: "transparent", boxShadow: "none" }}> 
                  <CardContent> <Typography color="text.secondary">Total Received</Typography> 
                  <Box display="flex" flexDirection="row" gap={5}> <Box display="flex" justifyContent="space-between" alignItems="center"> 
                    <Typography variant="h5">32</Typography> </Box> </Box> <Box display="flex" justifyContent="space-between" alignItems="center"> 
                      <Typography variant="body2" color="text.secondary"> Last 7 days </Typography> </Box> </CardContent> </Card> </Grid>
                       <Grid item xs={12} sm={6} md={3}> <Card sx={{ backgroundColor: "transparent", boxShadow: "none" }}> <CardContent> 
                        <Typography color="text.secondary">Total Returned</Typography> 
                        <Box display="flex" flexDirection="row" gap={3}> 
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                             <Typography variant="h5">32</Typography> </Box> </Box>
                             <Box display="flex" justifyContent="space-between" alignItems="center"> 
                              <Typography variant="body2" color="text.secondary"> Last 7 days </Typography> </Box> </CardContent> </Card> </Grid> 
                              <Grid item xs={12} sm={6} md={3}> <Card sx={{ backgroundColor: "transparent", boxShadow: "none" }}> 
                                <CardContent> 
                                  <Typography color="text.secondary">On the Way</Typography>
                                   <Box display="flex" flexDirection="row" > <Box display="flex" justifyContent="space-between" alignItems="center" gap={4}>
                                     <Typography variant="h5">32</Typography> </Box> </Box> 
                                     <Box display="flex" justifyContent="space-between" alignItems="center"> 
                                      <Typography variant="body2" color="text.secondary"> Last 7 days </Typography> </Box> </CardContent> </Card> </Grid> </Grid>


      <Card>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>S.No</TableCell>
                <TableCell>Order Id</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Payment Info</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Shipping</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order, index) => (
                  <TableRow key={order._id}>
                    <TableCell>
                      {(page - 1) * PAGE_SIZE + index + 1}
                    </TableCell>

                    <TableCell>{order.orderNumber}</TableCell>

                    <TableCell>
                      {order.items?.[0]?.productId?.name || "—"}
                    </TableCell>

                    <TableCell>
                      <Typography>
                        {order.customerInfo?.fullName || "—"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.customerInfo?.phone || "—"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {order.paymentInfo?.method || "—"}
                    </TableCell>

                    <TableCell>
                      <Select
                        size="small"
                        value={order.orderStatus || "pending"}
                        onChange={(e) => requestStatusChange(order, e.target.value)}
                        sx={{
                          minWidth: 140,
                          backgroundColor: "#F7F7F7",
                          borderRadius: 2,
                          "& fieldset": { border: "none" },
                        }}
                        renderValue={(val) => (
                          <Chip
                            label={val}
                            size="small"
                            color={statusColor(val)}
                            sx={{ width: "100%", justifyContent: "flex-start" }}
                          />
                        )}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="confirmed">Approve</MenuItem>
                        <MenuItem value="cancelled">Cancel</MenuItem>
                        <MenuItem value="processing">Processing</MenuItem>
                        <MenuItem value="shipped">Shipped</MenuItem>
                        <MenuItem value="on-the-way">On the way</MenuItem>
                        <MenuItem value="delivered">Delivered</MenuItem>
                      </Select>
                    </TableCell>

                    <TableCell>{order.shippingInfo}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>


        <Box px={3} py={2}>
          <Footer
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(p - 1, 1))}
            onNext={() =>
              setPage((p) => Math.min(p + 1, totalPages))
            }
          />
        </Box>
      </Card>

      <Dialog open={statusDialogOpen} onClose={() => (isSubmitting ? null : setStatusDialogOpen(false))} fullWidth maxWidth="xs">
        <DialogTitle>Confirm status change</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Change order <strong>{statusTarget?.order?.orderNumber}</strong> status to <strong>{statusTarget?.nextStatus}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="contained" color="success" onClick={confirmStatusChange} disabled={isSubmitting}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={assignDialogOpen} onClose={() => (isSubmitting ? null : setAssignDialogOpen(false))} fullWidth maxWidth="xs">
        <DialogTitle>Assign delivery boy</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, mt: 1 }}>
            Select a delivery boy for <strong>{statusTarget?.order?.orderNumber}</strong>
          </Typography>

          <FormControl fullWidth size="small">
            <InputLabel id="delivery-boy-label">Delivery Boy</InputLabel>
            <Select
              labelId="delivery-boy-label"
              label="Delivery Boy"
              value={selectedDeliveryBoyId}
              onChange={(e) => setSelectedDeliveryBoyId(e.target.value)}
            >
              {deliveryBoys.length === 0 ? (
                <MenuItem value="" disabled>
                  No delivery boys
                </MenuItem>
              ) : (
                deliveryBoys.map((db) => (
                  <MenuItem key={db._id} value={db._id}>
                    {db.name} {db.phone ? `(${db.phone})` : ""}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)} disabled={isSubmitting}>
            Later
          </Button>
          <Button variant="contained" color="success" onClick={submitAssignDeliveryBoy} disabled={isSubmitting || !selectedDeliveryBoyId}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;
