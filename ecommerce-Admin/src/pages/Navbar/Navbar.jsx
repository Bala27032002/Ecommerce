import React from "react";
import back from "../../assets/Navbar-icons/back.svg";
import bell from "../../assets/Navbar-icons/bell.svg";
import username from "../../assets/Navbar-icons/username.svg";
import "./Navbar.css";
import home from "../../assets/Navbar-icons/home.svg";
import customermanage from '../../assets/Navbar-icons/customermanage.svg'
import orders from '../../assets/Navbar-icons/orders.svg'
import settings from '../../assets/Navbar-icons/setting.svg'
import stock from '../../assets/Navbar-icons/strongbox.svg'
import logout from '../../assets/Navbar-icons/logout.svg'
import logo from '../../assets/Navbar-icons/Logo.svg'
import SellingProduct from "../SellingProduct/SellingProduct";
import TopSelling from "../TopSelling/TopSelling";
const Navbar = () => {
  return (
    <>
      <div className="admin-navbar">
        <div className="logo-section">
          <div>
            <h3>FreshlyGo</h3>
          </div>
          <div>
            <img src={back} alt="back" />
          </div>
        </div>
        {/* <div className="back-section"></div> */}
        <div className="right-section">
          <img src={bell} alt="bell" className="icon" />
          <div className="user-box">
            <img src={username} alt="user" />
            <div className="user-text">
              <p className="name">Username</p>
              <span className="role">Staff</span>
            </div>
          </div>
        </div>
      </div>
      <div className="dashboard-items">
  <div className="items-list">
    <span className="img-home"><img src={home} /> <p>Dashboard</p></span>
    <span className="img-home"><img src={stock} /> <p>Stock & Pricing</p></span>
    <span className="img-home"><img src={orders} /> <p>Orders</p></span>
    <span className="img-home"><img src={settings} /> <p>Settings</p></span>
    <span className="img-home"><img src={customermanage} /> <p>Customer Management</p></span>
    <span className="img-home"><img src={logout} /> <p>Logout</p></span>
  </div>
<div className="dashboard-content">
    <div className="dashboard-date">
      <h2>Dashboard</h2>
      <p>Date</p>
    </div>
    <div className="today-sales">
     <div className="sales-today">
      <div className="sale-name">
    <p>Todays Sales</p>
    <p>104 times</p>
    </div>
    <div>
    <img src={logo}/>
    </div>
  </div>
    <div className="sales-today">
      <div  className="sale-name">
    <p>Todays Sales</p>
    <p>104 times</p>
    </div>
    <div>
    <img src={logo}/>
    </div>
  </div>
    <div className="sales-today">
      <div  className="sale-name">
    <p>Todays Sales</p>
    <p>104 times</p>
    </div>
    <div>
    <img src={logo}/>
    </div>
  </div>
  </div>
 <TopSelling/>

  
  </div>
 

</div>

    </>
  );
};

export default Navbar;
