import { useState } from "react";
import {
  ArrowRight,
  Lock,
  Mail,
} from "lucide-react";

import {
  apiRequest,
  saveAuth,
} from "../api";

export default function Login({
  onBack,
  onRegister,
  onLoginSuccess,
}) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!form.email || !form.password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        }
      );

      saveAuth(data);

      onLoginSuccess?.(
        data?.user
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to sign in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <button
          type="button"
          className="auth-back-button"
          onClick={onBack}
        >
          ← Back to LokSetu
        </button>

        <div className="auth-brand">
          <div className="auth-logo">
            L
          </div>

          <div>
            <strong>LokSetu</strong>

            <span>
              Civic services, connected.
            </span>
          </div>
        </div>

        <div className="auth-heading">
          <span className="section-overline">
            CITIZEN ACCESS
          </span>

          <h1>Welcome back.</h1>

          <p>
            Sign in to report civic issues and
            track your submissions.
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          <label>
            Email address

            <div className="auth-input">
              <Mail size={18} />

              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </label>

          <label>
            Password

            <div className="auth-input">
              <Lock size={18} />

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>
          </label>

          <button
            type="submit"
            className="button-primary auth-submit"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign in"}

            {!loading && (
              <ArrowRight size={17} />
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>
            New to LokSetu?
          </span>

          <button
            type="button"
            onClick={onRegister}
          >
            Create an account
            <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </main>
  );
}