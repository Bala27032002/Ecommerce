import { useEffect, useState, useRef } from 'react'
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './Nav.css'
import logo from '../../assets/Home-icons/Logo.svg'
import cart from '../../assets/Home-icons/cart.svg';
import photo from '../../assets/Home-icons/photo.svg';
import home from '../../assets/Home-icons/Home.svg';
import hotdeals from '../../assets/Home-icons/hotdeals.png';
import percent from '../../assets/Home-icons/percent.svg';
import newproducts from '../../assets/Home-icons/newproducts.svg';
import { IoIosArrowDown } from 'react-icons/io';
import { FiMenu, FiX } from 'react-icons/fi';
import { MdHome, MdShoppingCart, MdFavoriteBorder, MdPerson } from 'react-icons/md';
import Home from '../../assets/Home-icons/Frame.svg'
import Phone from '../../assets/Icons/phone.svg'
import { CgProfile } from "react-icons/cg";
import wishlist from '../../assets/Home-icons/wishlist.svg';
import { useLocation, useNavigate } from 'react-router-dom';
import NotificationCenter from '../NotificationCenter/NotificationCenter';
import { RiLogoutBoxRLine } from "react-icons/ri";
import { CiDeliveryTruck } from 'react-icons/ci';
import mic from '../../assets/Navbar/mic.png';
import { logout as logoutAction } from '../../store/slices/authSlice';
import { resetCart } from '../../store/slices/cartSlice';
import { resetWishlist } from '../../store/slices/wishlistSlice';
import { MAINURL } from '../../config/Api';

