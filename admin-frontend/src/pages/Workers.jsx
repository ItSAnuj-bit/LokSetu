import { useEffect, useMemo, useState } from "react";

import {
  Users,
  Plus,
  Search,
  Edit3,
  UserCheck,
  UserX,
  X,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  BriefcaseBusiness,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import { apiRequest } from "../api";

function Workers() {
  const [workers, setWorkers] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    ward: "",
  });

  useEffect(() => {
    loadWorkers();
  }, []);

  async function loadWorkers() {
    try {
      setLoading(true);
      setError("");

      const [workersResponse, departmentsResponse] =
        await Promise.all([
          apiRequest("/admin/workers"),
          apiRequest("/departments"),
        ]);

      setWorkers(
        workersResponse?.workers || []
      );

      setDepartments(
        departmentsResponse?.departments || []
      );
    } catch (err) {
      setError(
        err.message || "Unable to load workers."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredWorkers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return workers;
    }

    return workers.filter((worker) =>
      [
        worker.name,
        worker.email,
        worker.phone,
        worker.worker_id,
        worker.ward,
        getDepartmentName(
          worker.department_id,
          departments
        ),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        )
    );
  }, [workers, departments, search]);

  const activeWorkers = workers.filter(
    (worker) => worker.is_active !== false
  ).length;

  const inactiveWorkers =
    workers.length - activeWorkers;

  const openCreateModal = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      ward: "",
    });

    setSelectedWorker(null);
    setError("");
    setSuccessMessage("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setSelectedWorker(null);

    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      ward: "",
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateWorker = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Worker name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!form.password) {
      setError("Password is required.");
      return;
    }

    if (form.password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      await apiRequest("/admin/workers", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          phone: form.phone.trim() || null,
          ward: form.ward.trim() || null,
        }),
      });

      setSuccessMessage(
        "Worker created successfully."
      );

      await loadWorkers();

      setShowModal(false);

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        ward: "",
      });
    } catch (err) {
      setError(
        err.message ||
          "Unable to create worker."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (worker) => {
    const nextStatus =
      worker.is_active === false;

    const actionText = nextStatus
      ? "activate"
      : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${worker.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      await apiRequest(
        `/admin/workers/${encodeURIComponent(
          worker.id
        )}/status?active=${nextStatus}`,
        {
          method: "PUT",
        }
      );

      setSuccessMessage(
        nextStatus
          ? "Worker activated successfully."
          : "Worker deactivated successfully."
      );

      await loadWorkers();
    } catch (err) {
      setError(
        err.message ||
          "Unable to update worker status."
      );
    }
  };

  const openWorkerDetails = async (worker) => {
    try {
      setError("");

      const response = await apiRequest(
        `/admin/workers/${encodeURIComponent(
          worker.id
        )}`
      );

      setSelectedWorker(
        response?.worker || worker
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load worker details."
      );
    }
  };

  const closeWorkerDetails = () => {
    setSelectedWorker(null);
  };

  return (
    <div className="workers-page">
      <div className="workers-page-header">
        <div>
          <span className="section-overline">
            MANAGEMENT
          </span>

          <h1>Workers</h1>

          <p>
            Manage field workers who handle assigned
            civic complaints.
          </p>
        </div>

        <button
          className="workers-add-button"
          onClick={openCreateModal}
        >
          <Plus size={17} />
          Add worker
        </button>
      </div>

      <div className="workers-summary">
        <div className="worker-summary-card">
          <div className="worker-summary-icon">
            <Users size={19} />
          </div>

          <div>
            <span>Total workers</span>
            <strong>{workers.length}</strong>
          </div>
        </div>

        <div className="worker-summary-card">
          <div className="worker-summary-icon">
            <UserCheck size={19} />
          </div>

          <div>
            <span>Active workers</span>
            <strong>{activeWorkers}</strong>
          </div>
        </div>

        <div className="worker-summary-card">
          <div className="worker-summary-icon">
            <UserX size={19} />
          </div>

          <div>
            <span>Inactive workers</span>
            <strong>{inactiveWorkers}</strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="workers-alert workers-alert-error">
          <AlertCircle size={16} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="workers-alert workers-alert-success">
          <CheckCircle2 size={16} />

          <span>{successMessage}</span>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section className="workers-card">
        <div className="workers-toolbar">
          <div>
            <strong>Field workers</strong>

            <span>
              {filteredWorkers.length}{" "}
              {filteredWorkers.length === 1
                ? "worker"
                : "workers"}
            </span>
          </div>

          <div className="workers-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search workers..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>
        </div>

        {loading ? (
          <div className="workers-loading">
            <LoaderCircle
              size={20}
              className="workers-spinner"
            />
            Loading workers...
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="workers-empty">
            <div className="workers-empty-icon">
              <Users size={22} />
            </div>

            <strong>
              {search
                ? "No workers found"
                : "No workers available"}
            </strong>

            <span>
              {search
                ? "Try a different search term."
                : "Create your first field worker to get started."}
            </span>

            {!search && (
              <button
                className="workers-empty-button"
                onClick={openCreateModal}
              >
                <Plus size={15} />
                Add worker
              </button>
            )}
          </div>
        ) : (
          <div className="workers-table-wrapper">
            <table className="workers-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Contact</th>
                  <th>Department</th>
                  <th>Ward</th>
                  <th>Status</th>
                  <th>Workload</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredWorkers.map(
                  (worker) => (
                    <tr key={worker.id}>
                      <td>
                        <div className="worker-name-cell">
                          <div className="worker-avatar">
                            {(
                              worker.name ||
                              "W"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {worker.name ||
                                "Unnamed worker"}
                            </strong>

                            <span>
                              {worker.worker_id ||
                                "Worker"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="worker-contact-cell">
                          <span>
                            <Mail size={12} />
                            {worker.email ||
                              "—"}
                          </span>

                          {worker.phone && (
                            <span>
                              <Phone size={12} />
                              {worker.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="worker-department">
                          {getDepartmentName(
                            worker.department_id,
                            departments
                          )}
                        </span>
                      </td>

                      <td>
                        <span className="worker-ward">
                          {worker.ward || "—"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            worker.is_active ===
                            false
                              ? "worker-status inactive"
                              : "worker-status active"
                          }
                        >
                          <span />

                          {worker.is_active ===
                          false
                            ? "Inactive"
                            : "Active"}
                        </span>
                      </td>

                      <td>
                        <button
                          className="worker-workload-button"
                          onClick={() =>
                            openWorkerDetails(
                              worker
                            )
                          }
                        >
                          <BriefcaseBusiness
                            size={13}
                          />

                          View
                        </button>
                      </td>

                      <td>
                        <div className="worker-actions">
                          <button
                            type="button"
                            className="worker-action-button"
                            onClick={() =>
                              openWorkerDetails(
                                worker
                              )
                            }
                            title="View worker"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            type="button"
                            className={
                              worker.is_active ===
                              false
                                ? "worker-action-button activate"
                                : "worker-action-button danger"
                            }
                            onClick={() =>
                              handleToggleStatus(
                                worker
                              )
                            }
                            title={
                              worker.is_active ===
                              false
                                ? "Activate worker"
                                : "Deactivate worker"
                            }
                          >
                            {worker.is_active ===
                            false ? (
                              <UserCheck
                                size={15}
                              />
                            ) : (
                              <UserX size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showModal && (
        <div
          className="worker-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="worker-modal">
            <div className="worker-modal-header">
              <div>
                <span className="section-overline">
                  FIELD WORKER
                </span>

                <h2>Add worker</h2>

                <p>
                  Create login credentials for a
                  new field worker.
                </p>
              </div>

              <button
                type="button"
                className="worker-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <form
              className="worker-form"
              onSubmit={handleCreateWorker}
            >
              <label>
                <span>Full name</span>

                <input
                  name="name"
                  type="text"
                  placeholder="e.g. Rahul Kumar"
                  value={form.name}
                  onChange={handleInputChange}
                  disabled={saving}
                />
              </label>

              <label>
                <span>Email</span>

                <input
                  name="email"
                  type="email"
                  placeholder="worker@example.com"
                  value={form.email}
                  onChange={handleInputChange}
                  disabled={saving}
                />
              </label>

              <div className="worker-form-grid">
                <label>
                  <span>Phone</span>

                  <input
                    name="phone"
                    type="tel"
                    placeholder="Phone number"
                    value={form.phone}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </label>

                <label>
                  <span>Ward</span>

                  <input
                    name="ward"
                    type="text"
                    placeholder="e.g. Ward 7"
                    value={form.ward}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </label>
              </div>

              <label>
                <span>Temporary password</span>

                <input
                  name="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={handleInputChange}
                  disabled={saving}
                />
              </label>

              <div className="worker-form-note">
                The worker can use this email and
                password to log in to the LokSetu
                worker portal.
              </div>

              <div className="worker-form-actions">
                <button
                  type="button"
                  className="worker-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="worker-submit-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        size={15}
                        className="workers-spinner"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      Create worker
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedWorker && (
        <div
          className="worker-details-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeWorkerDetails();
            }
          }}
        >
          <div className="worker-details-panel">
            <div className="worker-details-header">
              <div>
                <span className="section-overline">
                  WORKER DETAILS
                </span>

                <h2>
                  {selectedWorker.name ||
                    "Field worker"}
                </h2>

                <p>
                  {selectedWorker.worker_id ||
                    "Worker profile"}
                </p>
              </div>

              <button
                className="worker-modal-close"
                onClick={closeWorkerDetails}
              >
                <X size={18} />
              </button>
            </div>

            <div className="worker-profile-top">
              <div className="worker-details-avatar">
                {(
                  selectedWorker.name ||
                  "W"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {selectedWorker.name ||
                    "Field worker"}
                </strong>

                <span
                  className={
                    selectedWorker.is_active ===
                    false
                      ? "worker-status inactive"
                      : "worker-status active"
                  }
                >
                  <span />
                  {selectedWorker.is_active ===
                  false
                    ? "Inactive"
                    : "Active"}
                </span>
              </div>
            </div>

            <div className="worker-detail-grid">
              <div className="worker-detail-item">
                <Mail size={15} />

                <div>
                  <span>Email</span>

                  <strong>
                    {selectedWorker.email ||
                      "—"}
                  </strong>
                </div>
              </div>

              <div className="worker-detail-item">
                <Phone size={15} />

                <div>
                  <span>Phone</span>

                  <strong>
                    {selectedWorker.phone ||
                      "—"}
                  </strong>
                </div>
              </div>

              <div className="worker-detail-item">
                <BriefcaseBusiness
                  size={15}
                />

                <div>
                  <span>Department</span>

                  <strong>
                    {getDepartmentName(
                      selectedWorker.department_id,
                      departments
                    )}
                  </strong>
                </div>
              </div>

              <div className="worker-detail-item">
                <MapPin size={15} />

                <div>
                  <span>Ward</span>

                  <strong>
                    {selectedWorker.ward ||
                      "—"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="worker-workload-card">
              <div>
                <span>Active workload</span>

                <strong>
                  {selectedWorker.active_workload ??
                    0}
                </strong>
              </div>

              <BriefcaseBusiness size={21} />
            </div>

            <div className="worker-details-note">
              Department assignment and profile
              editing will be added when the
              corresponding admin API is available.
            </div>

            <button
              className="worker-details-close-button"
              onClick={closeWorkerDetails}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getDepartmentName(
  departmentId,
  departments
) {
  if (!departmentId) {
    return "Not assigned";
  }

  const department = departments.find(
    (item) => item.id === departmentId
  );

  return department?.name || "Not assigned";
}

export default Workers;