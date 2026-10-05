import { useEffect, useMemo, useState } from "react";

import {
  Search,
  SlidersHorizontal,
  MapPin,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";

import { apiRequest } from "../api";

function getStatusClass(status) {
  const normalizedStatus = String(status || "").toLowerCase();

  if (
    normalizedStatus === "resolved" ||
    normalizedStatus === "completed"
  ) {
    return "status-resolved";
  }

  if (
    normalizedStatus === "in_progress" ||
    normalizedStatus === "in progress"
  ) {
    return "status-progress";
  }

  return "status-pending";
}

function formatStatus(status) {
  const normalizedStatus = String(status || "")
    .toLowerCase()
    .replaceAll("_", " ");

  if (!normalizedStatus) {
    return "Pending";
  }

  return normalizedStatus
    .split(" ")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getLocationText(location) {
  if (!location) {
    return "Location unavailable";
  }

  if (typeof location === "string") {
    return location;
  }

  const parts = [
    location.address,
    location.ward
      ? `Ward ${location.ward}`
      : null,
    location.city,
    location.state,
  ].filter(Boolean);

  return parts.length > 0
    ? parts.join(", ")
    : "Location unavailable";
}

function Complaints({ onOpenComplaint }) {
  const [complaints, setComplaints] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadComplaints() {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest(
          "/admin/complaints"
        );

        if (!mounted) {
          return;
        }

        setComplaints(
          Array.isArray(data?.complaints)
            ? data.complaints
            : []
        );
      } catch (err) {
        if (!mounted) {
          return;
        }

        console.error(
          "Failed to load complaints:",
          err
        );

        setError(
          err.message ||
            "Unable to load complaints."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadComplaints();

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const values = complaints
      .map((complaint) => complaint.category)
      .filter(Boolean);

    return [...new Set(values)].sort();
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return complaints.filter((complaint) => {
      const complaintStatus = String(
        complaint.status || ""
      ).toLowerCase();

      const complaintCategory = String(
        complaint.category || ""
      ).toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        complaintStatus ===
          statusFilter.toLowerCase();

      const matchesCategory =
        categoryFilter === "all" ||
        complaintCategory ===
          categoryFilter.toLowerCase();

      if (!matchesStatus || !matchesCategory) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      const searchableText = [
        complaint.complaint_id,
        complaint.id,
        complaint.title,
        complaint.description,
        complaint.category,
        complaintStatus,
        getLocationText(
          complaint.location
        ),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchValue);
    });
  }, [
    complaints,
    search,
    statusFilter,
    categoryFilter,
  ]);

  const totalComplaints = complaints.length;

  return (
    <div className="complaints-page">
      <div className="complaints-heading">
        <div>
          <h2>Complaints</h2>
          <p>
            Review, assign and manage citizen complaints.
          </p>
        </div>

        <div className="complaints-total">
          <strong>{totalComplaints}</strong>
          <span>Total complaints</span>
        </div>
      </div>

      <div className="complaints-toolbar">
        <div className="complaints-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search complaints, ID or location..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="complaints-filter">
          <SlidersHorizontal size={16} />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            aria-label="Filter by status"
          >
            <option value="all">
              Status: All
            </option>
            <option value="pending">
              Pending
            </option>
            <option value="in_progress">
              In progress
            </option>
            <option value="resolved">
              Resolved
            </option>
            <option value="rejected">
              Rejected
            </option>
          </select>
        </div>

        <div className="complaints-filter">
          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
            aria-label="Filter by category"
          >
            <option value="all">
              Category: All
            </option>

            {categories.map((category) => (
              <option
                value={category}
                key={category}
              >
                {category}
              </option>
            ))}
          </select>
        </div>

        <button
          className="complaints-filter"
          type="button"
          onClick={() => {
            setSearch("");
            setStatusFilter("all");
            setCategoryFilter("all");
          }}
        >
          <CalendarDays size={15} />
          Reset
        </button>
      </div>

      <div className="complaints-table-card">
        <div className="complaints-table-header">
          <div>
            <strong>All complaints</strong>

            <span>
              {loading
                ? "Loading complaints..."
                : `Showing ${filteredComplaints.length} of ${totalComplaints} complaints`}
            </span>
          </div>

          <span className="table-sort">
            Latest first
          </span>
        </div>

        <div className="complaints-table">
          <div className="complaints-table-head">
            <span>Complaint</span>
            <span>Category</span>
            <span>Location</span>
            <span>Status</span>
            <span>Date</span>
            <span />
          </div>

          {loading && (
            <div className="complaints-empty">
              Loading complaints...
            </div>
          )}

          {!loading && error && (
            <div className="complaints-empty">
              <strong>
                Unable to load complaints
              </strong>

              <span>{error}</span>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
              >
                Retry
              </button>
            </div>
          )}

          {!loading &&
            !error &&
            filteredComplaints.length === 0 && (
              <div className="complaints-empty">
                <strong>
                  No complaints found
                </strong>

                <span>
                  Try changing your search or filters.
                </span>
              </div>
            )}

          {!loading &&
            !error &&
            filteredComplaints.map(
              (complaint) => (
                <button
                  className="complaint-table-row"
                  key={
                    complaint.complaint_id ||
                    complaint.id
                  }
                  onClick={() =>
                    onOpenComplaint(complaint)
                  }
                >
                  <div className="table-complaint">
                    <div className="table-complaint-icon">
                      <ArrowUpRight size={15} />
                    </div>

                    <div>
                      <strong>
                        {complaint.title ||
                          "Untitled complaint"}
                      </strong>

                      <span>
                        {complaint.complaint_id ||
                          complaint.id ||
                          "—"}
                        {" · "}
                        {complaint.citizen_name ||
                          complaint.citizen?.name ||
                          "Citizen"}
                      </span>
                    </div>
                  </div>

                  <span className="table-category">
                    {complaint.category ||
                      "Uncategorized"}
                  </span>

                  <span className="table-location">
                    <MapPin size={13} />

                    {getLocationText(
                      complaint.location
                    )}
                  </span>

                  <span
                    className={`complaint-status ${getStatusClass(
                      complaint.status
                    )}`}
                  >
                    {formatStatus(
                      complaint.status
                    )}
                  </span>

                  <span className="table-date">
                    {formatDate(
                      complaint.created_at
                    )}
                  </span>

                  <span className="table-arrow">
                    <ArrowUpRight size={16} />
                  </span>
                </button>
              )
            )}
        </div>
      </div>
    </div>
  );
}

export default Complaints;