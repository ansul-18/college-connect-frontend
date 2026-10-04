import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { loginUser } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const response = await loginUser(formData);

      /*
       * Expected structure will be finalized
       * according to actual Auth Service response.
       *
       * Example:
       * {
       *   token: "...",
       *   user: {
       *      id: 1,
       *      name: "Ansul",
       *      role: "ROLE_STUDENT"
       *   }
       * }
       */

      const accessToken =
        response.token ||
        response.accessToken;

      const userData =
        response.user ||
        {
          id: response.userId,
          name: response.name,
          role: response.role,
        };

      if (!accessToken) {
        throw new Error(
          "Login succeeded but access token was not returned."
        );
      }

      login(userData, accessToken);

      const role = userData?.role;

      if (location.state?.from?.pathname) {
        navigate(
          location.state.from.pathname,
          { replace: true }
        );
        return;
      }

      if (role === "ROLE_STUDENT") {
        navigate("/student/dashboard");
      } else if (role === "ROLE_MENTOR") {
        navigate("/mentor/dashboard");
      } else if (role === "ROLE_SUPER_ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }

    } catch (error) {
      console.error("Login failed:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        "Login failed. Please check your credentials.";

      setError(
        typeof message === "string"
          ? message
          : "Login failed. Please try again."
      );

    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">

        <div className="auth-left">

          <Link to="/" className="auth-brand">
            <div className="brand-logo">BC</div>

            <div className="brand-text">
              <span className="brand-title">
              IET Connect
              </span>

              <span className="brand-subtitle">
              For Engineering Students
              </span>
            </div>
          </Link>

          <div className="auth-left-content">

            <span className="auth-eyebrow">
              WELCOME BACK
            </span>

            <h1>
              Your college community
              <span> is waiting.</span>
            </h1>

            <p>
              Sign in to connect with mentors, discover
              events, explore resources and continue
              learning with your community.
            </p>

            <div className="auth-benefits">

              <div>
                <span>✓</span>
                <p>
                  Connect with experienced mentors
                </p>
              </div>

              <div>
                <span>✓</span>
                <p>
                  Ask and answer community questions
                </p>
              </div>

              <div>
                <span>✓</span>
                <p>
                  Access college resources and updates
                </p>
              </div>

            </div>

          </div>

        </div>

        <div className="auth-right">

          <div className="auth-card">

            <div className="auth-heading">
              <h2>Welcome back</h2>
              <p>
                Sign in to your account
              </p>
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-group">

                <div className="label-row">
                  <label htmlFor="password">
                    Password
                  </label>

                  <button
                    type="button"
                    className="forgot-btn"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="password-wrapper">

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={submitting}
              >
                {submitting
                  ? "Signing in..."
                  : "Sign In"}

                {!submitting && <span>→</span>}
              </button>

            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <p className="auth-switch">
              Don't have an account?{" "}
              <Link to="/register">
                Create one
              </Link>
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;