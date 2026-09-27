import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Droplets,
  FileText,
  Lightbulb,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { useMemo, useState } from "react";

const updates = [
  {
    id: 1,
    category: "Services",
    title: "Temporary water supply changes",
    description:
      "Water supply timings may be affected in parts of Ward 7 while maintenance work is carried out.",
    details:
      "Residents in affected areas may experience temporary changes to normal water supply timings while scheduled maintenance is completed. Residents are advised to plan water usage accordingly and check this page for further local notices.",
    date: "24 Sep 2026",
    icon: Droplets,
    featured: true,
  },
  {
    id: 2,
    category: "Community",
    title: "Community cleanliness drive",
    description:
      "Residents are invited to participate in the upcoming cleanliness activity around the main market area.",
    details:
      "A community cleanliness activity is planned around the main market area. Residents can participate by helping keep public spaces clean and placing waste in designated collection points.",
    date: "22 Sep 2026",
    icon: Users,
  },
  {
    id: 3,
    category: "Services",
    title: "Electricity maintenance notice",
    description:
      "Scheduled maintenance may temporarily affect electricity service in selected streets.",
    details:
      "Scheduled electrical maintenance may temporarily affect electricity service in selected streets. Residents should plan accordingly during the maintenance period.",
    date: "20 Sep 2026",
    icon: Lightbulb,
  },
  {
    id: 4,
    category: "Safety",
    title: "Public safety reminder",
    description:
      "Residents are requested to report damaged streetlights and other safety-related civic issues.",
    details:
      "Residents can help improve local safety by reporting damaged streetlights, exposed infrastructure and other civic issues that may create risks in public areas.",
    date: "18 Sep 2026",
    icon: ShieldCheck,
  },
  {
    id: 5,
    category: "Notices",
    title: "Ward 7 civic services notice",
    description:
      "Keep your contact details and report information updated when submitting civic complaints.",
    details:
      "When submitting a civic report, provide accurate location information and a clear description of the issue. This helps the responsible department process the report efficiently.",
    date: "16 Sep 2026",
    icon: FileText,
  },
];

const filters = [
  "All",
  "Services",
  "Community",
  "Safety",
  "Notices",
];

