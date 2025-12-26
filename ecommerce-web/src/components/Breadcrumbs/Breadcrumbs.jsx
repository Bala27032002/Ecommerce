import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { IoChevronForward } from 'react-icons/io5';
import { IoArrowBack } from 'react-icons/io5';
import './Breadcrumbs.css';
import { MAINURL } from '../../../config/Api';

const Breadcrumbs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const searchParams = new URLSearchParams(location.search);

  const [mobileTitle, setMobileTitle] = React.useState('');

  // Generate breadcrumb items based on route
  const getBreadcrumbs = () => {
    const breadcrumbs = [
      { label: 'Home', path: '/home' }
    ];

    if (pathname === '/home') {
      return breadcrumbs;
    }

    if (pathname === '/category' || pathname === '/allproducts') {
      breadcrumbs.push({
        label: 'Categories',
        path: null
      });
      return breadcrumbs;
    }

    // Handle category products page with slug
    if (pathname.startsWith('/category-products/')) {
      const slug = pathname.split('/').pop();
      breadcrumbs.push({
        label: 'Categories',
        path: '/allproducts'
      });
      breadcrumbs.push({
        label: slug.charAt(0).toUpperCase() + slug.slice(1),
        path: null
      });
      return breadcrumbs;
    }

    if (pathname === '/product' || pathname === '/product-details') {
      const productName = searchParams.get('name');
      const categoryName = searchParams.get('category');
      
      if (categoryName) {
        breadcrumbs.push({
          label: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
          path: `/allproducts?name=${categoryName}`
        });
      }
      
      if (productName) {
        breadcrumbs.push({
          label: productName,
          path: null
        });
      } else {
        breadcrumbs.push({
          label: 'Product Details',
          path: null
        });
      }
      return breadcrumbs;
    }

    if (pathname === '/wishlist') {
      breadcrumbs.push({
        label: 'Wishlist',
        path: null
      });
      return breadcrumbs;
    }

    if (pathname === '/cart') {
      breadcrumbs.push({
        label: 'Cart',
        path: null
      });
      return breadcrumbs;
    }

    if (pathname === '/order-information') {
      breadcrumbs.push({
        label: 'Cart',
        path: '/cart'
      });
      breadcrumbs.push({
        label: 'Order Information',
        path: null
      });
      return breadcrumbs;
    }

    if (pathname === '/hotdeals') {
      breadcrumbs.push({
        label: 'Hotdeals',
        path: null
      });
      return breadcrumbs;
    }

    if (pathname === '/contact-us') {
      breadcrumbs.push({
        label: 'Contact Us',
        path: null
      });
      return breadcrumbs;
    }

    return breadcrumbs;
  };

  React.useEffect(() => {
    let cancelled = false;
    const setTitle = (title) => {
      if (!cancelled) setMobileTitle(title);
    };

    const fallbackFromPath = () => {
      if (pathname.startsWith('/category-products/')) {
        const slug = pathname.split('/').pop();
        return slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'Category';
      }
      if (pathname === '/product-details' || pathname === '/product') {
        return 'Product Details';
      }
      if (pathname === '/wishlist') return 'Wishlist';
      if (pathname === '/cart') return 'Cart';
      if (pathname === '/order-information') return 'Order Information';
      if (pathname === '/contact-us') return 'Contact Us';
      if (pathname === '/allproducts' || pathname === '/category') return 'Categories';
      return '';
    };

    const run = async () => {
      if (pathname.startsWith('/category-products/')) {
        const slug = pathname.split('/').pop();
        if (!slug) {
          setTitle('Category');
          return;
        }

        try {
          const res = await fetch(`${MAINURL}categories/${slug}`);
          const data = await res.json();
          if (res.ok && data?.success && data?.category?.name) {
            setTitle(data.category.name);
            return;
          }
        } catch (e) {
          
        }

        setTitle(fallbackFromPath());
        return;
      }

      if (pathname === '/product-details' || pathname === '/product') {
        const productName = searchParams.get('name');
        if (productName) {
          setTitle(productName);
          return;
        }

        const productId = searchParams.get('id');
        if (!productId) {
          setTitle('Product Details');
          return;
        }

        try {
          const res = await fetch(`${MAINURL}products/${productId}`);
          const data = await res.json();
          const name = data?.product?.name || data?.name;
          if (res.ok && name) {
            setTitle(name);
            return;
          }
        } catch (e) {
          
        }

        setTitle('Product Details');
        return;
      }

      const breadcrumbs = getBreadcrumbs();
      const last = breadcrumbs[breadcrumbs.length - 1];
      setTitle(last?.label || fallbackFromPath());
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [pathname, location.search]);

  const breadcrumbs = getBreadcrumbs();

  // Don't show breadcrumbs on login page or home page
  if (pathname === '/' || pathname === '/home') {
    return null;
  }

  return (
    <div className="breadcrumbs-container">
      <div className="breadcrumbs-wrapper">
        {/* Mobile Back Button */}
        <button 
          className="mobile-back-button"
          onClick={() => navigate(-1)}
          title="Go Back"
          aria-label="Go back to previous page"
        >
          <IoArrowBack className="back-icon" />
        </button>

        <div className="breadcrumbs-mobile-title">{mobileTitle}</div>

        {/* Desktop Breadcrumbs */}
        <div className="breadcrumbs-desktop">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="breadcrumb-item">
              {crumb.path ? (
                <Link to={crumb.path} className="breadcrumb-link">
                  {crumb.label}
                </Link>
              ) : (
                <span className="breadcrumb-text">{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <IoChevronForward className="breadcrumb-separator" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Breadcrumbs;
