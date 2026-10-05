import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  ClipboardList,
  Clock3,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { apiRequest } from "../api";

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
    normalized.includes("working") ||
    normalized.includes("assigned")
  ) {
    return "status-progress";
  }

  return "status-pending";
}

function formatStatus(status) {
  if (!status) return "Assigned";

  return String(status)
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getLocation(task) {
  const location = task?.location;

  if (!location) return "Location not provided";

  if (typeof location === "string") {
    return location;
  }

  return (
    location.address ||
    location.landmark ||
    (location.latitude && location.longitude
      ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
      : "Location not provided")
  );
}

function Tasks({ onOpenTask }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadTasks = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await apiRequest("/worker/tasks");

      const taskList =
        response?.tasks ||
        response?.data?.tasks ||
        response?.complaints ||
        response?.data ||
        [];

      setTasks(Array.isArray(taskList) ? taskList : []);
    } catch (error) {
      console.error("Failed to load worker tasks:", error);

      setError(
        error.message || "Unable to load your assigned tasks."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  if (loading) {
    return (
      <main className="worker-page">
        <div className="worker-page-container">
          <div className="worker-page-heading">
            <span>FIELD OPERATIONS</span>
            <h1>Assigned Tasks</h1>
          </div>

          <div className="worker-loading-card">
            <div className="worker-loading-spinner">
              <RefreshCw size={22} />
            </div>

            <strong>Loading your tasks...</strong>

            <p>
              Fetching the latest assignments from LokSetu.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="worker-page">
      <div className="worker-page-container">
        <div className="worker-page-topbar">
          <div className="worker-page-heading">
            <span>FIELD OPERATIONS</span>

            <h1>Assigned Tasks</h1>

            <p>
              View and manage civic complaints assigned to you.
            </p>
          </div>

          <button
            type="button"
            className="worker-refresh-button"
            onClick={() => loadTasks(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={refreshing ? "worker-spin" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="worker-page-error">
            <div>
              <AlertCircle size={19} />
            </div>

            <section>
              <strong>Unable to load tasks</strong>

              <p>{error}</p>

              <button
                type="button"
                onClick={() => loadTasks(true)}
              >
                Try again
              </button>
            </section>
          </div>
        )}

        {!error && tasks.length === 0 && (
          <div className="worker-empty-card">
            <div className="worker-empty-icon">
              <ClipboardList size={28} />
            </div>

            <h2>No assigned tasks</h2>

            <p>
              You currently have no complaints assigned to you.
              New assignments will appear here.
            </p>

            <button
              type="button"
              className="worker-secondary-button"
              onClick={() => loadTasks(true)}
              disabled={refreshing}
            >
              <RefreshCw size={15} />
              Check again
            </button>
          </div>
        )}

        {!error && tasks.length > 0 && (
          <div className="worker-task-list">
            {tasks.map((task, index) => {
              const taskId =
                task?.complaint_id ||
                task?.id ||
                task?._id ||
                `task-${index}`;

              const status =
                task?.status ||
                task?.complaint_status ||
                "Assigned";

              const priority =
                task?.priority ||
                task?.ai_analysis?.priority ||
                "Medium";

              const title =
                task?.title ||
                task?.description ||
                "Civic complaint";

              const category =
                task?.category ||
                task?.ai_analysis?.category ||
                "Other";

              return (
                <article
                  className="worker-task-card"
                  key={taskId}
                >
                  <div className="worker-task-card-main">
                    <div className="worker-task-card-top">
                      <span className="worker-task-id">
                        {task?.complaint_id || task?.id || "TASK"}
                      </span>

                      <span
                        className={`worker-status ${getStatusClass(
                          status
                        )}`}
                      >
                        {formatStatus(status)}
                      </span>
                    </div>

                    <h2>{title}</h2>

                    <div className="worker-task-meta">
                      <span>
                        <ClipboardList size={15} />
                        {category}
                      </span>

                      <span>
                        <MapPin size={15} />
                        {getLocation(task)}
                      </span>

                      <span>
                        <Clock3 size={15} />
                        {formatDate(
                          task?.assigned_at ||
                            task?.updated_at ||
                            task?.created_at
                        )}
                      </span>
                    </div>

                    <div className="worker-task-bottom">
                      <div>
                        <small>PRIORITY</small>

                        <strong
                          className={`worker-priority worker-priority-${String(
                            priority
                          ).toLowerCase()}`}
                        >
                          {formatStatus(priority)}
                        </strong>
                      </div>

                      <button
                        type="button"
                        className="worker-open-task"
                        onClick={() => onOpenTask?.(taskId, task)}
                      >
                        Open task
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default Tasks;