function Updates({ onExplore, onReport }) {
  const [activeFilter, setActiveFilter] =
    useState("All");

  const [selectedUpdate, setSelectedUpdate] =
    useState(null);

  const filteredUpdates = useMemo(() => {
    if (activeFilter === "All") {
      return updates;
    }

    return updates.filter(
      (update) => update.category === activeFilter
    );
  }, [activeFilter]);

  const featuredUpdate = updates.find(
    (update) => update.featured
  );

  const openUpdate = (update) => {
    setSelectedUpdate(update);
  };

  const closeUpdate = () => {
    setSelectedUpdate(null);
  };

  const SelectedIcon = selectedUpdate
    ? selectedUpdate.icon
    : null;

  return (
    <div className="updates-page">
      <main>
        <section className="updates-hero">
          <div className="updates-hero-inner">
            <div>
              <span className="section-overline">
                LOCAL UPDATES
              </span>

              <h1>
                What’s happening in your area.
              </h1>

              <p>
                Stay informed about civic services,
                maintenance, community activities and
                important notices.
              </p>
            </div>

            <div className="updates-hero-card">
              <div className="updates-hero-card-icon">
                <Bell size={20} />
              </div>

              <div>
                <span>WARD 7</span>

                <strong>
                  Latest local notices
                </strong>

                <p>
                  Important information for residents
                  of Safidon.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="updates-section">
          <div className="updates-section-header">
            <div>
              <span className="section-overline">
                LATEST
              </span>

              <h2>Recent updates</h2>
            </div>

            <span className="updates-result-count">
              {filteredUpdates.length}{" "}
              {filteredUpdates.length === 1
                ? "update"
                : "updates"}
            </span>
          </div>

          <div className="updates-filters">
            {filters.map((filter) => (
              <button
                type="button"
                key={filter}
                className={
                  activeFilter === filter
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveFilter(filter)
                }
              >
                {filter}
              </button>
            ))}
          </div>

          {featuredUpdate &&
            activeFilter === "All" && (
              <article className="updates-featured">
                <div className="updates-featured-icon">
                  <Droplets size={25} />
                </div>

                <div className="updates-featured-content">
                  <div className="update-card-meta">
                    <span>
                      {featuredUpdate.category}
                    </span>

                    <span>
                      <CalendarDays size={13} />
                      {featuredUpdate.date}
                    </span>
                  </div>

                  <h2>
                    {featuredUpdate.title}
                  </h2>

                  <p>
                    {featuredUpdate.description}
                  </p>

                  <button
                    type="button"
                    className="update-read-more"
                    onClick={() =>
                      openUpdate(featuredUpdate)
                    }
                  >
                    Read full update
                    <ChevronRight size={15} />
                  </button>
                </div>
              </article>
            )}

          <div className="updates-grid">
            {filteredUpdates
              .filter(
                (update) =>
                  !(
                    activeFilter === "All" &&
                    update.featured
                  )
              )
              .map((update) => {
                const Icon = update.icon;

                return (
                  <article
                    className="update-card"
                    key={update.id}
                  >
                    <div className="update-card-top">
                      <div className="update-card-icon">
                        <Icon size={19} />
                      </div>

                      <span className="update-category">
                        {update.category}
                      </span>
                    </div>

                    <h3>{update.title}</h3>

                    <p>{update.description}</p>

                    <div className="update-card-footer">
                      <span>
                        <CalendarDays size={13} />
                        {update.date}
                      </span>

                      <button
                        type="button"
                        aria-label={`Read ${update.title}`}
                        onClick={() =>
                          openUpdate(update)
                        }
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
          </div>

          {filteredUpdates.length === 0 && (
            <div className="updates-empty">
              <Bell size={25} />

              <strong>
                No updates in this category
              </strong>

              <span>
                Try selecting another category.
              </span>

              <button
                type="button"
                onClick={() =>
                  setActiveFilter("All")
                }
              >
                View all updates
              </button>
            </div>
          )}
        </section>

        <section className="updates-notices">
          <div className="updates-notices-inner">
            <div className="notices-copy">
              <span className="section-overline">
                YOUR AREA
              </span>

              <h2>Ward 7 notices</h2>

              <p>
                Quick information that may be useful
                to residents in your area.
              </p>
            </div>

            <div className="notice-list">
              <div className="notice-item">
                <span className="notice-number">
                  01
                </span>

                <div>
                  <strong>
                    Report civic issues through
                    LokSetu
                  </strong>

                  <p>
                    Include a clear location and
                    description to help the responsible
                    team.
                  </p>
                </div>
              </div>

              <div className="notice-item">
                <span className="notice-number">
                  02
                </span>

                <div>
                  <strong>
                    Track submitted reports
                  </strong>

                  <p>
                    Check My Reports to follow the
                    progress of your submissions.
                  </p>
                </div>
              </div>

              <div className="notice-item">
                <span className="notice-number">
                  03
                </span>

                <div>
                  <strong>
                    Explore available civic services
                  </strong>

                  <p>
                    Find useful local service information
                    from the Explore section.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="updates-cta">
          <div>
            <span className="section-overline">
              SEE SOMETHING?
            </span>

            <h2>Report a civic problem.</h2>

            <p>
              Help your community by reporting issues
              that need attention.
            </p>
          </div>

          <div className="updates-cta-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={onExplore}
            >
              Explore services
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              className="button-primary"
              onClick={onReport}
            >
              Report a problem
              <ArrowRight size={15} />
            </button>
          </div>
        </section>
      </main>

      {selectedUpdate && (
        <div
          className="update-modal-backdrop"
          onClick={closeUpdate}
        >
          <div
            className="update-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="update-modal-top">
              <div className="update-modal-icon">
                {SelectedIcon && (
                  <SelectedIcon size={22} />
                )}
              </div>

              <button
                type="button"
                className="update-modal-close"
                onClick={closeUpdate}
                aria-label="Close update"
              >
                <X size={19} />
              </button>
            </div>

            <div className="update-modal-meta">
              <span>
                {selectedUpdate.category}
              </span>

              <span>
                <CalendarDays size={13} />
                {selectedUpdate.date}
              </span>
            </div>

            <h2>{selectedUpdate.title}</h2>

            <p className="update-modal-description">
              {selectedUpdate.details}
            </p>

            <div className="update-modal-area">
              <span>AREA</span>
              <strong>Ward 7, Safidon</strong>
            </div>

            <button
              type="button"
              className="button-primary update-modal-action"
              onClick={closeUpdate}
            >
              Done
              <Check size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Updates;