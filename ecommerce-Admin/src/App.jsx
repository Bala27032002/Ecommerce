import React, { Suspense, lazy } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, AuthContext } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import Orders from './pages/Orders/Orders';
import OrderDetails from './pages/Orders/OrderDetails';
import StockAndPricing from './pages/StockAndPricing/StockAndPricing';
import CustomerManagement from './pages/CustomerManagement/CustomerManagement';
import CategoryManagement from './pages/CategoryManagement/CategoryManagement';

// Lazy load pages
const Login = lazy(() => import('./pages/Login/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const SellingProduct = lazy(() => import('../src/pages/SellingProduct/SellingProduct'))
const TopSelling = lazy(() => import('../src/pages/TopSelling/TopSelling'))

// Loading component
const Loading = () => <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>

function AppRoutes() {
  const { isAuthenticated, loading } = React.useContext(AuthContext)

  if (loading) {
    return <Loading />
  }

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Login />} />

        {/* Protected Routes */}
        <Route
          path='/dashboard'
          element={
            isAuthenticated ? (
              <MainLayout>
                <Dashboard />
              </MainLayout>
            ) : (
              <Navigate to='/' replace />
            )
          }
        />
        <Route
          path='/stocks'
          element={
            isAuthenticated ? (
              <MainLayout>
                <StockAndPricing />
              </MainLayout>
            ) : (
              <Navigate to='/' replace />
            )
          }
        />
        <Route
          path='/orders'
          element={
            isAuthenticated ? (
              <MainLayout>
                <Orders />
              </MainLayout>
            ) : (
              <Navigate to='/' replace />
            )
          }
        />
        <Route
          path='/orders/:orderId'
          element={
            isAuthenticated ? (
              <MainLayout>
                <OrderDetails />
              </MainLayout>
            ) : (
              <Navigate to='/' replace />
            )
          }
        />
        <Route
          path='/customer'
          element={
            isAuthenticated ? (
              <MainLayout>
                <CustomerManagement />
              </MainLayout>
            ) : (
              <Navigate to='/' replace />
            )
          }
        />
        <Route
          path='/categories'
          element={
            isAuthenticated ? (
              <MainLayout>
                <CategoryManagement />
              </MainLayout>
            ) : (
              <Navigate to='/' replace />
            )
          }
        />
        {/* Redirect dashboard to home when authenticated */}
        <Route path='*' element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </Router>
  )
}

export default App
