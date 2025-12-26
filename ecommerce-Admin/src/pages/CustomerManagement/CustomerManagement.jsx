import React, { useState } from "react";
import { TableContainer, Paper } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import Checkbox from "@mui/material/Checkbox";

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
} from "@mui/material";import logo from "../../assets/Navbar-icons/Logo.svg";
import Dash from '../../assets/Dashboard-icons/image-dash.svg'
import SearchIcon from "@mui/icons-material/Search";
import update from '../../assets/Dashboard-icons/update.svg'
import Footer from "../Footer/Footer";


export default function CustomerManagement() {
     const orders = Array(9).fill({
    Image:Dash,
    Name: "Carson Darrin",
    Locate:"XXXXXXXXXXXXXXXXX",
    Orders: "3",
    Spent: "$300.00",
    Actions:update
  });
  const [dateFilter, setDateFilter] = useState("Daily");
  
   const [totalSale, setTotalSale] = useState({
      todaySales: 0,
      totalOrders: 0,
    });
 const [statusTab, setStatusTab] = useState("All");
 const [selectedRow, setSelectedRow] = useState(null);


  return (
    <Box
      sx={{
        p: 3,
        width: "100%",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Customer Management
          </Typography>
          <Typography color="text.secondary" fontSize={14}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography fontSize={14}>Date display:</Typography>
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
  

 <Box
  sx={{
    mb: 2,
    p: 2,
    backgroundColor: "#fff",
    borderRadius: 2,
    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
    display:"flex",
    justifyContent:'space-between'
  }}
>



     

  <Grid container spacing={2} alignItems="center">
    <Grid item xs={12} sm={8}>
      <TextField
        size="small"
        placeholder="Search"
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
    </Grid>
    <Grid item xs={12} sm={4}>
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
<Box >
 <Select
        size="small"
        value="newest"
        displayEmpty
        sx={{
          height: 40,
          minWidth: 200,
          backgroundColor: "#fff",
          borderRadius: 1,
          fontSize: 14,
          "& .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #2E7D32",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2E7D32",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2E7D32",
          },
        }}
      >
        <MenuItem value="newest">Last update (newest)</MenuItem>
        <MenuItem value="oldest">Last update (oldest)</MenuItem>
        <MenuItem value="priceHigh">Price: High to Low</MenuItem>
        <MenuItem value="priceLow">Price: Low to High</MenuItem>
      </Select>
      </Box>

</Box>



  <TableContainer
  component={Paper}
  sx={{
    width: "100%",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch", 
  }}
>

          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Orders</TableCell>
                <TableCell>Spent</TableCell>
               <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

           <TableBody>
 {orders
  .filter((row) =>
    statusTab === "All" ? true : row.status === statusTab
  )
  .map((row, index) => (
    <TableRow
      key={index}
      sx={{
        "& td": { borderBottom: "1px solid #f0f0f0" },
      }}
    >
    
      <TableCell sx={{ pl: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
            <Checkbox
      checked={selectedRow === row.id}
      onChange={() =>
        setSelectedRow(
           row.id
        )
      }
      sx={{
        p: 0,
        width: 20,
        height: 20,
        "& .MuiSvgIcon-root": {
          fontSize: 20,
        },
        color: "#9E9E9E",
        "&.Mui-checked": {
          color: "#2E7D32",
        },
      }}
    />
          <Avatar
            src={row.Image}
            alt={row.Name}
            sx={{ width: 40, height: 40 }}
            variant="rounded"
          />
          <Typography fontWeight={500}>
            {row.Name}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell>{row.Locate}</TableCell>
      <TableCell>{row.Orders}</TableCell>
      <TableCell>{row.Spent}</TableCell>
      <TableCell> <Avatar
            src={row.Actions}
            alt={row.Name}
            sx={{ width: 24, height: 24 }}
            variant="rounded"
          /></TableCell>
      
      
      
    </TableRow>
  ))}

</TableBody>

          </Table>
          <Box sx={{ pl: 3, py: 2,px:3 }}>
                        <Footer />
                      </Box>
        </TableContainer>
        </Card>
  </Box>
    </Box>
  );
}







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

