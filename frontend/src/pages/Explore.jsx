import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ChevronRight,
  Droplets,
  FileText,
  Hospital,
  Lightbulb,
  MapPin,
  Search,
  Shield,
  Trash2,
  Users,
  Zap,
} from "lucide-react";

import { useState } from "react";

const categories = [
  {
    id: "all",
    name: "All services",
    icon: Building2,
  },
  {
    id: "water",
    name: "Water",
    icon: Droplets,
  },
  {
    id: "electricity",
    name: "Electricity",
    icon: Zap,
  },
  {
    id: "health",
    name: "Health",
    icon: Hospital,
  },
  {
    id: "waste",
    name: "Waste",
    icon: Trash2,
  },
  {
    id: "safety",
    name: "Safety",
    icon: Shield,
  },
  {
    id: "documents",
    name: "Documents",
    icon: FileText,
  },
];

const services = [
  {
    id: 1,
    category: "water",
    title: "Water Services",
    description:
      "Water supply information, complaints and leakage reporting.",
    location: "Municipal water office",
    hours: "9:00 AM – 5:00 PM",
    icon: Droplets,
  },
  {
    id: 2,
    category: "electricity",
    title: "Electricity Services",
    description:
      "Power complaints, outages and electricity-related assistance.",
    location: "Electricity subdivision office",
    hours: "9:00 AM – 5:00 PM",
    icon: Zap,
  },
  {
    id: 3,
    category: "health",
    title: "Health Services",
    description:
      "Find nearby public health facilities and basic services.",
    location: "Government health centre",
    hours: "8:00 AM – 4:00 PM",
    icon: Hospital,
  },
  {
    id: 4,
    category: "waste",
    title: "Waste & Sanitation",
    description:
      "Garbage collection, sanitation and cleanliness services.",
    location: "Municipal sanitation office",
    hours: "9:00 AM – 5:00 PM",
    icon: Trash2,
  },
  {
    id: 5,
    category: "safety",
    title: "Public Safety",
    description:
      "Important contacts and local public safety information.",
    location: "Local administration",
    hours: "Available daily",
    icon: Shield,
  },
  {
    id: 6,
    category: "documents",
    title: "Citizen Documents",
    description:
      "Information about common civic documents and applications.",
    location: "Citizen service centre",
    hours: "9:00 AM – 5:00 PM",
    icon: FileText,
  },
];

