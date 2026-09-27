import {
  Search,
  SlidersHorizontal,
  MapPin,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";

const complaints = [
  {
    id: "LS-2026-00184",
    title: "Streetlight not working",
    category: "Streetlight",
    location: "Ward 7, Safidon",
    status: "In progress",
    date: "18 Sep 2026",
    citizen: "Rahul Kumar",
  },
  {
    id: "LS-2026-00182",
    title: "Garbage collection missed",
    category: "Waste",
    location: "Ward 5, Safidon",
    status: "Pending",
    date: "18 Sep 2026",
    citizen: "Priya Sharma",
  },
  {
    id: "LS-2026-00179",
    title: "Large road pothole",
    category: "Roads",
    location: "Ward 3, Safidon",
    status: "Resolved",
    date: "17 Sep 2026",
    citizen: "Amit Singh",
  },
  {
    id: "LS-2026-00176",
    title: "Water supply interruption",
    category: "Water",
    location: "Ward 9, Safidon",
    status: "In progress",
    date: "17 Sep 2026",
    citizen: "Neha Verma",
  },
  {
    id: "LS-2026-00174",
    title: "Damaged streetlight pole",
    category: "Streetlight",
    location: "Ward 2, Safidon",
    status: "Pending",
    date: "16 Sep 2026",
    citizen: "Vikas Malik",
  },
  {
    id: "LS-2026-00171",
    title: "Overflowing garbage point",
    category: "Waste",
    location: "Ward 6, Safidon",
    status: "Resolved",
    date: "16 Sep 2026",
    citizen: "Sonia Devi",
  },
  {
    id: "LS-2026-00168",
    title: "Broken water pipeline",
    category: "Water",
    location: "Ward 4, Safidon",
    status: "In progress",
    date: "15 Sep 2026",
    citizen: "Deepak Kumar",
  },
  {
    id: "LS-2026-00164",
    title: "Road surface damaged",
    category: "Roads",
    location: "Ward 8, Safidon",
    status: "Resolved",
    date: "15 Sep 2026",
    citizen: "Rakesh Yadav",
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

function Complaints({ onOpenComplaint }) {
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
          <strong>248</strong>
          <span>Total complaints</span>
        </div>
      </div>

      <div className="complaints-toolbar">
        <div className="complaints-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search complaints, ID or location..."
          />
        </div>

        <button className="complaints-filter">
          <SlidersHorizontal size={16} />
          Status
          <span>All</span>
        </button>

        <button className="complaints-filter">
          Category
          <span>All</span>
        </button>

        <button className="complaints-filter">
          Date
          <CalendarDays size={15} />
        </button>
      </div>

      <div className="complaints-table-card">
        <div className="complaints-table-header">
          <div>
            <strong>All complaints</strong>
            <span>Showing 8 of 248 complaints</span>
          </div>

          <button className="table-sort">
            Latest first
          </button>
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

          {complaints.map((complaint) => (
            <button
              className="complaint-table-row"
              key={complaint.id}
              onClick={() =>
                onOpenComplaint(complaint)
              }
            >
              <div className="table-complaint">
                <div className="table-complaint-icon">
                  <ArrowUpRight size={15} />
                </div>

                <div>
                  <strong>{complaint.title}</strong>

                  <span>
                    {complaint.id} · {complaint.citizen}
                  </span>
                </div>
              </div>

              <span className="table-category">
                {complaint.category}
              </span>

              <span className="table-location">
                <MapPin size={13} />
                {complaint.location}
              </span>

              <span
                className={`complaint-status ${getStatusClass(
                  complaint.status
                )}`}
              >
                {complaint.status}
              </span>

              <span className="table-date">
                {complaint.date}
              </span>

              <span className="table-arrow">
                <ArrowUpRight size={16} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Complaints;