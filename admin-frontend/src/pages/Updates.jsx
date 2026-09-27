import { useState } from "react";

import {
  Bell,
  CalendarDays,
  Megaphone,
  Plus,
  Search,
  X,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

const initialUpdates = [
  {
    id: 1,
    title: "Water supply maintenance in Ward 9",
    category: "Services",
    status: "Published",
    date: "20 Sep 2026",
    description:
      "Water supply will remain temporarily affected in Ward 9 due to scheduled pipeline maintenance.",
  },
  {
    id: 2,
    title: "Garbage collection schedule updated",
    category: "Notices",
    status: "Published",
    date: "19 Sep 2026",
    description:
      "The garbage collection schedule has been updated for selected wards.",
  },
  {
    id: 3,
    title: "Road repair work begins on Main Road",
    category: "Services",
    status: "Draft",
    date: "18 Sep 2026",
    description:
      "Repair work is scheduled to begin on the Main Road near Ward 3.",
  },
  {
    id: 4,
    title: "Community cleanliness drive",
    category: "Community",
    status: "Published",
    date: "16 Sep 2026",
    description:
      "A community cleanliness drive will be organised across selected areas.",
  },
];

const categories = [
  "Services",
  "Community",
  "Safety",
  "Notices",
];

function Updates() {
  const [updates, setUpdates] =
    useState(initialUpdates);

  const [showModal, setShowModal] =
    useState(false);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    title: "",
    category: "Services",
    description: "",
  });

  const filteredUpdates = updates.filter(
    (update) =>
      update.title
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      update.category
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const handleCreate = (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      return;
    }

    const newUpdate = {
      id: Date.now(),
      title: form.title,
      category: form.category,
      status: "Draft",
      date: "20 Sep 2026",
      description: form.description,
    };

    setUpdates((current) => [
      newUpdate,
      ...current,
    ]);

    setForm({
      title: "",
      category: "Services",
      description: "",
    });

    setShowModal(false);
  };

  const handleDelete = (id) => {
    setUpdates((current) =>
      current.filter((update) => update.id !== id)
    );
  };

  return (
    <div className="updates-page">
      <div className="updates-heading">
        <div>
          <h2>Updates</h2>

          <p>
            Publish civic announcements and service
            notices for citizens.
          </p>
        </div>

        <button
          className="create-update-button"
          onClick={() => setShowModal(true)}
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
            <span>Total updates</span>
            <strong>{updates.length}</strong>
          </div>
        </div>

        <div className="updates-summary-card">
          <div className="updates-summary-icon">
            <Megaphone size={18} />
          </div>

          <div>
            <span>Published</span>
            <strong>
              {
                updates.filter(
                  (item) =>
                    item.status === "Published"
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="updates-summary-card">
          <div className="updates-summary-icon">
            <Pencil size={18} />
          </div>

          <div>
            <span>Drafts</span>
            <strong>
              {
                updates.filter(
                  (item) => item.status === "Draft"
                ).length
              }
            </strong>
          </div>
        </div>
      </div>

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
                    {update.category}
                  </span>

                  <h3>{update.title}</h3>
                </div>

                <span
                  className={`update-status ${
                    update.status === "Published"
                      ? "update-published"
                      : "update-draft"
                  }`}
                >
                  {update.status}
                </span>
              </div>

              <p>{update.description}</p>

              <div className="admin-update-footer">
                <span>
                  <CalendarDays size={13} />
                  {update.date}
                </span>

                <div className="admin-update-actions">
                  <button
                    title="Preview"
                    aria-label="Preview update"
                  >
                    <Eye size={15} />
                  </button>

                  <button
                    title="Edit"
                    aria-label="Edit update"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    title="Delete"
                    aria-label="Delete update"
                    onClick={() =>
                      handleDelete(update.id)
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}

        {filteredUpdates.length === 0 && (
          <div className="updates-empty">
            <Bell size={25} />

            <strong>No updates found</strong>

            <span>
              Try a different search or create a new
              update.
            </span>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="update-modal-overlay"
          onMouseDown={() => setShowModal(false)}
        >
          <div
            className="update-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="update-modal-header">
              <div>
                <h3>Create civic update</h3>

                <p>
                  This will initially be saved as a
                  draft.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <label className="update-form-field">
                <span>Title</span>

                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title: event.target.value,
                    })
                  }
                  placeholder="Enter update title"
                />
              </label>

              <label className="update-form-field">
                <span>Category</span>

                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category: event.target.value,
                    })
                  }
                >
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="update-form-field">
                <span>Description</span>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description:
                        event.target.value,
                    })
                  }
                  placeholder="Write the civic update..."
                  rows="5"
                />
              </label>

              <div className="update-modal-actions">
                <button
                  type="button"
                  className="update-cancel-button"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="update-save-button"
                >
                  Save draft
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