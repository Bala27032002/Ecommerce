import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./ProductCards.css";

import heartfilled from "../../assets/Icons/heartfilled.svg";
import heart from "../../assets/Home-icons/heart.svg";
import { addToWishlist, removeFromWishlist, fetchWishlist, optimisticAddToWishlist, optimisticRemoveFromWishlist } from "../../store/slices/wishlistSlice";
import AddToCartStepper from "../AddToCartStepper/AddToCartStepper";

const ProductCards = ({ product }) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const wishlistHydrated = useSelector((state) => state.wishlist.hydrated);
  const navigate = useNavigate();

  // Handle card click to navigate to product details
  const handleCardClick = () => {
    const productId = product?._id ?? product?.id;
    const productName = product?.name || '';
    const categoryName = product?.category?.name || '';
    
    if (productId) {
      navigate(`/product-details?id=${productId}&name=${encodeURIComponent(productName)}&category=${encodeURIComponent(categoryName)}`);
    }
  };
  const isWishlisted = React.useMemo(() => {
    const id = product?._id ?? product?.id;
    return wishlistItems?.some((p) => (p?._id ?? p?.id) === id);
  }, [wishlistItems, product]);
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!wishlistHydrated) {
      try { dispatch(fetchWishlist()); } catch (e) {}
    }
  }, [dispatch, wishlistHydrated]);
  // Calculate discount percentage
  const discountPercent = product.discount || 0;
  
  // Format price
  const formatPrice = (price) => {
    return `₹${price}`;
  };

  // Render star rating
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
    <div className="product-card-wrapper"onClick={handleCardClick} >
     <div className="card-inner" >

        {/* Wishlist Icon */}
        <div className="wish-list" onClick={async (e) => {
          e.stopPropagation(); // Prevent card click
          const id = product?._id ?? product?.id;
          if (!id) return;
          if (isWishlisted) {
            dispatch(optimisticRemoveFromWishlist(id));
            try {
              await dispatch(removeFromWishlist(id)).unwrap();
            } catch (err) {
              dispatch(fetchWishlist());
            }
          } else {
            dispatch(optimisticAddToWishlist({ productId: id, productSnapshot: product }));
            try {
              await dispatch(addToWishlist(id)).unwrap();
            } catch (err) {
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
            src={product.image}
            alt={product.name}
            className="card-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
            }}
          />
          {discountPercent > 0 && (
            <div className="discount-badge">{discountPercent}% OFF</div>
          )}
        </div>

        {/* Product Details */}
        <div className="sausage-title">
          <h3 className="card-title">{product.name}</h3>

          <p className="card-weight">
            {product.quantity?.value} {product.quantity?.unit || 'g'} / pack
          </p>

          {/* Rating */}
          <div className="rating">
            {renderStars(product.rating || 0)}
            <span>({product.reviewCount || 0})</span>
          </div>

          {/* Price + Cart */}
          <div className="card-bottom">
            <div className="price-section">
              <p className="card-price">{formatPrice(product.price)}</p>
              {product.originalPrice && (
                <p className="card-original-price">{formatPrice(product.originalPrice)}</p>
              )}
            </div>
              <div
  className="cart-wrapper"
  onClick={(e) => e.stopPropagation()}
  onMouseDown={(e) => e.stopPropagation()}
  onTouchStart={(e) => e.stopPropagation()}
>
  <AddToCartStepper product={product} />
</div>

            
          </div>
          
        </div>
      

      </div>
    </div>
   
  );
};

export default ProductCards;
