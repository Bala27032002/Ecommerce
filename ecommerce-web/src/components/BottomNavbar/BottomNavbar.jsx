import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import './BottomNavbar.css'
import Home_icon from "../../assets/Home-icons/Home.svg"
import order_icon from "../../assets/Home-icons/symbols_orders.svg"
import cart_icon from "../../assets/Home-icons/cart.svg"
import profile_icon from "../../assets/Home-icons/profile.svg"
import offers_icon from "../../assets/Icons/offers_icon.svg"
import categories from "../../assets/Icons/categories.svg"


const BottomNavbar = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('home')
  
  // Get cart items count from Redux
  const cartItems = useSelector((state) => state.cart.items || [])
  const cartCount = cartItems.length // Count unique products instead of total quantity

  const handleNavigation = (tab, path) => {
    setActiveTab(tab)
    navigate(path)
  }

  return (
    <div className="bottom-navbar">
      <div 
        className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => handleNavigation('home', '/home')}
      >
        <div className="bottom-nav-icon"><img src={Home_icon} alt='home_icon' /></div>
        <span className="bottom-nav-label">Home</span>
      </div>
      <div 
        className={`bottom-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
        onClick={() => handleNavigation('categories', '/brands?tab=categories')}
      >
        <div className="bottom-nav-icon"><img src={categories} alt='Categories' /></div>
        <span className="bottom-nav-label">Categories</span>
      </div>

      <div 
        className={`bottom-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
        onClick={() => handleNavigation('orders', '/orders')}
      >
        <div className="bottom-nav-icon"><img src={order_icon} alt='order_icon' /></div>
        <span className="bottom-nav-label">Orders</span>
      </div>

      <div 
        className={`bottom-nav-item ${activeTab === 'cart' ? 'active' : ''}`}
        onClick={() => handleNavigation('cart', '/cart')}
      >
        <div className="bottom-nav-icon">
          <img src={cart_icon} alt='cart_icon' />
          {cartCount > 0 && (
            <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
          )}
        </div>
        <span className="bottom-nav-label">My Cart</span>
      </div>

      <div 
        className={`bottom-nav-item ${activeTab === 'offers' ? 'active' : ''}`}
        onClick={() => handleNavigation('Offers', '/offers')}
      >
        <div className="bottom-nav-icon"><img src={offers_icon} alt='fsg'/></div>
        <span className="bottom-nav-label">Offers</span>
      </div>
    </div>
  )
}

export default BottomNavbar
