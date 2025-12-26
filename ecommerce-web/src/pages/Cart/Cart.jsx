import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './Cart.css';
import { fetchCart, updateCartQuantity, removeFromCart, optimisticRemoveFromCart, optimisticUpdateQuantity } from '../../store/slices/cartSlice';

/* 🔹 Media Query Hook – UI purpose only */
function useMediaQuery(query) {
  const [matches, setMatches] = React.useState(
    window.matchMedia(query).matches
  );

  React.useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

const Cart = () => {
  const isMobile = useMediaQuery('(max-width:840px)');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const cartHydrated = useSelector((state) => state.cart.hydrated);

  const [selectedIds, setSelectedIds] = React.useState(() => new Set());

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!cartHydrated) dispatch(fetchCart());
  }, [dispatch, cartHydrated]);

  React.useEffect(() => {
    // Remove selections for products no longer in cart
    setSelectedIds((prev) => {
      const next = new Set();
      for (const item of cartItems || []) {
        const id = item._id ?? item.id;
        if (id && prev.has(id)) next.add(id);
      }
      return next;
    });
  }, [cartItems]);

  const toggleItem = (id) => {
    if (!id) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedItems = React.useMemo(() => {
    return (cartItems || []).filter((item) => {
      const id = item._id ?? item.id;
      return id && selectedIds.has(id);
    });
  }, [cartItems, selectedIds]);

  const selectedItemsCount = selectedItems.length;
  const totalPrice = selectedItems.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantity ?? item.qty ?? 1),
    0
  );

  const allSelected = (cartItems || []).length > 0 && selectedItemsCount === (cartItems || []).length;
  const toggleAll = () => {
    setSelectedIds((prev) => {
      const isAll = (cartItems || []).length > 0 && prev.size === (cartItems || []).length;
      if (isAll) return new Set();
      const next = new Set();
      for (const item of cartItems || []) {
        const id = item._id ?? item.id;
        if (id) next.add(id);
      }
      return next;
    });
  };

  const handlePayNow = () => {
    const items = (selectedItems || []).map((item) => ({
      _id: item._id ?? item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity ?? item.qty ?? 1,
      weight: item.weight,
    }));

    if (!items || items.length === 0) return;

    navigate('/order-information', {
      state: {
        items,
        source: 'cart',
      },
    });
  };

  return (
    <div>

      {/* ================= DESKTOP VIEW ================= */}
      {!isMobile && (
        <div className="cart-page">
          <div className="cart-container-main">

            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <p>Your cart is empty</p>
                <button className="continue-shopping" onClick={() => navigate('/home')}>
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <table className="cart-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th className="header-product">Product</th>
                      <th className="header-price">Price</th>
                      <th className="header-quantity">Quantity</th>
                      <th className="header-subtotal">Subtotal</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(cartItems || []).map((item) => {
                      const id = item._id ?? item.id;
                      const weightText = item.weight || ((item.quantity?.value && item.quantity?.unit) ? `${item.quantity.value}${item.quantity.unit ? ' ' + item.quantity.unit : ''} / pack` : '');
                      return (
                      <tr key={id}>
                        <td>
                          <input
                            type="checkbox"
                            className="item-checkbox-input"
                            checked={!!(id && selectedIds.has(id))}
                            onChange={() => toggleItem(id)}
                          />
                        </td>

                        <td>
                          <div className="cart-item-product">
                            <div className="cart-item-image">
                              <img src={item.image} alt={item.name} />
                            </div>
                            <div className="cart-item-details">
                              <h3>{item.name}</h3>
                              <p className="item-weight">{weightText}</p>
                            </div>
                          </div>
                        </td>

                        <td>₹{Number(item.price).toFixed(2)}/kg</td>

                        <td className="qunatity-cart">
                          <div className="item-quantity">
                            <button className="qty-btn" onClick={() => {
                              if (!id) return;
                              const next = Number(item.quantity || item.qty || 1) - 1;
                              if (next <= 0) {
                                dispatch(optimisticRemoveFromCart(id));
                                dispatch(removeFromCart(id)).unwrap().catch(() => dispatch(fetchCart()));
                              } else {
                                dispatch(optimisticUpdateQuantity({ productId: id, quantity: next }));
                                dispatch(updateCartQuantity({ productId: id, quantity: next })).unwrap().catch(() => dispatch(fetchCart()));
                              }
                            }}>−</button>
                            <input
                              type="number"
                              value={item.quantity ?? item.qty ?? 1}
                              readOnly
                              className="qty-input"
                            />
                            <button className="qty-btn" onClick={() => {
                              if (!id) return;
                              const next = Number(item.quantity || item.qty || 1) + 1;
                              dispatch(optimisticUpdateQuantity({ productId: id, quantity: next }));
                              dispatch(updateCartQuantity({ productId: id, quantity: next })).unwrap().catch(() => dispatch(fetchCart()));
                            }}>+</button>
                          </div>
                        </td>

                        <td>₹{(Number(item.price || 0) * Number(item.quantity ?? item.qty ?? 1)).toFixed(2)}</td>
                      </tr>
                    )})}
                  </tbody>
                </table>

                <div className="cart-footer">
                  <div className="select-all-section">
                    <input
                      type="checkbox"
                      className="select-all-checkbox-footer"
                      checked={allSelected}
                      onChange={toggleAll}
                    />
                    <label>Select All</label>
                  </div>

                  <div className="payment-section">
                    <div className="payment-info">
                      <p className="payment-label">
                        Total Payment ({selectedItemsCount} items)
                      </p>
                      <p className="payment-amount">
                        ₹ {totalPrice.toFixed(2)}
                      </p>
                    </div>
                    <button className="pay-now-btn" onClick={handlePayNow} disabled={selectedItemsCount === 0}>
                      Pay Now
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ================= MOBILE VIEW ================= */}
      {isMobile && (
        <div className="mobile-padd">
          <div className="mobile-cart-wrapper">
            <div className="cart-lists">

              {(cartItems || []).map((item) => {
                const id = item._id ?? item.id;
                const weightText = item.weight || ((item.quantity?.value && item.quantity?.unit) ? `${item.quantity.value}${item.quantity.unit ? ' ' + item.quantity.unit : ''} / pack` : '');
                return (
                <div className="lists-cart" key={id}>
                  <div className="cart-cards">
                    <input
                      type="checkbox"
                      className="item-checkbox-input"
                      checked={!!(id && selectedIds.has(id))}
                      onChange={() => toggleItem(id)}
                    />
                    <div className="cart-card-images">
                      <img src={item.image} alt={item.name} />
                    </div>
                  </div>

                  <div className="contain-cart">
                    <div className="cart-card-infos">
                      <h3>{item.name}</h3>
                      <p className="item-weights">{weightText}</p>
                    </div>

                    <div className="order-detail">
                      <p className="item-prices">₹{Number(item.price).toFixed(2)}/kg</p>

                      <div className="cart-card-qtys">
                        <button className="qty-btns" onClick={() => {
                          if (!id) return;
                          const next = Number(item.quantity || item.qty || 1) - 1;
                          if (next <= 0) {
                            dispatch(optimisticRemoveFromCart(id));
                            dispatch(removeFromCart(id)).unwrap().catch(() => dispatch(fetchCart()));
                          } else {
                            dispatch(optimisticUpdateQuantity({ productId: id, quantity: next }));
                            dispatch(updateCartQuantity({ productId: id, quantity: next })).unwrap().catch(() => dispatch(fetchCart()));
                          }
                        }}>−</button>
                        <span className="qty-numbers">{item.quantity ?? item.qty ?? 1}</span>
                        <button className="qty-btns" onClick={() => {
                          if (!id) return;
                          const next = Number(item.quantity || item.qty || 1) + 1;
                          dispatch(optimisticUpdateQuantity({ productId: id, quantity: next }));
                          dispatch(updateCartQuantity({ productId: id, quantity: next })).unwrap().catch(() => dispatch(fetchCart()));
                        }}>+</button>
                      </div>
                    </div>
                  </div>
                </div>
              )})}

            </div>

            <div className="mobile-cart-footer">
              <div className="select-all-section">
                <input
                  type="checkbox"
                  className="select-all-checkbox-footer"
                  checked={allSelected}
                  onChange={toggleAll}
                />
                <label>Select All</label>
              </div>

              <div className="payment-section">
                <div className="payment-info">
                  <span className="payment-label">
                    Total Payment ({selectedItemsCount} items)
                  </span>
                  <span className="payment-amount">
                    ₹ {totalPrice.toFixed(2)}
                  </span>
                </div>
                <button className="pay-now-btn" onClick={handlePayNow} disabled={selectedItemsCount === 0}>
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

 

    </div>
  );
};

export default Cart;
