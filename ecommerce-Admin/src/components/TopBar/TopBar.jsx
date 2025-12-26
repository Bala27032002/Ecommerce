import React, { useEffect, useMemo, useRef, useState } from "react";
import bell from "../../assets/Navbar-icons/Notification.svg";
import username from "../../assets/Navbar-icons/username.svg";
import back from "../../assets/Navbar-icons/back.svg";
import "./TopBar.css";
import axios from "axios";
import { MAINURL } from "../../config/Api";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const TopBar = ({ children, onToggleSidebar }) => {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const authToken = useMemo(() => {
    return localStorage.getItem("auth_token") || localStorage.getItem("token");
  }, []);

  const apiHeaders = useMemo(() => {
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
  }, [authToken]);

  const fetchAdminNotifications = async () => {
    try {
      const res = await axios.get(`${MAINURL}notifications/admin`, {
        headers: apiHeaders,
      });

      setNotifications(res.data?.notifications || []);
    } catch (error) {
      console.error("Failed to fetch admin notifications", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(`${MAINURL}notifications/admin/unread-count`, {
        headers: apiHeaders,
      });
      setUnreadCount(Number(res.data?.unreadCount || 0));
    } catch (error) {
      console.error("Failed to fetch admin unread count", error);
    }
  };

  const markAdminAsRead = async (notificationId) => {
    try {
      await axios.put(`${MAINURL}notifications/admin/${notificationId}/read`, null, {
        headers: apiHeaders,
      });
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const onNotificationClick = async (n) => {
    const orderId = n?.orderId?._id || n?.orderId;
    if (!orderId) return;

    if (n?._id && !n?.isRead) {
      await markAdminAsRead(n._id);
    }

    setIsOpen(false);
    await fetchUnreadCount();
    await fetchAdminNotifications();
    navigate(`/orders/${orderId}`);
  };

  useEffect(() => {
    fetchUnreadCount();
    fetchAdminNotifications();
  }, [apiHeaders]);

  useEffect(() => {
    if (!authToken) return;
    const socket = io(MAINURL.replace(/\/api\/?$/, ""), {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("admin_notification", () => {
      fetchUnreadCount();
      fetchAdminNotifications();
    });

    return () => {
      socket.disconnect();
    };
  }, [authToken, apiHeaders]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!isOpen) return;
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isOpen]);

  return (
    <div className="topbar-layout">
      <div className="topbar">
        <div className="logo-section">
          <button
            type="button"
            className="topbar-menu-btn"
            aria-label="Toggle menu"
            onClick={onToggleSidebar}
          >
            <span className="topbar-menu-icon" />
            <span className="topbar-menu-icon" />
            <span className="topbar-menu-icon" />
          </button>
          <div className="logo">
            <h3>FreshlyGo</h3>
          </div>
          <div className="back-btn">
            <img src={back} alt="back" />
          </div>
        </div>
        <div className="right-section">
          <div className="notification-bell" ref={dropdownRef}>
            <img src={bell} alt="bell" className="icon" />
            {unreadCount > 0 ? (
              <span className="notification-badge">{unreadCount}</span>
            ) : null}

            <button
              type="button"
              className="notification-click-target"
              aria-label="Open notifications"
              onClick={() => setIsOpen((p) => !p)}
            />

            {isOpen ? (
              <div className="notification-dropdown" role="menu">
                <div className="notification-dropdown-header">
                  <span>Notifications</span>
                  <button
                    type="button"
                    className="notification-refresh"
                    onClick={() => {
                      fetchUnreadCount();
                      fetchAdminNotifications();
                    }}
                  >
                    Refresh
                  </button>
                </div>

                <div className="notification-dropdown-list">
                  {notifications.length === 0 ? (
                    <div className="notification-empty">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n._id}
                        type="button"
                        className={`notification-item ${n.isRead ? "read" : "unread"}`}
                        onClick={() => onNotificationClick(n)}
                      >
                        <div className="notification-title">{n.title}</div>
                        <div className="notification-message">{n.message}</div>
                        <div className="notification-meta">
                          {n?.data?.orderNumber ? `#${n.data.orderNumber}` : ""}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>
          <div className="user-box">
            <img src={username} alt="user" />
            <div className="user-text">
              <p className="name"> {admin?.name || admin?.username || "Admin"}</p>
              <span className="role">{admin?.role || "Admin"}</span>
            </div>
          </div>
        </div>
      </div>

      {children ? <div className="topbar-children">{children}</div> : null}
    </div>
  );
};

export default TopBar;
