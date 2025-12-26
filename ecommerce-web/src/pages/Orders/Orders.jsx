import React, { useState, useRef, useEffect } from "react";
import greensearch from "../../assets/Icons/Green_search.svg";
import filter from "../../assets/Icons/filter.svg";
import date from "../../assets/Icons/date.svg";
import Horlicks from "../../assets/Icons/Horlicks.svg";
import Boost from "../../assets/Icons/Boost.png";
import mic from "../../assets/Navbar/mic.png";
import './Orders.css';
import { useOrders } from '../../hooks/useOrders';
import { useNavigate } from "react-router-dom";

const Orders = () => {
    const navigate = useNavigate();
    const scrollContainerRef = useRef(null);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    const {
        orders,
        loading,
        error,
        fetchOrders,
        getFilteredOrders,
        searchOrders,
        getOrderStats
    } = useOrders();

    // Get filtered orders based on active tab
    const filteredOrders = activeTab === 'all' 
        ? getFilteredOrders('all')
        : getFilteredOrders(activeTab);

    // Get search results if there's a search query
    const displayOrders = searchQuery 
        ? searchOrders(searchQuery)
        : filteredOrders;

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    // Get status display text and style
    const getStatusInfo = (status) => {
        const statusMap = {
            'delivered': { text: 'Delivered', className: 'delivered' },
            'cancelled': { text: 'Cancelled', className: 'cancelled' },
            'confirmed': { text: 'Confirmed', className: 'confirmed' },
            'processing': { text: 'Processing', className: 'processing' },
            'shipped': { text: 'Shipped', className: 'shipped' },
            'pending': { text: 'Pending', className: 'pending' }
        };
        return statusMap[status] || { text: status, className: 'pending' };
    };

    // Handle search input
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    // Handle refresh
    const handleRefresh = () => {
        fetchOrders();
    };

    if (loading && orders.length === 0) {
        return (
            <div className="orders-loading">
                <div className="loading-spinner"></div>
                <p>Loading your orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="orders-error">
                <p>Error: {error}</p>
                <button onClick={handleRefresh} className="retry-button">
                    Retry
                </button>
            </div>
        );
    }

    const handleProductClick = (item) => {
        const productId =
            typeof item?.productId === "string"
                ? item.productId
                : (item?.productId?._id ?? item?.productId?.id);

        if (!productId) return;

        const productName = item?.productId?.name ?? item?.name ?? '';
        const categoryName = item?.productId?.category?.name ?? item?.category?.name ?? '';

        navigate(`/product-details?id=${productId}&name=${encodeURIComponent(productName)}&category=${encodeURIComponent(categoryName)}`);
    };

    return (
        <>
           
         
        
            <div className="search-container">
                <div className="mobile-search-orders">
                    <img src={greensearch} alt="search" />
                    <input
                        type="text"
                        className='mobile-search-orders-input'
                        placeholder='Search Products'
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                    <button className='mic-button-orders' type="button">
                        <img src={mic} alt='microphone' />
                    </button>
                </div>
               
            </div>

          
            <div className="filter-tabs">
                <button 
                    className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All Orders
                </button>
                <button 
                    className={`filter-tab ${activeTab === 'delivered' ? 'active' : ''}`}
                    onClick={() => setActiveTab('delivered')}
                >
                    Delivered
                </button>
                <button 
                    className={`filter-tab ${activeTab === 'cancelled' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cancelled')}
                >
                    Cancelled
                </button>
            </div>

            <div className="orders-container">
                {displayOrders.length === 0 ? (
                    <div className="no-orders">
                        <p>No orders found</p>
                    </div>
                ) : (
                    displayOrders.map((order) => {
                        const statusInfo = getStatusInfo(order.orderStatus);
                        return (
                            <div key={order._id} className="order-card">
                                <div className="order-header">
                                    <div className="order-date">
                                        <img src={date} alt="date" />
                                        <span>{formatDate(order.createdAt)}</span>
                                    </div>
                                    <button className={`status-tag ${statusInfo.className}`}>
                                        {statusInfo.text}
                                    </button>
                                </div>
                                
                                <div className="order-items">
                                    {order.items && order.items.slice(0, 3).map((item, index) => (
                                        <div key={index} className="item-image" 
>
                                            <img onClick={() => handleProductClick(item)}
                                                src={item.productId?.image || item.image || Horlicks} 
                                                alt={item.productId?.name || item.name || 'Product'} 
                                            />
                                        </div>
                                    ))}
                                    {order.items && order.items.length > 3 && (
                                        <span className="more-items">
                                            +{order.items.length - 3} more items
                                        </span>
                                    )}
                                </div>
                                
                                <div className="order-footer">
                                    <span className="item-count">
                                        {order.items ? `${order.items.length} Items` : '0 Items'}
                                    </span>
                                    <div className="order-value">
                                        <span className="value">
                                            ₹{order.pricing?.total || order.totalAmount || '0'}
                                        </span>
                                        <span className="value-label">Order value</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </>
    )
}

export default Orders;