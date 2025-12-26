import React from 'react';
import ProductCards from '../ProductCards.jsx/ProductCards';
import './RelatedProducts.css';

const RelatedProducts = ({ products, title = "Related Products", loading }) => {
  if (loading) {
    return (
      <div className="related-products-section">
        <h2 className="related-products-title">{title}</h2>
        <div className="related-products-loading">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="related-product-skeleton"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="related-products-section">
      <h2 className="related-products-title" style={{textAlign:'start'}}>{title}</h2>
      <div className="related-products-container">
        {products.slice(0, 8).map((product) => (
          <ProductCards key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
