import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  TrendingUp,
  Users,
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
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
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
    location.ward ? `Ward ${location.ward}` : null,
    location.city,
    location.state,
  ].filter(Boolean);

  return parts.length > 0
    ? parts.join(", ")
    : "Location unavailable";
}

function Dashboard({ onNavigate }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [workers, setWorkers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [
          dashboardResponse,
          complaintsResponse,
          departmentsResponse,
          workersResponse,
        ] = await Promise.all([
          apiRequest("/admin/dashboard"),
          apiRequest("/admin/complaints"),
          apiRequest("/departments"),
          apiRequest("/admin/workers"),
        ]);

        if (!mounted) {
          return;
        }

        setDashboardData(
          dashboardResponse?.data || {}
        );

        setComplaints(
          Array.isArray(complaintsResponse?.complaints)
            ? complaintsResponse.complaints
            : []
        );

        setDepartments(
          Array.isArray(departmentsResponse?.departments)
            ? departmentsResponse.departments
            : []
        );

        setWorkers(
          Array.isArray(workersResponse?.workers)
            ? workersResponse.workers
            : []
        );
      } catch (err) {
        if (!mounted) {
          return;
        }

        console.error(
          "Failed to load admin dashboard:",
          err
        );

        setError(
          err.message ||
            "Unable to load dashboard data."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const data = dashboardData || {};

    return [
      {
        label: "Total complaints",
        value: data.total_complaints ?? 0,
        change: "",
        description: "all submitted complaints",
        icon: FileText,
      },
      {
        label: "Pending",
        value: data.pending ?? 0,
        change: "",
        description: "need attention",
        icon: Clock3,
      },
      {
        label: "In progress",
        value: data.in_progress ?? 0,
        change: "",
        description: "currently assigned",
        icon: TrendingUp,
      },
      {
        label: "Resolved",
        value: data.resolved ?? 0,
        change: "",
        description: "completed complaints",
        icon: CheckCircle2,
      },
    ];
  }, [dashboardData]);

  const recentComplaints = useMemo(() => {
    if (
      Array.isArray(dashboardData?.recent_complaints) &&
      dashboardData.recent_complaints.length > 0
    ) {
      return dashboardData.recent_complaints.slice(0, 10);
    }

    return complaints.slice(0, 10);
  }, [dashboardData, complaints]);

  const departmentWorkload = useMemo(() => {
    return departments.map((department) => {
      const departmentComplaints = complaints.filter(
        (complaint) =>
          complaint.department_id === department.id
      );

      const activeComplaints =
        departmentComplaints.filter((complaint) => {
          const status = String(
            complaint.status || ""
          ).toLowerCase();

          return (
            status !== "resolved" &&
            status !== "rejected" &&
            status !== "completed"
          );
        }).length;

      const resolvedComplaints =
        departmentComplaints.filter((complaint) => {
          const status = String(
            complaint.status || ""
          ).toLowerCase();

          return (
            status === "resolved" ||
            status === "completed"
          );
        }).length;

      const totalComplaints =
        departmentComplaints.length;

      const resolutionProgress =
        totalComplaints > 0
          ? Math.round(
              (resolvedComplaints /
                totalComplaints) *
                100
            )
          : 0;

      const staffMembers = workers.filter(
        (worker) =>
          worker.department_id === department.id
      ).length;

      return {
        id: department.id,
        name: department.name,
        code: department.code,
        complaints: activeComplaints,
        progress: resolutionProgress,
        staffMembers,
      };
    });
  }, [departments, complaints, workers]);

  const activeDepartments = departments.length;

  const activeCitizens =
    dashboardData?.active_citizens ?? 0;

  const activeWards =
    dashboardData?.active_wards ?? 0;

  const resolutionRate =
    dashboardData?.resolution_rate ?? 0;

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-intro">
          <div>
            <h2>Good morning, Administrator</h2>
            <p>
              Loading the latest LokSetu dashboard data...
            </p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-loading">
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-intro">
          <div>
            <h2>Good morning, Administrator</h2>
            <p>
              Here's what's happening across LokSetu today.
            </p>
          </div>

          <button
            className="dashboard-action"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-error">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-intro">
        <div>
          <h2>Good morning, Administrator</h2>
          <p>
            Here's what's happening across LokSetu today.
          </p>
        </div>

        <button
          className="dashboard-action"
           onClick={() => onNavigate("complaints")}
        >
          View complaints
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="dashboard-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              className="stat-card"
              key={stat.label}
            >
              <div className="stat-card-top">
                <div className="stat-icon">
                  <Icon size={19} />
                </div>

                {stat.change && (
                  <span className="stat-change">
                    {stat.change}
                  </span>
                )}
              </div>

              <div className="stat-value">
                {stat.value}
              </div>

              <div className="stat-label">
                {stat.label}
              </div>

              <div className="stat-description">
                {stat.description}
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-card complaints-card">
          <div className="dashboard-card-header">
            <div>
              <h3>Recent complaints</h3>
              <p>
                Latest reports submitted by citizens
              </p>
            </div>

            <button
              className="text-action"
              onClick={() => onNavigate("complaints")}
            >
              View all
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="complaints-list">
            {recentComplaints.length === 0 ? (
              <div className="dashboard-empty">
                No complaints found.
              </div>
            ) : (
              recentComplaints.map((complaint) => (
                <button
                  className="complaint-row"
                  key={
                    complaint.complaint_id ||
                    complaint.id
                  }
                  onClick={() =>
                    onNavigate("complaints")
                  }
                >
                  <div className="complaint-main">
                    <div className="complaint-icon">
                      <AlertCircle size={17} />
                    </div>

                    <div className="complaint-info">
                      <strong>
                        {complaint.title ||
                          "Untitled complaint"}
                      </strong>

                      <span>
                        {complaint.complaint_id ||
                          complaint.id ||
                          "—"}{" "}
                        ·{" "}
                        {complaint.category ||
                          "Uncategorized"}
                      </span>
                    </div>
                  </div>

                  <div className="complaint-location">
                    <MapPin size={14} />
                    {getLocationText(
                      complaint.location
                    )}
                  </div>

                  <span
                    className={`complaint-status ${getStatusClass(
                      complaint.status
                    )}`}
                  >
                    {formatStatus(
                      complaint.status
                    )}
                  </span>

                  <span className="complaint-date">
                    {formatDate(
                      complaint.created_at
                    )}
                  </span>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h3>Department workload</h3>
              <p>
                Current active complaints
              </p>
            </div>
          </div>

          <div className="department-list">
            {departmentWorkload.length === 0 ? (
              <div className="dashboard-empty">
                No active departments found.
              </div>
            ) : (
              departmentWorkload.map(
                (department) => (
                  <div
                    className="department-item"
                    key={department.id}
                  >
                    <div className="department-heading">
                      <span>
                        {department.name}
                      </span>

                      <strong>
                        {department.complaints}
                      </strong>
                    </div>

                    <div className="department-bar">
                      <div
                        className="department-bar-fill"
                        style={{
                          width: `${department.progress}%`,
                        }}
                      />
                    </div>

                    <div className="department-meta">
                      <span>
                        Resolution progress
                      </span>

                      <span>
                        {department.progress}%
                      </span>
                    </div>

                    <div className="department-meta">
                      <span>
                        {department.staffMembers} staff
                      </span>

                      <span>
                        {department.code || ""}
                      </span>
                    </div>
                  </div>
                )
              )
            )}
          </div>

          <button
            className="department-link"
            onClick={() =>
              onNavigate("departments")
            }
          >
            Manage departments
            <ArrowRight size={15} />
          </button>
        </section>
      </div>

      <section className="dashboard-bottom-grid">
        <div className="dashboard-mini-card">
          <div className="mini-card-icon">
            <Users size={19} />
          </div>

          <div>
            <span>Active citizens</span>
            <strong>{activeCitizens}</strong>
            <small>registered users</small>
          </div>
        </div>

        <div className="dashboard-mini-card">
          <div className="mini-card-icon">
            <MapPin size={19} />
          </div>

          <div>
            <span>Active wards</span>
            <strong>{activeWards}</strong>
            <small>currently monitored</small>
          </div>
        </div>

        <div className="dashboard-mini-card">
          <div className="mini-card-icon">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>Resolution rate</span>
            <strong>{resolutionRate}%</strong>
            <small>overall rate</small>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;