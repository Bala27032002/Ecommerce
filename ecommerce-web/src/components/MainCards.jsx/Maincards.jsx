import React from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Maincards.css";

import heart from "../../assets/Home-icons/heart.svg";
import sausage from "../../assets/Home-icons/sausage.svg";
import heartfilled from "../../assets/Icons/heartfilled.svg";
import { addToWishlist, removeFromWishlist, fetchWishlist, optimisticAddToWishlist, optimisticRemoveFromWishlist } from "../../store/slices/wishlistSlice";
import AddToCartStepper from "../AddToCartStepper/AddToCartStepper";

const Maincards = ({ product }) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const isWishlisted = React.useMemo(() => {
    const id = product?._id ?? product?.id;
    return wishlistItems?.some((p) => (p?._id ?? p?.id) === id);
  }, [wishlistItems, product]);

  const discountPercent = product?.discount || 0;

  const formatPrice = (price) => {
    return `₹${price}`;
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <>
        {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`}>⭐</span>)}
        {hasHalfStar && <span>⭐</span>}
        {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`}>☆</span>)}
      </>
    );
  };
  return (
    <div className="product-card-wrapper">
      <div className="card-inner">

        {/* Wishlist Icon */}
        <div className="wish-list" onClick={async (e) => {
          e.stopPropagation(); // Prevent card click
          const id = product?._id ?? product?.id;
          if (!id) return;
          if (isWishlisted) {
            dispatch(optimisticRemoveFromWishlist(id));
            try {
              await dispatch(removeFromWishlist(id)).unwrap();
            } catch (e) {
              dispatch(fetchWishlist());
            }
          } else {
            dispatch(optimisticAddToWishlist({ productId: id, productSnapshot: product }));
            try {
              await dispatch(addToWishlist(id)).unwrap();
            } catch (e) {
              dispatch(fetchWishlist());
            }
          }
        }}>
          <img
            src={isWishlisted ? heartfilled : heart}
            className="card-heart"
            alt="wishlist"
          />
        </div>

        {/* Product Image */}
        <div className="card-image-container">
          <img
            src={product?.image || sausage}
            alt={product?.name || "Product"}
            className="card-image"
            onError={(e) => {
              e.target.src = sausage;
            }}
          />
          {discountPercent > 0 && (
            <div className="discount-badge">{discountPercent}% OFF</div>
          )}
        </div>

        {/* Product Details */}
        <div className="sausage-title">
          <h3 className="card-title">{product?.name || "Product Name"}</h3>

          <p className="card-weight">
            {product?.quantity?.value ? `${product.quantity.value}${product.quantity.unit || 'g'}` : '1 pack'}
          </p>

          {/* Rating UI only */}
          <div className="rating">
            {renderStars(product?.rating || 0)} <span>({product?.reviewCount || 0})</span>
          </div>

          {/* Price + Cart */}
          <div className="card-bottom">
            <div className="price-section">
              <p className="card-price">{formatPrice(product?.price ?? 0)}</p>
              {product?.originalPrice && (
                <p className="card-original-price">{formatPrice(product.originalPrice)}</p>
              )}
            </div>

            <AddToCartStepper product={product} stopPropagation={true} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Maincards;
