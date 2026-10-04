import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "./complaints.css";

import {
  getMyComplaints,
  createComplaint,
} from "../../api/collegeApi";

import { useAuth } from "../../hooks/useAuth";

// ============================================================
// CONSTANTS
// ============================================================

const categories = [
  "LABORATORY",
  "INFRASTRUCTURE",
  "WIFI",
  "CLASSROOM",
  "LIBRARY",
  "OTHER",
];

const statusFilters = [
  "ALL",
  "PENDING",
  "IN_PROGRESS",
  "RESOLVED",
];

// ============================================================
// COMPONENT
// ============================================================

function Complaints() {
  const { user } = useAuth();

  // ==========================================================
  // STATES
  // ==========================================================

  const [complaints, setComplaints] = useState([]);

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [showModal, setShowModal] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "INFRASTRUCTURE",
    location: "",
    image: null,
  });

  // ==========================================================
  // LOAD MY COMPLAINTS
  // ==========================================================

  useEffect(() => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    const loadComplaints = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getMyComplaints(user.userId);

        setComplaints(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load complaints:",
          error
        );

        setError(
          error?.response?.data?.message ||
            "Failed to load complaints."
        );
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, [user?.userId]);

  // ==========================================================
  // FILTER COMPLAINTS
  // ==========================================================

  const filteredComplaints = useMemo(() => {
    if (statusFilter === "ALL") {
      return complaints;
    }

    return complaints.filter(
      (complaint) =>
        getComplaintStatus(complaint) ===
        statusFilter
    );
  }, [complaints, statusFilter]);

  // ==========================================================
  // FORM INPUT
  // ==========================================================

  const handleInputChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================================
  // IMAGE INPUT
  // ==========================================================

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0] || null;

    setFormData((previous) => ({
      ...previous,
      image: file,
    }));
  };

  // ==========================================================
  // RESET FORM
  // ==========================================================

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "INFRASTRUCTURE",
      location: "",
      image: null,
    });
  };

  // ==========================================================
  // CREATE COMPLAINT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user?.userId) {
      setError(
        "User information is not available."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const complaintData = {
        studentId: user.userId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
      };

      const createdComplaint =
        await createComplaint(
          complaintData
        );

      /*
       * Add newly created complaint
       * immediately to the list.
       */

      setComplaints((previous) => [
        createdComplaint,
        ...previous,
      ]);

      // Reset form
      resetForm();

      // Close modal
      setShowModal(false);
    } catch (error) {
      console.error(
        "Failed to create complaint:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to submit complaint."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // GET STATUS
  // ==========================================================

  function getComplaintStatus(complaint) {
    return (
      complaint.status ||
      complaint.complaintStatus ||
      "PENDING"
    );
  }

  // ==========================================================
  // STATUS LABEL
  // ==========================================================

  const getStatusLabel = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase()
      );
  };

  // ==========================================================
  // PROGRESS
  // ==========================================================

  const getProgress = (status) => {
    switch (status) {
      case "PENDING":
        return 33;

      case "IN_PROGRESS":
        return 66;

      case "RESOLVED":
        return 100;

      default:
        return 0;
    }
  };

  // ==========================================================
  // DATE FORMAT
  // ==========================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      return new Date(
        date
      ).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return date;
    }
  };

  // ==========================================================
  // COUNTS
  // ==========================================================

  const pendingCount =
    complaints.filter(
      (complaint) =>
        getComplaintStatus(
          complaint
        ) === "PENDING"
    ).length;

  const inProgressCount =
    complaints.filter(
      (complaint) =>
        getComplaintStatus(
          complaint
        ) === "IN_PROGRESS"
    ).length;

  const resolvedCount =
    complaints.filter(
      (complaint) =>
        getComplaintStatus(
          complaint
        ) === "RESOLVED"
    ).length;

  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {
    return (
      <div className="complaints-page">
        <section className="complaints-header">
          <div className="container">
            <div className="complaints-header-content">
              <div>
                <span className="dashboard-eyebrow">
                  STUDENT SUPPORT
                </span>

                <h1>
                  Report an issue.
                  <span>
                    {" "}
                    Track its progress.
                  </span>
                </h1>

                <p>
                  Report problems around
                  your college and stay
                  updated on their
                  resolution.
                </p>
              </div>
            </div>
          </div>
        </section>

        <main className="container complaints-content">
          <section className="complaints-empty">
            <div className="complaints-empty-icon">
              ...
            </div>

            <h3>
              Loading complaints...
            </h3>

            <p>
              Please wait while we load
              your complaints.
            </p>
          </section>
        </main>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="complaints-page">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <section className="complaints-header">
        <div className="container">

          <div className="complaints-breadcrumb">
            <Link to="/student/dashboard">
              Dashboard
            </Link>

            <span>/</span>

            <span>
              Complaints
            </span>
          </div>

          <div className="complaints-header-content">

            <div>
              <span className="dashboard-eyebrow">
                STUDENT SUPPORT
              </span>

              <h1>
                Report an issue.
                <span>
                  {" "}
                  Track its progress.
                </span>
              </h1>

              <p>
                Report problems around
                your college and stay
                updated on their
                resolution.
              </p>
            </div>

            <button
              className="new-complaint-button"
              onClick={() => {
                setError("");
                setShowModal(true);
              }}
            >
              + New Complaint
            </button>

          </div>
        </div>
      </section>

      {/* ====================================================
          CONTENT
      ==================================================== */}

      <main className="container complaints-content">

        {/* ERROR */}

        {error && (
          <div
            className="complaint-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* ==================================================
            SUMMARY
        ================================================== */}

        

        {/* ==================================================
            TOOLBAR
        ================================================== */}

        <section className="complaints-toolbar">

          <div>
            <span className="section-label">
              MY REQUESTS
            </span>

            <h2>
              My Complaints
            </h2>
          </div>

          <div className="complaint-status-filters">

            {statusFilters.map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  className={
                    statusFilter ===
                    status
                      ? "complaint-filter active"
                      : "complaint-filter"
                  }
                  onClick={() =>
                    setStatusFilter(
                      status
                    )
                  }
                >
                  {status === "ALL"
                    ? "All"
                    : getStatusLabel(
                        status
                      )}
                </button>
              )
            )}

          </div>

        </section>

        {/* ==================================================
            COMPLAINT LIST
        ================================================== */}

        {filteredComplaints.length >
        0 ? (
          <section className="complaints-list">

            {filteredComplaints.map(
              (complaint) => {

                const status =
                  getComplaintStatus(
                    complaint
                  );

                return (
                  <article
                    className="complaint-detail-card"
                    key={
                      complaint.id
                    }
                  >

                    {/* CARD HEADER */}

                    <div className="complaint-card-header">

                      <div className="complaint-main-info">

                        <div className="complaint-status-icon">
                          !
                        </div>

                        <div>

                          <div className="complaint-tags">

                            <span>
                              {complaint.category ||
                                complaint.complaintCategory ||
                                "OTHER"}
                            </span>

                            <span>
                              {complaint.department ||
                                complaint.departmentCode ||
                                "Department"}
                            </span>

                          </div>

                          <h3>
                            {complaint.title}
                          </h3>

                        </div>

                      </div>

                      <span
                        className={`complaint-badge ${status
                          .toLowerCase()
                          .replaceAll(
                            "_",
                            "-"
                          )}`}
                      >
                        {getStatusLabel(
                          status
                        )}
                      </span>

                    </div>

                    {/* DESCRIPTION */}

                    <p className="complaint-description">
                      {
                        complaint.description
                      }
                    </p>

                    {/* META */}

                    <div className="complaint-meta">

                      <span>
                        📍{" "}
                        {complaint.location ||
                          "Location not provided"}
                      </span>

                      <span>
                        Created:{" "}
                        {formatDate(
                          complaint.createdAt
                        )}
                      </span>

                      <span>
                        Updated:{" "}
                        {formatDate(
                          complaint.updatedAt ||
                            complaint.createdAt
                        )}
                      </span>

                    </div>

                    {/* ==================================================
                        PROGRESS
                    ================================================== */}

                    <div className="complaint-progress-section">

                      <div className="complaint-progress-top">

                        <span>
                          Resolution progress
                        </span>

                        <strong>
                          {status ===
                          "RESOLVED"
                            ? "Completed"
                            : status ===
                              "IN_PROGRESS"
                            ? "In progress"
                            : "Submitted"}
                        </strong>

                      </div>

                      <div className="complaint-progress-bar">

                        <div
                          style={{
                            width: `${getProgress(
                              status
                            )}%`,
                          }}
                        />

                      </div>

                      <div className="complaint-progress-labels">

                        <span
                          className={
                            status ===
                              "PENDING" ||
                            status ===
                              "IN_PROGRESS" ||
                            status ===
                              "RESOLVED"
                              ? "done"
                              : ""
                          }
                        >
                          Submitted
                        </span>

                        <span
                          className={
                            status ===
                              "IN_PROGRESS" ||
                            status ===
                              "RESOLVED"
                              ? "done"
                              : ""
                          }
                        >
                          In Progress
                        </span>

                        <span
                          className={
                            status ===
                            "RESOLVED"
                              ? "done"
                              : ""
                          }
                        >
                          Resolved
                        </span>

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </section>
        ) : (

          /* ==================================================
             EMPTY STATE
          ================================================== */

          <section className="complaints-empty">

            <div className="complaints-empty-icon">
              ✓
            </div>

            <h3>
              No complaints found
            </h3>

            <p>
              {statusFilter === "ALL"
                ? "You have not submitted any complaints yet."
                : "There are no complaints matching this status."}
            </p>

            {statusFilter !==
              "ALL" && (
              <button
                onClick={() =>
                  setStatusFilter(
                    "ALL"
                  )
                }
              >
                Show All
              </button>
            )}

          </section>
        )}

      </main>

      {/* ====================================================
          CREATE COMPLAINT MODAL
      ==================================================== */}

      {showModal && (
        <div
          className="complaint-modal-overlay"
          onClick={() =>
            !submitting &&
            setShowModal(false)
          }
        >

          <div
            className="complaint-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CLOSE */}

            <button
              type="button"
              className="complaint-modal-close"
              onClick={() =>
                !submitting &&
                setShowModal(false)
              }
            >
              ×
            </button>

            {/* HEADING */}

            <div className="complaint-modal-heading">

              <span className="section-label">
                STUDENT SUPPORT
              </span>

              <h2>
                Report a complaint
              </h2>

              <p>
                Provide enough information
                so the college team can
                resolve your issue.
              </p>

            </div>

            {/* FORM */}

            <form
              className="complaint-form"
              onSubmit={handleSubmit}
            >

              {/* TITLE */}

              <div className="complaint-form-group">

                <label
                  htmlFor="complaint-title"
                >
                  Title
                </label>

                <input
                  id="complaint-title"
                  type="text"
                  name="title"
                  value={
                    formData.title
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="e.g. WiFi not working in Block A"
                  required
                />

              </div>

              {/* CATEGORY */}

              <div className="complaint-form-group">

                <label
                  htmlFor="complaint-category"
                >
                  Category
                </label>

                <select
                  id="complaint-category"
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleInputChange
                  }
                >

                  {categories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category.replaceAll(
                          "_",
                          " "
                        )}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* LOCATION */}

              <div className="complaint-form-group">

                <label
                  htmlFor="complaint-location"
                >
                  Location
                </label>

                <input
                  id="complaint-location"
                  type="text"
                  name="location"
                  value={
                    formData.location
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="e.g. Block A, Room 204"
                  required
                />

              </div>

              {/* DESCRIPTION */}

              <div className="complaint-form-group">

                <label
                  htmlFor="complaint-description"
                >
                  Description
                </label>

                <textarea
                  id="complaint-description"
                  name="description"
                  rows="5"
                  value={
                    formData.description
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Describe the issue..."
                  required
                />

              </div>

              {/* IMAGE */}

              <div className="complaint-form-group">

                <label
                  htmlFor="complaint-image"
                >
                  Image
                  <span>
                    Optional
                  </span>
                </label>

                <div className="complaint-file-input">

                  <input
                    id="complaint-image"
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImageChange
                    }
                  />

                  <label htmlFor="complaint-image">

                    <span>
                      📷
                    </span>

                    <div>

                      <strong>
                        {formData.image
                          ? formData
                              .image
                              .name
                          : "Upload an image"}
                      </strong>

                      <small>
                        JPG, PNG or WEBP
                      </small>

                    </div>

                  </label>

                </div>

              </div>

              {/* ERROR */}

              {error && (
                <div
                  className="complaint-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {/* ACTIONS */}

              <div className="complaint-form-actions">

                <button
                  type="button"
                  className="complaint-cancel-button"
                  onClick={() =>
                    !submitting &&
                    setShowModal(false)
                  }
                  disabled={
                    submitting
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="complaint-submit-button"
                  disabled={
                    submitting
                  }
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Complaint →"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Complaints;