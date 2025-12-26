
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './OrderInformation.css';
import { toast } from 'react-toastify';
import { MAINURL } from '../../../config/Api';

const OrderInformation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = useSelector((state) => state.cart.items);

  const stateItems = location.state?.items;
  const items = React.useMemo(() => {
    if (Array.isArray(stateItems) && stateItems.length > 0) return stateItems;
    return (cartItems || []).map((item) => ({
      _id: item._id ?? item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity ?? item.qty ?? 1,
      weight: item.weight,
    }));
  }, [stateItems, cartItems]);

  const [paymentMethod, setPaymentMethod] = React.useState('razorpay');
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const token = React.useMemo(() => localStorage.getItem('token'), []);

  const subtotal = React.useMemo(() => {
    return (items || []).reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );
  }, [items]);

  const shipping = 0;
  const discount = 0;
  const total = subtotal + shipping - discount;

  const validateForm = () => {
    if (!formData.fullName?.trim()) {
      toast.error('Enter full name');
      return false;
    }
    if (!formData.email?.trim()) {
      toast.error('Enter email');
      return false;
    }
    if (!formData.phone?.trim()) {
      toast.error('Enter phone');
      return false;
    }
    if (!formData.address?.trim()) {
      toast.error('Enter address');
      return false;
    }
    if (!formData.city?.trim()) {
      toast.error('Enter city');
      return false;
    }
    if (!formData.postalCode?.trim()) {
      toast.error('Enter postal code');
      return false;
    }
    if (!token) {
      toast.error('Please login to continue');
      return false;
    }
    return true;
  };

  const authHeaders = React.useMemo(
    () => ({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (paymentMethod === 'cod') {
        const res = await fetch(`${MAINURL}orders/create`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            items: items.map((i) => ({ productId: i._id, quantity: i.quantity ?? 1 })),
            customerInfo: formData,
            paymentInfo: { method: 'cod' },
          }),
        });

        const data = await res.json();
        if (!res.ok || !data?.success) throw new Error(data?.message || 'Order failed');

        toast.success('✅ Order placed (Cash on Delivery)');
        setShowSuccess(true);
        setTimeout(() => navigate('/orders'), 1500);
        return;
      }

      if (!window.Razorpay) {
        toast.error('Razorpay is not loaded. Please refresh and try again.');
        return;
      }

      // Create Razorpay order from backend (amount computed server-side)
      const orderRes = await fetch(`${MAINURL}orders/razorpay-order`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i._id, quantity: i.quantity ?? 1 })),
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData?.success) {
        throw new Error(orderData?.message || 'Failed to create Razorpay order');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'GoFresh E-Commerce',
        description: 'Order Payment',
        order_id: orderData.orderId,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: '#16a34a' },
        handler: async (response) => {
          try {
            // Verify payment (server also verifies with Razorpay API)
            const verifyRes = await fetch(`${MAINURL}orders/verify-payment`, {
              method: 'POST',
              headers: authHeaders,
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData?.success) {
              throw new Error(verifyData?.message || 'Payment verification failed');
            }

            const createRes = await fetch(`${MAINURL}orders/create`, {
              method: 'POST',
              headers: authHeaders,
              body: JSON.stringify({
                items: items.map((i) => ({ productId: i._id, quantity: i.quantity ?? 1 })),
                customerInfo: formData,
                paymentInfo: { method: 'razorpay' },
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const createData = await createRes.json();
            if (!createRes.ok || !createData?.success) {
              throw new Error(createData?.message || 'Order creation failed');
            }

            toast.success('✅ Payment successful! Order placed.');
            setShowSuccess(true);
            setTimeout(() => navigate('/orders'), 1500);
          } catch (e) {
            console.error(e);
            toast.error(e?.message || '❌ Payment failed');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error('❌ Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error(e);
      toast.error(e?.message || '❌ Payment failed. Please try again.');
      setLoading(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="order-info-page">
        <div className="empty-order">
          <p>Your order is empty</p>
          <button className="back-btn" onClick={() => navigate('/home')}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-info-page">
      <div className="order-info-container">
        <div>
          <div className="form-section">
            <h2 className="section-title">Order Information</h2>
            <p className="section-subtitle">Enter your details to complete the payment</p>

            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  className="form-input-order"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  className="form-input-order"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="form-group full-width">
                <label>Email</label>
                <input
                  className="form-input-order"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="form-group full-width">
                <label>Delivery Address</label>
                <input
                  className="form-input-order"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  className="form-input-order"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Postal Code</label>
                <input
                  className="form-input-order"
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData((p) => ({ ...p, postalCode: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Payment Method</h2>
            <p className="section-subtitle">Choose how you want to pay</p>

            <div className="payment-methods">
              <div className="payment-option" onClick={() => setPaymentMethod('razorpay')}>
                <label className="payment-label">
                  <input
                    className="payment-radio"
                    type="radio"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                  />
                  <span className="payment-name">Razorpay (UPI)</span>
                </label>
              </div>
              <div className="payment-option" onClick={() => setPaymentMethod('cod')}>
                <label className="payment-label">
                  <input
                    className="payment-radio"
                    type="radio"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <span className="payment-name">Cash on Delivery</span>
                </label>
              </div>
            </div>

            {paymentMethod === 'razorpay' && (
              <div className="upi-info" style={{ marginTop: 16 }}>
                You can pay using UPI / Google Pay / PhonePe inside Razorpay.
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="upi-info" style={{ marginTop: 16 }}>
                Pay cash when your order is delivered.
              </div>
            )}
          </div>
        </div>

        <div className="order-summary-section">
          <h3 className="summary-title">Order Summary</h3>

          <div className="order-items">
            {items.map((item) => (
              <div className="order-item" key={item._id ?? item.name}>
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p className="item-weight">{item.weight || ''}</p>
                </div>
                <div className="item-price">
                  <p className="price">₹{Number(item.price || 0).toFixed(2)}</p>
                  <p className="quantity">Qty: {item.quantity || 1}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="order-divider" />

          <div className="price-breakdown">
            <div className="breakdown-row">
              <span className="breakdown-label">Subtotal</span>
              <span className="breakdown-value">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="breakdown-row">
              <span className="breakdown-label">Shipping</span>
              <span className="breakdown-value">₹{shipping.toFixed(2)}</span>
            </div>
            <div className="breakdown-row">
              <span className="breakdown-label">Discount</span>
              <span className="breakdown-value">₹{discount.toFixed(2)}</span>
            </div>
          </div>

          <div className="order-total">
            <span className="total-label">Total</span>
            <span className="total-amount">₹{total.toFixed(2)}</span>
          </div>

          <button className="pay-now-btn" onClick={handlePayment} disabled={loading}>
            {loading ? 'Processing...' : 'Buy Now'}
          </button>
          <button className="back-to-cart-btn" onClick={() => navigate('/home')}>
            Back to cart
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="payment-success-overlay" onClick={() => setShowSuccess(false)}>
          <div className="payment-success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon-circle">✓</div>
            <div className="success-amount">₹{total.toFixed(2)}</div>
            <div className="success-label">Payment Successful</div>
            <button className="success-return-btn" onClick={() => navigate('/home')}>
              Return to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderInformation;
