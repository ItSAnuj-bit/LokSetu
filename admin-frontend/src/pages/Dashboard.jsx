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

const stats = [
  {
    label: "Total complaints",
    value: "248",
    change: "+12%",
    description: "vs last month",
    icon: FileText,
  },
  {
    label: "Pending",
    value: "42",
    change: "+5",
    description: "need attention",
    icon: Clock3,
  },
  {
    label: "In progress",
    value: "71",
    change: "+8%",
    description: "currently assigned",
    icon: TrendingUp,
  },
  {
    label: "Resolved",
    value: "135",
    change: "+16%",
    description: "this month",
    icon: CheckCircle2,
  },
];

const recentComplaints = [
  {
    id: "LS-2026-00184",
    title: "Streetlight not working",
    category: "Streetlight",
    location: "Ward 7, Safidon",
    status: "In progress",
    date: "18 Sep 2026",
  },
  {
    id: "LS-2026-00182",
    title: "Garbage collection missed",
    category: "Waste",
    location: "Ward 5, Safidon",
    status: "Pending",
    date: "18 Sep 2026",
  },
  {
    id: "LS-2026-00179",
    title: "Road pothole",
    category: "Roads",
    location: "Ward 3, Safidon",
    status: "Resolved",
    date: "17 Sep 2026",
  },
  {
    id: "LS-2026-00176",
    title: "Water supply issue",
    category: "Water",
    location: "Ward 9, Safidon",
    status: "In progress",
    date: "17 Sep 2026",
  },
];

const departments = [
  {
    name: "Public Works",
    complaints: 38,
    progress: 72,
  },
  {
    name: "Water Supply",
    complaints: 24,
    progress: 58,
  },
  {
    name: "Sanitation",
    complaints: 19,
    progress: 81,
  },
  {
    name: "Electricity",
    complaints: 16,
    progress: 64,
  },
];

function getStatusClass(status) {
  if (status === "Resolved") {
    return "status-resolved";
  }

  if (status === "In progress") {
    return "status-progress";
  }

  return "status-pending";
}

function Dashboard({ onNavigate }) {
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
            <div className="stat-card" key={stat.label}>
              <div className="stat-card-top">
                <div className="stat-icon">
                  <Icon size={19} />
                </div>

                <span className="stat-change">
                  {stat.change}
                </span>
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
              <p>Latest reports submitted by citizens</p>
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
            {recentComplaints.map((complaint) => (
              <button
                className="complaint-row"
                key={complaint.id}
                onClick={() => onNavigate("complaints")}
              >
                <div className="complaint-main">
                  <div className="complaint-icon">
                    <AlertCircle size={17} />
                  </div>

                  <div className="complaint-info">
                    <strong>{complaint.title}</strong>

                    <span>
                      {complaint.id} · {complaint.category}
                    </span>
                  </div>
                </div>

                <div className="complaint-location">
                  <MapPin size={14} />
                  {complaint.location}
                </div>

                <span
                  className={`complaint-status ${getStatusClass(
                    complaint.status
                  )}`}
                >
                  {complaint.status}
                </span>

                <span className="complaint-date">
                  {complaint.date}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h3>Department workload</h3>
              <p>Current active complaints</p>
            </div>
          </div>

          <div className="department-list">
            {departments.map((department) => (
              <div
                className="department-item"
                key={department.name}
              >
                <div className="department-heading">
                  <span>{department.name}</span>
                  <strong>{department.complaints}</strong>
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
                  <span>Resolution progress</span>
                  <span>{department.progress}%</span>
                </div>
              </div>
            ))}
          </div>

          <button
            className="department-link"
            onClick={() => onNavigate("departments")}
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
            <strong>1,284</strong>
            <small>registered users</small>
          </div>
        </div>

        <div className="dashboard-mini-card">
          <div className="mini-card-icon">
            <MapPin size={19} />
          </div>

          <div>
            <span>Active wards</span>
            <strong>12</strong>
            <small>currently monitored</small>
          </div>
        </div>

        <div className="dashboard-mini-card">
          <div className="mini-card-icon">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>Resolution rate</span>
            <strong>82%</strong>
            <small>this month</small>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;