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

import { useEffect, useState } from "react";

const DEFAULT_LOCATION = [29.405, 76.67];

const categories = [
  { name: "Roads", description: "Potholes & damage", icon: Navigation },
  { name: "Water", description: "Supply & leakage", icon: Droplets },
  { name: "Electricity", description: "Power problems", icon: Zap },
  { name: "Streetlight", description: "Lights & poles", icon: Lightbulb },
  { name: "Waste", description: "Garbage & sanitation", icon: Trash2 },
  { name: "Other", description: "Something else", icon: FileText },
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
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

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

  const submitReport = () => {
    const reportNumber = Math.floor(
      10000 + Math.random() * 90000
    );

    const reportId = `LS-2026-${reportNumber}`;

    const newReport = {
      id: reportId,
      title:
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
          : "Civic issue",

      category: category || "Other",

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

    setSubmittedReportId(reportId);
    setSubmitted(true);
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
              Your issue has been recorded and will be
              forwarded to the responsible department.
            </p>

            <div className="success-report-id">
              <span>REPORT ID</span>
              <strong>{submittedReportId}</strong>
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
            <span className="brand-mark">L</span>

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
            } ${step > 1 ? "completed" : ""}`}
          >
            <span>
              {step > 1 ? <Check size={13} /> : "1"}
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
            } ${step > 2 ? "completed" : ""}`}
          >
            <span>
              {step > 2 ? <Check size={13} /> : "2"}
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

              <h1>What needs attention?</h1>

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
                      <strong>{item.name}</strong>

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

            <div className="evidence-row">
              <button type="button">
                <Camera size={17} />
                Add photo
              </button>

              <button type="button">
                <Mic size={17} />
                Add voice note
              </button>

              <button type="button">
                <Upload size={17} />
                Add file
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="report-content">
            <div className="report-heading">
              <span className="section-overline">
                STEP 2 OF 3
              </span>

              <h1>Where is the problem?</h1>

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
                      className: "report-map-marker",
                    }}
                  >
                    <></>
                  </CircleMarker>
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

              <h1>Check your report.</h1>

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

                <div className="review-empty">
                  <Camera size={17} />

                  <span>
                    No photos or files added
                  </span>
                </div>
              </div>
            </div>

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
            >
              Submit report
              <ArrowRight size={15} />
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