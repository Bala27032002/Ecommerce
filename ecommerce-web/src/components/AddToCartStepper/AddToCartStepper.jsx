import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './AddToCartStepper.css';
import plusIcon from '../../assets/Home-icons/plus.svg';
import {
  addToCart,
  fetchCart,
  optimisticAddToCart,
  optimisticRemoveFromCart,
  optimisticUpdateQuantity,
  removeFromCart,
  updateCartQuantity,
} from '../../store/slices/cartSlice';
import { showToast } from '../../utils/Toast';

const getProductId = (product, explicitId) => {
  return explicitId || (product?._id ?? product?.id) || null;
};

const selectCartQtyById = (state, productId) => {
  if (!productId) return 0;
  const item = (state.cart.items || []).find((it) => (it?._id ?? it?.id) === productId);
  return Number(item?.quantity || 0);
};

const AddToCartStepper = ({
  product,
  productId: productIdProp,
  variant = 'icon',
  className = '',
  stopPropagation = false,
  addLabel = 'Add to cart',
  onAddedFirstTime,
}) => {
  const dispatch = useDispatch();
  const productId = useMemo(() => getProductId(product, productIdProp), [product, productIdProp]);
  const qty = useSelector((state) => selectCartQtyById(state, productId));

  const [busy, setBusy] = useState(false);

  const safeStop = (e) => {
    if (stopPropagation) e.stopPropagation();
  };

  const ensureAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast.error('Please login to add items to cart');
      return false;
    }
    return true;
  };

  const handleAdd = async (e) => {
    safeStop(e);
    if (!productId) return;
    if (!ensureAuth()) return;

    setBusy(true);
    dispatch(optimisticAddToCart({ productId, quantity: 1, productSnapshot: product }));
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      if (typeof onAddedFirstTime === 'function') {
        try {
          await onAddedFirstTime();
        } catch (err) {
          // ignore callback errors
        }
      }
    } catch (err) {
      dispatch(fetchCart());
    } finally {
      setBusy(false);
    }
  };

  const handleInc = async (e) => {
    safeStop(e);
    if (!productId) return;
    if (!ensureAuth()) return;

    const next = Number(qty || 0) + 1;
    setBusy(true);
    dispatch(optimisticUpdateQuantity({ productId, quantity: next }));
    try {
      await dispatch(updateCartQuantity({ productId, quantity: next })).unwrap();
    } catch (err) {
      dispatch(fetchCart());
    } finally {
      setBusy(false);
    }
  };

  const handleDec = async (e) => {
    safeStop(e);
    if (!productId) return;
    if (!ensureAuth()) return;

    const next = Number(qty || 0) - 1;
    setBusy(true);

    if (next <= 0) {
      dispatch(optimisticRemoveFromCart(productId));
      try {
        await dispatch(removeFromCart(productId)).unwrap();
      } catch (err) {
        dispatch(fetchCart());
      } finally {
        setBusy(false);
      }
      return;
    }

    dispatch(optimisticUpdateQuantity({ productId, quantity: next }));
    try {
      await dispatch(updateCartQuantity({ productId, quantity: next })).unwrap();
    } catch (err) {
      dispatch(fetchCart());
    } finally {
      setBusy(false);
    }
  };

  if (!qty) {
    if (variant === 'button') {
      return (
        <button
          type="button"
          className={`add-stepper add-stepper--button ${className}`.trim()}
          onClick={handleAdd}
          disabled={busy}
        >
          {addLabel}
        </button>
      );
    }

    return (
      <img
        src={plusIcon}
        className={`card-add ${className}`.trim()}
        alt="add to cart"
        onClick={handleAdd}
      />
    );
  }

  return (
    <div
      className={`add-stepper ${variant === 'button' ? 'add-stepper--button' : 'add-stepper--icon'} ${className}`.trim()}
      onClick={safeStop}
      role="group"
      aria-label="cart quantity"
    >
      <button type="button" className="add-stepper-btn" onClick={handleDec} disabled={busy}>
        −
      </button>
      <div className="add-stepper-qty">{qty}</div>
      <button type="button" className="add-stepper-btn" onClick={handleInc} disabled={busy}>
        +
      </button>
    </div>
  );
};

export default AddToCartStepper;
