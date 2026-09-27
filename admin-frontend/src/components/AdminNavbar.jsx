import {
  Bell,
  ChevronDown,
  Menu,
} from "lucide-react";

function AdminNavbar({
  activePage,
  onNavigate,
  onMenuOpen,
}) {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
    },
    {
      id: "complaints",
      label: "Complaints",
    },
    {
      id: "departments",
      label: "Departments",
    },
    {
      id: "updates",
      label: "Updates",
    },
  ];

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-left">
        <button
          className="admin-navbar-menu"
          onClick={onMenuOpen}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="admin-navbar-brand">
          <div className="admin-navbar-logo">
            L
          </div>

          <div>
            <strong>LokSetu</strong>
            <span>Admin Portal</span>
          </div>
        </div>

        <nav className="admin-navbar-links">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={
                activePage === item.id
                  ? "admin-navbar-link active"
                  : "admin-navbar-link"
              }
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="admin-navbar-right">
        <div className="admin-system-status">
          <span />
          Operational
        </div>

        <button
          className="admin-notification"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="notification-badge">3</span>
        </button>

        <button className="admin-profile">
          <div className="admin-profile-avatar">
            A
          </div>

          <div className="admin-profile-text">
            <strong>Administrator</strong>
            <span>Admin</span>
          </div>

          <ChevronDown size={15} />
        </button>
      </div>
    </header>
  );
}

export default AdminNavbar;