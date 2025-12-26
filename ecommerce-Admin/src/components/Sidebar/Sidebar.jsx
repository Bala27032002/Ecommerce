import React from "react";
import { Link, useLocation } from "react-router-dom";
import home from "../../assets/Navbar-icons/home.svg";
import stock from "../../assets/Navbar-icons/strongbox.svg";
import orders from "../../assets/Navbar-icons/orders.svg";
import settings from "../../assets/Navbar-icons/setting.svg";
import customermanage from "../../assets/Navbar-icons/customermanage.svg";
import salt from "../../assets/Navbar-icons/salt.svg";
import logout from "../../assets/Navbar-icons/logout.svg";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onNavigate }) => {
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", icon: home, label: "Dashboard" },
    { path: "/stocks", icon: stock, label: "Stock & Pricing" },
    { path: "/orders", icon: orders, label: "Orders" },
    { path: "/categories", icon: salt, label: "Categories" },
    { path: "/settings", icon: settings, label: "Settings" },
    { path: "/customer", icon: customermanage, label: "Customer Management" },
    { path: "/logout", icon: logout, label: "Logout", onClick: handleLogout },
  ];

  function handleLogout() {
    localStorage.removeItem("auth_token");
    window.location.href = "/";
  }

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-items">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${
              location.pathname === item.path ? "active" : ""
            }`}
            onClick={(e) => {
              if (item.onClick) {
                item.onClick(e);
              }
              if (onNavigate) {
                onNavigate();
              }
            }}
          >
            <img src={item.icon} alt={item.label} />
            <p>{item.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
