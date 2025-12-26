import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Wishlist.css';
import { FaStar } from 'react-icons/fa';
import deleteIcon from '../../assets/Icons/delete_2.svg';
import { removeFromWishlist, fetchWishlist, optimisticRemoveFromWishlist } from '../../store/slices/wishlistSlice';
import AddToCartStepper from '../../components/AddToCartStepper/AddToCartStepper';

const Wishlist = () => {

  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const wishlistHydrated = useSelector((state) => state.wishlist.hydrated);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!wishlistHydrated) dispatch(fetchWishlist());
  }, [dispatch, wishlistHydrated]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} size={14} color="#FFD700" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
            <FaStar size={14} color="#e0e0e0" />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', overflow: 'hidden' }}>
              <FaStar size={14} color="#FFD700" />
            </div>
          </div>
        );
      } else {
        stars.push(<FaStar key={i} size={14} color="#e0e0e0" />);
      }
    }
    return stars;
  };

  return (
    <div className="wishlist-page">

      <div className="wishlist-title">
        <p className="wishlist-head" style={{ fontSize: '26px', fontWeight: '700', lineHeight: '3rem' }}>
          Wishlist
        </p>
        <p style={{ color: '#808080', fontSize: '13px' }}>
          Quick access to your saved products
        </p>
      </div>

      <div className="wishlist-container-main">

        {(!wishlistItems || wishlistItems.length === 0) ? (
          <div className="empty-wishlist">
            <p>Your wishlist is empty</p>
            <button className="continue-shopping">
              Continue Shopping
            </button>
          </div>
        ) : (
          <table className="wishlist-table">
            <thead>
              <tr>
                <th className="header-product">Product</th>
                <th className="header-price">Price</th>
              </tr>
            </thead>

            <tbody>
              {wishlistItems.map((product) => {
                const id = product?._id ?? product?.id;
                const weightText = product?.quantity?.value && product?.quantity?.unit
                  ? `${product.quantity.value} ${product.quantity.unit}`
                  : (product?.weight || '');
                return (
                <tr key={id} className="wishlist-row">

                  {/* Product Column */}
                  <td className="product-column">
                    <div className="wishlist-item-product">
                      <div className="wishlist-item-image">
                        <img src={product.image} alt={product.name} />
                      </div>

                      <div className="wishlist-item-details">
                        <p className="item-category">{product?.category?.name || ''}</p>
                        <h3>{product?.name}</h3>
                        <p className="item-weight">{weightText}</p>
                        <div className="rating">{renderStars(product.rating || 0)}</div>
                        <span className="price-value-mobile">
                          ₹{Number(product.price).toFixed(2)}/kg
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Price Column */}
                  <td className="price-column">
                    <span className="price-value">
                      ₹{Number(product.price).toFixed(2)}/kg
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td className="actions-column">
                    <AddToCartStepper
                      product={product}
                      variant="button"
                      className="add-stepper--wishlist"
                      addLabel="Add to cart"
                      onAddedFirstTime={async () => {
                        const _id = product?._id ?? product?.id;
                        if (!_id) return;
                        dispatch(optimisticRemoveFromWishlist(_id));
                        try {
                          await dispatch(removeFromWishlist(_id)).unwrap();
                        } catch (e) {
                          dispatch(fetchWishlist());
                        }
                      }}
                    />

                    <button
                      className="remove-from-wishlist-btn"
                      onClick={async () => {
                        const _id = product?._id ?? product?.id;
                        if (!_id) return;
                        dispatch(optimisticRemoveFromWishlist(_id));
                        try {
                          await dispatch(removeFromWishlist(_id)).unwrap();
                        } catch (e) {
                          dispatch(fetchWishlist());
                        }
                      }}
                    >
                      <img src={deleteIcon} alt="delete" />
                    </button>
                  </td>

                </tr>
              )})}
            </tbody>
          </table>
        )}
      </div>



    </div>
  );
};

export default Wishlist;
