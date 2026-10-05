import { useState } from "react";

import {
  Bell,
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Complaints from "./pages/Complaints";
import ComplaintDetails from "./pages/ComplaintDetails";
import Departments from "./pages/Departments";
import Workers from "./pages/Workers";
import Updates from "./pages/Updates";
import Login from "./pages/Login";

import {
  clearAdminSession,
  getAdminToken,
  getAdminUser,
} from "./api";


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
    id: "workers",
    label: "Workers",
    icon: Users,
  },
  {
    id: "updates",
    label: "Updates",
    icon: Bell,
  },
];


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(getAdminToken())
  );

  const [activePage, setActivePage] = useState("dashboard");

  const [selectedComplaintId, setSelectedComplaintId] =
    useState(null);


  const adminUser = getAdminUser();


  const handleLogin = () => {
    setIsAuthenticated(true);
    setActivePage("dashboard");
  };


  const handleLogout = () => {
    clearAdminSession();
    setIsAuthenticated(false);
    setSelectedComplaintId(null);
    setActivePage("dashboard");
  };


  const handleNavigate = (page) => {
    setSelectedComplaintId(null);
    setActivePage(page);
  };


  const handleOpenComplaint = (complaintId) => {
    setSelectedComplaintId(complaintId);
  };


  const handleBackToComplaints = () => {
    setSelectedComplaintId(null);
    setActivePage("complaints");
  };


  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }


  let pageContent;


  if (selectedComplaintId) {
    pageContent = (
      <ComplaintDetails
        complaintId={selectedComplaintId}
        onBack={handleBackToComplaints}
      />
    );
  } else if (activePage === "dashboard") {
    pageContent = (
      <Dashboard
        onNavigate={handleNavigate}
      />
    );
  } else if (activePage === "complaints") {
    pageContent = (
      <Complaints
        onOpenComplaint={handleOpenComplaint}
      />
    );
  } else if (activePage === "departments") {
    pageContent = <Departments />;
  } else if (activePage === "workers") {
    pageContent = <Workers />;
  } else if (activePage === "updates") {
    pageContent = <Updates />;
  } else {
    pageContent = (
      <Dashboard
        onNavigate={handleNavigate}
      />
    );
  }


  return (
    <div className="admin-shell">

      {/* LEFT SIDEBAR */}

      <aside className="admin-sidebar">

        <div className="admin-sidebar-top">

          <div className="admin-sidebar-brand">

            <div className="admin-sidebar-logo">
              L
            </div>

            <div>
              <strong>LokSetu</strong>
              <span>Administration</span>
            </div>

          </div>


          <div className="admin-sidebar-section-title">
            MANAGEMENT
          </div>


          <nav className="admin-navigation">

            {navigationItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                !selectedComplaintId &&
                activePage === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={
                    isActive
                      ? "admin-nav-item admin-nav-item-active"
                      : "admin-nav-item"
                  }
                  onClick={() => handleNavigate(item.id)}
                >
                  <Icon size={18} strokeWidth={1.8} />

                  <span>
                    {item.label}
                  </span>
                </button>
              );
            })}

          </nav>

        </div>


        {/* SIDEBAR FOOTER */}

        <div className="admin-sidebar-bottom">

          <div className="admin-user-card">

            <div className="admin-avatar">
              {(adminUser?.name || "A")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="admin-user-info">

              <strong>
                {adminUser?.name || "LokSetu Admin"}
              </strong>

              <span>
                {adminUser?.email || "Administrator"}
              </span>

            </div>

          </div>


          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />

            <span>
              Sign out
            </span>
          </button>

        </div>

      </aside>


      {/* MAIN CONTENT */}

      <main className="admin-main">
        {pageContent}
      </main>

    </div>
  );
}


export default App;