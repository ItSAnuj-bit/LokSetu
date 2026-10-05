import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  Search,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { apiRequest } from "../api";


function StatusBadge({ type, children }) {
  return (
    <span className={`report-status ${type}`}>

      {type === "progress" && (
        <Clock3 size={13} />
      )}

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


function normalizeStatus(status) {
  if (!status) {
    return "Submitted";
  }

  if (status === "pending") {
    return "Submitted";
  }

  if (status === "assigned") {
    return "In progress";
  }

  if (status === "in_progress") {
    return "In progress";
  }

  if (status === "resolved") {
    return "Resolved";
  }

  if (status === "rejected") {
    return "Rejected";
  }

  return status;
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


function formatDate(value) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


function formatLocation(location) {
  if (!location) {
    return "Ward 7, Safidon";
  }

  if (typeof location === "string") {
    return location;
  }

  return (
    location.address ||
    location.landmark ||
    "Location selected"
  );
}


/*
 * Backend evidence URLs are stored like:
 *
 * /uploads/example.jpg
 *
 * This helper converts them into:
 *
 * http://127.0.0.1:8000/uploads/example.jpg
 */
function getEvidenceUrl(url) {
  if (!url) {
    return "";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  return `http://127.0.0.1:8000${
    url.startsWith("/") ? "" : "/"
  }${url}`;
}


function MyReports({
  onBack,
  onReport,
}) {

  const [reports, setReports] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [selectedReportId, setSelectedReportId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {

    let mounted = true;

    async function loadReports() {

      try {

        setLoading(true);
        setError("");

        const response =
          await apiRequest(
            "/complaints/my"
          );

        if (!mounted) {
          return;
        }

        const complaints =
          Array.isArray(
            response?.complaints
          )
            ? response.complaints
            : [];

        const normalizedReports =
          complaints.map(
            (complaint) => ({

              id:
                complaint.complaint_id ||
                complaint.id,

              title:
                complaint.title ||
                "Civic issue",

              category:
                complaint.category ||
                "Other",

              status:
                normalizeStatus(
                  complaint.status
                ),

              date:
                formatDate(
                  complaint.created_at
                ),

              location:
                formatLocation(
                  complaint.location
                ),

              description:
                complaint.description ||
                "No additional description provided.",

              landmark:
                complaint.location?.landmark ||
                "",

              coordinates:
                complaint.location
                  ? {
                      latitude:
                        complaint.location
                          .latitude,

                      longitude:
                        complaint.location
                          .longitude,
                    }
                  : null,

              priority:
                complaint.priority ||
                "medium",

              rawStatus:
                complaint.status,

              createdAt:
                complaint.created_at,

              updatedAt:
                complaint.updated_at,

            })
          );

        setReports(
          normalizedReports
        );

        if (
          normalizedReports.length > 0
        ) {

          setSelectedReportId(
            normalizedReports[0].id
          );

        } else {

          setSelectedReportId(null);

        }

      } catch (err) {

        if (!mounted) {
          return;
        }

        console.error(
          "Could not load reports:",
          err
        );

        setError(
          err.message ||
          "Unable to load your reports."
        );

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }
    }

    loadReports();

    return () => {
      mounted = false;
    };

  }, []);


  const selectedReport =
    reports.find(
      (report) =>
        report.id ===
        selectedReportId
    ) || reports[0];


  const [
    selectedReportDetails,
    setSelectedReportDetails,
  ] = useState(null);


  const [
    detailsLoading,
    setDetailsLoading,
  ] = useState(false);


  const [
    detailsError,
    setDetailsError,
  ] = useState("");


  useEffect(() => {

    if (!selectedReportId) {

      setSelectedReportDetails(null);

      return;
    }

    const loadReportDetails =
      async () => {

        setDetailsLoading(true);
        setDetailsError("");

        try {

          const response =
            await apiRequest(
              `/complaints/${selectedReportId}`
            );

          setSelectedReportDetails(
            response?.complaint ||
            response?.data ||
            null
          );

        } catch (error) {

          console.error(
            "Failed to load complaint details:",
            error
          );

          setDetailsError(
            error.message ||
            "Unable to load report details."
          );

        } finally {

          setDetailsLoading(false);

        }
      };

    loadReportDetails();

  }, [selectedReportId]);


  const filteredReports =
    useMemo(() => {

      const query =
        search.trim().toLowerCase();

      if (!query) {
        return reports;
      }

      return reports.filter(
        (report) =>
          `${report.title} ${report.category} ${report.id} ${report.location}`
            .toLowerCase()
            .includes(query)
      );

    }, [reports, search]);


  const totalReports =
    reports.length;


  const inProgress =
    reports.filter(
      (report) =>
        report.status ===
        "In progress"
    ).length;


  const resolved =
    reports.filter(
      (report) =>
        report.status ===
        "Resolved"
    ).length;


  const handleRetry = () => {
    window.location.reload();
  };


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

                <strong>
                  {totalReports}
                </strong>

                <span>
                  Total reports
                </span>

              </div>


              <div>

                <strong>
                  {inProgress}
                </strong>

                <span>
                  In progress
                </span>

              </div>


              <div>

                <strong>
                  {resolved}
                </strong>

                <span>
                  Resolved
                </span>

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
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search reports"
              />

            </div>


            <span className="reports-count">

              {filteredReports.length}{" "}

              {filteredReports.length === 1
                ? "report"
                : "reports"}

            </span>

          </div>


          {loading && (

            <div className="no-reports">

              <FileText size={24} />

              <strong>
                Loading your reports...
              </strong>

              <span>
                Getting your latest submissions.
              </span>

            </div>

          )}


          {!loading && error && (

            <div className="no-reports">

              <FileText size={24} />

              <strong>
                Could not load reports
              </strong>

              <span>
                {error}
              </span>

              <button
                type="button"
                className="button-primary"
                onClick={handleRetry}
              >
                Try again
              </button>

            </div>

          )}


          {!loading &&
            !error &&
            reports.length === 0 && (

              <div className="no-reports">

                <FileText size={24} />

                <strong>
                  You haven't submitted any reports yet
                </strong>

                <span>
                  Report a civic issue and track it here.
                </span>

                <button
                  type="button"
                  className="button-primary"
                  onClick={onReport}
                >
                  Report a problem
                  <ArrowRight size={15} />
                </button>

              </div>

            )}


          {!loading &&
            !error &&
            reports.length > 0 && (

              <>
  <div className="reports-layout">

                  <div className="reports-list">

                    {filteredReports.map(
                      (report) => {

                        const selected =
                          selectedReport?.id ===
                          report.id;

                        const statusType =
                          getStatusType(
                            report.status
                          );

                        return (

                          <button
                            type="button"
                            className={`report-list-card ${
                              selected
                                ? "selected"
                                : ""
                            }`}
                            key={report.id}
                            onClick={() =>
                              setSelectedReportId(
                                report.id
                              )
                            }
                          >

                            <div className="report-list-top">

                              <span>
                                {report.id}
                              </span>

                              <StatusBadge
                                type={statusType}
                              >
                                {report.status}
                              </StatusBadge>

                            </div>


                            <h2>
                              {report.title}
                            </h2>


                            <p>
                              {report.description}
                            </p>


                            <div className="report-list-meta">

                              <span>

                                <MapPin
                                  size={13}
                                />

                                {report.location}

                              </span>


                              <span>

                                <Clock3
                                  size={13}
                                />

                                {report.date}

                              </span>

                            </div>


                            <div className="report-list-bottom">

                              <span>
                                {report.category}
                              </span>

                              <ChevronRight
                                size={15}
                              />

                            </div>

                          </button>

                        );

                      }
                    )}


                    {filteredReports.length ===
                      0 && (

                      <div className="no-reports">

                        <FileText
                          size={24}
                        />

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


                      {/* ==================================================
                          EVIDENCE SECTION
                      ================================================== */}

                      <div className="report-evidence">

                        <div className="report-evidence-header">

                          <div>

                            <span className="section-overline">
                              EVIDENCE
                            </span>

                            <h3>
                              Attached evidence
                            </h3>

                          </div>

                        </div>


                        {detailsLoading && (

                          <div className="evidence-empty">

                            <FileText
                              size={20}
                            />

                            <span>
                              Loading evidence...
                            </span>

                          </div>

                        )}


                        {!detailsLoading &&
                          detailsError && (

                            <div className="evidence-empty">

                              <FileText
                                size={20}
                              />

                              <span>
                                {detailsError}
                              </span>

                            </div>

                          )}


                        {!detailsLoading &&
                          !detailsError &&
                          selectedReportDetails &&
                          (
                            !Array.isArray(
                              selectedReportDetails.evidence
                            ) ||
                            selectedReportDetails.evidence.length === 0
                          ) && (

                            <div className="evidence-empty">

                              <FileText
                                size={20}
                              />

                              <span>
                                No evidence uploaded
                                for this report.
                              </span>

                            </div>

                          )}


                        {!detailsLoading &&
                          !detailsError &&
                          Array.isArray(
                            selectedReportDetails?.evidence
                          ) &&
                          selectedReportDetails.evidence.length > 0 && (

                            <div className="evidence-list">

                              {selectedReportDetails.evidence.map(
                                (evidence, index) => {

                                  const evidenceUrl =
                                    getEvidenceUrl(
                                      evidence.url
                                    );

                                  const evidenceType =
                                    evidence.type ||
                                    "file";

                                  const evidenceName =
                                    evidence.original_name ||
                                    `Evidence ${index + 1}`;


                                  return (

                                    <div
                                      className="evidence-item"
                                      key={`${evidenceUrl}-${index}`}
                                    >

                                      {/* PHOTO */}

                                      {evidenceType ===
                                        "photo" && (

                                        <div className="evidence-photo">

                                          <img
                                            src={evidenceUrl}
                                            alt={evidenceName}
                                          />


                                          <div className="evidence-photo-info">

                                            <ImageIcon
                                              size={16}
                                            />

                                            <span>
                                              {evidenceName}
                                            </span>

                                          </div>

                                        </div>

                                      )}


                                      {/* VOICE */}

                                      {evidenceType ===
                                        "voice" && (

                                        <div className="evidence-audio">

                                          <div className="evidence-file-icon">

                                            <MessageSquare
                                              size={18}
                                            />

                                          </div>


                                          <div className="evidence-file-content">

                                            <strong>
                                              {evidenceName}
                                            </strong>

                                            <audio
                                              controls
                                              src={evidenceUrl}
                                            />

                                          </div>

                                        </div>

                                      )}


                                      {/* OTHER FILE */}

                                      {evidenceType ===
                                        "file" && (

                                        <div className="evidence-file">

                                          <div className="evidence-file-icon">

                                            <FileText
                                              size={18}
                                            />

                                          </div>


                                          <div className="evidence-file-content">

                                            <strong>
                                              {evidenceName}
                                            </strong>

                                            <span>
                                              {evidence.content_type ||
                                                "File"}
                                            </span>

                                          </div>


                                          <a
                                            href={evidenceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="evidence-download"
                                            title="Open file"
                                          >
                                            <Download
                                              size={16}
                                            />
                                          </a>

                                        </div>

                                      )}

                                    </div>

                                  );

                                }
                              )}

                            </div>

                          )}

                      </div>


                      <div className="timeline">
                        <div className="timeline-item completed">

                          <div className="timeline-dot">

                            <CheckCircle2
                              size={17}
                            />

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


                        {selectedReport.rawStatus ===
                          "pending" && (

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


                        {(selectedReport.rawStatus ===
                          "assigned" ||
                          selectedReport.rawStatus ===
                            "in_progress" ||
                          selectedReport.rawStatus ===
                            "resolved") && (

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
                                    Updated
                                  </span>

                                </div>


                                <p>
                                  The report has been
                                  forwarded to the
                                  responsible department.
                                </p>

                              </div>

                            </div>

                          </>

                        )}


                        {(selectedReport.rawStatus ===
                          "in_progress" ||
                          selectedReport.rawStatus ===
                            "resolved") && (

                          <div
                            className={`timeline-item ${
                              selectedReport.rawStatus ===
                              "in_progress"
                                ? "current"
                                : "completed"
                            }`}
                          >

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
                                  {selectedReport.rawStatus ===
                                  "in_progress"
                                    ? "Current"
                                    : "Completed"}
                                </span>

                              </div>


                              <p>
                                The responsible team is
                                currently working on the
                                issue.
                              </p>

                            </div>

                          </div>

                        )}


                        {selectedReport.rawStatus ===
                          "resolved" && (

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

                        )}


                        {selectedReport.rawStatus ===
                          "rejected" && (

                          <div className="timeline-item current">

                            <div className="timeline-dot">

                              <FileText
                                size={17}
                              />

                            </div>


                            <div className="timeline-copy">

                              <div className="timeline-title">

                                <strong>
                                  Report rejected
                                </strong>

                                <span>
                                  Closed
                                </span>

                              </div>


                              <p>
                                This report has been
                                marked as rejected by
                                the responsible authority.
                              </p>

                            </div>

                          </div>

                        )}

                      </div>


                      <div className="detail-help">

                        <div className="detail-help-icon">

                          <MessageSquare
                            size={17}
                          />

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

              </>
            )}

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