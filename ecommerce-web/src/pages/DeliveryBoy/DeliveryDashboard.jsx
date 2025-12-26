import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MAINURL } from '../../../config/Api';
import { toast } from 'react-toastify';
import './DeliveryDashboard.css';
import delivery from "../../assets/DeliveryBoy/Delivery_boy.svg"
import { io } from 'socket.io-client';

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const [deliveryBoy, setDeliveryBoy] = useState(null);
  const [activeTab, setActiveTab] = useState('assigned');
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('deliveryBoyToken');
    const boy = localStorage.getItem('deliveryBoy');

    if (!token || !boy) {
      return;
    }

    const parsedBoy = JSON.parse(boy);
    const socket = io(MAINURL.replace(/\/api\/?$/, ''), {
      transports: ['websocket'],
      withCredentials: true,
      auth: {
        token,
      },
    });

    const onAssigned = (payload) => {
      const targetId = payload?.deliveryBoyId ? String(payload.deliveryBoyId) : null;
      const myId = parsedBoy?.id ? String(parsedBoy.id) : null;
      if (targetId && myId && targetId !== myId) return;

      toast.info('New order assigned');
      fetchOrders(token);
    };

    socket.on('deliveryboy_notification', onAssigned);

    return () => {
      socket.off('deliveryboy_notification', onAssigned);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('deliveryBoyToken');
    const boy = localStorage.getItem('deliveryBoy');

    if (!token || !boy) {
      navigate('/delivery-login');
      return;
    }

    setDeliveryBoy(JSON.parse(boy));
    fetchOrders(token);
  }, [navigate]);

  const fetchOrders = async (token) => {
    try {
      const [assignedRes, completedRes] = await Promise.all([
        fetch(`${MAINURL}delivery-boy/orders/assigned`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${MAINURL}delivery-boy/orders/completed`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const assignedData = await assignedRes.json();
      const completedData = await completedRes.json();

      if (assignedData.success) {
        setAssignedOrders(assignedData.orders || []);
      }
      if (completedData.success) {
        setCompletedOrders(completedData.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('deliveryBoyToken');
    localStorage.removeItem('deliveryBoy');
    toast.success('Logged out successfully');
    navigate('/delivery-login');
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleAcceptOrder = async () => {
    if (!selectedOrder) return;

    setModalLoading(true);
    const token = localStorage.getItem('deliveryBoyToken');

    try {
      const response = await fetch(`${MAINURL}delivery-boy/orders/${selectedOrder._id}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Order accepted successfully!');
        setShowOrderModal(false);
        setSelectedOrder(null);
        // Navigate to order details
        navigate(`/delivery-order/${selectedOrder._id}`);
      } else {
        toast.error(data.message || 'Failed to accept order');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Failed to accept order. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!selectedOrder) return;

    setModalLoading(true);
    const token = localStorage.getItem('deliveryBoyToken');

    try {
      const response = await fetch(`${MAINURL}delivery-boy/orders/${selectedOrder._id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Order rejected successfully');
        setShowOrderModal(false);
        setSelectedOrder(null);
        // Refresh orders
        const token = localStorage.getItem('deliveryBoyToken');
        fetchOrders(token);
      } else {
        toast.error(data.message || 'Failed to reject order');
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error('Failed to reject order. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  if (!deliveryBoy) {
    return <div className="loading">Loading...</div>;
  }

  const orders = activeTab === 'assigned' ? assignedOrders : completedOrders;
  const pendingDeliveries = assignedOrders.filter((o) => o?.orderStatus === 'confirmed').length;
  const totalEarnings = completedOrders.reduce((sum, o) => sum + Number(o?.pricing?.total || 0), 0);

  return (
    <div className="delivery-dashboard">
      <div className="db-shell">
        <div className="db-topbar">
          
          <div className="db-topbar-title">Dashboard</div>
          <button
            type="button"
            className="db-icon-btn"
            aria-label="Logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <div className="db-content">
          <div className="db-profile">
            <div className="db-avatar">
              <img src={delivery} alt="Delivery Partner" />
            </div>
            <div className="db-profile-meta">
              <div className="db-profile-name">{deliveryBoy.name}</div>
              <div className="db-profile-sub">{deliveryBoy.phone || 'Delivery Partner'}</div>
            </div>
          </div>

          <div className="db-cards-grid">
            <div className="db-stat-card" role="button" tabIndex={0} onClick={() => setActiveTab('completed')}>
              <div className="db-stat-icon db-stat-icon-green">✓</div>
              <div className="db-stat-meta">
                <div className="db-stat-value">{completedOrders.length}</div>
                <div className="db-stat-label">Completed Deliveries</div>
              </div>
            </div>

            <div className="db-stat-card" role="button" tabIndex={0} onClick={() => setActiveTab('assigned')}>
              <div className="db-stat-icon db-stat-icon-amber">⧗</div>
              <div className="db-stat-meta">
                <div className="db-stat-value">{pendingDeliveries}</div>
                <div className="db-stat-label">Pending Deliveries</div>
              </div>
            </div>

            <div className="db-stat-card">
              <div className="db-stat-icon db-stat-icon-blue">↻</div>
              <div className="db-stat-meta">
                <div className="db-stat-value">{deliveryBoy.totalDeliveries}</div>
                <div className="db-stat-label">Total Deliveries</div>
              </div>
            </div>

            <div className="db-stat-card">
              <div className="db-stat-icon db-stat-icon-purple">₹</div>
              <div className="db-stat-meta">
                <div className="db-stat-value">₹{Math.round(totalEarnings)}</div>
                <div className="db-stat-label">Total Earnings</div>
              </div>
            </div>
          </div>

          <div className="db-alert-card">
            <div className="db-alert-left">
              <div className="db-alert-dot" />
              <div className="db-alert-title">0 Deliveries Cancelled</div>
            </div>
            <button type="button" className="db-alert-action" onClick={() => setActiveTab('completed')}>
              View
            </button>
          </div>

          <div className="db-section">
            <div className="db-section-head">
              <div className="db-section-title">My Delivery</div>
              <div className="db-segment">
                <button
                  type="button"
                  className={`db-seg-btn ${activeTab === 'assigned' ? 'active' : ''}`}
                  onClick={() => setActiveTab('assigned')}
                >
                  Assigned
                </button>
                <button
                  type="button"
                  className={`db-seg-btn ${activeTab === 'completed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('completed')}
                >
                  Completed
                </button>
              </div>
            </div>

            <div className="db-orders">
              {loading ? (
                <div className="loading">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="no-orders">
                  <p>No {activeTab === 'assigned' ? 'assigned' : 'completed'} orders</p>
                </div>
              ) : (
                <div className="db-order-list">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="db-order-item"
                      onClick={() => handleOrderClick(order)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="db-order-top">
                        <div className="db-order-id">Order #{order.orderNumber}</div>
                        <div className={`db-order-status ${order.orderStatus}`}>
                          {order.orderStatus === 'on-the-way'
                            ? 'On The Way'
                            : order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </div>
                      </div>
                      <div className="db-order-sub">{order.customerInfo?.fullName || '—'}</div>
                      <div className="db-order-meta">
                        <div className="db-order-pill">₹{Number(order?.pricing?.total || 0).toFixed(0)}</div>
                        <div className="db-order-pill">{order.items?.length || 0} items</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>


      </div>

      {/* Order Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>

            <div className="modal-header-section">
              <div className="delivery-boy-container">
                <div className="delivery-boy-box">
                  <div className="delivery-alert-icon" ><img src={delivery} alt='sdfdelivery'style={{width:"9rem"}}/></div>
                </div>
              </div>
<div style={{display:"flex",justifyContent:'space-between'}}>
              <h2 className="modal-title">New delivery alert!</h2>
              <p className="alert-timer">25s</p>
              </div>
                    <p className="payout-label">Est. payout:</p>
                <p className="payout-amount">₹{selectedOrder.pricing?.total?.toFixed(2) || '0.00'}</p>
                    <div className="detail-row">
                      <div>
                  <span className="detail-label">Distance:</span>
                  <span className="detail-value">{selectedOrder.distance || '4.3'}km</span>
                 </div>
                 <div>
                  <span className="detail-label">From:</span>
                  <span className="detail-value">FreshyGo</span>
           </div>
                </div>
            </div>

          

            <div className="modal-actions">
              <button
                className="btn-reject"
                onClick={handleRejectOrder}
                disabled={modalLoading}
              >
                {modalLoading ? 'Processing...' : 'Reject'}
              </button>
              <button
                className="btn-accept"
                onClick={handleAcceptOrder}
                disabled={modalLoading}
              >
                {modalLoading ? 'Processing...' : 'Accept'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
