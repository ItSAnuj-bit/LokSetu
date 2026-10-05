import {
  ShieldCheck,
  Users,
  HardHat,
  ArrowRight,
  MapPin,
} from "lucide-react";

const portals = [
  {
    title: "Citizen",
    description: "Report civic issues, track complaints, and stay updated.",
    icon: Users,
    url: "http://localhost:5173",
    button: "Continue as Citizen",
  },
  {
    title: "Admin",
    description: "Manage complaints, departments, workers, and updates.",
    icon: ShieldCheck,
    url: "http://localhost:5175",
    button: "Login as Admin",
  },
  {
    title: "Worker",
    description: "View assigned tasks, update status, and submit work proof.",
    icon: HardHat,
    url: "http://localhost:5174",
    button: "Login as Worker",
  },
];

function App() {
  const handlePortalSelect = (url) => {
    window.location.href = url;
  };

  return (
    <div className="portal-page">
      <header className="portal-header">
        <div className="portal-brand">
          <div className="portal-logo">
            <MapPin size={22} />
          </div>

          <div>
            <h1>LokSetu</h1>
            <span>Civic Services Platform</span>
          </div>
        </div>
      </header>

      <main className="portal-main">
        <section className="portal-hero">
          <div className="portal-badge">
            <MapPin size={15} />
            Connecting citizens with better civic services
          </div>

          <h2>Welcome to LokSetu</h2>

          <p>
            Choose how you want to continue with the LokSetu civic services
            platform.
          </p>
        </section>

        <section className="portal-options">
          {portals.map((portal) => {
            const Icon = portal.icon;

            return (
              <article className="portal-card" key={portal.title}>
                <div className="portal-card-icon">
                  <Icon size={28} />
                </div>

                <div className="portal-card-content">
                  <h3>{portal.title}</h3>

                  <p>{portal.description}</p>

                  <button
                    type="button"
                    onClick={() => handlePortalSelect(portal.url)}
                  >
                    {portal.button}
                    <ArrowRight size={17} />
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <p className="portal-footer-text">
          One platform. Three connected experiences.
        </p>
      </main>
    </div>
  );
}

export default App;