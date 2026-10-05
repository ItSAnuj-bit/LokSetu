import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock3,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  MapPin,
  Mic,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { apiRequest } from "../api";

const API_BASE_URL = "http://127.0.0.1:8000";

function getEvidenceUrl(url) {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function formatStatus(status) {
  if (!status) return "Assigned";

  return String(status)
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusClass(status) {
  const normalized = String(status || "")
    .toLowerCase()
    .replace(/[_-]/g, " ");

  if (
    normalized.includes("completed") ||
    normalized.includes("resolved") ||
    normalized.includes("closed")
  ) {
    return "status-completed";
  }

  if (
    normalized.includes("progress") ||
    normalized.includes("working")
  ) {
    return "status-progress";
  }

  return "status-pending";
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getLocationAddress(location) {
  if (!location) return "Location not provided";

  if (typeof location === "string") {
    return location;
  }

  return (
    location.address ||
    location.landmark ||
    "Location not provided"
  );
}

function getCoordinates(location) {
  if (!location || typeof location === "string") {
    return null;
  }

  if (
    typeof location.latitude === "number" &&
    typeof location.longitude === "number"
  ) {
    return {
      latitude: location.latitude,
      longitude: location.longitude,
    };
  }

  return null;
}

function TaskDetails({
  complaintId,
  initialTask,
  onBack,
  onUpdateStatus,
}) {
  const [task, setTask] = useState(initialTask || null);
  const [loading, setLoading] = useState(!initialTask);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadTask = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await apiRequest(
        `/worker/tasks/${complaintId}`
      );

      const taskData =
        response?.task ||
        response?.complaint ||
        response?.data?.task ||
        response?.data?.complaint ||
        response?.data ||
        null;

      if (!taskData) {
        throw new Error("Task details were not returned.");
      }

      setTask(taskData);
    } catch (error) {
      console.error(
        "Failed to load worker task details:",
        error
      );

      setError(
        error.message ||
          "Unable to load the task details."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (complaintId) {
      loadTask(Boolean(initialTask));
    }
  }, [complaintId]);

  if (loading) {
    return (
      <main className="worker-page">
        <div className="worker-page-container">
          <div className="worker-loading-card">
            <div className="worker-loading-spinner">
              <LoaderCircle size={22} />
            </div>

            <strong>Loading task...</strong>

            <p>
              Fetching the latest complaint details.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !task) {
    return (
      <main className="worker-page">
        <div className="worker-page-container">
          <button
            type="button"
            className="worker-back-button"
            onClick={onBack}
          >
            <ArrowLeft size={16} />
            Assigned tasks
          </button>

          <div className="worker-page-error worker-detail-error">
            <div>
              <AlertCircle size={19} />
            </div>

            <section>
              <strong>Unable to load task</strong>

              <p>{error}</p>

              <button
                type="button"
                onClick={() => loadTask(true)}
              >
                Try again
              </button>
            </section>
          </div>
        </div>
      </main>
    );
  }

  const status =
    task?.status ||
    task?.complaint_status ||
    "Assigned";

  const category =
    task?.category ||
    task?.ai_analysis?.category ||
    "Other";

  const priority =
    task?.priority ||
    task?.ai_analysis?.priority ||
    "Medium";

  const title =
    task?.title ||
    "Civic complaint";

  const description =
    task?.description ||
    "No description provided.";

  const location =
    task?.location ||
    task?.complaint_location ||
    null;

  const coordinates = getCoordinates(location);

  const evidence = Array.isArray(task?.evidence)
    ? task.evidence
    : [];

  const activity = Array.isArray(task?.activity)
    ? task.activity
    : Array.isArray(task?.activities)
      ? task.activities
      : [];

  const aiAnalysis =
    task?.ai_analysis ||
    task?.aiAnalysis ||
    null;

  return (
    <main className="worker-page">
      <div className="worker-page-container worker-detail-container">
        <div className="worker-detail-topbar">
          <button
            type="button"
            className="worker-back-button"
            onClick={onBack}
          >
            <ArrowLeft size={16} />
            Assigned tasks
          </button>

          <button
            type="button"
            className="worker-refresh-button"
            onClick={() => loadTask(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={15}
              className={refreshing ? "worker-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="worker-page-error worker-detail-warning">
            <div>
              <AlertCircle size={18} />
            </div>

            <section>
              <strong>Some details could not be refreshed</strong>
              <p>{error}</p>
            </section>
          </div>
        )}

        <section className="worker-detail-hero">
          <div>
            <div className="worker-detail-id-row">
              <span className="worker-task-id">
                {task?.complaint_id || complaintId}
              </span>

              <span
                className={`worker-status ${getStatusClass(
                  status
                )}`}
              >
                {formatStatus(status)}
              </span>
            </div>

            <h1>{title}</h1>

            <p className="worker-detail-category">
              {category}
            </p>
          </div>

          <div className="worker-detail-priority">
            <small>PRIORITY</small>

            <strong>{formatStatus(priority)}</strong>
          </div>
        </section>

        <div className="worker-detail-grid">
          <div className="worker-detail-main">
            <section className="worker-detail-card">
              <div className="worker-detail-card-heading">
                <div className="worker-detail-card-icon">
                  <FileText size={17} />
                </div>

                <div>
                  <span>COMPLAINT</span>
                  <h2>Problem description</h2>
                </div>
              </div>

              <p className="worker-description">
                {description}
              </p>
            </section>

            <section className="worker-detail-card">
              <div className="worker-detail-card-heading">
                <div className="worker-detail-card-icon">
                  <MapPin size={17} />
                </div>

                <div>
                  <span>LOCATION</span>
                  <h2>Where the issue was reported</h2>
                </div>
              </div>

              <div className="worker-location-box">
                <MapPin size={19} />

                <div>
                  <strong>
                    {getLocationAddress(location)}
                  </strong>

                  {location?.landmark && (
                    <span>
                      Landmark: {location.landmark}
                    </span>
                  )}

                  {coordinates && (
                    <span>
                      GPS: {coordinates.latitude.toFixed(6)},{" "}
                      {coordinates.longitude.toFixed(6)}
                    </span>
                  )}
                </div>
              </div>

              {coordinates && (
                <a
                  className="worker-map-link"
                  href={`https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open location in Maps
                  <ArrowLeft
                    size={14}
                    style={{ transform: "rotate(180deg)" }}
                  />
                </a>
              )}
            </section>

            {aiAnalysis && (
              <section className="worker-detail-card">
                <div className="worker-detail-card-heading">
                  <div className="worker-detail-card-icon">
                    <Wrench size={17} />
                  </div>

                  <div>
                    <span>AI ASSESSMENT</span>
                    <h2>Suggested field information</h2>
                  </div>
                </div>

                <div className="worker-ai-grid">
                  {aiAnalysis.incident_type && (
                    <div>
                      <small>INCIDENT TYPE</small>
                      <strong>
                        {formatStatus(
                          aiAnalysis.incident_type
                        )}
                      </strong>
                    </div>
                  )}

                  {aiAnalysis.severity && (
                    <div>
                      <small>SEVERITY</small>
                      <strong>
                        {formatStatus(aiAnalysis.severity)}
                      </strong>
                    </div>
                  )}

                  {aiAnalysis.affected_area && (
                    <div>
                      <small>AFFECTED AREA</small>
                      <strong>
                        {aiAnalysis.affected_area}
                      </strong>
                    </div>
                  )}

                  {aiAnalysis.required_work && (
                    <div>
                      <small>REQUIRED WORK</small>
                      <strong>
                        {aiAnalysis.required_work}
                      </strong>
                    </div>
                  )}

                  {aiAnalysis.required_skills && (
                    <div>
                      <small>REQUIRED SKILLS</small>
                      <strong>
                        {aiAnalysis.required_skills}
                      </strong>
                    </div>
                  )}

                  {aiAnalysis.estimated_cost && (
                    <div>
                      <small>ESTIMATED COST</small>
                      <strong>
                        {aiAnalysis.estimated_cost}
                      </strong>
                    </div>
                  )}
                </div>

                {aiAnalysis.temporary_solution && (
                  <div className="worker-temporary-solution">
                    <small>SHORT-TERM GUIDANCE</small>

                    <p>
                      {aiAnalysis.temporary_solution}
                    </p>
                  </div>
                )}
              </section>
            )}

            <section className="worker-detail-card">
              <div className="worker-detail-card-heading">
                <div className="worker-detail-card-icon">
                  <ImageIcon size={17} />
                </div>

                <div>
                  <span>EVIDENCE</span>
                  <h2>Citizen attachments</h2>
                </div>
              </div>

              {evidence.length === 0 ? (
                <div className="worker-detail-empty">
                  <FileText size={19} />
                  <span>No evidence attached.</span>
                </div>
              ) : (
                <div className="worker-evidence-grid">
                  {evidence.map((item, index) => {
                    const url = getEvidenceUrl(
                      item?.url
                    );

                    const type =
                      item?.type ||
                      item?.evidence_type ||
                      "file";

                    if (type === "photo" && url) {
                      return (
                        <a
                          className="worker-evidence-photo"
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          key={`${url}-${index}`}
                        >
                          <img
                            src={url}
                            alt={
                              item?.original_name ||
                              "Complaint evidence"
                            }
                          />
                        </a>
                      );
                    }

                    if (type === "voice" && url) {
                      return (
                        <div
                          className="worker-evidence-audio"
                          key={`${url}-${index}`}
                        >
                          <Mic size={17} />

                          <div>
                            <strong>
                              {item?.original_name ||
                                "Voice note"}
                            </strong>

                            <audio
                              controls
                              src={url}
                            />
                          </div>
                        </div>
                      );
                    }

                    return (
                      <a
                        className="worker-evidence-file"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        key={`${url}-${index}`}
                      >
                        <FileText size={18} />

                        <div>
                          <strong>
                            {item?.original_name ||
                              "Attached file"}
                          </strong>

                          <span>
                            Open attachment
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="worker-detail-card">
              <div className="worker-detail-card-heading">
                <div className="worker-detail-card-icon">
                  <Clock3 size={17} />
                </div>

                <div>
                  <span>ACTIVITY</span>
                  <h2>Task history</h2>
                </div>
              </div>

              {activity.length === 0 ? (
                <div className="worker-detail-empty">
                  <Clock3 size={19} />
                  <span>No activity recorded yet.</span>
                </div>
              ) : (
                <div className="worker-activity-list">
                  {activity.map((item, index) => (
                    <div
                      className="worker-activity-item"
                      key={
                        item?.id ||
                        item?._id ||
                        `${item?.created_at}-${index}`
                      }
                    >
                      <div className="worker-activity-dot">
                        <CheckCircle2 size={13} />
                      </div>

                      <div>
                        <strong>
                          {formatStatus(
                            item?.action ||
                              item?.status ||
                              "Update"
                          )}
                        </strong>

                        <p>
                          {item?.description ||
                            item?.message ||
                            "Task activity recorded."}
                        </p>

                        <small>
                          {formatDate(
                            item?.created_at ||
                              item?.updated_at
                          )}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="worker-detail-sidebar">
            <section className="worker-detail-card worker-action-card">
              <div className="worker-detail-card-heading">
                <div className="worker-detail-card-icon">
                  <Wrench size={17} />
                </div>

                <div>
                  <span>FIELD ACTION</span>
                  <h2>Manage task</h2>
                </div>
              </div>

              <p>
                Update the task status as work progresses.
              </p>

              <button
                type="button"
                className="worker-primary-action"
                onClick={() =>
                  onUpdateStatus?.(complaintId, task)
                }
              >
                Update status
                <ArrowLeft
                  size={15}
                  style={{ transform: "rotate(180deg)" }}
                />
              </button>
            </section>

            <section className="worker-detail-card">
              <div className="worker-info-row">
                <span>Assigned</span>

                <strong>
                  {formatDate(
                    task?.assigned_at ||
                      task?.updated_at
                  )}
                </strong>
              </div>

              <div className="worker-info-row">
                <span>Category</span>
                <strong>{category}</strong>
              </div>

              <div className="worker-info-row">
                <span>Status</span>
                <strong>{formatStatus(status)}</strong>
              </div>

              <div className="worker-info-row">
                <span>Priority</span>
                <strong>{formatStatus(priority)}</strong>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default TaskDetails;