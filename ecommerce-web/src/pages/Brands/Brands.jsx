import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Brands.css";
import boost from "../../assets/Product/Boost.svg";
import HealthDrinkBanner from "./HealthDrinkBanner";
import { MAINURL } from "../../config/Api";


const Brands = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("brands");
  const [openCategoryId, setOpenCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);

  const [categoryProductsBySlug, setCategoryProductsBySlug] = useState({});
  const [categoryProductsLoadingBySlug, setCategoryProductsLoadingBySlug] = useState({});
  const [categoryProductsErrorBySlug, setCategoryProductsErrorBySlug] = useState({});

  const activeCategoryAbortRef = useRef(null);

  const navigate = useNavigate();

  const brandsData = [
    { id: 1, name: "Boost", image: boost },
    { id: 2, name: "Boost", image: boost },
    { id: 3, name: "Boost", image: boost },
    { id: 4, name: "Boost", image: boost },
  ];

  const resolvedInitialTab = useMemo(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    return tab === "categories" ? "categories" : "brands";
  }, [location.search]);

  useEffect(() => {
    setActiveTab(resolvedInitialTab);
  }, [resolvedInitialTab]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);
        const response = await fetch(`${MAINURL}categories`, { signal: controller.signal });
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        if (error?.name === "AbortError") return;
        setCategories([]);
        setCategoriesError(error?.message || "Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
    return () => controller.abort();
  }, []);

  const setTab = useCallback(
    (tab) => {
      setActiveTab(tab);
      navigate(`/brands?tab=${tab}`, { replace: true });
    },
    [navigate]
  );

  const getCategorySlug = useCallback((category) => {
    return (
      category?.slug ||
      category?.name?.toLowerCase()?.replace(/[^a-z0-9]+/g, "-")?.replace(/(^-|-$)/g, "") ||
      ""
    );
  }, []);

  const fetchProductsForCategorySlug = useCallback(async (slug, signal) => {
    if (!slug) return [];

    const endpoints = [
      `${MAINURL}products/category/${slug}`,
      `${MAINURL}products?category=${encodeURIComponent(slug)}`,
      `${MAINURL}category/${slug}/products`,
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url, { signal });
        if (!res.ok) continue;
        const data = await res.json();
        const products = data?.products || data?.data || data || [];
        if (Array.isArray(products)) return products;
      } catch (e) {
        if (e?.name === "AbortError") throw e;
      }
    }

    return [];
  }, []);

  const handleCategoryToggle = useCallback(
    async (category) => {
      const categoryId = category?._id ?? category?.id;
      const nextOpenId = openCategoryId === categoryId ? null : categoryId;
      setOpenCategoryId(nextOpenId);

      if (!nextOpenId) return;

      const slug = getCategorySlug(category);
      if (!slug) return;

      if (categoryProductsBySlug[slug]) return;

      if (activeCategoryAbortRef.current) {
        activeCategoryAbortRef.current.abort();
      }

      const controller = new AbortController();
      activeCategoryAbortRef.current = controller;

      setCategoryProductsLoadingBySlug((prev) => ({ ...prev, [slug]: true }));
      setCategoryProductsErrorBySlug((prev) => ({ ...prev, [slug]: null }));

      try {
        const products = await fetchProductsForCategorySlug(slug, controller.signal);
        setCategoryProductsBySlug((prev) => ({ ...prev, [slug]: products }));
      } catch (e) {
        if (e?.name === "AbortError") return;
        setCategoryProductsErrorBySlug((prev) => ({
          ...prev,
          [slug]: e?.message || "Failed to load products",
        }));
      } finally {
        setCategoryProductsLoadingBySlug((prev) => ({ ...prev, [slug]: false }));
      }
    },
    [
      categoryProductsBySlug,
      fetchProductsForCategorySlug,
      getCategorySlug,
      openCategoryId,
      setOpenCategoryId,
    ]
  );

  const handleClick = () => {
    navigate("/allproducts");
  };

  const handleProductClick = useCallback(
    (product) => {
      const productId = product?._id ?? product?.id;
      const productName = product?.name || "";
      const categoryName = product?.category?.name || "";
      if (!productId) return;
      navigate(
        `/product-details?id=${productId}&name=${encodeURIComponent(productName)}&category=${encodeURIComponent(categoryName)}`
      );
    },
    [navigate]
  );

  return (
    <div>
      <div className="brands-categories">
        <p
          className={`tab-item ${activeTab === "brands" ? "active" : ""}`}
          onClick={() => setTab("brands")}
        >
          Brands
        </p>

        <p
          className={`tab-item ${activeTab === "categories" ? "active" : ""}`}
          onClick={() => setTab("categories")}
        >
          Categories
        </p>
      </div>

      <div>
        <div className="offers-main">
          <div className="grid-offers">
            {activeTab === "brands" &&
              brandsData.map((item) => (
                <div
                  key={item.id}
                  className="offer-card brand-card"
                  onClick={handleClick}
                >
                  
                 <div className="offer-logo-box">
    <img
      src={boost}
      alt="Boost"
      className="offer-logo"
    />
  </div>
                  </div>
              ))}
          </div>
        </div>
        <div className="categories-wrapper">
          {activeTab === "categories" && (
            <>
              {categoriesLoading ? (
                <div className="no-categories">Loading categories...</div>
              ) : categoriesError ? (
                <div className="no-categories">{categoriesError}</div>
              ) : categories.length > 0 ? (
                categories.map((category) => {
                  const categoryId = category?._id ?? category?.id;
                  const slug = getCategorySlug(category);
                  const isOpen = openCategoryId === categoryId;
                  const products = categoryProductsBySlug[slug] || [];
                  const isLoadingProducts = !!categoryProductsLoadingBySlug[slug];
                  const productsError = categoryProductsErrorBySlug[slug];

                  return (
                    <div key={categoryId} className="category-wrapper">
                      <div className="category-header" onClick={() => handleCategoryToggle(category)}>
                        <div className="category-header-left">
                          <div className="category-header-icon">
                            {category?.image ? (
                              <img className="category-header-img" src={category.image} alt={category.name} />
                            ) : (
                              <img className="category-header-img" src={boost} alt={category.name || "Category"} />
                            )}
                          </div>
                          <p className="category-header-title">{category?.name || "Category"}</p>
                        </div>
                        <span className={`arrow ${isOpen ? "rotate" : ""}`}>▾</span>
                      </div>

                      {isOpen && (
                        <div className="category-content">
                          {isLoadingProducts ? (
                            <div className="no-categories">Loading products...</div>
                          ) : productsError ? (
                            <div className="no-categories">{productsError}</div>
                          ) : products.length > 0 ? (
                            <div className="brand-category-products-grid">
                              {products.map((product) => (
                                <button
                                  key={product?._id ?? product?.id}
                                  type="button"
                                  className="brand-category-product-tile"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleProductClick(product);
                                  }}
                                >
                                  <img
                                    className="brand-category-product-img"
                                    src={product?.image || boost}
                                    alt={product?.name || "Product"}
                                    loading="lazy"
                                  />
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="no-categories">No products available</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="no-categories">No categories available</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Brands;
