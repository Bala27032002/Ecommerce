import React, { useState, useEffect, useRef } from 'react';
import './Home.css';
import HomeMobileBanner from '../../assets/Home-icons/Banner-dis.svg';
import BigSale from '../../assets/Home-icons/BigSale.svg';
import Girl_img from '../../assets/Home-icons/Girl_img.svg'
import bathitem from '../../assets/Home-icons/bathitem.svg'
import ProductCards from '../../components/ProductCards.jsx/ProductCards';
import { MAINURL } from '../../config/Api';
import BigDeal from './BigDeal';
import { useNavigate } from 'react-router-dom';
import BigSaleBanner from './BigSaleBanner';
import ImageWave from './ImageWave';
import DealAnimation from './DealAnimation';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${MAINURL}categories`);
        const data = await response.json();
        const categoryData = data.categories || [];
        setCategories(categoryData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    // Fetch products for deals - show all available products
    const fetchDeals = async () => {
      try {
        const response = await fetch(`${MAINURL}products`);
        const data = await response.json();
        setDeals(data.products || []);
      } catch (error) {
        console.error('Error fetching deals:', error);
        setDeals([]);
      }
    };

    // Fetch featured products
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch(`${MAINURL}products/featured/all`);
        const data = await response.json();
        setFeaturedProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setFeaturedProducts([]);
      }
    };

    fetchCategories();
    fetchDeals();
    fetchFeaturedProducts();
  }, []);

  const handleCategoryClick = (category) => {
    // Navigate to category page with clean URL using slug
    const slug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    navigate(`/category-products/${slug}`);
  };

  const handleViewMoreCategories = () => {
    navigate('/brands?tab=categories');
  };

  const handleproductmore =()=>
{
  navigate("/allproducts");
}
  return (
    <div className="home-container">


      {/* Brands & Categories Section */}
      <section className="brands-section">
        <div className="brands-categories-wrapper">
          {/* All Brands Box - Left Side */}
          <div className="all-brands-box">
        
            <p className="all-brands-text">All Brands</p>
          </div>

          {/* Categories Carousel - Right Side */}
          <div className="categories-carousel-container">
            <div className="categories-carousel" ref={scrollContainerRef}>
              {loading ? (
                <div className="home-loading-skeleton">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="home-category-skeleton"></div>
                  ))}
                </div>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <div
                    key={category._id}
                    className="category-card"
                    onClick={() => handleCategoryClick(category)}
                    title={category.name}
                  >
                    <div className="category-image-wrapper">
                      {category.image && category.image !== "" ? (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="category-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<span className="category-icon">📦</span>';
                          }}
                        />
                      ) : (
                        <span className="category-icon">📦</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-categories">No categories available</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section>
        <img src={HomeMobileBanner} alt='HomeMobileBanner' style={{width:'100%'}}/>
      </section>

      {/* Best Deal For You Section */}
      <section className="best-deal-section">
        <div className="best-deal-header">
         <DealAnimation />
        </div>

        {/* Deal Products Carousel */}
        <div className="deal-products-container">
          {deals.length > 0 ? (
            deals.map((product) => (
              <div 
                key={product._id} 
                className="deal-product-card"
                onClick={() => navigate(`/product-details?id=${product._id}&name=${encodeURIComponent(product.name)}&category=${encodeURIComponent(product.category?.name || '')}`)}
              >
                <div className="deal-product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <div className="product-placeholder">📦</div>
                  )}
                </div>
                <div className="deal-product-info">
                  <div className="deal-badge">UPTO 5% OFF</div>
                  {/* <p className="deal-product-category">{product.category?.name || 'Category'}</p> */}
                </div>
              </div>
            ))
          ) : (
            <div className="no-deals">No deals available</div>
          )}
        </div>
        <div className="best-deal-girl-wrapper">
          <img src={Girl_img} alt="Best deal" className="best-deal-girl-image" />
        </div>
      </section>

      {/* Top Categories Section */}
      <section className="top-categories-section">
        <div className="top-categories-header">
          <h2>Top Categories</h2>
          <span className="top-categories-view-more" onClick={handleViewMoreCategories} role="button" tabIndex={0}>
            View more &gt;
          </span>
        </div>

        <div className="top-categories-grid">
          {categories && categories.length > 0 ? (
            categories.slice(0, 6).map((category) => (
              <div
                key={category._id}
                className="top-category-card"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="top-category-image-wrapper">
                  {category.image ? (
                    <img src={category.image} alt={category.name} />
                  ) : (
                    <span className="category-icon">📦</span>
                  )}
                </div>
                <p className="top-category-name">{category.name}</p>
              </div>
            ))
          ) : (
            <div className="no-categories">No categories available</div>
          )}
        </div>
      </section>

      {/* Best Seller Section */}
      <section className="best-seller-section">
        <div className="best-seller-container">
          <div className="best-seller-header">
            <p className="best-seller-title">Best Seller</p>
            <span className="top-categories-view-more" onClick={handleproductmore} role="button" tabIndex={0}>
            View more &gt;
          </span>
          </div>
          
          <div className="best-seller-scroll-wrapper">
            <div className="best-seller-products">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <ProductCards key={product._id} product={product} />
                ))
              ) : (
                <div className="no-products">No featured products available</div>
              )}
            </div>
          </div>
        </div>
      </section>
      <section>
        <div style={{display:'flex',justifyContent:"center",background:'rgb(250 241 252 / 91%)'}}>
          {/* <img src={BigSale} alt='BigSale'/> */}
            <ImageWave />
        </div>
      </section>
      <section className="offer-section">
  {/* <div className="offer-grid">
    
    <div className="offer-card purple">
      <div className="offer-text">
        <h4>Body Lotion</h4>
        <p>UPTO <br /><span>7% OFF</span></p>
      </div>
      <img src={BigSale} alt="product" className="offer-img" />
    </div>

    <div className="offer-card green">
      <div className="offer-text">
        <h4>Body Lotion</h4>
        <p>UPTO <br /><span>7% OFF</span></p>
      </div>
      <img src={BigSale} alt="product" className="offer-img" />
    </div>

    <div className="offer-card green">
      <div className="offer-text">
        <h4>Body Lotion</h4>
        <p>UPTO <br /><span>7% OFF</span></p>
      </div>
      <img src={BigSale} alt="product" className="offer-img" />
    </div>

    <div className="offer-card purple">
      <div className="offer-text">
        <h4>Body Lotion</h4>
        <p>UPTO <br /><span>7% OFF</span></p>
      </div>
      <img src={BigSale} alt="product" className="offer-img" />
    </div>

  </div> */}
  <BigDeal />
  {/* <BigSaleBanner /> */}

</section>

 
    </div>
  );
};

export default Home;