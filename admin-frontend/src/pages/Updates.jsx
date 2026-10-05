import { useEffect, useMemo, useState } from "react";

import {
  Bell,
  Plus,
  Search,
  Megaphone,
  X,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  MapPin,
  CalendarDays,
} from "lucide-react";

import { apiRequest } from "../api";

function Updates() {
  const [updates, setUpdates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "General",
    ward: "",
  });

  useEffect(() => {
    loadUpdates();
  }, []);

  async function loadUpdates() {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest(
        "/updates"
      );

      setUpdates(
        Array.isArray(response?.updates)
          ? response.updates
          : []
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load updates."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredUpdates = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return updates;
    }

    return updates.filter((update) =>
      [
        update.title,
        update.description,
        update.category,
        update.ward,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        )
    );
  }, [updates, search]);

  const publishedCount = updates.filter(
    (item) => item.status === "published"
  ).length;

  const openCreateModal = () => {
    setForm({
      title: "",
      description: "",
      category: "General",
      ward: "",
    });

    setError("");
    setSuccessMessage("");
    setShowModal(true);
  };

  const closeCreateModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);

    setForm({
      title: "",
      description: "",
      category: "General",
      ward: "",
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateUpdate = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Update title is required.");
      return;
    }

    if (!form.description.trim()) {
      setError(
        "Update description is required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      await apiRequest("/admin/updates", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          description:
            form.description.trim(),
          category:
            form.category.trim() || "General",
          ward: form.ward.trim() || null,
          status: "published",
        }),
      });

      setShowModal(false);

      setForm({
        title: "",
        description: "",
        category: "General",
        ward: "",
      });

      setSuccessMessage(
        "Update published successfully."
      );

      await loadUpdates();
    } catch (err) {
      setError(
        err.message ||
          "Unable to publish update."
      );
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="updates-page">
      <div className="updates-heading">
        <div>
          <span className="section-overline">
            PUBLIC COMMUNICATION
          </span>

          <h2>Updates</h2>

          <p>
            Publish civic announcements and service
            notices for citizens.
          </p>
        </div>

        <button
          className="create-update-button"
          onClick={openCreateModal}
        >
          <Plus size={16} />
          Create update
        </button>
      </div>

      <div className="updates-summary">
        <div className="updates-summary-card">
          <div className="updates-summary-icon">
            <Bell size={18} />
          </div>

          <div>
            <span>Total published</span>
            <strong>{updates.length}</strong>
          </div>
        </div>

        <div className="updates-summary-card">
          <div className="updates-summary-icon">
            <Megaphone size={18} />
          </div>

          <div>
            <span>Published</span>
            <strong>{publishedCount}</strong>
          </div>
        </div>

        <div className="updates-summary-card">
          <div className="updates-summary-icon">
            <CalendarDays size={18} />
          </div>

          <div>
            <span>Latest</span>
            <strong>
              {updates.length > 0
                ? "Active"
                : "—"}
            </strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="updates-alert updates-alert-error">
          <AlertCircle size={16} />

          <span>{error}</span>

          <button
            onClick={() => setError("")}
            aria-label="Close error"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="updates-alert updates-alert-success">
          <CheckCircle2 size={16} />

          <span>{successMessage}</span>

          <button
            onClick={() =>
              setSuccessMessage("")
            }
            aria-label="Close message"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="updates-toolbar">
        <div className="updates-search">
          <Search size={16} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search updates..."
          />
        </div>
      </div>

      {loading ? (
        <div className="updates-loading">
          <LoaderCircle
            size={20}
            className="updates-spinner"
          />

          Loading updates...
        </div>
      ) : filteredUpdates.length === 0 ? (
        <div className="updates-empty">
          <div className="updates-empty-icon">
            <Bell size={22} />
          </div>

          <strong>
            {search
              ? "No updates found"
              : "No published updates"}
          </strong>

          <span>
            {search
              ? "Try a different search term."
              : "Create your first civic announcement."}
          </span>

          {!search && (
            <button
              className="updates-empty-button"
              onClick={openCreateModal}
            >
              <Plus size={15} />
              Create update
            </button>
          )}
        </div>
      ) : (
        <div className="admin-updates-list">
          {filteredUpdates.map((update) => (
            <article
              className="admin-update-card"
              key={update.id}
            >
              <div className="admin-update-icon">
                <Bell size={19} />
              </div>

              <div className="admin-update-content">
                <div className="admin-update-top">
                  <div>
                    <span className="admin-update-category">
                      {update.category ||
                        "General"}
                    </span>

                    <h3>
                      {update.title ||
                        "Untitled update"}
                    </h3>
                  </div>

                  <span className="update-status update-published">
                    Published
                  </span>
                </div>

                <p>
                  {update.description ||
                    "No description provided."}
                </p>

                <div className="admin-update-footer">
                  <span>
                    <CalendarDays size={12} />

                    {formatDate(
                      update.published_at ||
                        update.created_at
                    )}
                  </span>

                  <span>
                    <MapPin size={12} />

                    {update.ward ||
                      "All wards"}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className="update-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeCreateModal();
            }
          }}
        >
          <div className="update-modal">
            <div className="update-modal-header">
              <div>
                <span className="section-overline">
                  PUBLIC ANNOUNCEMENT
                </span>

                <h2>Create update</h2>

                <p>
                  Publish an announcement that
                  citizens can see.
                </p>
              </div>

              <button
                className="update-modal-close"
                onClick={closeCreateModal}
                disabled={saving}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form
              className="update-form"
              onSubmit={handleCreateUpdate}
            >
              <label>
                <span>Title</span>

                <input
                  name="title"
                  type="text"
                  placeholder="e.g. Water supply maintenance"
                  value={form.title}
                  onChange={handleChange}
                  disabled={saving}
                />
              </label>

              <label>
                <span>Description</span>

                <textarea
                  name="description"
                  rows="5"
                  placeholder="Write the announcement details..."
                  value={form.description}
                  onChange={handleChange}
                  disabled={saving}
                />
              </label>

              <div className="update-form-grid">
                <label>
                  <span>Category</span>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    disabled={saving}
                  >
                    <option value="General">
                      General
                    </option>

                    <option value="Water">
                      Water
                    </option>

                    <option value="Electricity">
                      Electricity
                    </option>

                    <option value="Roads">
                      Roads
                    </option>

                    <option value="Sanitation">
                      Sanitation
                    </option>

                    <option value="Emergency">
                      Emergency
                    </option>

                    <option value="Public Notice">
                      Public Notice
                    </option>
                  </select>
                </label>

                <label>
                  <span>Ward</span>

                  <input
                    name="ward"
                    type="text"
                    placeholder="Leave empty for all wards"
                    value={form.ward}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </label>
              </div>

              <div className="update-form-note">
                This announcement will be published
                immediately and will become visible
                through the citizen Updates section.
              </div>

              <div className="update-form-actions">
                <button
                  type="button"
                  className="update-cancel-button"
                  onClick={closeCreateModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="update-submit-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        size={15}
                        className="updates-spinner"
                      />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Megaphone size={15} />
                      Publish update
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

export default Updates;