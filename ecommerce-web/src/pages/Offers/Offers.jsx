import React, { useState, useEffect } from "react";
import greensearch from "../../assets/Icons/Green_search.svg";
import mic from "../../assets/Navbar/mic.png";
import offer_bg from "../../assets/Home-icons/offerc-bg.png";
import { productService } from "../../services/api";
import "./Offers.css";

function Offers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOffer, setSelectedOffer] = useState("10");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const offers = [
    { percent: "10", color: "#007021" },
    { percent: "20", color: "#84006C" },
    { percent: "30", color: "#170097" },
    { percent: "40", color: "#6C4600" },
  ];

  // Fetch products based on selected offer percentage
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { limit: 20, minDiscount: selectedOffer };

        if (searchQuery && searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        const response = await productService.getProducts(params);
        if (response.success) {
          setProducts(response.products);
        } else {
          setError("Failed to fetch products");
        }
      } catch (err) {
        setError("Error fetching products");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [selectedOffer, searchQuery]);

  // Handle offer filter click
  const handleOfferClick = (offerPercent) => {
    setSelectedOffer(offerPercent);
  };

  return (
    <>
      {/* Search */}
      {/* <div className="search-container">
        <div className="mobile-search-orders">
          <img src={greensearch} alt="search" />
          <input
            type="text"
            className="mobile-search-orders-input"
            placeholder="Search Products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="mic-button-orders">
            <img src={mic} alt="mic" />
          </button>
        </div>
      </div> */}

      {/* Offer Banner */}
      <div className="offer-wrapper">
        <img src={offer_bg} alt="offer" className="offer-bg-img" />

        <div className="offer-card-row">
          {offers.map((item, index) => (
            <div 
              className={`offer-glass-card ${selectedOffer === item.percent ? 'selected' : ''}`} 
              key={index}
              onClick={() => handleOfferClick(item.percent)}
              style={{ cursor: 'pointer' }}
            >
              <p style={{ color: item.color }} className="offer-percent">
                {item.percent}%
              </p>
              <span style={{ color: item.color }} className="offer-subtext">
                & above
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="offers-section">
      <div className="offers-section-header">
        <p className="offers-section-title">
          {`Products with ${selectedOffer}% & above offers`}
        </p>
        <p className="offer-more">View More &gt;</p>
      </div>
      <br/>
     
     {loading && (
       <div style={{ textAlign: 'center', padding: '20px' }}>Loading products...</div>
     )}
     
     {error && (
       <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</div>
     )}
     
     {!loading && !error && (
       <div className="parent-card">
         {products.length > 0 ? (
           products.map((product, i) => (
             <div className="offer-card" key={product._id || i}>
               <p className="offer-badge">
                 UPTO {product.offer?.isActive && product.offer?.discountType === "PERCENTAGE" ? product.offer?.discountValue : product.discount}% OFF
               </p>

               <div className="offer-image-wrap">
                 <img src={product.image} alt={product.name} />
               </div>

               <div className="offer-footer">
                 {product.category?.name || 'Product'}
               </div>
             </div>
           ))
         ) : (
           <div style={{ textAlign: 'center', padding: '20px' }}>No products found</div>
         )}
       </div>
     )}

      </div>
    </>
  );
}

export default Offers;
