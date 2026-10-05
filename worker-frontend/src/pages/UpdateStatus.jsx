import { useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  Upload,
  X,
} from "lucide-react";
import { apiRequest } from "../api";

function formatStatus(status) {
  if (!status) return "Assigned";

  return String(status)
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatFileSize(size) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function UpdateStatus({
  complaintId,
  task,
  onBack,
  onSuccess,
}) {
  const [status, setStatus] = useState(
    task?.status || task?.complaint_status || "in_progress"
  );

  const [notes, setNotes] = useState("");

  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const beforeInputRef = useRef(null);
  const afterInputRef = useRef(null);

  const handleBeforePhoto = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setBeforePhoto(file);
    event.target.value = "";
  };

  const handleAfterPhoto = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setAfterPhoto(file);
    event.target.value = "";
  };

  const removeBeforePhoto = () => {
    setBeforePhoto(null);
  };

  const removeAfterPhoto = () => {
    setAfterPhoto(null);
  };

  const uploadProof = async (file, proofType) => {
    if (!file) return;

    const formData = new FormData();

    formData.append("proof_type", proofType);
    formData.append("file", file);

    await apiRequest(
      `/worker/tasks/${complaintId}/proof`,
      {
        method: "POST",
        body: formData,
      }
    );
  };

  const submitUpdate = async () => {
    setError("");

    if (!complaintId) {
      setError("Complaint ID is missing.");
      return;
    }

    if (!status) {
      setError("Please select a status.");
      return;
    }

    if (status === "completed" && !afterPhoto) {
      setError(
        "Please upload an after-work photo before marking the task completed."
      );
      return;
    }

    setLoading(true);

    try {
      // --------------------------------------------------
      // STEP 1: UPDATE STATUS
      // --------------------------------------------------

      await apiRequest(
        `/worker/tasks/${complaintId}/status`,
        {
          method: "PUT",
          body: JSON.stringify({
            status,
          }),
        }
      );

      // --------------------------------------------------
      // STEP 2: UPLOAD BEFORE PHOTO
      // --------------------------------------------------

      if (beforePhoto) {
        await uploadProof(beforePhoto, "before");
      }

      // --------------------------------------------------
      // STEP 3: UPLOAD AFTER PHOTO
      // --------------------------------------------------

      if (afterPhoto) {
        await uploadProof(afterPhoto, "after");
      }

      // --------------------------------------------------
      // STEP 4: ADD WORK NOTES
      // --------------------------------------------------

      if (notes.trim()) {
        await apiRequest(
          `/worker/tasks/${complaintId}/notes`,
          {
            method: "POST",
            body: JSON.stringify({
              notes: notes.trim(),
            }),
          }
        );
      }

      setSuccess(true);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 900);
    } catch (error) {
      console.error(
        "Worker task update failed:",
        error
      );

      setError(
        error.message ||
          "Unable to update the task. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="worker-page">
        <div className="worker-page-container">
          <div className="worker-update-success">
            <div className="worker-update-success-icon">
              <CheckCircle2 size={32} />
            </div>

            <span>UPDATE SAVED</span>

            <h1>Task updated successfully.</h1>

            <p>
              The complaint status and field information
              have been recorded.
            </p>

            <button
              type="button"
              onClick={onSuccess}
            >
              Back to task
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="worker-page">
      <div className="worker-page-container worker-update-container">
        <button
          type="button"
          className="worker-back-button"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          Back to task
        </button>

        <div className="worker-update-heading">
          <span>FIELD UPDATE</span>

          <h1>Update task</h1>

          <p>
            Record the latest progress and field work for
            this complaint.
          </p>
        </div>

        <div className="worker-update-id">
          <FileText size={16} />

          <div>
            <small>COMPLAINT</small>

            <strong>{complaintId}</strong>

            {task?.title && (
              <span>{task.title}</span>
            )}
          </div>
        </div>

        <section className="worker-update-card">
          <div className="worker-update-card-heading">
            <span>01</span>

            <div>
              <h2>Task status</h2>

              <p>
                Select the current state of the field work.
              </p>
            </div>
          </div>

          <div className="worker-status-options">
            <button
              type="button"
              className={
                status === "in_progress"
                  ? "selected"
                  : ""
              }
              onClick={() => setStatus("in_progress")}
            >
              <span className="worker-status-option-dot" />

              <div>
                <strong>In progress</strong>
                <small>Work has started.</small>
              </div>
            </button>

            <button
              type="button"
              className={
                status === "completed"
                  ? "selected"
                  : ""
              }
              onClick={() => setStatus("completed")}
            >
              <span className="worker-status-option-dot" />

              <div>
                <strong>Completed</strong>
                <small>
                  The reported issue has been resolved.
                </small>
              </div>
            </button>
          </div>

          <div className="worker-current-status">
            Current selection:
            <strong>{formatStatus(status)}</strong>
          </div>
        </section>

        <section className="worker-update-card">
          <div className="worker-update-card-heading">
            <span>02</span>

            <div>
              <h2>Work notes</h2>

              <p>
                Add useful information about the work
                performed.
              </p>
            </div>
          </div>

          <textarea
            className="worker-notes-input"
            value={notes}
            maxLength={1000}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            placeholder="Describe what you found, what work was performed, materials used, or anything the department should know..."
            rows={6}
          />

          <div className="worker-notes-footer">
            {notes.length}/1000 characters
          </div>
        </section>

        <section className="worker-update-card">
          <div className="worker-update-card-heading">
            <span>03</span>

            <div>
              <h2>Work proof</h2>

              <p>
                Upload photos showing the field condition.
              </p>
            </div>
          </div>

          <div className="worker-proof-grid">
            <div className="worker-proof-box">
              <div className="worker-proof-heading">
                <div>
                  <strong>Before work</strong>

                  <span>
                    Optional condition photo
                  </span>
                </div>

                {beforePhoto && (
                  <button
                    type="button"
                    onClick={removeBeforePhoto}
                    aria-label="Remove before photo"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {beforePhoto ? (
                <div className="worker-proof-selected">
                  <ImageIcon size={20} />

                  <div>
                    <strong>
                      {beforePhoto.name}
                    </strong>

                    <span>
                      {formatFileSize(
                        beforePhoto.size
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="worker-proof-upload"
                  onClick={() =>
                    beforeInputRef.current?.click()
                  }
                >
                  <Camera size={20} />

                  <span>
                    Upload before photo
                  </span>
                </button>
              )}

              <input
                ref={beforeInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={handleBeforePhoto}
              />
            </div>

            <div className="worker-proof-box">
              <div className="worker-proof-heading">
                <div>
                  <strong>After work</strong>

                  <span>
                    Required when completing
                  </span>
                </div>

                {afterPhoto && (
                  <button
                    type="button"
                    onClick={removeAfterPhoto}
                    aria-label="Remove after photo"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {afterPhoto ? (
                <div className="worker-proof-selected">
                  <ImageIcon size={20} />

                  <div>
                    <strong>
                      {afterPhoto.name}
                    </strong>

                    <span>
                      {formatFileSize(
                        afterPhoto.size
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="worker-proof-upload"
                  onClick={() =>
                    afterInputRef.current?.click()
                  }
                >
                  <Upload size={20} />

                  <span>
                    Upload after photo
                  </span>
                </button>
              )}

              <input
                ref={afterInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={handleAfterPhoto}
              />
            </div>
          </div>
        </section>

        {error && (
          <div className="worker-page-error">
            <div>
              <AlertCircle size={19} />
            </div>

            <section>
              <strong>Update could not be saved</strong>

              <p>{error}</p>
            </section>
          </div>
        )}

        <div className="worker-update-actions">
          <button
            type="button"
            className="worker-cancel-button"
            onClick={onBack}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="worker-save-button"
            onClick={submitUpdate}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle
                  size={17}
                  className="worker-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 size={17} />
                Save update
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}

export default UpdateStatus;