const Nav = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate()

    const [open, setOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('home')
    const [mobileSearchInput, setMobileSearchInput] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [showSearchDropdown, setShowSearchDropdown] = useState(false)
    const [searchLoading, setSearchLoading] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [voiceStatus, setVoiceStatus] = useState('idle')
    const dropdownRef = useRef(null)
    const searchTimeoutRef = useRef(null)
    const searchContainerRef = useRef(null)
    const recognitionRef = useRef(null)
    const mobileSearchInputRef = useRef(null)
    const location=useLocation()
    const pathname=location.pathname;
    const wishlistItems = useSelector((state) => state.wishlist.items);
    const wishlistCount = wishlistItems?.length || 0;
    const cartItems = useSelector((state) => state.cart.items);
    const cartCount = cartItems?.length || 0;
    const hideSearchOnRoutes=['/orders']

    const handleLogout = () => {
        dispatch(resetCart());
        dispatch(resetWishlist());
        dispatch(logoutAction());
        navigate("/");
    }

    const user = JSON.parse(localStorage.getItem("user"));
    console.log("User in Home:", user);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/ ");
        }
    }, []);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSearchDropdown(false);
            }
        };

        if (open || showSearchDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open, showSearchDropdown]);

    const handleMenuItemClick = (fn) => {
        setMobileMenuOpen(false);
        if (typeof fn === 'function') fn();
    };

    const handleSearch = (value) => {
        setMobileSearchInput(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (value.trim() === '') {
            setSearchResults([]);
            setShowSearchDropdown(false);
            return;
        }

        setSearchLoading(true);
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await fetch(`${MAINURL}products?name=${encodeURIComponent(value)}&limit=8`);
                const data = await response.json();
                setSearchResults(data.products || []);
                setShowSearchDropdown(true);
            } catch (error) {
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 300);
    };

    const handleVoiceTranscript = async (transcript) => {
        const query = String(transcript || '').trim();
        if (!query) {
            setVoiceStatus('no_results');
            setTimeout(() => {
                setIsListening(false);
                setVoiceStatus('idle');
            }, 1000);
            return;
        }

        setMobileSearchInput(query);
        setVoiceStatus('searching');

        try {
            const response = await fetch(`${MAINURL}products?name=${encodeURIComponent(query)}&limit=8`);
            const data = await response.json();
            const products = data.products || [];
            if (products.length > 0) {
                handleSearchResultClick(products[0]);
                setVoiceStatus('idle');
                setIsListening(false);
                return;
            }
            setSearchResults([]);
            setShowSearchDropdown(false);
            setVoiceStatus('no_results');
            setTimeout(() => {
                setIsListening(false);
                setVoiceStatus('idle');
            }, 1200);
        } catch (e) {
            setSearchResults([]);
            setShowSearchDropdown(false);
            setVoiceStatus('no_results');
            setTimeout(() => {
                setIsListening(false);
                setVoiceStatus('idle');
            }, 1200);
        }
    };

    const handleMicClick = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        const stopListening = () => {
            try {
                recognitionRef.current?.stop?.();
            } catch (e) {}
            setIsListening(false);
            setVoiceStatus('idle');
        };

        if (!SpeechRecognition) {
            if (mobileSearchInputRef.current) {
                mobileSearchInputRef.current.focus();
            }
            return;
        }

        if (isListening) {
            stopListening();
            return;
        }

        const recognition = recognitionRef.current || new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.lang = navigator.language || 'en-US';

        recognition.onresult = (event) => {
            const transcript = event?.results?.[0]?.[0]?.transcript || '';
            handleVoiceTranscript(transcript);
        };

        recognition.onerror = () => {
            setVoiceStatus('no_results');
            setTimeout(() => {
                setIsListening(false);
                setVoiceStatus('idle');
            }, 1200);
        };

        recognition.onend = () => {
            // overlay will close after search completes (or after timeout on no-results)
        };

        setVoiceStatus('listening');
        setIsListening(true);
        try {
            recognition.start();
        } catch (e) {
            setIsListening(false);
            setVoiceStatus('idle');
        }
    };

    const stopVoiceSearch = () => {
        try {
            recognitionRef.current?.stop?.();
        } catch (e) {}
        setIsListening(false);
        setVoiceStatus('idle');
    };

    const handleSearchSubmit = () => {
        if (mobileSearchInput.trim()) {
            navigate(`/category?search=${encodeURIComponent(mobileSearchInput)}`);
            setMobileSearchInput('');
            setSearchResults([]);
            setShowSearchDropdown(false);
        }
    };

    const handleSearchResultClick = (product) => {
        const productId = product?._id ?? product?.id ?? product?.productId;
        const productName = product?.name ?? product?.title ?? '';
        const categoryName =
            product?.category?.name ??
            product?.category?.title ??
            product?.category?.slug ??
            product?.categoryName ??
            (typeof product?.category === 'string' ? product.category : '') ??
            '';

        if (!productId) return;

        navigate(
            `/product-details?id=${encodeURIComponent(String(productId))}&name=${encodeURIComponent(String(productName))}&category=${encodeURIComponent(String(categoryName))}`
        );
        setMobileSearchInput('');
        setSearchResults([]);
        setShowSearchDropdown(false);
    };

    const handleNavigation = (path, tab) => {
        navigate(path);
        setActiveTab(tab);
        setMobileMenuOpen(false);
    }
