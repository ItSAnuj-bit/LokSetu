import { useState } from "react";
import Login from "./pages/Login";
import Tasks from "./pages/Tasks";
import TaskDetails from "./pages/TaskDetails";
import UpdateStatus from "./pages/UpdateStatus";

function App() {
  const [loggedIn, setLoggedIn] = useState(
    Boolean(
      localStorage.getItem(
        "loksetu_worker_access_token"
      )
    )
  );

  const [currentPage, setCurrentPage] =
    useState("tasks");

  const [selectedTaskId, setSelectedTaskId] =
    useState("");

  const [selectedTask, setSelectedTask] =
    useState(null);

  const handleLogin = () => {
    setLoggedIn(true);
    setCurrentPage("tasks");
  };

  const handleLogout = () => {
    localStorage.removeItem(
      "loksetu_worker_access_token"
    );

    setLoggedIn(false);
    setCurrentPage("tasks");
    setSelectedTaskId("");
    setSelectedTask(null);
  };

  const handleOpenTask = (taskId, task) => {
    setSelectedTaskId(taskId);
    setSelectedTask(task || null);
    setCurrentPage("task-details");
  };

  const handleBackToTasks = () => {
    setSelectedTaskId("");
    setSelectedTask(null);
    setCurrentPage("tasks");
  };

  const handleUpdateStatus = (taskId, task) => {
    setSelectedTaskId(taskId);
    setSelectedTask(task || selectedTask);
    setCurrentPage("update-status");
  };

  const handleUpdateSuccess = () => {
    setCurrentPage("task-details");
  };

  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="worker-app">
      <header className="worker-header">
        <div className="worker-header-inner">
          <div className="worker-header-brand">
            <div className="worker-header-mark">
              L
            </div>

            <div>
              <strong>
                Lok<span>Setu</span>
              </strong>

              <small>Field Worker</small>
            </div>
          </div>

          <div className="worker-header-actions">
            <span>Worker Portal</span>

            <button
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {currentPage === "tasks" && (
        <Tasks
          onOpenTask={handleOpenTask}
        />
      )}

      {currentPage === "task-details" &&
        selectedTaskId && (
          <TaskDetails
            complaintId={selectedTaskId}
            initialTask={selectedTask}
            onBack={handleBackToTasks}
            onUpdateStatus={
              handleUpdateStatus
            }
          />
        )}

      {currentPage === "update-status" &&
        selectedTaskId && (
          <UpdateStatus
            complaintId={selectedTaskId}
            task={selectedTask}
            onBack={() =>
              setCurrentPage("task-details")
            }
            onSuccess={handleUpdateSuccess}
          />
        )}
    </div>
  );
}

export default App;