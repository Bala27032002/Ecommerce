import { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './utils/toast.css';

import Login from './pages/Login/Login';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import Brands from './pages/Brands/Brands';
import Categories from './pages/CategoryProduct/Categories';
import CategoryProducts from './pages/CategoryProducts/CategoryProducts';
import Wishlist from './pages/Wishlist/Wishlist';
import Cart from './pages/Cart/Cart';
import Orders from './pages/Orders/Orders';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import OrderInformation from './pages/OrderInformation/OrderInformation';
import ContactUs from './pages/ContactUs/ContactUs';
import Profile from './pages/Profile/Profile';
import DeliveryLogin from './pages/DeliveryBoy/DeliveryLogin';
import DeliveryDashboard from './pages/DeliveryBoy/DeliveryDashboard';
import DeliveryOrderDetails from './pages/DeliveryBoy/DeliveryOrderDetails';

import { setUser } from './store/slices/authSlice';
import Offers from './pages/Offers/Offers';

// 🔐 Protected Route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const DeliveryProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('deliveryBoyToken');
  const boy = localStorage.getItem('deliveryBoy');
  return token && boy ? children : <Navigate to="/delivery-login" replace />;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      dispatch(setUser({ user: JSON.parse(user), token }));
    }
    setIsLoading(false);
  }, [dispatch]);

  if (isLoading) return <div>Loading...</div>;

  const protectedRoutes = [
    { path: '/home', element: <Home /> },
    { path: '/allproducts', element: <Categories /> },
    { path: '/category-products/:slug', element: <CategoryProducts /> },
    { path: '/brands', element: <Brands /> },
    { path: '/wishlist', element: <Wishlist /> },
    { path: '/cart', element: <Cart /> },
    { path: '/orders', element: <Orders /> },
    { path: '/product-details', element: <ProductDetails /> },
    { path: '/order-information', element: <OrderInformation /> },
    { path: '/contact-us', element: <ContactUs /> },
    { path: '/profile', element: <Profile /> },
    { path: '/offers', element: <Offers /> },
  ];

  return (
    <>
      <Router>
        <Routes>
          {/* Login */}
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />}
          />

          {/* Delivery Boy */}
          <Route path="/delivery-login" element={<DeliveryLogin />} />
          <Route
            path="/delivery-dashboard"
            element={
              <DeliveryProtectedRoute>
                <DeliveryDashboard />
              </DeliveryProtectedRoute>
            }
          />
          <Route
            path="/delivery-order/:orderId"
            element={
              <DeliveryProtectedRoute>
                <DeliveryOrderDetails />
              </DeliveryProtectedRoute>
            }
          />

          {/* Protected Layout */}
          <Route element={<Layout />}>
            {protectedRoutes.map(({ path, element }) => (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute>
                    {element}
                  </ProtectedRoute>
                }
              />
            ))}
          </Route>
        </Routes>
      </Router>

      <ToastContainer
        position="top-center"
        autoClose={500}
        hideProgressBar
        limit={1}
      />
    </>
  );
}

export default App;
