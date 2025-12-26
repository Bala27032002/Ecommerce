import React from "react";
import TopBar from "../components/TopBar/TopBar";
import Sidebar from "../components/Sidebar/Sidebar";
import "./MainLayout.css";

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const toggleSidebar = React.useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = React.useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <div className="main-layout">
      <TopBar onToggleSidebar={toggleSidebar}>
        {isSidebarOpen ? (
          <div
            className="sidebar-overlay"
            role="button"
            tabIndex={0}
            onClick={closeSidebar}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                closeSidebar();
              }
            }}
          />
        ) : null}

        <div className="layout-container">
          <aside className="sidebar-wrapper">
            <Sidebar isOpen={isSidebarOpen} onNavigate={closeSidebar} />
          </aside>

          <main className="main-content">{children}</main>
        </div>
      </TopBar>
    </div>
  );
};

export default MainLayout;
