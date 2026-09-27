import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  MapPin,
  MessageSquare,
  Search,
} from "lucide-react";

import { useState } from "react";

function StatusBadge({ type, children }) {
  return (
    <span className={`report-status ${type}`}>
      {type === "progress" && <Clock3 size={13} />}
      {type === "resolved" && (
        <CheckCircle2 size={13} />
      )}
      {type === "submitted" && (
        <FileText size={13} />
      )}

      {children}
    </span>
  );
}

function getStatusType(status) {
  if (status === "Resolved") {
    return "resolved";
  }

  if (status === "In progress") {
    return "progress";
  }

  return "submitted";
}

function MyReports({
  onBack,
  onReport,
  reports,
}) {
  const [search, setSearch] = useState("");

  const [selectedReportId, setSelectedReportId] =
    useState(reports[0]?.id);

  const selectedReport =
    reports.find(
      (report) =>
        report.id === selectedReportId
    ) || reports[0];

  const filteredReports = reports.filter(
    (report) =>
      `${report.title} ${report.category} ${report.id} ${report.location}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const totalReports = reports.length;

  const inProgress = reports.filter(
    (report) => report.status === "In progress"
  ).length;

  const resolved = reports.filter(
    (report) => report.status === "Resolved"
  ).length;

  return (
    <div className="my-reports-page">
      <main>
        <section className="reports-intro">
          <div className="reports-intro-inner">
            <span className="section-overline">
              MY REPORTS
            </span>

            <h1>
              Keep track of what you reported.
            </h1>

            <p>
              Follow the progress of your civic
              reports and see when action is taken.
            </p>

            <div className="report-stats">
              <div>
                <strong>{totalReports}</strong>
                <span>Total reports</span>
              </div>

              <div>
                <strong>{inProgress}</strong>
                <span>In progress</span>
              </div>

              <div>
                <strong>{resolved}</strong>
                <span>Resolved</span>
              </div>
            </div>
          </div>
        </section>

        <section className="reports-section">
          <div className="reports-toolbar">
            <div className="reports-search">
              <Search size={17} />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search reports"
              />
            </div>

            <span className="reports-count">
              {filteredReports.length} reports
            </span>
          </div>

          <div className="reports-layout">
            <div className="reports-list">
              {filteredReports.map((report) => {
                const selected =
                  selectedReport?.id === report.id;

                const statusType =
                  getStatusType(report.status);

                return (
                  <button
                    className={`report-list-card ${
                      selected ? "selected" : ""
                    }`}
                    key={report.id}
                    onClick={() =>
                      setSelectedReportId(
                        report.id
                      )
                    }
                  >
                    <div className="report-list-top">
                      <span>{report.id}</span>

                      <StatusBadge
                        type={statusType}
                      >
                        {report.status}
                      </StatusBadge>
                    </div>

                    <h2>{report.title}</h2>

                    <p>{report.description}</p>

                    <div className="report-list-meta">
                      <span>
                        <MapPin size={13} />
                        {report.location}
                      </span>

                      <span>
                        <Clock3 size={13} />
                        {report.date}
                      </span>
                    </div>

                    <div className="report-list-bottom">
                      <span>
                        {report.category}
                      </span>

                      <ChevronRight size={15} />
                    </div>
                  </button>
                );
              })}

              {filteredReports.length === 0 && (
                <div className="no-reports">
                  <FileText size={24} />

                  <strong>
                    No reports found
                  </strong>

                  <span>
                    Try a different search term.
                  </span>
                </div>
              )}
            </div>

            {selectedReport && (
              <aside className="report-detail">
                <div className="detail-header">
                  <div>
                    <span className="detail-id">
                      {selectedReport.id}
                    </span>

                    <h2>
                      {selectedReport.title}
                    </h2>
                  </div>

                  <StatusBadge
                    type={getStatusType(
                      selectedReport.status
                    )}
                  >
                    {selectedReport.status}
                  </StatusBadge>
                </div>

                <div className="detail-location">
                  <MapPin size={15} />

                  <span>
                    {selectedReport.location}
                  </span>
                </div>

                <div className="timeline">
                  <div className="timeline-item completed">
                    <div className="timeline-dot">
                      <CheckCircle2 size={17} />
                    </div>

                    <div className="timeline-copy">
                      <div className="timeline-title">
                        <strong>
                          Report submitted
                        </strong>

                        <span>
                          {selectedReport.date}
                        </span>
                      </div>

                      <p>
                        Your report was received
                        by LokSetu.
                      </p>
                    </div>
                  </div>

                  {selectedReport.status ===
                    "Submitted" && (
                    <div className="timeline-item">
                      <div className="timeline-dot">
                        <span />
                      </div>

                      <div className="timeline-copy">
                        <div className="timeline-title">
                          <strong>
                            Awaiting assignment
                          </strong>

                          <span>
                            Pending
                          </span>
                        </div>

                        <p>
                          The report is waiting to
                          be assigned to the
                          responsible department.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedReport.status ===
                    "In progress" && (
                    <>
                      <div className="timeline-item completed">
                        <div className="timeline-dot">
                          <CheckCircle2
                            size={17}
                          />
                        </div>

                        <div className="timeline-copy">
                          <div className="timeline-title">
                            <strong>
                              Assigned to department
                            </strong>

                            <span>
                              Today
                            </span>
                          </div>

                          <p>
                            The report has been
                            forwarded to the
                            responsible department.
                          </p>
                        </div>
                      </div>

                      <div className="timeline-item current">
                        <div className="timeline-dot">
                          <CheckCircle2
                            size={17}
                          />
                        </div>

                        <div className="timeline-copy">
                          <div className="timeline-title">
                            <strong>
                              Work in progress
                            </strong>

                            <span>
                              Current
                            </span>
                          </div>

                          <p>
                            The responsible team is
                            currently working on the
                            issue.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedReport.status ===
                    "Resolved" && (
                    <>
                      <div className="timeline-item completed">
                        <div className="timeline-dot">
                          <CheckCircle2
                            size={17}
                          />
                        </div>

                        <div className="timeline-copy">
                          <div className="timeline-title">
                            <strong>
                              Work completed
                            </strong>

                            <span>
                              Completed
                            </span>
                          </div>

                          <p>
                            The responsible
                            department completed
                            the reported work.
                          </p>
                        </div>
                      </div>

                      <div className="timeline-item completed">
                        <div className="timeline-dot">
                          <CheckCircle2
                            size={17}
                          />
                        </div>

                        <div className="timeline-copy">
                          <div className="timeline-title">
                            <strong>
                              Resolved
                            </strong>

                            <span>
                              Completed
                            </span>
                          </div>

                          <p>
                            The issue has been
                            marked as resolved.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="detail-help">
                  <div className="detail-help-icon">
                    <MessageSquare size={17} />
                  </div>

                  <div>
                    <strong>
                      Need help with this report?
                    </strong>

                    <p>
                      Contact support if you have a
                      question about its status.
                    </p>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </section>

        <section className="reports-cta">
          <div>
            <span className="section-overline">
              SOMETHING ELSE?
            </span>

            <h2>
              Notice another problem?
            </h2>

            <p>
              Submit another report and help keep
              your area better maintained.
            </p>
          </div>

          <button onClick={onReport}>
            Report a problem
            <ArrowRight size={15} />
          </button>
        </section>
      </main>
    </div>
  );
}

export default MyReports;