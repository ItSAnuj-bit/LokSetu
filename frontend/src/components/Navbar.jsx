import {
  Bell,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

function Navbar({
  page,
  onNavigate,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (target) => {
    setMobileOpen(false);
    onNavigate(target);
  };

  const navItems = [
    {
      id: "home",
      label: "Home",
    },
    {
      id: "explore",
      label: "Explore",
    },
    {
      id: "report",
      label: "Report",
    },
    {
      id: "reports",
      label: "My Reports",
    },
    {
      id: "updates",
      label: "Updates",
    },
  ];

  return (
    <header className="global-navbar">
      <div className="global-navbar-inner">
        <button
          className="global-brand"
          onClick={() => navigate("home")}
          aria-label="Go to home"
        >
          <span className="global-brand-mark">
            <span />
            <span />
            <span />
          </span>

          <span className="global-brand-name">
            LokSetu
          </span>
        </button>

        <nav className="global-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={
                page === item.id
                  ? "global-nav-link active"
                  : "global-nav-link"
              }
              onClick={() => navigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="global-actions">
          <span className="global-ward">
            Ward 7
          </span>

          <button
            className="global-icon-button"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>

          <button className="global-profile">
            <span className="global-avatar">
              A
            </span>

            <span className="global-profile-name">
              Resident
            </span>

            <ChevronDown
              size={14}
              className="global-profile-chevron"
            />
          </button>
        </div>

        <button
          className="global-mobile-button"
          onClick={() =>
            setMobileOpen((current) => !current)
          }
          aria-label="Toggle navigation"
        >
          {mobileOpen ? (
            <X size={21} />
          ) : (
            <Menu size={21} />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="global-mobile-menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={
                page === item.id
                  ? "global-mobile-link active"
                  : "global-mobile-link"
              }
              onClick={() => navigate(item.id)}
            >
              {item.label}
            </button>
          ))}

          <div className="global-mobile-area">
            <span>Current area</span>
            <strong>Ward 7, Safidon</strong>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;