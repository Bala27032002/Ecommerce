import React, { useState, useEffect } from 'react'
import { IoIosArrowDown } from 'react-icons/io'
import './CategoryProducts.css'
import search from '../../assets/Home-icons/searchs.svg'
import Maincards from '../../components/MainCards.jsx/Maincards'
import { MAINURL } from '../../config/Api'
import { useParams } from 'react-router-dom'
import mic from "../../assets/Navbar/mic.png";
import greensearch from "../../assets/Icons/Green_search.svg";

const CategoryProducts = () => {
  const { slug } = useParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryName, setCategoryName] = useState('')

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!slug) {
        setLoading(false)
        return
      }

      try {
        console.log('Fetching products for category slug:', slug)
        
        // Try different possible endpoints to find the correct one
        let products = []
        
        // Endpoint 1: /products/category/{slug}
        try {
          const response = await fetch(`${MAINURL}products/category/${slug}`)
          if (response.ok) {
            const data = await response.json()
            products = data.products || data.data || data || []
            console.log('Success with endpoint 1 (slug):', products)
          }
        } catch (e) {
          console.log('Endpoint 1 (slug) failed')
        }
        
        // Endpoint 2: /products?category={slug}
        if (products.length === 0) {
          try {
            const response = await fetch(`${MAINURL}products?category=${slug}`)
            if (response.ok) {
              const data = await response.json()
              products = data.products || data.data || data || []
              console.log('Success with endpoint 2 (slug):', products)
            }
          } catch (e) {
            console.log('Endpoint 2 (slug) failed')
          }
        }
        
        // Endpoint 3: /category/{slug}/products
        if (products.length === 0) {
          try {
            const response = await fetch(`${MAINURL}category/${slug}/products`)
            if (response.ok) {
              const data = await response.json()
              products = data.products || data.data || data || []
              console.log('Success with endpoint 3 (slug):', products)
            }
          } catch (e) {
            console.log('Endpoint 3 (slug) failed')
          }
        }
        
        // Endpoint 4: Try getting all products and filter by category slug
        if (products.length === 0) {
          try {
            const response = await fetch(`${MAINURL}products`)
            if (response.ok) {
              const data = await response.json()
              const allProducts = data.products || data.data || data || []
              products = allProducts.filter(product => {
                const productSlug = product.category?.slug || 
                                  (product.category?.name && product.category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
                return productSlug === slug
              })
              console.log('Success with filtering all products (slug):', products)
            }
          } catch (e) {
            console.log('Filtering all products (slug) failed')
          }
        }
        
        console.log('Final products:', products)
        setProducts(products)
      } catch (error) {
        console.error('Error fetching category products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryProducts()
  }, [slug])

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="category-products-page">

      {/* Header */}
      <div className="category-products-header">
        {/* <h1>{slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Category'}</h1> */}

        <div className="search-container">
                       <div className="mobile-search-orders">
                           <img src={greensearch} alt="search" />
                           <input
                               type="text"
                               className='mobile-search-orders-input'
                               placeholder='Search Products'
                               value={searchTerm}
                               onChange={(e) => setSearchTerm(e.target.value)}
                           />
                           <button className='mic-button-orders' type="button">
                               <img src={mic} alt='microphone' />
                           </button>
                       </div>
                      
                   </div>
      </div>

      {/* Mobile Price Filter Tabs */}
      <div className='mobile-price-filter-tabs'>
        <div className='price-filter-tab'>
          <span className="active">All price</span>
        </div>
        <div className='price-filter-tab'>
          <span>Under 100</span>
        </div>
        <div className='price-filter-tab'>
          <span>100-200</span>
        </div>
        <div className='price-filter-tab'>
          <span>200-500</span>
        </div>
        <div className='price-filter-tab'>
          <span>500+</span>
        </div>
      </div>

      <div className='category-listss'>

        {/* Sidebar Price Filter */}
        <div className='range-price'>

          <div className='price-ranges'>
            <h4>Price Range</h4>
            <IoIosArrowDown />
          </div>

          <div className='price-min'>
            <input className='min-prices' placeholder='Max Price' />
            <input className='min-prices' placeholder='Min Price' />
          </div>

          <div>
            <label className="radio-item">
              <input type="radio" name="category" checked />
              <span>All price</span>
            </label>

            <label className="radio-item">
              <input type="radio" name="category" />
              <span>Under 100</span>
            </label>

            <label className="radio-item">
              <input type="radio" name="category" />
              <span>100 to 200</span>
            </label>

            <label className="radio-item">
              <input type="radio" name="category" />
              <span>200 to 500</span>
            </label>

            <label className="radio-item">
              <input type="radio" name="category" />
              <span>500 & above</span>
            </label>
          </div>

        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {loading ? (
            <div className="loading-products">Loading products...</div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Maincards key={product._id} product={product} />
            ))
          ) : (
            <div className="no-products-found">
              {searchTerm ? 'No products found matching your search' : 'No products available in this category'}
            </div>
          )}
        </div>

      </div>

    

    </div>
  )
}

export default CategoryProducts
