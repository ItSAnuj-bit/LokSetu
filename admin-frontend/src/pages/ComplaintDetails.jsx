import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  User,
  CalendarDays,
  Building2,
  AlertCircle,
} from "lucide-react";

function ComplaintDetails({
  complaint,
  onBack,
}) {
  if (!complaint) {
    return null;
  }

  return (
    <div className="complaint-details-page">
      <button
        className="details-back-button"
        onClick={onBack}
      >
        <ArrowLeft size={16} />
        Back to complaints
      </button>

      <div className="details-heading">
        <div>
          <div className="details-id">
            {complaint.id}
          </div>

          <h2>{complaint.title}</h2>

          <p>
            Submitted by {complaint.citizen} on{" "}
            {complaint.date}
          </p>
        </div>

        <span
          className={`complaint-status ${
            complaint.status === "Resolved"
              ? "status-resolved"
              : complaint.status === "In progress"
              ? "status-progress"
              : "status-pending"
          }`}
        >
          {complaint.status}
        </span>
      </div>

      <div className="details-layout">
        <div className="details-main">
          <section className="details-card">
            <div className="details-card-title">
              <FileText size={17} />
              Complaint information
            </div>

            <div className="details-description">
              <span>Description</span>

              <p>
                The reported civic issue requires attention
                from the concerned department. The citizen
                reported this issue through the LokSetu
                platform and provided the location for
                verification.
              </p>
            </div>

            <div className="details-info-grid">
              <div>
                <span>Category</span>
                <strong>{complaint.category}</strong>
              </div>

              <div>
                <span>Location</span>
                <strong>{complaint.location}</strong>
              </div>

              <div>
                <span>Submitted by</span>
                <strong>{complaint.citizen}</strong>
              </div>

              <div>
                <span>Submitted on</span>
                <strong>{complaint.date}</strong>
              </div>
            </div>
          </section>

          <section className="details-card">
            <div className="details-card-title">
              <MapPin size={17} />
              Reported location
            </div>

            <div className="details-map">
              <div className="map-grid">
                <div className="map-road map-road-one" />
                <div className="map-road map-road-two" />
                <div className="map-road map-road-three" />
              </div>

              <div className="map-marker">
                <MapPin size={18} />
              </div>

              <div className="map-location-label">
                <strong>{complaint.location}</strong>
                <span>Reported complaint location</span>
              </div>
            </div>
          </section>

          <section className="details-card">
            <div className="details-card-title">
              <Clock3 size={17} />
              Activity timeline
            </div>

            <div className="activity-timeline">
              <div className="timeline-item">
                <div className="timeline-icon completed">
                  <CheckCircle2 size={15} />
                </div>

                <div>
                  <strong>Complaint submitted</strong>
                  <span>
                    Citizen submitted the complaint
                    through LokSetu.
                  </span>
                  <small>{complaint.date}</small>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-icon completed">
                  <CheckCircle2 size={15} />
                </div>

                <div>
                  <strong>Complaint reviewed</strong>
                  <span>
                    Complaint received by the
                    administration.
                  </span>
                  <small>18 Sep 2026 · 10:30 AM</small>
                </div>
              </div>

              <div className="timeline-item">
                <div
                  className={`timeline-icon ${
                    complaint.status === "Pending"
                      ? "current"
                      : "completed"
                  }`}
                >
                  {complaint.status === "Pending" ? (
                    <Clock3 size={15} />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}
                </div>

                <div>
                  <strong>
                    {complaint.status === "Pending"
                      ? "Awaiting assignment"
                      : "Assigned to department"}
                  </strong>

                  <span>
                    {complaint.status === "Pending"
                      ? "The complaint is waiting for departmental assignment."
                      : "The complaint has been forwarded to the concerned department."}
                  </span>

                  <small>Current status</small>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="details-sidebar">
          <section className="details-card">
            <div className="details-card-title">
              <AlertCircle size={17} />
              Manage complaint
            </div>

            <label className="details-field">
              <span>Status</span>

              <select defaultValue={complaint.status}>
                <option>Pending</option>
                <option>In progress</option>
                <option>Resolved</option>
              </select>
            </label>

            <label className="details-field">
              <span>Department</span>

              <select defaultValue="Public Works">
                <option>Public Works</option>
                <option>Water Supply</option>
                <option>Sanitation</option>
                <option>Electricity</option>
              </select>
            </label>

            <button className="details-save-button">
              Save changes
            </button>
          </section>

          <section className="details-card">
            <div className="details-card-title">
              <User size={17} />
              Citizen
            </div>

            <div className="citizen-profile">
              <div className="citizen-avatar">
                {complaint.citizen
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>{complaint.citizen}</strong>
                <span>LokSetu citizen</span>
              </div>
            </div>

            <div className="citizen-meta">
              <div>
                <CalendarDays size={14} />
                Registered citizen
              </div>

              <div>
                <MapPin size={14} />
                {complaint.location}
              </div>
            </div>
          </section>

          <section className="details-card">
            <div className="details-card-title">
              <Building2 size={17} />
              Department
            </div>

            <div className="department-assignment">
              <strong>Public Works</strong>

              <span>
                Responsible department
              </span>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default ComplaintDetails;