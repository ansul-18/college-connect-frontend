import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../api/authApi";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
   event.preventDefault();

   if (formData.password !== formData.confirmPassword) {
       alert("Passwords do not match.");
       return;
   }

   const registerData = {
       name: formData.name,
       email: formData.email,
       password: formData.password,
       role: formData.role
   };

   console.log("Register data:", registerData);

   try {

       const response = await registerUser(registerData);

       console.log("Register response:", response);

       localStorage.setItem("token", response.token);
       localStorage.setItem("userId", response.userId);
       localStorage.setItem("role", response.role);

       alert("Account created successfully.");

       if (response.role === "STUDENT") {
           navigate("/student/dashboard");
       } else if (response.role === "MENTOR_PENDING") {
           navigate("/");
       }

   } catch (error) {

       console.error("Registration failed:", error);

       alert(
           error.response?.data?.message ||
           "Registration failed"
       );
   }
};

  return (
    <div className="auth-page">
      <div className="auth-wrapper">

        <div className="auth-left register-left">

          <Link to="/" className="auth-brand">
            <div className="brand-logo">BC</div>

            <div className="brand-text">
              <span className="brand-title">IET </span>
              <span className="brand-subtitle">Connect</span>
            </div>
          </Link>

          <div className="auth-left-content">

            <span className="auth-eyebrow">
              JOIN THE COMMUNITY
            </span>

            <h1>
              One place to
              <span> learn and grow.</span>
            </h1>

            <p>
              Create your account and become part of your
              college's connected learning community.
            </p>

            <div className="register-mini-stats">

              <div>
                <strong>2.5K+</strong>
                <span>Students</span>
              </div>

              <div>
                <strong>120+</strong>
                <span>Mentors</span>
              </div>

              <div>
                <strong>80+</strong>
                <span>Events</span>
              </div>

            </div>

          </div>

        </div>

        <div className="auth-right">
          <div className="auth-card register-card">

            <div className="auth-heading">
              <h2>Create account</h2>
              <p>Join IET Connect</p>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label htmlFor="name">
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-email">
                  Email address
                </label>

                <input
                  id="register-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">
                  Account type
                </label>

                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="STUDENT">
                    Student
                  </option>

                  <option value="MENTOR">
                    Mentor
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="register-password">
                  Password
                </label>

                <div className="password-wrapper">
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                    minLength={6}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="auth-submit"
              >
                Create Account
                <span>→</span>
              </button>

            </form>

            <p className="auth-switch">
              Already have an account?{" "}
              <Link to="/login">
                Sign in
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;