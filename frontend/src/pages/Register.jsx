import { useState } from "react";

import {
  ArrowRight,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import {
  apiRequest,
  saveAuth,
} from "../api";

export default function Register({
  onBack,
  onLogin,
  onRegisterSuccess,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    ward: "",
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

    if (
      !form.name ||
      !form.email ||
      !form.password
    ) {
      setError(
        "Name, email and password are required."
      );

      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );

      return;
    }

    try {
      setLoading(true);

      await apiRequest(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            phone: form.phone || null,
            ward: form.ward || null,
          }),
        }
      );

      /*
       * Registration creates the citizen account.
       * Login immediately afterward so the user
       * enters the application already authenticated.
       */
      const loginData = await apiRequest(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        }
      );

      saveAuth(loginData);

      onRegisterSuccess?.(
        loginData?.user
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-wide">
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
            CITIZEN REGISTRATION
          </span>

          <h1>Create your account.</h1>

          <p>
            Join LokSetu to report issues and
            track civic services in your area.
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
            Full name

            <div className="auth-input">
              <User size={18} />

              <input
                type="text"
                name="name"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
          </label>

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
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
          </label>

          <label>
            Phone number

            <div className="auth-input">
              <Phone size={18} />

              <input
                type="tel"
                name="phone"
                placeholder="Optional"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>
          </label>

          <label>
            Ward

            <div className="auth-input">
              <MapPin size={18} />

              <input
                type="text"
                name="ward"
                placeholder="Optional"
                value={form.ward}
                onChange={handleChange}
              />
            </div>
          </label>

          <button
            type="submit"
            className="button-primary auth-submit"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create account"}

            {!loading && (
              <ArrowRight size={17} />
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>
            Already have an account?
          </span>

          <button
            type="button"
            onClick={onLogin}
          >
            Sign in
            <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </main>
  );
}