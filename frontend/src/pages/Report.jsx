import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Droplets,
  FileText,
  Lightbulb,
  LoaderCircle,
  MapPin,
  Mic,
  Navigation,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";

import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import { useEffect, useRef, useState } from "react";

import { apiRequest } from "../api";

const DEFAULT_LOCATION = [29.405, 76.67];

const categories = [
  {
    name: "Roads",
    description: "Potholes & damage",
    icon: Navigation,
  },
  {
    name: "Water",
    description: "Supply & leakage",
    icon: Droplets,
  },
  {
    name: "Electricity",
    description: "Power problems",
    icon: Zap,
  },
  {
    name: "Streetlight",
    description: "Lights & poles",
    icon: Lightbulb,
  },
  {
    name: "Waste",
    description: "Garbage & sanitation",
    icon: Trash2,
  },
  {
    name: "Other",
    description: "Something else",
    icon: FileText,
  },
];

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect([
        event.latlng.lat,
        event.latlng.lng,
      ]);
    },
  });

  return null;
}

function MapCenterController({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, {
        duration: 1,
      });
    }
  }, [position, map]);

  return null;
}

function Report({
  onBack,
  onReports,
  onSubmitReport,
}) {
  const [step, setStep] = useState(1);

  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [landmark, setLandmark] = useState("");

  const [coordinates, setCoordinates] = useState(null);

  const [submitted, setSubmitted] = useState(false);
  const [submittedReportId, setSubmittedReportId] =
    useState("");

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");

  const [submitLoading, setSubmitLoading] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  // Evidence
  const [photoFiles, setPhotoFiles] = useState([]);
  const [otherFiles, setOtherFiles] = useState([]);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceUrl, setVoiceUrl] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const photoInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const handlePhotoChange = (event) => {
    const files = Array.from(
      event.target.files || []
    );

    if (files.length === 0) {
      return;
    }

    setPhotoFiles((current) => [
      ...current,
      ...files,
    ]);

    event.target.value = "";
  };

  const handleFileChange = (event) => {
    const files = Array.from(
      event.target.files || []
    );

    if (files.length === 0) {
      return;
    }

    setOtherFiles((current) => [
      ...current,
      ...files,
    ]);

    event.target.value = "";
  };

  const removePhoto = (index) => {
    setPhotoFiles((current) =>
      current.filter(
        (_, fileIndex) => fileIndex !== index
      )
    );
  };

  const removeFile = (index) => {
    setOtherFiles((current) =>
      current.filter(
        (_, fileIndex) => fileIndex !== index
      )
    );
  };
  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setIsRecording(false);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setSubmitError(
        "Voice recording is not supported by this browser."
      );
      return;
    }

    if (isRecording) {
      stopRecording();
      return;
    }

    try {
      setSubmitError("");

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      mediaChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          mediaChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(
          mediaChunksRef.current,
          {
            type:
              recorder.mimeType || "audio/webm",
          }
        );

        const url = URL.createObjectURL(blob);

        setVoiceBlob(blob);
        setVoiceUrl(url);

        stream
          .getTracks()
          .forEach((track) => track.stop());
      };

      recorder.start();

      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current =
        window.setInterval(() => {
          setRecordingTime(
            (current) => current + 1
          );
        }, 1000);
    } catch (error) {
      console.error(
        "Voice recording failed:",
        error
      );

      setSubmitError(
        "Microphone permission was denied or the microphone is unavailable."
      );

      setIsRecording(false);
    }
  };

  const removeVoiceNote = () => {
    stopRecording();

    if (voiceUrl) {
      URL.revokeObjectURL(voiceUrl);
    }

    setVoiceBlob(null);
    setVoiceUrl("");
    setRecordingTime(0);
  };

  const formatFileSize = (size) => {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatRecordingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  };

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }

      const recorder = mediaRecorderRef.current;

      if (
        recorder &&
        recorder.state !== "inactive"
      ) {
        recorder.stop();
      }

      if (voiceUrl) {
        URL.revokeObjectURL(voiceUrl);
      }
    };
  }, [voiceUrl]);

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const previousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const selectMapLocation = (position) => {
    setCoordinates({
      latitude: position[0],
      longitude: position[1],
    });

    setLocation(
      `Selected location (${position[0].toFixed(
        6
      )}, ${position[1].toFixed(6)})`
    );

    setLocationError("");
  };
    const useCurrentLocation = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        "Location is not supported by this browser."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        setCoordinates({
          latitude,
          longitude,
        });

        setLocation(
          `Current location (${latitude.toFixed(
            6
          )}, ${longitude.toFixed(6)})`
        );

        setLocationLoading(false);
      },
      (error) => {
        setLocationLoading(false);

        if (error.code === 1) {
          setLocationError(
            "Location permission was denied. Please allow location access in your browser."
          );
        } else if (error.code === 2) {
          setLocationError(
            "Your location could not be determined. Try again."
          );
        } else {
          setLocationError(
            "Unable to get your location. Please try again."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const submitReport = async () => {
  if (!category) {
    setSubmitError(
      "Please select a problem category."
    );

    return;
  }

  setSubmitError("");
  setSubmitLoading(true);

  const title =
    category === "Streetlight"
      ? "Streetlight not working"
      : category === "Water"
      ? "Water supply issue"
      : category === "Electricity"
      ? "Electricity problem"
      : category === "Waste"
      ? "Waste collection issue"
      : category === "Roads"
      ? "Road problem"
      : "Civic issue";

  const complaintLocation = {
    address:
      location || "Ward 7, Safidon",

    landmark:
      landmark || null,

    latitude:
      coordinates?.latitude ?? null,

    longitude:
      coordinates?.longitude ?? null,
  };

  try {
    // --------------------------------------------------------
    // STEP 1: CREATE COMPLAINT
    // --------------------------------------------------------

    const response = await apiRequest(
      "/complaints",
      {
        method: "POST",

        body: JSON.stringify({
          title,

          description:
            description ||
            "No additional description provided.",

          category:
            category || "Other",

          location:
            complaintLocation,

          priority: "medium",
        }),
      }
    );

    const complaintId =
      response?.data?.complaint_id ||
      response?.complaint_id;

    if (!complaintId) {
      throw new Error(
        "Complaint was created, but no complaint ID was returned."
      );
    }

    // --------------------------------------------------------
    // STEP 2: UPLOAD PHOTO EVIDENCE
    // --------------------------------------------------------

    for (const photo of photoFiles) {
      const formData = new FormData();

      formData.append(
        "evidence_type",
        "photo"
      );

      formData.append(
        "file",
        photo
      );

      await apiRequest(
        `/complaints/${complaintId}/evidence`,
        {
          method: "POST",
          body: formData,
        }
      );
    }

    // --------------------------------------------------------
    // STEP 3: UPLOAD OTHER FILES
    // --------------------------------------------------------

    for (const file of otherFiles) {
      const formData = new FormData();

      formData.append(
        "evidence_type",
        "file"
      );

      formData.append(
        "file",
        file
      );

      await apiRequest(
        `/complaints/${complaintId}/evidence`,
        {
          method: "POST",
          body: formData,
        }
      );
    }

    // --------------------------------------------------------
    // STEP 4: UPLOAD VOICE NOTE
    // --------------------------------------------------------

    if (voiceBlob) {
      const voiceFile = new File(
        [voiceBlob],
        `voice-note-${Date.now()}.webm`,
        {
          type:
            voiceBlob.type ||
            "audio/webm",
        }
      );

      const formData = new FormData();

      formData.append(
        "evidence_type",
        "voice"
      );

      formData.append(
        "file",
        voiceFile
      );

      await apiRequest(
        `/complaints/${complaintId}/evidence`,
        {
          method: "POST",
          body: formData,
        }
      );
    }

    // --------------------------------------------------------
    // STEP 5: UPDATE LOCAL REPORT
    // --------------------------------------------------------

    const newReport = {
      id: complaintId,

      title,

      category:
        category || "Other",

      status: "Submitted",

      date: "Today",

      location:
        location || "Ward 7, Safidon",

      description:
        description ||
        "No additional description provided.",

      landmark,

      coordinates,
    };

    if (onSubmitReport) {
      onSubmitReport(newReport);
    }

    setSubmittedReportId(
      complaintId
    );

    setSubmitted(true);

  } catch (error) {
    console.error(
      "Complaint submission failed:",
      error
    );

    setSubmitError(
      error.message ||
        "Unable to submit your report. Please try again."
    );

  } finally {
    setSubmitLoading(false);
  }
};
  
  if (submitted) {
    return (
      <div className="report-page">
        <main className="report-success-page">
          <section className="report-success-card">
            <div className="success-icon">
              <Check size={32} />
            </div>

            <span className="section-overline">
              REPORT SUBMITTED
            </span>

            <h1>
              Your report has been submitted.
            </h1>

            <p>
              Your issue has been recorded and
              will be forwarded to the responsible
              department.
            </p>

            <div className="success-report-id">
              <span>REPORT ID</span>
              <strong>
                {submittedReportId}
              </strong>
            </div>

            <div className="success-actions">
              <button
                className="button-primary"
                onClick={onReports}
              >
                Track this report
                <ArrowRight size={15} />
              </button>

              <button
                className="report-back"
                onClick={onBack}
              >
                Back to home
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="report-page">
      <header className="report-header">
        <div className="report-header-inner">
          <button
            className="report-brand"
            onClick={onBack}
          >
            <span className="brand-mark">
              L
            </span>

            <span className="brand-name">
              Lok<span>Setu</span>
            </span>
          </button>

          <button
            className="report-close"
            onClick={onBack}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>
      </header>

      <div className="report-progress">
        <div className="report-progress-inner">
          <div
            className={`report-step ${
              step >= 1 ? "active" : ""
            } ${
              step > 1 ? "completed" : ""
            }`}
          >
            <span>
              {step > 1 ? (
                <Check size={13} />
              ) : (
                "1"
              )}
            </span>

            <div>
              <strong>Problem</strong>
              <small>What happened?</small>
            </div>
          </div>

          <div
            className={`progress-line ${
              step > 1 ? "filled" : ""
            }`}
          />

          <div
            className={`report-step ${
              step >= 2 ? "active" : ""
            } ${
              step > 2 ? "completed" : ""
            }`}
          >
            <span>
              {step > 2 ? (
                <Check size={13} />
              ) : (
                "2"
              )}
            </span>

            <div>
              <strong>Location</strong>
              <small>Where is it?</small>
            </div>
          </div>

          <div
            className={`progress-line ${
              step > 2 ? "filled" : ""
            }`}
          />

          <div
            className={`report-step ${
              step >= 3 ? "active" : ""
            }`}
          >
            <span>3</span>

            <div>
              <strong>Review</strong>
              <small>Check & submit</small>
            </div>
          </div>
        </div>
      </div>

      <main className="report-main">
        {step === 1 && (
          <section className="report-content">
            <div className="report-heading">
              <span className="section-overline">
                STEP 1 OF 3
              </span>

              <h1>
                What needs attention?
              </h1>

              <p>
                Choose the category that best describes
                the problem you're reporting.
              </p>
            </div>

            <div className="report-category-grid">
              {categories.map((item) => {
                const Icon = item.icon;

                const selected =
                  category === item.name;

                return (
                  <button
                    type="button"
                    key={item.name}
                    className={`report-category ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() =>
                      setCategory(item.name)
                    }
                  >
                    <span className="report-category-icon">
                      <Icon size={21} />
                    </span>

                    <span>
                      <strong>
                        {item.name}
                      </strong>

                      <small>
                        {item.description}
                      </small>
                    </span>

                    {selected && (
                      <span className="category-check">
                        <Check size={12} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="report-field">
              <label>
                Tell us more
                <span>Optional</span>
              </label>

              <textarea
                value={description}
                maxLength={500}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Describe what you noticed..."
                rows="5"
              />

              <div className="report-field-footer">
                <span>
                  {description.length}/500 characters
                </span>
              </div>
            </div>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handlePhotoChange}
            />

            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={handleFileChange}
            />

            <div className="evidence-row">
              <button
                type="button"
                onClick={() =>
                  photoInputRef.current?.click()
                }
              >
                <Camera size={17} />
                Add photo
              </button>

              <button
                type="button"
                onClick={startRecording}
              >
                <Mic size={17} />

                {isRecording
                  ? `Stop recording ${formatRecordingTime(
                      recordingTime
                    )}`
                  : "Add voice note"}
              </button>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                <Upload size={17} />
                Add file
              </button>
            </div>

            {(photoFiles.length > 0 ||
              otherFiles.length > 0 ||
              voiceUrl) && (
              <div className="evidence-preview">
                {photoFiles.map((file, index) => (
                  <div
                    className="evidence-item"
                    key={`${file.name}-${file.lastModified}-${index}`}
                  >
                    <Camera size={15} />

                    <span>
                      {file.name}

                      <small>
                        {formatFileSize(file.size)}
                      </small>
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removePhoto(index)
                      }
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {otherFiles.map((file, index) => (
                  <div
                    className="evidence-item"
                    key={`${file.name}-${file.lastModified}-${index}`}
                  >
                    <FileText size={15} />

                    <span>
                      {file.name}

                      <small>
                        {formatFileSize(file.size)}
                      </small>
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeFile(index)
                      }
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {voiceUrl && (
                  <div className="evidence-item evidence-audio">
                    <Mic size={15} />

                    <span>
                      Voice note

                      <small>
                        {formatRecordingTime(
                          recordingTime
                        )}
                      </small>
                    </span>

                    <audio
                      controls
                      src={voiceUrl}
                    />

                    <button
                      type="button"
                      onClick={removeVoiceNote}
                      aria-label="Remove voice note"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {step === 2 && (
          <section className="report-content">
            <div className="report-heading">
              <span className="section-overline">
                STEP 2 OF 3
              </span>

              <h1>
                Where is the problem?
              </h1>

              <p>
                Use your current location or click
                anywhere on the map to select a point.
              </p>
            </div>

            <div className="location-action">
              <div>
                <div className="location-icon">
                  <Navigation size={19} />
                </div>

                <div>
                  <strong>
                    Use my current location
                  </strong>

                  <span>
                    Your browser will provide your
                    current GPS coordinates.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <>
                    <LoaderCircle
                      size={15}
                      className="location-spinner"
                    />
                    Locating...
                  </>
                ) : (
                  <>
                    Use location
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>

            {locationError && (
              <div className="location-error">
                <span>!</span>
                <p>{locationError}</p>
              </div>
            )}

            <div className="real-map-wrapper">
              <MapContainer
                center={
                  coordinates
                    ? [
                        coordinates.latitude,
                        coordinates.longitude,
                      ]
                    : DEFAULT_LOCATION
                }
                zoom={14}
                scrollWheelZoom={true}
                className="real-report-map"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapClickHandler
                  onSelect={selectMapLocation}
                />

                {coordinates && (
                  <CircleMarker
                    center={[
                      coordinates.latitude,
                      coordinates.longitude,
                    ]}
                    radius={10}
                    pathOptions={{
                      className:
                        "report-map-marker",
                    }}
                  />
                )}

                {coordinates && (
                  <MapCenterController
                    position={[
                      coordinates.latitude,
                      coordinates.longitude,
                    ]}
                  />
                )}
              </MapContainer>

              <div className="map-instruction">
                <MapPin size={15} />
                Click the map to choose a location
              </div>
            </div>

            {coordinates && (
              <div className="location-success">
                <Check size={15} />

                <span>
                  Location selected:{" "}
                  {coordinates.latitude.toFixed(6)},{" "}
                  {coordinates.longitude.toFixed(6)}
                </span>
              </div>
            )}

            <div className="report-field">
              <label>
                Location or landmark
                <span>Recommended</span>
              </label>

              <input
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
                placeholder="e.g. Main Bazaar, near the bus stand"
              />
            </div>

            <div className="report-field">
              <label>
                Additional landmark
                <span>Optional</span>
              </label>

              <input
                value={landmark}
                onChange={(event) =>
                  setLandmark(event.target.value)
                }
                placeholder="Nearby shop, building or landmark"
              />
            </div>
          </section>
        )}
                {step === 3 && (
          <section className="report-content">
            <div className="report-heading">
              <span className="section-overline">
                STEP 3 OF 3
              </span>

              <h1>
                Check your report.
              </h1>

              <p>
                Make sure everything looks right before
                submitting.
              </p>
            </div>

            <div className="review-card">
              <div className="review-section">
                <div className="review-label">
                  <span>PROBLEM</span>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                  >
                    Edit
                  </button>
                </div>

                <div className="review-value">
                  <strong>
                    {category ||
                      "No category selected"}
                  </strong>

                  <p>
                    {description ||
                      "No additional description provided."}
                  </p>
                </div>
              </div>

              <div className="review-divider" />

              <div className="review-section">
                <div className="review-label">
                  <span>LOCATION</span>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                  >
                    Edit
                  </button>
                </div>

                <div className="review-location">
                  <MapPin size={17} />

                  <div>
                    <strong>
                      {location ||
                        "Ward 7, Safidon"}
                    </strong>

                    <span>
                      {landmark ||
                        "No additional landmark provided."}
                    </span>
                  </div>
                </div>
              </div>

              <div className="review-divider" />

              <div className="review-section">
                <div className="review-label">
                  <span>GPS COORDINATES</span>
                </div>

                <div className="review-empty">
                  <MapPin size={17} />

                  <span>
                    {coordinates
                      ? `${coordinates.latitude.toFixed(
                          6
                        )}, ${coordinates.longitude.toFixed(
                          6
                        )}`
                      : "No GPS coordinates added"}
                  </span>
                </div>
              </div>

              <div className="review-divider" />

              <div className="review-section">
                <div className="review-label">
                  <span>EVIDENCE</span>
                </div>

                {photoFiles.length === 0 &&
                otherFiles.length === 0 &&
                !voiceUrl ? (
                  <div className="review-empty">
                    <Camera size={17} />

                    <span>
                      No photos or files added
                    </span>
                  </div>
                ) : (
                  <div className="review-evidence-list">
                    {photoFiles.length > 0 && (
                      <div>
                        <strong>
                          Photos ({photoFiles.length})
                        </strong>

                        {photoFiles.map(
                          (file, index) => (
                            <span
                              key={`${file.name}-${index}`}
                            >
                              {file.name}
                            </span>
                          )
                        )}
                      </div>
                    )}

                    {otherFiles.length > 0 && (
                      <div>
                        <strong>
                          Files ({otherFiles.length})
                        </strong>

                        {otherFiles.map(
                          (file, index) => (
                            <span
                              key={`${file.name}-${index}`}
                            >
                              {file.name}
                            </span>
                          )
                        )}
                      </div>
                    )}

                    {voiceUrl && (
                      <div>
                        <strong>
                          Voice note
                        </strong>

                        <audio
                          controls
                          src={voiceUrl}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {submitError && (
              <div className="location-error">
                <span>!</span>
                <p>{submitError}</p>
              </div>
            )}

            <div className="submission-note">
              <ShieldIcon />

              <p>
                Your report will be shared with the
                department responsible for this type
                of issue.
              </p>
            </div>
          </section>
        )}

        <div className="report-actions">
          <button
            type="button"
            className="report-back"
            onClick={previousStep}
          >
            <ArrowLeft size={15} />
            Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              className="button-primary"
              onClick={nextStep}
              disabled={
                step === 1 && !category
              }
            >
              Continue
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              className="button-primary"
              onClick={submitReport}
              disabled={submitLoading}
            >
              {submitLoading
                ? "Submitting..."
                : "Submit report"}

              {!submitLoading && (
                <ArrowRight size={15} />
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function ShieldIcon() {
  return (
    <div className="submission-shield">
      <Check size={15} />
    </div>
  );
}

export default Report;