import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MAINURL } from '../../../config/Api';
import { toast } from 'react-toastify';
import './DeliveryOrderDetails.css';

const DeliveryOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [paymentCollected, setPaymentCollected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('deliveryBoyToken');
    if (!token) {
      navigate('/delivery-login');
      return;
    }
    fetchOrderDetails(token);
  }, [orderId, navigate]);

  const fetchOrderDetails = async (token) => {
    try {
      const response = await fetch(`${MAINURL}delivery-boy/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
        setPaymentCollected(data.order.paymentCollected || false);
      } else {
        toast.error(data.message || 'Failed to fetch order');
        navigate('/delivery-dashboard');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to fetch order details');
      navigate('/delivery-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    const token = localStorage.getItem('deliveryBoyToken');
    if (!token) {
      navigate('/delivery-login');
      return;
    }

    setUpdating(true);

    try {
      const response = await fetch(
        `${MAINURL}delivery-boy/orders/${orderId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            paymentCollected: newStatus === 'delivered' ? paymentCollected : undefined,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
        toast.success(`Order status updated to ${newStatus}`);
        if (newStatus === 'delivered') {
          setTimeout(() => navigate('/delivery-dashboard'), 1500);
        }
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading order details...</div>;
  }

  if (!order) {
    return <div className="loading-container">Order not found</div>;
  }

  const isCOD = order.paymentInfo.method === 'cod';

  return (
    <div className="delivery-order-details">
      {/* Header */}
      <div className="order-details-header">
        <button className="back-btn" onClick={() => navigate('/delivery-dashboard')}>
          ← Back
        </button>
        <h1>Order #{order.orderNumber}</h1>
        <span className={`status-badge ${order.orderStatus}`}>
          {order.orderStatus === 'on-the-way' ? 'On The Way' : order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
        </span>
      </div>

      <div className="order-details-container">
        {/* Customer Info */}
        <div className="section customer-section">
          <h2>👤 Customer Information</h2>
          <div className="customer-card">
            <div className="customer-header">
              <div className="customer-avatar">{order.customerInfo.fullName.charAt(0).toUpperCase()}</div>
              <div className="customer-basic">
                <h3>{order.customerInfo.fullName}</h3>
                <p className="customer-city">📍 {order.customerInfo.city}</p>
              </div>
            </div>
            
            <div className="contact-section">
              <h4>Contact Details</h4>
              <div className="contact-items">
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <div className="contact-info">
                    <p className="contact-label">Phone</p>
                    <a href={`tel:${order.customerInfo.phone}`} className="contact-value">
                      {order.customerInfo.phone}
                    </a>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <div className="contact-info">
                    <p className="contact-label">Email</p>
                    <a href={`mailto:${order.customerInfo.email}`} className="contact-value">
                      {order.customerInfo.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="address-section">
            <h4>🏠 Delivery Address</h4>
            <div className="address-box">
              <p className="address">
                {order.customerInfo.address}
              </p>
              <p className="address-details">
                {order.customerInfo.city}, {order.customerInfo.postalCode}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="section items-section">
          <h2>Order Items</h2>
          <div className="items-list">
            {order.items.map((item, index) => (
              <div key={index} className="item-row">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p className="item-details">
                    {item.quantity} × {item.weight || '1 unit'}
                  </p>
                </div>
                <div className="item-price">
                  <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="section pricing-section">
          <h2>Order Summary</h2>
          <div className="pricing-details">
            <div className="pricing-row">
              <span>Subtotal</span>
              <span>₹{order.pricing.subtotal.toFixed(2)}</span>
            </div>
            <div className="pricing-row">
              <span>Shipping</span>
              <span>₹{order.pricing.shippingFee.toFixed(2)}</span>
            </div>
            <div className="pricing-row">
              <span>Tax</span>
              <span>₹{order.pricing.tax.toFixed(2)}</span>
            </div>
            <div className="pricing-row total">
              <span>Total Amount</span>
              <span>₹{order.pricing.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="section payment-section">
          <h2>Payment Information</h2>
          <div className="payment-info">
            <p>
              <strong>Method:</strong>{' '}
              {order.paymentInfo.method === 'card'
                ? 'Credit/Debit Card'
                : order.paymentInfo.method === 'upi'
                ? 'UPI'
                : order.paymentInfo.method === 'cod'
                ? 'Cash on Delivery'
                : 'Online Payment'}
            </p>
            <p>
              <strong>Status:</strong>{' '}
              <span className={`payment-status ${order.paymentInfo.status}`}>
                {order.paymentInfo.status.charAt(0).toUpperCase() +
                  order.paymentInfo.status.slice(1)}
              </span>
            </p>
            {order.paymentCollected && (
              <p className="payment-collected">
                ✅ Payment Collected from Customer
              </p>
            )}
          </div>
        </div>

        {/* Status Update Section */}
        {order.orderStatus !== 'delivered' && (
          <div className="section action-section">
            <h2>Update Delivery Status</h2>

            {order.orderStatus === 'confirmed' || order.orderStatus === 'processing' || order.orderStatus === 'shipped' ? (
              <button
                className="status-btn on-the-way"
                onClick={() => handleStatusUpdate('on-the-way')}
                disabled={updating}
              >
                {updating ? 'Updating...' : '🚚 Mark as On The Way'}
              </button>
            ) : null}

            {order.orderStatus === 'on-the-way' ? (
              <div className="delivery-section">
                <h3>Mark as Delivered</h3>

                {isCOD && (
                  <div className="payment-collection">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={paymentCollected}
                        onChange={(e) => setPaymentCollected(e.target.checked)}
                        disabled={updating}
                      />
                      <span>Payment Collected from Customer (₹{order.pricing.total.toFixed(2)})</span>
                    </label>
                    {paymentCollected && (
                      <p className="collection-note">
                        ✅ You will collect ₹{order.pricing.total.toFixed(2)} from the customer
                      </p>
                    )}
                  </div>
                )}

                <button
                  className="status-btn delivered"
                  onClick={() => handleStatusUpdate('delivered')}
                  disabled={updating || (isCOD && !paymentCollected)}
                >
                  {updating ? 'Updating...' : '✅ Mark as Delivered'}
                </button>
              </div>
            ) : null}
          </div>
        )}

        {order.orderStatus === 'delivered' && (
          <div className="section completed-section">
            <h2>✅ Order Completed</h2>
            <p>This order has been successfully delivered.</p>
            {order.paymentCollected && (
              <p className="payment-info-completed">
                Payment of ₹{order.pricing.total.toFixed(2)} was collected from the customer.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryOrderDetails;
