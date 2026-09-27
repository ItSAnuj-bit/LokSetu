import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Report from "./pages/Report";
import MyReports from "./pages/MyReports";
import Updates from "./pages/Updates";

const initialReports = [
  {
    id: "LS-2026-00184",
    title: "Streetlight not working",
    category: "Streetlight",
    status: "In progress",
    date: "18 Sep 2026",
    location: "Ward 7, Safidon",
    description:
      "Streetlight is not working near the main road.",
  },
  {
    id: "LS-2026-00161",
    title: "Garbage collection missed",
    category: "Waste",
    status: "Resolved",
    date: "15 Sep 2026",
    location: "Ward 7, Safidon",
    description:
      "Garbage collection was missed for the scheduled pickup.",
  },
  {
    id: "LS-2026-00142",
    title: "Road pothole",
    category: "Roads",
    status: "Submitted",
    date: "12 Sep 2026",
    location: "Ward 7, Safidon",
    description:
      "A large pothole is causing difficulty for vehicles.",
  },
];

function App() {
  const [page, setPage] = useState("home");

  const [reports, setReports] = useState(() => {
    try {
      const savedReports =
        localStorage.getItem("loksetu_reports");

      if (savedReports) {
        return JSON.parse(savedReports);
      }

      return initialReports;
    } catch (error) {
      console.error(
        "Could not load saved reports:",
        error
      );

      return initialReports;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "loksetu_reports",
      JSON.stringify(reports)
    );
  }, [reports]);

  const handleNavigate = (target) => {
    setPage(target);
  };

  const handleSubmitReport = (newReport) => {
    setReports((currentReports) => [
      newReport,
      ...currentReports,
    ]);
  };

  let currentPage;

  if (page === "explore") {
    currentPage = (
      <Explore
        onBack={() => setPage("home")}
        onReport={() => setPage("report")}
      />
    );
  } else if (page === "report") {
    currentPage = (
      <Report
        onBack={() => setPage("home")}
        onReports={() => setPage("reports")}
        onSubmitReport={handleSubmitReport}
      />
    );
  } else if (page === "reports") {
    currentPage = (
      <MyReports
        onBack={() => setPage("home")}
        onReport={() => setPage("report")}
        reports={reports}
      />
    );
  } else if (page === "updates") {
    currentPage = (
      <Updates
        onBack={() => setPage("home")}
        onExplore={() => setPage("explore")}
        onReport={() => setPage("report")}
      />
    );
  } else {
    currentPage = (
      <Home
        onExplore={() => setPage("explore")}
        onReport={() => setPage("report")}
        onReports={() => setPage("reports")}
        onUpdates={() => setPage("updates")}
      />
    );
  }

  return (
    <div className="app-shell">
      <Navbar
        page={page}
        onNavigate={handleNavigate}
      />

      <main className="app-content">
        {currentPage}
      </main>
    </div>
  );
}

export default App;