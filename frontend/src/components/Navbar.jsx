import {
  Bell,
  ChevronDown,
  LogIn,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { useState } from "react";

function Navbar({
  page,
  onNavigate,
  user,
  onLogin,
  onLogout,
}) {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const navigate = (target) => {
    setMobileOpen(false);
    setProfileOpen(false);

    onNavigate(target);
  };

  const handleLogin = () => {
    setMobileOpen(false);
    setProfileOpen(false);

    onLogin();
  };

  const handleLogout = () => {
    setMobileOpen(false);
    setProfileOpen(false);

    onLogout();
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

  const displayName =
    user?.name ||
    user?.full_name ||
    user?.email?.split("@")[0] ||
    "Resident";

  const avatarLetter =
    displayName.charAt(0).toUpperCase();

  return (
    <header className="global-navbar">
      <div className="global-navbar-inner">
        {/* BRAND */}
        <button
          type="button"
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

        {/* DESKTOP NAVIGATION */}
        <nav className="global-nav">
          {navItems.map((item) => (
            <button
              type="button"
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

        {/* DESKTOP ACTIONS */}
        <div className="global-actions">
          <span className="global-ward">
            Ward 7
          </span>

          {user ? (
            <>
              <button
                type="button"
                className="global-icon-button"
                aria-label="Notifications"
                onClick={() =>
                  window.alert(
                    "Notifications will be connected to LokSetu shortly."
                  )
                }
              >
                <Bell size={18} />
              </button>

              <div className="global-profile-wrapper">
                <button
                  type="button"
                  className="global-profile"
                  onClick={() =>
                    setProfileOpen(
                      (current) => !current
                    )
                  }
                  aria-expanded={profileOpen}
                  aria-label="Open profile menu"
                >
                  <span className="global-avatar">
                    {avatarLetter}
                  </span>

                  <span className="global-profile-name">
                    {displayName}
                  </span>

                  <ChevronDown
                    size={14}
                    className={
                      profileOpen
                        ? "global-profile-chevron open"
                        : "global-profile-chevron"
                    }
                  />
                </button>

                {profileOpen && (
                  <div className="global-profile-menu">
                    <div className="global-profile-menu-header">
                      <span className="global-avatar large">
                        {avatarLetter}
                      </span>

                      <div>
                        <strong>
                          {displayName}
                        </strong>

                        <span>
                          {user.email}
                        </span>
                      </div>
                    </div>

                    <div className="global-profile-divider" />

                    <button
                      type="button"
                      className="global-profile-menu-item"
                      onClick={() =>
                        navigate("home")
                      }
                    >
                      <span>My account</span>
                    </button>

                    <button
                      type="button"
                      className="global-profile-menu-item logout"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              type="button"
              className="global-login-button"
              onClick={handleLogin}
            >
              <LogIn size={16} />
              Sign in
            </button>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className="global-mobile-button"
          onClick={() =>
            setMobileOpen(
              (current) => !current
            )
          }
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X size={21} />
          ) : (
            <Menu size={21} />
          )}
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="global-mobile-menu">
          {navItems.map((item) => (
            <button
              type="button"
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
            <strong>
              Ward 7, Safidon
            </strong>
          </div>

          {user ? (
            <div className="global-mobile-user">
              <div className="global-mobile-user-info">
                <span className="global-avatar">
                  {avatarLetter}
                </span>

                <div>
                  <strong>
                    {displayName}
                  </strong>

                  <span>
                    {user.email}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="global-mobile-logout"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="global-mobile-login"
              onClick={handleLogin}
            >
              <LogIn size={16} />
              Sign in
            </button>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;