function Explore({ onBack, onReport }) {
  const [activeCategory, setActiveCategory] =
    useState("all");

  const [search, setSearch] = useState("");

  const [selectedService, setSelectedService] =
    useState(null);

  const filteredServices = services.filter(
    (service) => {
      const matchesCategory =
        activeCategory === "all" ||
        service.category === activeCategory;

      const searchText =
        `${service.title} ${service.description} ${service.location}`.toLowerCase();

      const matchesSearch = searchText.includes(
        search.toLowerCase()
      );

      return matchesCategory && matchesSearch;
    }
  );

  return (
    <div className="explore-page">
      <main>
        {/* HERO */}

        <section className="explore-hero">
          <div className="page-shell">
            <button
              className="back-link"
              onClick={onBack}
            >
              <ArrowLeft size={17} />
              Back to home
            </button>

            <span className="section-overline">
              EXPLORE YOUR AREA
            </span>

            <h1>
              Find the services you need.
            </h1>

            <p>
              Browse local civic services, facilities
              and useful information for your area.
            </p>

            <div className="explore-search">
              <Search size={19} />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search services..."
              />
            </div>
          </div>
        </section>

        {/* CATEGORIES */}

        <section className="explore-categories">
          <div className="page-shell">
            <div className="category-scroll">
              {categories.map((category) => {
                const Icon = category.icon;

                return (
                  <button
                    key={category.id}
                    className={
                      activeCategory === category.id
                        ? "explore-category active"
                        : "explore-category"
                    }
                    onClick={() =>
                      setActiveCategory(
                        category.id
                      )
                    }
                  >
                    <Icon size={17} />

                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* SERVICES */}

        <section className="explore-services">
          <div className="page-shell">
            <div className="explore-section-heading">
              <div>
                <span className="section-overline">
                  SERVICES
                </span>

                <h2>
                  Available in your area
                </h2>
              </div>

              <span className="service-count">
                {filteredServices.length} services
              </span>
            </div>

            <div className="service-grid">
              {filteredServices.map((service) => {
                const Icon = service.icon;

                return (
                  <button
                    className="service-card"
                    key={service.id}
                    onClick={() =>
                      setSelectedService(
                        service
                      )
                    }
                  >
                    <div className="service-card-icon">
                      <Icon size={22} />
                    </div>

                    <div className="service-card-content">
                      <h3>{service.title}</h3>

                      <p>
                        {service.description}
                      </p>

                      <div className="service-location">
                        <MapPin size={14} />

                        <span>
                          {service.location}
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      size={17}
                      className="service-arrow"
                    />
                  </button>
                );
              })}
            </div>

            {filteredServices.length === 0 && (
              <div className="explore-empty">
                <Search size={25} />

                <strong>
                  No services found
                </strong>

                <span>
                  Try another search or category.
                </span>
              </div>
            )}
          </div>
        </section>

        {/* NEARBY */}

        <section className="nearby-section">
          <div className="page-shell">
            <div className="nearby-card">
              <div className="nearby-map">
                <div className="nearby-grid" />

                <div className="nearby-road nearby-road-a" />
                <div className="nearby-road nearby-road-b" />
                <div className="nearby-road nearby-road-c" />

                <div className="nearby-marker marker-one">
                  <MapPin size={15} />
                </div>

                <div className="nearby-marker marker-two">
                  <Hospital size={14} />
                </div>

                <div className="nearby-marker marker-three">
                  <Building2 size={14} />
                </div>

                <div className="nearby-map-label">
                  Safidon
                </div>
              </div>

              <div className="nearby-copy">
                <span className="section-overline">
                  NEARBY
                </span>

                <h2>
                  Services around Ward 7
                </h2>

                <p>
                  Explore civic facilities and
                  services around your selected area.
                </p>

                <div className="nearby-items">
                  <div>
                    <span className="nearby-dot">
                      <Hospital size={15} />
                    </span>

                    <span>
                      Health centre
                    </span>

                    <small>
                      Nearby
                    </small>
                  </div>

                  <div>
                    <span className="nearby-dot">
                      <Building2 size={15} />
                    </span>

                    <span>
                      Citizen service centre
                    </span>

                    <small>
                      Nearby
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REPORT CTA */}

        <section className="explore-report">
          <div className="page-shell">
            <div className="explore-report-inner">
              <div>
                <span className="section-overline">
                  CAN'T FIND WHAT YOU NEED?
                </span>

                <h2>
                  Report a civic problem.
                </h2>

                <p>
                  If something in your area needs
                  attention, let the responsible team
                  know.
                </p>
              </div>

              <button
                className="button-primary"
                onClick={onReport}
              >
                Report a problem
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* SERVICE DETAIL */}

      {selectedService && (
        <div
          className="service-modal-backdrop"
          onClick={() =>
            setSelectedService(null)
          }
        >
          <div
            className="service-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="service-modal-close"
              onClick={() =>
                setSelectedService(null)
              }
            >
              ×
            </button>

            <div className="service-modal-icon">
              {(() => {
                  const Icon = selectedService.icon;

                  return <Icon size={25} />;
              })()}
            </div>

            <span className="section-overline">
              CIVIC SERVICE
            </span>

            <h2>
              {selectedService.title}
            </h2>

            <p>
              {selectedService.description}
            </p>

            <div className="service-detail-row">
              <MapPin size={16} />

              <div>
                <span>LOCATION</span>
                <strong>
                  {selectedService.location}
                </strong>
              </div>
            </div>

            <div className="service-detail-row">
              <Users size={16} />

              <div>
                <span>AREA</span>
                <strong>
                  Ward 7, Safidon
                </strong>
              </div>
            </div>

            <div className="service-detail-row">
              <ChevronRight size={16} />

              <div>
                <span>HOURS</span>
                <strong>
                  {selectedService.hours}
                </strong>
              </div>
            </div>

            <button
              className="button-primary service-modal-button"
              onClick={() => {
                setSelectedService(null);
                onReport();
              }}
            >
              Report an issue
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Explore;