import { useEffect, useMemo, useState } from "react";

import {
  Building2,
  Edit3,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Search,
} from "lucide-react";

import { apiRequest } from "../api";

function Departments() {
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  async function loadDepartments() {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest("/departments");

      setDepartments(response?.departments || []);
    } catch (err) {
      setError(
        err.message || "Unable to load departments."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return departments;
    }

    return departments.filter((department) =>
      [
        department.name,
        department.code,
        department.description,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        )
    );
  }, [departments, search]);

  const openCreateModal = () => {
    setEditingDepartment(null);

    setForm({
      name: "",
      code: "",
      description: "",
    });

    setError("");
    setSuccessMessage("");
    setShowModal(true);
  };

  const openEditModal = (department) => {
    setEditingDepartment(department);

    setForm({
      name: department.name || "",
      code: department.code || "",
      description:
        department.description || "",
    });

    setError("");
    setSuccessMessage("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingDepartment(null);

    setForm({
      name: "",
      code: "",
      description: "",
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Department name is required.");
      return;
    }

    if (!form.code.trim()) {
      setError("Department code is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        description:
          form.description.trim() || null,
      };

      if (editingDepartment) {
        await apiRequest(
          `/admin/departments/${encodeURIComponent(
            editingDepartment.id
          )}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

        setSuccessMessage(
          "Department updated successfully."
        );
      } else {
        await apiRequest("/admin/departments", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setSuccessMessage(
          "Department created successfully."
        );
      }

      await loadDepartments();

      setShowModal(false);
      setEditingDepartment(null);

      setForm({
        name: "",
        code: "",
        description: "",
      });
    } catch (err) {
      setError(
        err.message ||
          "Unable to save department."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (department) => {
    const confirmed = window.confirm(
      `Delete "${department.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      await apiRequest(
        `/admin/departments/${encodeURIComponent(
          department.id
        )}`,
        {
          method: "DELETE",
        }
      );

      setSuccessMessage(
        "Department deleted successfully."
      );

      await loadDepartments();
    } catch (err) {
      setError(
        err.message ||
          "Unable to delete department."
      );
    }
  };

  const activeCount = departments.filter(
    (department) =>
      department.is_active !== false
  ).length;

  return (
    <div className="departments-page">
      <div className="departments-page-header">
        <div>
          <span className="section-overline">
            MANAGEMENT
          </span>

          <h1>Departments</h1>

          <p>
            Manage the departments responsible for
            handling civic complaints.
          </p>
        </div>

        <button
          className="departments-add-button"
          onClick={openCreateModal}
        >
          <Plus size={17} />
          Add department
        </button>
      </div>

      <div className="departments-summary">
        <div className="department-summary-card">
          <div className="department-summary-icon">
            <Building2 size={19} />
          </div>

          <div>
            <span>Total departments</span>
            <strong>{departments.length}</strong>
          </div>
        </div>

        <div className="department-summary-card">
          <div className="department-summary-icon">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>Active departments</span>
            <strong>{activeCount}</strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="departments-alert departments-alert-error">
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
        <div className="departments-alert departments-alert-success">
          <CheckCircle2 size={16} />
          <span>{successMessage}</span>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section className="departments-card">
        <div className="departments-toolbar">
          <div>
            <strong>All departments</strong>

            <span>
              {filteredDepartments.length}{" "}
              {filteredDepartments.length === 1
                ? "department"
                : "departments"}
            </span>
          </div>

          <div className="departments-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search departments..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>
        </div>

        {loading ? (
          <div className="departments-loading">
            <LoaderCircle
              size={20}
              className="departments-spinner"
            />
            Loading departments...
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="departments-empty">
            <div className="departments-empty-icon">
              <Building2 size={22} />
            </div>

            <strong>
              {search
                ? "No departments found"
                : "No departments available"}
            </strong>

            <span>
              {search
                ? "Try a different search term."
                : "Create your first department to get started."}
            </span>

            {!search && (
              <button
                className="departments-empty-button"
                onClick={openCreateModal}
              >
                <Plus size={15} />
                Add department
              </button>
            )}
          </div>
        ) : (
          <div className="departments-table-wrapper">
            <table className="departments-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredDepartments.map(
                  (department) => (
                    <tr key={department.id}>
                      <td>
                        <div className="department-name-cell">
                          <div className="department-row-icon">
                            <Building2 size={17} />
                          </div>

                          <div>
                            <strong>
                              {department.name ||
                                "Unnamed department"}
                            </strong>

                            <span>
                              Department
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="department-code">
                          {department.code ||
                            "—"}
                        </span>
                      </td>

                      <td>
                        <span className="department-description">
                          {department.description ||
                            "No description provided."}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            department.is_active ===
                            false
                              ? "department-status inactive"
                              : "department-status active"
                          }
                        >
                          <span />

                          {department.is_active ===
                          false
                            ? "Inactive"
                            : "Active"}
                        </span>
                      </td>

                      <td>
                        <div className="department-actions">
                          <button
                            type="button"
                            className="department-action-button"
                            onClick={() =>
                              openEditModal(
                                department
                              )
                            }
                            title="Edit department"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            type="button"
                            className="department-action-button danger"
                            onClick={() =>
                              handleDelete(
                                department
                              )
                            }
                            title="Delete department"
                          >
                            <Trash2 size={15} />
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
          className="department-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="department-modal">
            <div className="department-modal-header">
              <div>
                <span className="section-overline">
                  DEPARTMENT
                </span>

                <h2>
                  {editingDepartment
                    ? "Edit department"
                    : "Add department"}
                </h2>

                <p>
                  {editingDepartment
                    ? "Update department information."
                    : "Create a new department for complaint assignment."}
                </p>
              </div>

              <button
                type="button"
                className="department-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <form
              className="department-form"
              onSubmit={handleSubmit}
            >
              <label>
                <span>Department name</span>

                <input
                  name="name"
                  type="text"
                  placeholder="e.g. Public Works"
                  value={form.name}
                  onChange={handleInputChange}
                  disabled={saving}
                />
              </label>

              <label>
                <span>Department code</span>

                <input
                  name="code"
                  type="text"
                  placeholder="e.g. PWD"
                  value={form.code}
                  onChange={handleInputChange}
                  disabled={saving}
                  maxLength={20}
                />
              </label>

              <label>
                <span>Description</span>

                <textarea
                  name="description"
                  placeholder="Briefly describe the department's responsibilities."
                  value={form.description}
                  onChange={handleInputChange}
                  disabled={saving}
                  rows={4}
                />
              </label>

              <div className="department-form-actions">
                <button
                  type="button"
                  className="department-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="department-submit-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        size={15}
                        className="departments-spinner"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      {editingDepartment
                        ? "Save changes"
                        : "Create department"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Departments;