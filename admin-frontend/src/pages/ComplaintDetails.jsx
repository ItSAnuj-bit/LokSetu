import { useEffect, useMemo, useState } from "react";

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
  Download,
  Volume2,
  LoaderCircle,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

import { apiRequest } from "../api";

const API_BASE_URL = "http://127.0.0.1:8000";

const markerIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapCenterUpdater({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    if (
      typeof latitude === "number" &&
      typeof longitude === "number"
    ) {
      map.setView([latitude, longitude], 16);
    }
  }, [map, latitude, longitude]);

  return null;
}

function ComplaintDetails({
  complaint,
  onBack,
}) {
  const [details, setDetails] = useState(null);
  const [activities, setActivities] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [workers, setWorkers] = useState([]);

  const [selectedStatus, setSelectedStatus] = useState(
    complaint.status || "pending"
  );

  const [selectedDepartment, setSelectedDepartment] =
    useState("");

  const [selectedWorker, setSelectedWorker] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (!complaint) {
      return;
    }

    let mounted = true;

    async function loadDetails() {
      try {
        setLoading(true);
        setError("");

        const [
          detailResponse,
          departmentsResponse,
          workersResponse,
        ] = await Promise.all([
          apiRequest(
            `/admin/complaints/${encodeURIComponent(
              complaint.complaint_id || complaint.id
            )}`
          ),
          apiRequest("/departments"),
          apiRequest("/admin/workers"),
        ]);

        if (!mounted) {
          return;
        }

        const loadedComplaint =
          detailResponse?.complaint ||
          detailResponse?.data ||
          complaint;

        setDetails(loadedComplaint);

        setActivities(
          detailResponse?.activity ||
            detailResponse?.activities ||
            []
        );

        setDepartments(
          departmentsResponse?.departments || []
        );

        setWorkers(
          workersResponse?.workers || []
        );

        setSelectedStatus(
          loadedComplaint?.status ||
            complaint.status ||
            "pending"
        );

        setSelectedDepartment(
          loadedComplaint?.department_id || ""
        );

        setSelectedWorker(
          loadedComplaint?.assigned_worker_id || ""
        );
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(
          err.message ||
            "Unable to load complaint details."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDetails();

    return () => {
      mounted = false;
    };
  }, [complaint]);

  const currentComplaint = details || complaint;

  const complaintId =
    currentComplaint?.complaint_id ||
    currentComplaint?.id ||
    complaint?.complaint_id ||
    complaint?.id;

  const location = currentComplaint?.location;

  const locationText = useMemo(() => {
    if (!location) {
      return "Location not available";
    }

    if (typeof location === "string") {
      return location;
    }

    return [
      location.address,
      location.area,
      location.ward,
      location.city,
      location.state,
    ]
      .filter(Boolean)
      .join(", ") || "Location not available";
  }, [location]);

  const latitude = useMemo(() => {
    const value = Number(location?.latitude);

    return Number.isFinite(value) ? value : null;
  }, [location]);

  const longitude = useMemo(() => {
    const value = Number(location?.longitude);

    return Number.isFinite(value) ? value : null;
  }, [location]);

  const departmentName = useMemo(() => {
    if (!currentComplaint?.department_id) {
      return "Not assigned";
    }

    const department = departments.find(
      (item) =>
        item.id === currentComplaint.department_id
    );

    return department?.name || "Assigned department";
  }, [
    currentComplaint,
    departments,
  ]);

  const assignedWorker = useMemo(() => {
    if (!currentComplaint?.assigned_worker_id) {
      return null;
    }

    return (
      workers.find(
        (worker) =>
          worker.id ===
          currentComplaint.assigned_worker_id
      ) || null
    );
  }, [
    currentComplaint,
    workers,
  ]);

  const evidence = useMemo(() => {
    if (
      Array.isArray(currentComplaint?.evidence)
    ) {
      return currentComplaint.evidence;
    }

    if (
      Array.isArray(currentComplaint?.photo_urls)
    ) {
      return currentComplaint.photo_urls.map(
        (url) => ({
          type: "photo",
          url,
          original_name:
            url.split("/").pop() || "Photo",
          content_type: "image/jpeg",
        })
      );
    }

    return [];
  }, [currentComplaint]);

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Pending";
    }

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "resolved":
        return "status-resolved";

      case "in_progress":
        return "status-progress";

      case "assigned":
        return "status-progress";

      case "rejected":
        return "status-rejected";

      default:
        return "status-pending";
    }
  };

  const buildEvidenceUrl = (url) => {
    if (!url) {
      return "";
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    return `${API_BASE_URL}${url}`;
  };

  const isImage = (item) => {
    if (item?.type === "photo") {
      return true;
    }

    return (
      item?.content_type?.startsWith("image/")
    );
  };

  const isAudio = (item) => {
    if (item?.type === "voice") {
      return true;
    }

    return (
      item?.content_type?.startsWith("audio/")
    );
  };

  const handleSaveChanges = async () => {
    if (!complaintId) {
      return;
    }

    try {
      setSaving(true);
      setSaveMessage("");
      setError("");

      if (
        selectedDepartment !==
          (currentComplaint?.department_id || "") ||
        selectedWorker !==
          (currentComplaint?.assigned_worker_id || "")
      ) {
        await apiRequest(
          `/admin/complaints/${encodeURIComponent(
            complaintId
          )}/assign`,
          {
            method: "PUT",
            body: JSON.stringify({
              department_id:
                selectedDepartment || null,
              worker_id:
                selectedWorker || null,
            }),
          }
        );
      }

      if (
        selectedStatus !==
        (currentComplaint?.status || "pending")
      ) {
        await apiRequest(
          `/admin/complaints/${encodeURIComponent(
            complaintId
          )}/status`,
          {
            method: "PUT",
            body: JSON.stringify({
              status: selectedStatus,
              note: "Status updated by administration.",
            }),
          }
        );
      }

      const refreshed = await apiRequest(
        `/admin/complaints/${encodeURIComponent(
          complaintId
        )}`
      );

      setDetails(
        refreshed?.complaint ||
          currentComplaint
      );

      setActivities(
        refreshed?.activity ||
          refreshed?.activities ||
          []
      );

      setSaveMessage(
        "Complaint changes saved successfully."
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to save complaint changes."
      );
    } finally {
      setSaving(false);
    }
  };

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

      {loading && (
        <div className="details-card">
          <div className="details-loading">
            <LoaderCircle
              size={20}
              className="details-loading-icon"
            />
            Loading complaint details...
          </div>
        </div>
      )}

      {error && (
        <div className="details-error">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      <div className="details-heading">
        <div>
          <div className="details-id">
            {currentComplaint.complaint_id ||
              currentComplaint.id}
          </div>

          <h2>
            {currentComplaint.title ||
              "Complaint"}
          </h2>

          <p>
            Submitted by{" "}
            {currentComplaint.citizen ||
              currentComplaint.citizen_name ||
              "Citizen"}{" "}
            on{" "}
            {formatDate(
              currentComplaint.created_at ||
                currentComplaint.date
            )}
          </p>
        </div>

        <span
          className={`complaint-status ${getStatusClass(
            currentComplaint.status
          )}`}
        >
          {formatStatus(
            currentComplaint.status
          )}
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
                {currentComplaint.description ||
                  "No description provided."}
              </p>
            </div>

            <div className="details-info-grid">
              <div>
                <span>Category</span>
                <strong>
                  {currentComplaint.category ||
                    "Other"}
                </strong>
              </div>

              <div>
                <span>Priority</span>
                <strong>
                  {formatStatus(
                    currentComplaint.priority
                  )}
                </strong>
              </div>

              <div>
                <span>Location</span>
                <strong>
                  {locationText}
                </strong>
              </div>

              <div>
                <span>Submitted on</span>
                <strong>
                  {formatDate(
                    currentComplaint.created_at
                  )}
                </strong>
              </div>
            </div>
          </section>

          <section className="details-card">
            <div className="details-card-title">
              <MapPin size={17} />
              Reported location
            </div>

            {latitude !== null &&
            longitude !== null ? (
              <div className="details-real-map">
                <MapContainer
                  center={[
                    latitude,
                    longitude,
                  ]}
                  zoom={16}
                  scrollWheelZoom={false}
                  style={{
                    height: "330px",
                    width: "100%",
                  }}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapCenterUpdater
                    latitude={latitude}
                    longitude={longitude}
                  />

                  <Marker
                    position={[
                      latitude,
                      longitude,
                    ]}
                    icon={markerIcon}
                  >
                    <Popup>
                      <strong>
                        Complaint location
                      </strong>
                      <br />
                      {locationText}
                    </Popup>
                  </Marker>
                </MapContainer>

                <div className="map-location-label">
                  <strong>
                    {locationText}
                  </strong>

                  <span>
                    {latitude.toFixed(6)},{" "}
                    {longitude.toFixed(6)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="details-map-empty">
                <MapPin size={24} />

                <strong>
                  Location coordinates unavailable
                </strong>

                <span>
                  This complaint does not contain
                  latitude and longitude data.
                </span>
              </div>
            )}
          </section>

          <section className="details-card">
            <div className="details-card-title">
              <FileText size={17} />
              Evidence
            </div>

            {evidence.length === 0 ? (
              <div className="details-empty-state">
                No evidence has been uploaded for
                this complaint.
              </div>
            ) : (
              <div className="evidence-grid">
                {evidence.map(
                  (item, index) => {
                    const evidenceUrl =
                      buildEvidenceUrl(
                        item.url
                      );

                    const evidenceName =
                      item.original_name ||
                      item.name ||
                      `Evidence ${index + 1}`;

                    if (isImage(item)) {
                      return (
                        <div
                          className="evidence-card"
                          key={
                            item.url ||
                            `${evidenceName}-${index}`
                          }
                        >
                          <div className="evidence-image-wrapper">
                            <img
                              src={evidenceUrl}
                              alt={evidenceName}
                            />
                          </div>

                          <div className="evidence-card-footer">
                            <div>
                              <strong>
                                {evidenceName}
                              </strong>

                              <span>
                                Photo evidence
                              </span>
                            </div>

                            <a
                              href={evidenceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="evidence-open-button"
                              title="Open image"
                            >
                              <Download
                                size={16}
                              />
                            </a>
                          </div>
                        </div>
                      );
                    }

                    if (isAudio(item)) {
                      return (
                        <div
                          className="evidence-file"
                          key={
                            item.url ||
                            `${evidenceName}-${index}`
                          }
                        >
                          <div className="evidence-file-icon">
                            <Volume2
                              size={18}
                            />
                          </div>

                          <div className="evidence-file-content">
                            <strong>
                              {evidenceName}
                            </strong>

                            <span>
                              Voice evidence
                            </span>

                            <audio
                              controls
                              src={evidenceUrl}
                            />
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        className="evidence-file"
                        key={
                          item.url ||
                          `${evidenceName}-${index}`
                        }
                      >
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
                            {item.content_type ||
                              "Document"}
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
                    );
                  }
                )}
              </div>
            )}
          </section>

          <section className="details-card">
            <div className="details-card-title">
              <Clock3 size={17} />
              Activity timeline
            </div>

            {activities.length === 0 ? (
              <div className="details-empty-state">
                No activity recorded yet.
              </div>
            ) : (
              <div className="activity-timeline">
                {activities.map(
                  (activity, index) => (
                    <div
                      className="timeline-item"
                      key={
                        activity.id ||
                        `${activity.action}-${index}`
                      }
                    >
                      <div className="timeline-icon completed">
                        <CheckCircle2
                          size={15}
                        />
                      </div>

                      <div>
                        <strong>
                          {formatActivityTitle(
                            activity
                          )}
                        </strong>

                        <span>
                          {activity.description ||
                            "Complaint activity recorded."}
                        </span>

                        <small>
                          {formatDate(
                            activity.created_at
                          )}
                        </small>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
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

              <select
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(
                    event.target.value
                  )
                }
                disabled={saving}
              >
                <option value="pending">
                  Pending
                </option>

                <option value="assigned">
                  Assigned
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
            </label>

            <label className="details-field">
              <span>Department</span>

              <select
                value={selectedDepartment}
                onChange={(event) =>
                  setSelectedDepartment(
                    event.target.value
                  )
                }
                disabled={saving}
              >
                <option value="">
                  Select department
                </option>

                {departments.map(
                  (department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.name}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="details-field">
              <span>Field worker</span>

              <select
                value={selectedWorker}
                onChange={(event) =>
                  setSelectedWorker(
                    event.target.value
                  )
                }
                disabled={saving}
              >
                <option value="">
                  Select worker
                </option>

                {workers
                  .filter(
                    (worker) =>
                      worker.is_active !==
                      false
                  )
                  .map((worker) => (
                    <option
                      key={worker.id}
                      value={worker.id}
                    >
                      {worker.name ||
                        worker.worker_id ||
                        worker.email}
                    </option>
                  ))}
              </select>
            </label>

            <button
              className="details-save-button"
              onClick={handleSaveChanges}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save changes"}
            </button>

            {saveMessage && (
              <div className="details-save-success">
                <CheckCircle2 size={15} />
                {saveMessage}
              </div>
            )}
          </section>

          <section className="details-card">
            <div className="details-card-title">
              <User size={17} />
              Citizen
            </div>

            <div className="citizen-profile">
              <div className="citizen-avatar">
                {(
                  currentComplaint.citizen ||
                  currentComplaint.citizen_name ||
                  "C"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {currentComplaint.citizen ||
                    currentComplaint.citizen_name ||
                    "Citizen"}
                </strong>

                <span>
                  LokSetu citizen
                </span>
              </div>
            </div>

            <div className="citizen-meta">
              <div>
                <CalendarDays size={14} />
                Complaint submitted
              </div>

              <div>
                <MapPin size={14} />
                {locationText}
              </div>
            </div>
          </section>

          <section className="details-card">
            <div className="details-card-title">
              <Building2 size={17} />
              Department
            </div>

            <div className="department-assignment">
              <strong>
                {departmentName}
              </strong>

              <span>
                Responsible department
              </span>
            </div>
          </section>

          {assignedWorker && (
            <section className="details-card">
              <div className="details-card-title">
                <User size={17} />
                Assigned worker
              </div>

              <div className="department-assignment">
                <strong>
                  {assignedWorker.name ||
                    assignedWorker.worker_id ||
                    "Field worker"}
                </strong>

                <span>
                  {assignedWorker.email ||
                    "Assigned field worker"}
                </span>
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function formatActivityTitle(activity) {
  const action = activity?.action;

  const titles = {
    created: "Complaint submitted",
    assigned_department:
      "Department assigned",
    assigned_worker:
      "Field worker assigned",
    status_changed:
      "Status updated",
    evidence_uploaded:
      "Evidence uploaded",
    notes_added:
      "Worker note added",
    proof_uploaded:
      "Work proof uploaded",
  };

  if (titles[action]) {
    return titles[action];
  }

  if (!action) {
    return "Complaint activity";
  }

  return action
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

export default ComplaintDetails;