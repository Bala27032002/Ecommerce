import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './CategoryProduct.css';
import offer from '../../assets/Category/offer.svg'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import greensearch from '../../assets/Icons/Green_search.svg';
import mic from '../../assets/Navbar/mic.png';
import filter from '../../assets/Icons/filter.svg';
import { MAINURL } from '../../config/Api';
import AddToCartStepper from '../../components/AddToCartStepper/AddToCartStepper';
import { addToWishlist, removeFromWishlist, fetchWishlist, optimisticAddToWishlist, optimisticRemoveFromWishlist } from '../../store/slices/wishlistSlice';


const Categories = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategorySlug, setActiveCategorySlug] = useState('all');

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const gramList = useMemo(() => ['250g', '150g', '100g', '4x200g', '400g'], []);
  const [activeGramByProductId, setActiveGramByProductId] = useState({});

  const wishlistItems = useSelector((state) => state.wishlist.items);
  const wishlistHydrated = useSelector((state) => state.wishlist.hydrated);

  const abortRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!wishlistHydrated) {
      try { dispatch(fetchWishlist()); } catch (e) {}
    }
  }, [dispatch, wishlistHydrated]);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [categoriesRes, productsRes] = await Promise.all([
          fetch(`${MAINURL}categories`, { signal: controller.signal }),
          fetch(`${MAINURL}products`, { signal: controller.signal }),
        ]);

        const categoriesJson = await categoriesRes.json().catch(() => ({}));
        const productsJson = await productsRes.json().catch(() => ({}));

        setCategories(categoriesJson?.categories || []);
        setProducts(productsJson?.products || []);
      } catch (e) {
        if (e?.name === 'AbortError') return;
        setError(e?.message || 'Failed to load products');
        setCategories([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  const getCategorySlug = useCallback((category) => {
    return (
      category?.slug ||
      category?.name?.toLowerCase()?.replace(/[^a-z0-9]+/g, '-')?.replace(/(^-|-$)/g, '') ||
      ''
    );
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (products || []).filter((p) => {
      const name = (p?.name || '').toLowerCase();
      const matchSearch = !q || name.includes(q);
      if (!matchSearch) return false;
      if (activeCategorySlug === 'all') return true;
      const slug = p?.category?.slug || (p?.category?.name ? getCategorySlug(p.category) : '');
      return slug === activeCategorySlug;
    });
  }, [products, searchQuery, activeCategorySlug, getCategorySlug]);

  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSelectGram = useCallback((productId, gram) => {
    setActiveGramByProductId((prev) => ({ ...prev, [productId]: gram }));
  }, []);

  const handleProductClick = useCallback(
    (product) => {
      const productId = product?._id ?? product?.id;
      const productName = product?.name || '';
      const categoryName = product?.category?.name || '';
      if (!productId) return;
      navigate(`/product-details?id=${productId}&name=${encodeURIComponent(productName)}&category=${encodeURIComponent(categoryName)}`);
    },
    [navigate]
  );

  const handleWishlistToggle = useCallback(
    async (product) => {
      const id = product?._id ?? product?.id;
      if (!id) return;
      const isWishlisted = wishlistItems?.some((p) => (p?._id ?? p?.id) === id);
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
    },
    [dispatch, wishlistItems]
  );

  return (
    <>
      <div className="search-container">
        <div className="mobile-search-orders">
          <img src={greensearch} alt="search" />
          <input
            type="text"
            className="mobile-search-orders-input"
            placeholder="Search Products"
            value={searchQuery}
            onChange={handleSearch}
          />
          <button className="mic-button-orders" type="button">
            <img src={mic} alt="microphone" />
          </button>
        </div>
        <button className="filter-button-orders" type="button">
          <img src={filter} alt="filter" />
        </button>
      </div>

      <div className="filter-category">
        <Swiper spaceBetween={10} slidesPerView={4} freeMode={true}>
          <SwiperSlide className="filter-slide">
            <button
              type="button"
              className={`all ${activeCategorySlug === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategorySlug('all')}
            >
              All
            </button>
          </SwiperSlide>
          {categories.map((c) => {
            const slug = getCategorySlug(c);
            const id = c?._id ?? slug;
            return (
              <SwiperSlide key={id} className="filter-slide">
                <button
                  type="button"
                  className={`all ${activeCategorySlug === slug ? 'active' : ''}`}
                  onClick={() => setActiveCategorySlug(slug)}
                  title={c?.name}
                >
                  {c?.name}
                </button>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      <div className="whole-category">
        {loading ? (
          <div className="allproducts-state">Loading products...</div>
        ) : error ? (
          <div className="allproducts-state">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="allproducts-state">No products found</div>
        ) : (
          <div className="allproducts-list">
            {filteredProducts.map((product) => {
              const id = product?._id ?? product?.id;
              const activeGram = activeGramByProductId[id] || gramList[0];
              const isWishlisted = wishlistItems?.some((p) => (p?._id ?? p?.id) === id);
              return (
                <div key={id} className="category-product">
                 

                  <div className="product-row" onClick={() => handleProductClick(product)}>
                    <div className="product-shift">
                      <img
                        src={product?.image || ''}
                        alt={product?.name || 'Product'}
                        className="product-img"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/120x80?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="product-info">
                      <p className="product-name">{product?.name || 'Product'}</p>
                      <div>
                        <p className="product-mrp">MRP</p>
                        <p className="product-price">₹ {product?.price ?? ''}</p>
                      </div>
                    </div>
                  </div>

                  <div className="offers-gram">
                    {gramList.map((gram) => (
                      <button
                        key={gram}
                        type="button"
                        className={`grams ${activeGram === gram ? 'active' : ''}`}
                        onClick={() => handleSelectGram(id, gram)}
                      >
                        {gram}
                      </button>
                    ))}
                  </div>

                  <div className="cart-add">
                    <AddToCartStepper product={product} variant="button" className="add-cart" addLabel="Add to cart" />
                    <button
                      type="button"
                      className={`heart-cart ${isWishlisted ? 'active' : ''}`}
                      onClick={() => handleWishlistToggle(product)}
                      aria-label="wishlist"
                    >
                      <span className="heart-symbol">{isWishlisted ? '❤' : '♡'}</span>
                    </button>
                  </div>

                  <div className="apply-offer">
                    <div className="offer-apply">
                      <img src={offer} alt="offer" />
                      <p style={{ color: '#rgba(27, 27, 27, 0.6)', fontSize: '12px' }}>
                        Get additional 0.5% off per unit on order between 6 units and 299 units
                      </p>
                      <p className="apply">Apply</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Categories;
