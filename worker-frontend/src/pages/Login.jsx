import { useState } from "react";
import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";
import { apiRequest, saveWorkerToken } from "../api";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest("/auth/worker/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const token =
        response?.access_token ||
        response?.data?.access_token ||
        response?.token;

      if (!token) {
        throw new Error("Login succeeded, but no access token was returned.");
      }

      saveWorkerToken(token);

      if (onLogin) {
        onLogin(response);
      }
    } catch (error) {
      console.error("Worker login failed:", error);
      setError(error.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="worker-login-page">
      <div className="worker-login-card">
        <div className="worker-brand">
          <div className="worker-brand-mark">L</div>

          <div>
            <strong>
              Lok<span>Setu</span>
            </strong>

            <small>Field Worker Portal</small>
          </div>
        </div>

        <div className="worker-login-heading">
          <span>WORKER ACCESS</span>

          <h1>Welcome back.</h1>

          <p>
            Sign in to view your assigned civic tasks and update their progress.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="worker-field">
            <label htmlFor="worker-email">Email address</label>

            <div className="worker-input-wrap">
              <UserRound size={18} />

              <input
                id="worker-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="worker@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="worker-field">
            <label htmlFor="worker-password">Password</label>

            <div className="worker-input-wrap">
              <LockKeyhole size={18} />

              <input
                id="worker-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="worker-login-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="worker-login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}

            {!loading && <ArrowRight size={17} />}
          </button>
        </form>

        <div className="worker-login-note">
          <strong>LokSetu Field Operations</strong>

          <span>
            Use the account provided by your LokSetu administrator.
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;