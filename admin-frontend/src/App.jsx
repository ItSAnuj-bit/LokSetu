import { useState } from "react";

import {
  LayoutDashboard,
  FileText,
  Building2,
  Bell,
  LogOut,
  X,
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Complaints from "./pages/Complaints";
import ComplaintDetails from "./pages/ComplaintDetails";
import Departments from "./pages/Departments";
import Updates from "./pages/Updates";
import AdminNavbar from "./components/AdminNavbar";

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "complaints",
    label: "Complaints",
    icon: FileText,
  },
  {
    id: "departments",
    label: "Departments",
    icon: Building2,
  },
  {
    id: "updates",
    label: "Updates",
    icon: Bell,
  },
];

function App() {
  const [activePage, setActivePage] =
    useState("dashboard");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [selectedComplaint, setSelectedComplaint] =
    useState(null);

  const handleNavigation = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
    setSelectedComplaint(null);
  };

  const handleOpenComplaint = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const handleBackToComplaints = () => {
    setSelectedComplaint(null);
    setActivePage("complaints");
  };

  return (
    <div className="admin-shell">
      <AdminNavbar
        activePage={activePage}
        onNavigate={handleNavigation}
        onMenuOpen={() => setSidebarOpen(true)}
      />

      <aside
        className={`admin-sidebar ${
          sidebarOpen
            ? "admin-sidebar-open"
            : ""
        }`}
      >
        <div className="admin-sidebar-header">
          <div className="admin-brand">
            <div className="admin-brand-mark">
              L
            </div>

            <div>
              <div className="admin-brand-name">
                LokSetu
              </div>

              <div className="admin-brand-subtitle">
                Administration
              </div>
            </div>
          </div>

          <button
            className="sidebar-close"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <X size={19} />
          </button>
        </div>

        <div className="sidebar-section-label">
          MANAGEMENT
        </div>

        <nav className="admin-navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`admin-nav-item ${
                  activePage === item.id
                    ? "admin-nav-item-active"
                    : ""
                }`}
                onClick={() =>
                  handleNavigation(item.id)
                }
              >
                <Icon size={18} />

                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-user-card">
            <div className="admin-avatar">
              A
            </div>

            <div className="admin-user-info">
              <strong>Administrator</strong>
              <span>LokSetu Admin</span>
            </div>
          </div>

          <button className="admin-logout-button">
            <LogOut size={17} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <main className="admin-main">
        <div className="admin-content">
          {selectedComplaint ? (
            <ComplaintDetails
              complaint={selectedComplaint}
              onBack={handleBackToComplaints}
            />
          ) : (
            <>
              {activePage === "dashboard" && (
                <Dashboard
                  onNavigate={handleNavigation}
                />
              )}

              {activePage === "complaints" && (
                <Complaints
                  onOpenComplaint={
                    handleOpenComplaint
                  }
                />
              )}

              {activePage === "departments" && (
                <Departments />
              )}

              {activePage === "updates" && (
                <Updates />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;