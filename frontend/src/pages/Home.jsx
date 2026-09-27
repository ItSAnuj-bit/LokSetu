import {
  ArrowRight,
  Bell,
  ChevronDown,
  ChevronRight,
  Droplets,
  FileText,
  MapPin,
  Menu,
  Navigation,
  Search,
  Trash2,
  UserRound,
  X,
  Zap,
} from "lucide-react";

import { useState } from "react";

const services = [
  {
    name: "Water",
    description: "Supply, leakage & drainage",
    icon: Droplets,
  },
  {
    name: "Roads",
    description: "Potholes & damaged roads",
    icon: Navigation,
  },
  {
    name: "Electricity",
    description: "Power & streetlights",
    icon: Zap,
  },
  {
    name: "Waste",
    description: "Garbage & sanitation",
    icon: Trash2,
  },
];

const updates = [
  {
    type: "SERVICE",
    title: "Water supply maintenance",
    description:
      "Scheduled maintenance may affect water supply in parts of the area.",
    time: "Today · 2:00 PM",
  },
  {
    type: "COMMUNITY",
    title: "Cleanliness drive",
    description:
      "Residents can join the community cleanliness drive near Main Bazaar.",
    time: "Tomorrow · 7:30 AM",
  },
];

function Home({ onReport, onExplore, onReports, onUpdates }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="home-page">
      {/* HEADER */}
      <header className="site-header">
        <div className="header-inner">
          <button
            className="brand"
            onClick={() => window.scrollTo(0, 0)}
          >
            <span className="brand-mark">L</span>

            <span className="brand-name">
              Lok<span>Setu</span>
            </span>
          </button>

          <nav
            className={`main-navigation ${
              menuOpen ? "mobile-open" : ""
            }`}
          >
            <button className="nav-item active">Home</button>

            <button
              className="nav-item"
              onClick={onExplore}
            >
              Explore
            </button>

            <button
              className="nav-item"
              onClick={onReport}
            >
              Report
            </button>

            <button
              className="nav-item"
              onClick={onReports}
            >
              My Reports
            </button>

            <button
              className="nav-item"
              onClick={onUpdates}
            >
              Updates
            </button>
          </nav>

          <div className="header-actions">
            <button className="area-selector">
              <MapPin size={15} />
              <span>Ward 7</span>
              <ChevronDown size={14} />
            </button>

            <button
              className="notification-button"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="notification-count">3</span>
            </button>

            <button className="profile-button">
              <span className="profile-initials">PP</span>
              <UserRound size={14} />
            </button>

            <button
              className="mobile-menu"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open navigation"
            >
              {menuOpen ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="home-hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <div className="hero-label">
                <span />
                YOUR LOCAL CIVIC PLATFORM
              </div>

              <h1>
                Everything happening
                <br />
                <em>around you.</em>
              </h1>

              <p>
                Find local services, report civic problems and
                stay informed about your area — all in one place.
              </p>

              <div className="hero-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search services, places or issues"
                />

                <button>
                  Search
                </button>
              </div>

              <div className="hero-buttons">
                <button
                  className="button-primary"
                  onClick={onReport}
                >
                  Report a problem
                  <ArrowRight size={16} />
                </button>

                <button
                  className="button-secondary"
                  onClick={onExplore}
                >
                  Explore your area
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* AREA CARD */}
            <div className="area-card">
              <div className="area-card-header">
                <div>
                  <span className="area-overline">
                    YOUR AREA
                  </span>

                  <h2>Ward 7</h2>

                  <p>Safidon</p>
                </div>

                <div className="area-status">
                  <span />
                  Active
                </div>
              </div>

              <div className="area-map">
                <div className="map-grid" />

                <div className="map-road road-one" />
                <div className="map-road road-two" />
                <div className="map-road road-three" />

                <div className="map-water-line" />

                <div className="map-point point-one">
                  <span>
                    <Droplets size={14} />
                  </span>
                </div>

                <div className="map-point point-two">
                  <span>
                    <Zap size={14} />
                  </span>
                </div>

                <div className="map-point point-three">
                  <span>
                    <Trash2 size={14} />
                  </span>
                </div>

                <div className="you-are-here">
                  <span />
                  <div>
                    <strong>You are here</strong>
                    <small>Ward 7</small>
                  </div>
                </div>
              </div>

              <div className="area-card-footer">
                <span>
                  <MapPin size={14} />
                  3 local updates
                </span>

                <button onClick={onExplore}>
                  Explore
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="quick-section">
          <div className="quick-section-inner">
            <button
              className="quick-card"
              onClick={onReport}
            >
              <div className="quick-icon report-icon">
                <FileText size={21} />
              </div>

              <div>
                <strong>Report a problem</strong>
                <span>
                  Tell us about something that needs attention.
                </span>
              </div>

              <ChevronRight size={17} />
            </button>

            <button
              className="quick-card"
              onClick={onReports}
            >
              <div className="quick-icon track-icon">
                <Navigation size={21} />
              </div>

              <div>
                <strong>Track your reports</strong>
                <span>
                  See the latest status of your submissions.
                </span>
              </div>

              <ChevronRight size={17} />
            </button>

            <button
              className="quick-card"
              onClick={onExplore}
            >
              <div className="quick-icon service-icon">
                <MapPin size={21} />
              </div>

              <div>
                <strong>Find local services</strong>
                <span>
                  Discover useful places and public services.
                </span>
              </div>

              <ChevronRight size={17} />
            </button>
          </div>
        </section>

        {/* SERVICES */}
        <section className="page-section">
          <div className="section-top">
            <div>
              <span className="section-overline">
                CIVIC SERVICES
              </span>

              <h2>What can we help with?</h2>
            </div>

            <button
              className="section-link"
              onClick={onExplore}
            >
              View all
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="services-grid">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <button
                  className="service-card"
                  key={service.name}
                  onClick={onExplore}
                >
                  <span className="service-card-icon">
                    <Icon size={22} />
                  </span>

                  <span className="service-card-info">
                    <strong>{service.name}</strong>
                    <small>{service.description}</small>
                  </span>

                  <ChevronRight size={16} />
                </button>
              );
            })}
          </div>
        </section>

        {/* UPDATES */}
        <section className="page-section updates-section">
          <div className="section-top">
            <div>
              <span className="section-overline">
                LOCAL UPDATES
              </span>

              <h2>What's happening?</h2>
            </div>

            <button
              className="section-link"
              onClick={onUpdates}
            >
              All updates
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="updates-grid">
            {updates.map((update) => (
              <article
                className="update-card"
                key={update.title}
              >
                <div className="update-type">
                  {update.type}
                </div>

                <h3>{update.title}</h3>

                <p>{update.description}</p>

                <div className="update-bottom">
                  <span>{update.time}</span>

                  <button onClick={onUpdates}>
                    Details
                    <ArrowRight size={13} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* COMMUNITY STRIP */}
        <section className="community-strip">
          <div>
            <span className="section-overline">
              BUILT FOR YOUR AREA
            </span>

            <h2>
              Your neighbourhood,
              <br />
              connected.
            </h2>
          </div>

          <p>
            LokSetu brings everyday civic information and
            services closer to the people who use them.
          </p>

          <button onClick={onExplore}>
            Explore LokSetu
            <ArrowRight size={15} />
          </button>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="brand">
              <span className="brand-mark">L</span>

              <span className="brand-name">
                Lok<span>Setu</span>
              </span>
            </div>

            <p>
              Local information, services and civic reporting
              in one place.
            </p>
          </div>

          <div className="footer-navigation">
            <button onClick={onExplore}>
              Explore
            </button>

            <button onClick={onReport}>
              Report
            </button>

            <button onClick={onReports}>
              My Reports
            </button>

            <button onClick={onUpdates}>
              Updates
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 LokSetu</span>
          <span>Made for local communities</span>
        </div>
      </footer>
    </div>
  );
}

export default Home;