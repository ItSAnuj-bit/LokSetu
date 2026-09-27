import {
  Building2,
  Users,
  ClipboardList,
  CheckCircle2,
  ArrowUpRight,
  Search,
} from "lucide-react";

const departments = [
  {
    name: "Public Works",
    code: "PWD",
    description: "Roads, drainage and public infrastructure",
    complaints: 38,
    pending: 9,
    inProgress: 18,
    resolved: 11,
    staff: 24,
    progress: 72,
  },
  {
    name: "Water Supply",
    code: "WSD",
    description: "Water pipelines and public water supply",
    complaints: 24,
    pending: 6,
    inProgress: 10,
    resolved: 8,
    staff: 16,
    progress: 58,
  },
  {
    name: "Sanitation",
    code: "SAN",
    description: "Waste collection and sanitation services",
    complaints: 19,
    pending: 3,
    inProgress: 5,
    resolved: 11,
    staff: 31,
    progress: 81,
  },
  {
    name: "Electricity",
    code: "ELEC",
    description: "Streetlights and electrical infrastructure",
    complaints: 16,
    pending: 4,
    inProgress: 7,
    resolved: 5,
    staff: 19,
    progress: 64,
  },
];

function Departments() {
  return (
    <div className="departments-page">
      <div className="departments-heading">
        <div>
          <h2>Departments</h2>
          <p>
            Monitor departmental workload and complaint
            resolution.
          </p>
        </div>

        <div className="departments-summary">
          <strong>4</strong>
          <span>Active departments</span>
        </div>
      </div>

      <div className="departments-toolbar">
        <div className="departments-search">
          <Search size={16} />

          <input
            type="text"
            placeholder="Search departments..."
          />
        </div>
      </div>

      <div className="department-stats">
        <div className="department-stat-card">
          <div className="department-stat-icon">
            <Building2 size={18} />
          </div>

          <div>
            <span>Departments</span>
            <strong>4</strong>
          </div>
        </div>

        <div className="department-stat-card">
          <div className="department-stat-icon">
            <ClipboardList size={18} />
          </div>

          <div>
            <span>Active complaints</span>
            <strong>97</strong>
          </div>
        </div>

        <div className="department-stat-card">
          <div className="department-stat-icon">
            <Users size={18} />
          </div>

          <div>
            <span>Staff members</span>
            <strong>90</strong>
          </div>
        </div>

        <div className="department-stat-card">
          <div className="department-stat-icon">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <span>Average resolution</span>
            <strong>69%</strong>
          </div>
        </div>
      </div>

      <div className="departments-grid">
        {departments.map((department) => (
          <article
            className="department-management-card"
            key={department.code}
          >
            <div className="department-card-top">
              <div className="department-large-icon">
                <Building2 size={20} />
              </div>

              <span className="department-code">
                {department.code}
              </span>
            </div>

            <h3>{department.name}</h3>

            <p>{department.description}</p>

            <div className="department-workload">
              <div>
                <span>Active workload</span>
                <strong>
                  {department.complaints}
                </strong>
              </div>

              <span className="department-progress-text">
                {department.progress}%
              </span>
            </div>

            <div className="department-progress-track">
              <div
                className="department-progress-fill"
                style={{
                  width: `${department.progress}%`,
                }}
              />
            </div>

            <div className="department-breakdown">
              <div>
                <span>Pending</span>
                <strong>{department.pending}</strong>
              </div>

              <div>
                <span>In progress</span>
                <strong>
                  {department.inProgress}
                </strong>
              </div>

              <div>
                <span>Resolved</span>
                <strong>{department.resolved}</strong>
              </div>
            </div>

            <div className="department-card-footer">
              <div className="department-staff">
                <Users size={14} />
                <span>
                  {department.staff} staff members
                </span>
              </div>

              <button className="department-view-button">
                View
                <ArrowUpRight size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Departments;