import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Report from "./pages/Report";
import MyReports from "./pages/MyReports";
import Updates from "./pages/Updates";
import Login from "./pages/Login";
import Register from "./pages/Register";

import {
  apiRequest,
  clearAuth,
  getStoredUser,
} from "./api";


function App() {
  const [page, setPage] = useState("home");

  const [user, setUser] = useState(() =>
    getStoredUser()
  );

  const [authChecking, setAuthChecking] =
    useState(true);


  /*
   * Restore the authenticated user from the backend
   * when an access token already exists.
   */
  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem(
        "loksetu_access_token"
      );

      if (!token) {
        setAuthChecking(false);
        return;
      }

      try {
        const data =
          await apiRequest("/auth/me");

        const currentUser =
          data?.user || data;

        setUser(currentUser);

        localStorage.setItem(
          "loksetu_user",
          JSON.stringify(currentUser)
        );
      } catch (error) {
        console.warn(
          "Session could not be restored:",
          error.message
        );

        clearAuth();
        setUser(null);
      } finally {
        setAuthChecking(false);
      }
    }

    restoreSession();
  }, []);


  const handleNavigate = (target) => {
    /*
     * Reporting and My Reports are citizen features.
     * Require authentication before opening them.
     */
    if (
      (target === "report" ||
        target === "reports") &&
      !user
    ) {
      setPage("login");
      return;
    }

    setPage(target);
  };


  const handleLoginSuccess = (
    authenticatedUser
  ) => {
    setUser(
      authenticatedUser ||
        getStoredUser()
    );

    setPage("home");
  };


  const handleRegisterSuccess = (
    authenticatedUser
  ) => {
    setUser(
      authenticatedUser ||
        getStoredUser()
    );

    setPage("home");
  };


  const handleLogout = async () => {
    const refreshToken =
      localStorage.getItem(
        "loksetu_refresh_token"
      );

    /*
     * Try to invalidate the refresh token on the
     * backend. Even if this fails, local auth is
     * still cleared.
     */
    if (refreshToken) {
      try {
        await apiRequest(
          "/auth/logout",
          {
            method: "POST",
            body: JSON.stringify({
              refresh_token:
                refreshToken,
            }),
          }
        );
      } catch (error) {
        console.warn(
          "Backend logout failed:",
          error.message
        );
      }
    }

    clearAuth();

    setUser(null);
    setPage("home");
  };


  /*
   * Report.jsx can still call this after creating
   * a complaint. The actual complaint is now stored
   * in the backend, while MyReports loads the real
   * data from GET /complaints/my.
   */
  const handleSubmitReport = (
    newReport
  ) => {
    console.log(
      "Report submitted:",
      newReport
    );
  };


  /*
   * While we check an existing JWT, avoid briefly
   * showing the wrong authentication state.
   */
  if (authChecking) {
    return (
      <div className="app-shell">
        <main className="app-content">
          <div
            style={{
              minHeight: "70vh",
              display: "grid",
              placeItems: "center",
              color: "#77736b",
            }}
          >
            Checking your session...
          </div>
        </main>
      </div>
    );
  }


  /*
   * Authentication pages do not need the normal
   * citizen navbar.
   */
  if (page === "login") {
    return (
      <Login
        onBack={() =>
          setPage("home")
        }
        onRegister={() =>
          setPage("register")
        }
        onLoginSuccess={
          handleLoginSuccess
        }
      />
    );
  }


  if (page === "register") {
    return (
      <Register
        onBack={() =>
          setPage("home")
        }
        onLogin={() =>
          setPage("login")
        }
        onRegisterSuccess={
          handleRegisterSuccess
        }
      />
    );
  }


  let currentPage;


  if (page === "explore") {
    currentPage = (
      <Explore
        onBack={() =>
          setPage("home")
        }
        onReport={() =>
          handleNavigate("report")
        }
      />
    );
  }


  else if (page === "report") {
    currentPage = (
      <Report
        onBack={() =>
          setPage("home")
        }
        onReports={() =>
          handleNavigate("reports")
        }
        onSubmitReport={
          handleSubmitReport
        }
      />
    );
  }


  else if (page === "reports") {
    currentPage = (
      <MyReports
        onBack={() =>
          setPage("home")
        }
        onReport={() =>
          handleNavigate("report")
        }
      />
    );
  }


  else if (page === "updates") {
    currentPage = (
      <Updates
        onBack={() =>
          setPage("home")
        }
        onExplore={() =>
          setPage("explore")
        }
        onReport={() =>
          handleNavigate("report")
        }
      />
    );
  }


  else {
    currentPage = (
      <Home
        onExplore={() =>
          setPage("explore")
        }
        onReport={() =>
          handleNavigate("report")
        }
        onReports={() =>
          handleNavigate("reports")
        }
        onUpdates={() =>
          setPage("updates")
        }
      />
    );
  }


  return (
    <div className="app-shell">
      <Navbar
        page={page}
        onNavigate={handleNavigate}
        user={user}
        onLogin={() =>
          setPage("login")
        }
        onLogout={handleLogout}
      />

      <main className="app-content">
        {currentPage}
      </main>
    </div>
  );
}


export default App;