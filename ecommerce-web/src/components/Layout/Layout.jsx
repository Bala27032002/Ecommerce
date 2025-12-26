import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import BottomNavbar from '../BottomNavbar/BottomNavbar';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import './Layout.css'

import footer from '../../assets/footer.svg'
import Nav from '../Nav/Nav';
import { fetchCart } from '../../store/slices/cartSlice';
import { fetchWishlist } from '../../store/slices/wishlistSlice';

const Layout = () => {
  const dispatch = useDispatch();
  const cartHydrated = useSelector((state) => state.cart.hydrated);
  const cartLoading = useSelector((state) => state.cart.loading);
  const wishlistHydrated = useSelector((state) => state.wishlist.hydrated);
  const wishlistLoading = useSelector((state) => state.wishlist.loading);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      if (!cartHydrated && !cartLoading) dispatch(fetchCart());
      if (!wishlistHydrated && !wishlistLoading) dispatch(fetchWishlist());
    }
  }, [dispatch, cartHydrated, cartLoading, wishlistHydrated, wishlistLoading]);
  return (
    <div className='layout-container'>
      <Nav />
      <Breadcrumbs />
      <main className='layout-main'>
        <Outlet />
      </main>
      <Footer />
      <BottomNavbar />
      <div style={{ position: 'relative' }}>
          <img src={footer} alt="footer" className='footer-login-img' style={{ width: '100%', }} />
        </div> 
    </div>
  )
}

export default Layout
