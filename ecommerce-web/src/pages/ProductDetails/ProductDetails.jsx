import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, fetchCart, optimisticAddToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist, fetchWishlist, optimisticAddToWishlist, optimisticRemoveFromWishlist } from '../../store/slices/wishlistSlice';
import { fetchRelatedProducts, fetchCategoryProducts } from '../../store/slices/productSlice';
import { FaStar, FaEllipsisV } from 'react-icons/fa';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { toast } from 'react-toastify';
import axios from 'axios';
import Rating from '@mui/material/Rating';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { MAINURL } from '../../../config/Api';
import './ProductDetails.css';
import heart from "../../assets/Icons/heart.png"
import share from "../../assets/Icons/share.png"
import tdot from "../../assets/Icons/tdot.png"
import payment from '../../assets/productdetails/payment.svg'
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import RelatedProducts from '../../components/RelatedProducts/RelatedProducts';
import cart_icon from '../../assets/Icons/bx_cart-add.svg'
import { Images } from 'lucide-react';
const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token } = useSelector(state => state.auth);

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState('1kg');
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const weightOptions = ["250g", "500g", "1kg", "2kg"];

  const [weightIndex, setWeightIndex] = useState(0);
  const { featured, popular, categories, relatedProducts, categoryProducts, loading: productsLoading, error: productsError } = useSelector(state => state.products);


  const { items: wishlistItems } = useSelector(state => state.wishlist);
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get('id');
  const productName = searchParams.get('name');
  const categoryName = searchParams.get('category');
  useEffect(() => {
    setWeight(weightOptions[weightIndex]);
  }, [weightIndex]);
  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${MAINURL}products/${productId}`);
        setProduct(response.data.product || response.data);
        // console.log("response.data.product ",response.data.product )

        // Check if in wishlist
        const inWishlist = wishlistItems.some(item => item._id === productId);
        setIsInWishlist(inWishlist);

        // Record product view
        const viewToken = localStorage.getItem('token');
        if (viewToken && productId) {
          try {
            await axios.post(
              `${MAINURL}products/${productId}/view`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${viewToken}`,
                },
              }
            );
          } catch (viewError) {
            console.log('View recording failed (non-critical):', viewError.message);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [productId, wishlistItems]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;
      try {
        setReviewLoading(true);
        const res = await axios.get(`${MAINURL}products/${productId}/reviews`);
        setReviews(res.data.reviews || []);
        setAverageRating(Number(res.data.rating || 0));
        setReviewCount(Number(res.data.reviewCount || 0));
      } catch (e) {
        setReviews([]);
        setAverageRating(0);
        setReviewCount(0);
      } finally {
        setReviewLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  // Fetch related products when product is loaded
  useEffect(() => {
    if (product && product._id) {
      // Try to fetch related products using category slug
      dispatch(fetchRelatedProducts({ 
        productId: product._id, 
        categorySlug: product.category?.slug 
      }));
      
      // Also fetch category products as fallback
      if (product.category?.slug) {
        dispatch(fetchCategoryProducts(product.category.slug));
      }
    }
  }, [product, dispatch]);

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(quantity + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleWeightChange = (e) => {
    setWeight(e.target.value);
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      dispatch(optimisticAddToCart({ productId: product._id, quantity: quantity, productSnapshot: product }));
      await dispatch(addToCart({
        productId: product._id,
        quantity: quantity
      })).unwrap();
      toast.success('Added to cart successfully!');
      setQuantity(1);
    } catch (error) {
      dispatch(fetchCart());
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    try {
      if (isInWishlist) {
        dispatch(optimisticRemoveFromWishlist(product._id));
        await dispatch(removeFromWishlist(product._id)).unwrap();
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        dispatch(optimisticAddToWishlist({ productId: product._id, productSnapshot: product }));
        await dispatch(addToWishlist(product._id)).unwrap();
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      dispatch(fetchWishlist());
      toast.error('Failed to update wishlist');
    }
  };

  const handleShare = () => {
    const payload = {
      title: product?.name,
      text: product?.description,
      url: window.location.href,
    };

    if (window.ReactNativeWebView) {
      try {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'share',
          payload,
        }));
        return;
      } catch (e) {
        toast.error('Failed to open share');
        return;
      }
    }

    if (navigator.share) {
      navigator.share(payload);
    } else {
      toast.info('Share functionality not available');
    }
  };

  const handleSubmitReview = async () => {
    if (!productId) return;
    if (!token) {
      toast.info('Please login to add a review');
      return;
    }
    if (!userRating || userRating < 1 || userRating > 5) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await axios.post(
        `${MAINURL}products/${productId}/review`,
        { rating: userRating, comment: userComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedProduct = res.data.product;
      setProduct((prev) => {
        if (!prev) return updatedProduct;
        return {
          ...prev,
          ...updatedProduct,
          category: prev.category,
        };
      });
      setReviews(updatedProduct?.reviews || []);
      setAverageRating(Number(updatedProduct?.rating || 0));
      setReviewCount(Number(updatedProduct?.reviewCount || 0));
      setUserComment('');
      toast.success(res.data.message || 'Review submitted');

      try { dispatch(fetchCart()); } catch (e) {}
      try { dispatch(fetchWishlist()); } catch (e) {}
      setIsReviewModalOpen(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShopNow = () => {
    if (!product?._id) return;
    navigate('/order-information', {
      state: {
        items: [
          {
            _id: product._id,
            name: product.name,
            image: product.image,
            Images: product.images,
            price: product.price,
            quantity,
            weight,
          },
        ],
        source: 'product',
      },
    });
  };

  if (loading) {
    return (
      <div className="product-details-container">
        <div className="loading-skeleton">
          <div className="skeleton-image"></div>
          <div className="skeleton-content">
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
            <div className="skeleton-line"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-container">
        <div className="error-message">
          <p>Product not found</p>
          <button onClick={() => navigate('/home')}>Back to Home</button>
        </div>
      </div>
    );
  }



  const handleIncreaseWeight = () => {
    if (weightIndex < weightOptions.length - 1) {
      setWeightIndex(weightIndex + 1);
    }

  };

  const handleDecreaseWeight = () => {
    if (weightIndex > 0) {
      setWeightIndex(weightIndex - 1);
    }
  };

  const stockStatus = product.stock > 0 ? `${product.stock}+ in stock` : 'Out of stock';
  const isOutOfStock = product.stock <= 0;

  return (
    <div>
      <div className="product-details-container">
        <div className="product-details-wrapper">
         
<div className="product-image-container">
  <Swiper
    slidesPerView={1}
    spaceBetween={8}
    // onClick={(e) => e.stopPropagation()}
    // onTouchStart={(e) => e.stopPropagation()}
  >
    {[
      ...(product.image ? [product.image] : []),
      ...(Array.isArray(product.images) ? product.images : [])
    ].map((img, index) => (
      <SwiperSlide key={index}>
        <img
          src={img}
          alt={`${product.name}-${index}`}
          className="product-image"
         
        />
      </SwiperSlide>
    ))}
  </Swiper>
</div>



          {/* Product Details Section */}
          <div className="product-info-section">
            {/* Category and Actions Header */}
            <div className="product-header">
              <div className="product-header-left">
                <p className="product-category">
                  {product.category?.name || 'Category'}
                </p>
                <h1 className="product-name">{product.name}</h1>
              </div>
              <div className="product-image-actions">
                <button className="action-btn share-btn" onClick={handleShare} title="Share">
                  <img src={share} alt="Share" style={{ width: "21px" }} />
                </button>
                <button className={`action-btn wishlist-btn ${isInWishlist ? 'active' : ''}`}
                  onClick={handleWishlistToggle} title="Add to Wishlist">
                  {isInWishlist ? <AiFillHeart /> : <img src={heart} alt="Heart" style={{ width: "24px" }} />}
                </button>
                <button className="action-btn menu-btn" title="More options">
                  <img src={tdot} alt="More" style={{ width: "24px" }} />
                </button>
              </div>
            </div>
            {/* Price and Rating */}
            <div className="price-rating-section">
              <div className="price-container">
                <span className="product-price">
                  ₹{product.price?.toFixed(2) || '0.00'}
                </span>
                <span className="price-unit">/per kg</span>
              </div>
              <div className="rating-container">
                <button
                  type="button"
                  className="rating-stars-button"
                  onClick={() => setIsReviewModalOpen(true)}
                >
                  <Rating value={averageRating || 0} precision={0.1} readOnly size="small" />
                </button>
                <span className="rating-text">{(Number(averageRating || 0)).toFixed(1)}</span>
                <button
                  type="button"
                  className="rating-count-button"
                  onClick={() => setIsReviewsModalOpen(true)}
                >
                  ({reviewCount || 0})
                </button>
              </div>
            </div>

            {/* Product Description */}
            <div className="description-section">
              <p className="product-description">{product.description}</p>
              {product.description && product.description.length > 150 && (
                <button className="read-more-btn">Read more...</button>
              )}
            </div>

            {/* Quantity, Weight and Stock Status */}
            <div className="quantity-weight-section">
              <div className="quantity-container">
                <label>Quantity</label>
                <div className="quantity-selector">
                  <button
                    className="qty-btn"
                    onClick={() => handleQuantityChange('decrease')}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="qty-input"
                    min="1"
                  />
                  <button
                    className="qty-btn"
                    onClick={() => handleQuantityChange('increase')}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="weight-container">
                <label>Weight</label>

                <div className="weight-selector">
                  <button className="circle-btn" onClick={handleDecreaseWeight}>−</button>

                  <span className="weight-value">{weight}</span>

                  <button className="circle-btn plus" onClick={handleIncreaseWeight}>+</button>
                </div>
              </div>



            </div>
            <div className="stock-status">
              <div className={`stock-badge ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
                {isOutOfStock ? '❌ Out of stock' : `✓ ${stockStatus}`}
              </div>
            </div>
            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className="add-to-cart-btns"
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
              >
                <img style={{ position: 'relative', top: "0.3rem" }} src={cart_icon} /> {addingToCart ? 'Adding...' : `Add to Cart ₹${product.price?.toFixed(2) || '0.00'}`}
              </button>
              <button className="shop-now-btn" onClick={handleShopNow} disabled={isOutOfStock}>
                Shop Now
              </button>
            </div>



          </div>

        </div>
        <div >

        </div>


      </div>
      
      <Dialog open={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Your Rating</DialogTitle>
        <DialogContent>
          <div className="review-modal-content">
            <div className="review-form-row">
              <span className="review-form-label">Your Rating</span>
              <Rating
                value={userRating}
                onChange={(_, value) => setUserRating(value || 0)}
                precision={1}
                size="large"
              />
            </div>
            <textarea
              className="review-textarea"
              placeholder="Write your comment"
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              rows={4}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsReviewModalOpen(false)} disabled={submittingReview}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitReview} disabled={submittingReview}>
            {submittingReview ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isReviewsModalOpen} onClose={() => setIsReviewsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ratings & Reviews</DialogTitle>
        <DialogContent>
          <div className="reviews-modal-header">
            <Rating value={averageRating || 0} precision={0.1} readOnly size="small" />
            <span className="rating-text">{(Number(averageRating || 0)).toFixed(1)} ({reviewCount || 0})</span>
          </div>
          <div className="review-list">
            {reviewLoading ? (
              <div className="review-loading">Loading reviews...</div>
            ) : reviews && reviews.length > 0 ? (
              reviews
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((r, idx) => (
                  <div className="review-item" key={r._id || `${r.userId}-${idx}`}>
                    <div className="review-item-header">
                      <div className="review-user">
                        <span className="review-user-name">{r.userName || r?.userId?.fullName || 'User'}</span>
                        <span className="review-date">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                      <Rating value={Number(r.rating || 0)} readOnly size="small" />
                    </div>
                    <div className="review-comment">{r.comment}</div>
                  </div>
                ))
            ) : (
              <div className="review-empty">No reviews yet</div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsReviewsModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Related Products Section */}
      <RelatedProducts 
        products={relatedProducts.length > 0 ? relatedProducts : categoryProducts}
        title={relatedProducts.length > 0 ? "Related Products" : "More from this Category"}
        loading={productsLoading}
      />
      

    </div>
  );
};

export default ProductDetails;