const shouldHideSearch =
  hideSearchOnRoutes.includes(pathname) ||
  pathname.startsWith('/orders');


    return (
        <>
            {isListening && (
                <div className="voice-overlay" onClick={stopVoiceSearch} role="dialog" aria-modal="true">
                    <div className="voice-overlay-content" onClick={(e) => e.stopPropagation()}>
                        <div className="voice-mic-circle">
                            <img src={mic} alt="mic" className="voice-mic-icon" />
                        </div>
                        <div className="voice-listening-text">
                            {voiceStatus === 'searching' ? 'Searching...' : voiceStatus === 'no_results' ? 'No results found' : 'Listening...'}
                        </div>
                       
                    </div>
                </div>
            )}
            {/* Desktop Navbar */}
            <div className='navbar-icons'>
                {/* Logo - Desktop Only */}
                <div onClick={() => navigate('/home')} className='navbar-logo'>
                    <img src={logo} alt="logo" />
                </div>

                {/* Mobile Menu Toggle - Mobile Only */}
                <div className='mobile-menu-toggle' onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </div>

                <div className='navbar-coins'>

    <p 
        className={`cart-containers ${pathname === '/home' ? 'active' : ''}`}
        onClick={() => navigate('/home')}
    >
        <span className='cart'><img src={Home} alt='fff'/></span>
        Home
    </p>

    {/* <p 
        className={`cart-containers ${pathname === '/hotdeals' ? 'active' : ''}`}
        onClick={() => navigate('/hotdeals')}
    >
        <span className='cart'><img src={hotdeals} alt='fff'/></span>
        Hot Deals
    </p> */}

    {/* <p 
        className={`cart-containers ${pathname === '/category' ? 'active' : ''}`}
        onClick={() => navigate('/category')}
    >
        <span className='cart'><img src={percent} /></span>
        Categories
    </p> */}

    <p
        className={`cart-containers ${pathname === '/contact-us' ? 'active' : ''}`}
        onClick={() => navigate('/contact-us')}
    >
        <span className='cart'><img src={Phone} alt='fff'/></span>
        Contact
    </p>

</div>


                <div className='navbar-icons-2'>
                     <NotificationCenter />
                    <p className='cart-containers' onClick={() => navigate('/wishlist')}>
                      <span className='wishlist'>
                        {wishlist ? <img src={wishlist} alt='wishlist-icon'/> : <span>❤️</span>}
                        {wishlistCount > 0 && (
                          <span className='count-badge'>{wishlistCount}</span>
                        )}
                      </span>
                      Wishlist
                    </p>

                    <p className='cart-containers' onClick={() => navigate('/cart')}>
                        <span className='cart'>
                          {cart ? <img src={cart} alt='shopping-cart-icon'/> : <span>🛒</span>}
                          {cartCount > 0 && (
                            <span className='count-badge'>{cartCount}</span>
                          )}
                        </span>
                        My cart 
                    </p>

                    <p className='cart-containers' onClick={() => setOpen(!open)}>
                        <span className='cart'>{photo ? <img src={photo} alt='user-profile-icon'/> : <span>👤</span>}</span>
                        {user?.fullName || 'User'} <IoIosArrowDown className="down-icon" />
                    </p>
                    <div ref={dropdownRef}>
                      {open && (
            <div className="dropdown-menu">
                <div style={{display:'flex',alignItems:'center',gap:'0.3rem'}}>
                <CgProfile style={{width:"1rem", height:"1rem"}}/>
              <p className="dropdown-profile" onClick={() => {
                navigate('/profile');
                setOpen(false);
              }}>Profile</p>
              </div>
              <div className="dropdown-divider"></div>
              <div style={{display:'flex',alignItems:'center',gap:'0.3rem'}}>
              <RiLogoutBoxRLine style={{width:"1rem", height:"1rem"}}/>
              <p className="dropdown-logout" onClick={handleLogout}>Logout</p>
              
              </div>
                                                <p className='cart-containers' onClick={() => navigate('/delivery-login')}><span className='cart'>🚚</span>Delivery</p>

            </div>
                      )}
                    </div>
                </div>
                {!shouldHideSearch && (
                         <div className='mobile-search-bar-container' ref={searchContainerRef}>
                <div className='mobile-search-wrapper' >
                    <svg className='search-icon-svg' width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                        type="text"
                        className='mobile-search-input'
                        placeholder='Search fruits, veggies & more...'
                        value={mobileSearchInput}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => mobileSearchInput && setShowSearchDropdown(true)}
                        ref={mobileSearchInputRef}
                    />
                    <button className='mic-button' type="button" onClick={handleMicClick} data-listening={isListening ? 'true' : 'false'}>
                        <img src={mic} alt='d'/>
                    </button>
                </div>
                {showSearchDropdown && (
                    <div className='mobile-search-dropdown'>
                        {searchLoading ? (
                            <div className='search-dropdown-empty'>Searching...</div>
                        ) : (searchResults || []).length > 0 ? (
                            (searchResults || []).map((p) => (
                                <div
                                    key={p?._id ?? p?.id ?? p?.productId}
                                    className='search-dropdown-item'
                                    onClick={() => handleSearchResultClick(p)}
                                >
                                    <img
                                        className='search-dropdown-img'
                                        src={p?.image}
                                        alt={p?.name || 'product'}
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/40x40?text=Img';
                                        }}
                                    />
                                    <div className='search-dropdown-name'>{p?.name ?? p?.title}</div>
                                </div>
                            ))
                        ) : (
                            <div className='search-dropdown-empty'>No products found</div>
                        )}
                    </div>
                )}
            </div>)}

                {/* Mobile Notification Center - Right Corner */}
                <div className='mobile-notification-corner'>
                    <NotificationCenter />
                </div>
            </div>

            {/* Mobile Search Bar */}
            {/* <div className='mobile-search-bar-container'>
                <div className='mobile-search-wrapper'>
                    <svg className='search-icon-svg' width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                        type="text"
                        className='mobile-search-input'
                        placeholder='Search fruits, veggies & more...'
                        value={mobileSearchInput}
                        onChange={(e) => setMobileSearchInput(e.target.value)}
                    />
                    <button className='mic-button' type="button">
                        <img src={mic} alt='d'/>
                    </button>
                </div>
            </div> */}

            {/* Mobile Menu Drawer */}
            {mobileMenuOpen && (
                <div className='mobile-menu-drawer'>
                    <div className='mobile-menu-content'>
                        <p className='mobile-menu-item' onClick={() => handleNavigation('/home', 'home')}>
                            <span className='mobile-menu-icon'><img src={home} alt="home" /></span>
                            Home
                        </p>
                        {/* <p className='mobile-menu-item' onClick={() => handleNavigation('/hotdeals', 'hotdeals')}>
                            <span className='mobile-menu-icon'><img src={hotdeals} alt="hotdeals" /></span>
                            Hot Deals
                        </p> */}
                        <p className='mobile-menu-item' onClick={() => handleNavigation('/contact-us', 'contact')}>
                            <span className='mobile-menu-icon'><img src={Phone} alt="contact" /></span>
                            Contact
                        </p>
                   
                        <p className='mobile-menu-item' onClick={() => handleNavigation('/wishlist', 'wishlist')}>
                            <span className='mobile-menu-icon'>
                              <img src={wishlist} alt="wishlist" />
                              {wishlistCount > 0 && (
                                <span className='count-badge'>{wishlistCount}</span>
                              )}
                            </span>
                            Wishlist
                        </p>
                        <p className='mobile-menu-item' onClick={() => handleNavigation('/cart', 'cart')}>
                            <span className='mobile-menu-icon'>
                              <img src={cart} alt="cart" />
                              {cartCount > 0 && (
                                <span className='count-badge'>{cartCount}</span>
                              )}
                            </span>
                            My Cart
                        </p>
                               <p className="mobile-menu-item" onClick={() => handleMenuItemClick(() => navigate('/delivery-login'))}>
                                        <span className="mobile-menu-icon"><CiDeliveryTruck size={24} /></span>
                                       Delivery Boy
                                      </p>
                        {/* <div className='mobile-menu-divider'></div> */}
                        
                        <p className='mobile-menu-user'>
                            <span className='mobile-menu-icon'><img src={photo} alt="user" /></span>
                            {user?.fullName || 'User'}
                        </p>
                        <p className='mobile-menu-logout' onClick={handleLogout}>Logout</p>
                    </div>
                </div>
            )}

            {/* Mobile Bottom Navigation */}
            <div className='mobile-bottom-nav'>
                <div 
                    className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}
                    onClick={() => handleNavigation('/home', 'home')}
                >
                    <MdHome size={24} />
                    <span>Home</span>
                </div>
                <div 
                    className={`bottom-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => handleNavigation('/orders', 'orders')}
                >
                    <MdShoppingCart size={24} />
                    <span>Orders</span>
                </div>
                <div 
                    className={`bottom-nav-item ${activeTab === 'earnings' ? 'active' : ''}`}
                    onClick={() => handleNavigation('/earnings', 'earnings')}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v6l4 2"></path>
                    </svg>
                    <span>Earnings</span>
                </div>
                <div 
                    className={`bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => handleNavigation('/profile', 'profile')}
                >
                    <MdPerson size={24} />
                    <span>Profile</span>
                </div>
            </div>
        </>
    )
}

export default Nav