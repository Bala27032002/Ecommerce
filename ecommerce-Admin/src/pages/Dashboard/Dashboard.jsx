import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import axios from "axios";

import logo from "../../assets/Navbar-icons/Logo.svg";
import TopSelling from "../TopSelling/TopSelling";
import { MAINURL } from "../../config/Api";

const Dashboard = () => {
  const [totalSale, setTotalSale] = useState({
    todaySales: 0,
    totalOrders: 0,
  });

  const [dateFilter, setDateFilter] = useState("Daily");

  useEffect(() => {
    fetchConfirmedOrders();
  }, []);

  const fetchConfirmedOrders = async () => {
    try {
      const authToken = localStorage.getItem("auth_token") || localStorage.getItem("token");
      const res = await axios.get(`${MAINURL}orders?status=confirmed`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      });
      const data = res.data;

      setTotalSale({
        todaySales: data.todayConfirmedOrders || 0,
        totalOrders: data.totalOrders || 0,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        width: "100%",
        maxWidth: "100%",
      }}
    >
      {/* HEADER */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Dashboard
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

      {/* STAT CARDS */}
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


      {/* TOP SELLING + LOW STOCK */}
      <Box mt={4}>
        <TopSelling />
      </Box>
    </Box>
  );
};

export default Dashboard;

/* ---------------- STAT CARD ---------------- */

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
