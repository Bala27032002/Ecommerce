import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import axios from "axios";
import { MAINURL } from "../../../config/Api";

const formatCurrency = (value) => {
  const n = Number(value || 0);
  return `₹${n.toFixed(2)}`;
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  const authToken = useMemo(() => {
    return localStorage.getItem("auth_token") || localStorage.getItem("token");
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${MAINURL}orders/admin/${orderId}`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        });
        setOrder(res.data?.order || null);
      } catch (e) {
        console.error(e);
        setError(e?.response?.data?.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId, authToken]);

  if (loading) {
    return (
      <Box p={2}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Stack spacing={2}>
          <Typography color="error">{error}</Typography>
          <Button variant="contained" onClick={() => navigate("/orders")}>
            Back to Orders
          </Button>
        </Stack>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box p={2}>
        <Stack spacing={2}>
          <Typography>No order found</Typography>
          <Button variant="contained" onClick={() => navigate("/orders")}>
            Back to Orders
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Order Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {order.orderNumber}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={order.orderStatus}
            color={order.orderStatus === "confirmed" ? "success" : "warning"}
            size="small"
          />
          <Button variant="outlined" onClick={() => navigate("/orders")}>
            Back
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography fontWeight={700} mb={1}>
                Customer
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={0.5}>
                <Typography>
                  <b>Name:</b> {order.customerInfo?.fullName || "—"}
                </Typography>
                <Typography>
                  <b>Phone:</b> {order.customerInfo?.phone || "—"}
                </Typography>
                <Typography>
                  <b>Email:</b> {order.customerInfo?.email || "—"}
                </Typography>
                <Typography>
                  <b>Address:</b> {order.customerInfo?.address || "—"}
                </Typography>
                <Typography>
                  <b>City:</b> {order.customerInfo?.city || "—"}
                </Typography>
                <Typography>
                  <b>Postal Code:</b> {order.customerInfo?.postalCode || "—"}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography fontWeight={700} mb={1}>
                Payment & Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={0.5}>
                <Typography>
                  <b>Method:</b> {order.paymentInfo?.method || "—"}
                </Typography>
                <Typography>
                  <b>Payment Status:</b> {order.paymentInfo?.status || "—"}
                </Typography>
                <Typography>
                  <b>Subtotal:</b> {formatCurrency(order.pricing?.subtotal)}
                </Typography>
                <Typography>
                  <b>Shipping:</b> {formatCurrency(order.pricing?.shippingFee)}
                </Typography>
                <Typography>
                  <b>Tax:</b> {formatCurrency(order.pricing?.tax)}
                </Typography>
                <Typography>
                  <b>Total:</b> {formatCurrency(order.pricing?.total)}
                </Typography>
                <Typography>
                  <b>Created At:</b>{" "}
                  {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography fontWeight={700} mb={1}>
                Items
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Weight</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(order.items || []).map((it, idx) => {
                      const lineTotal = Number(it.price || 0) * Number(it.quantity || 0);
                      return (
                        <TableRow key={it._id || idx}>
                          <TableCell>{it.name || it?.productId?.name || "—"}</TableCell>
                          <TableCell>{it.weight || "—"}</TableCell>
                          <TableCell align="right">{formatCurrency(it.price)}</TableCell>
                          <TableCell align="right">{it.quantity}</TableCell>
                          <TableCell align="right">{formatCurrency(lineTotal)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderDetails;
