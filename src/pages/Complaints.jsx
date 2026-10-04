import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import useUser from "../hooks/useUser";
import { getMyComplaints, createComplaint, getAllComplaints } from "../api/complaintApi";

import "./Complaints.css";


const categories = [
  "LABORATORY",
  "INFRASTRUCTURE",
  "WIFI",
  "CLASSROOM",
  "LIBRARY",
  "OTHER",
];

const statusFilters = ["ALL", "PENDING", "IN_PROGRESS", "RESOLVED"];

const formatLabel = (value = "") =>
  value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getProgress = (status) => {
  switch (status) {
    case "PENDING":
      return 34;
    case "IN_PROGRESS":
      return 68;
    case "RESOLVED":
      return 100;
    default:
      return 0;
  }
};

function Complaints() {
  const { profile, loading: profileLoading } = useUser();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "INFRASTRUCTURE",
    location: "",
    image: null,
  });


  // =========================================================
  // LOAD CURRENT STUDENT COMPLAINTS FROM BACKEND
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const loadComplaints = async () => {
      try {
        setLoading(true);
        setError("");

        if (!profile?.id) {
          setComplaints([]);
          return;
        }

        const data = await getMyComplaints(profile.id);

        if (mounted) {
          setComplaints(
            Array.isArray(data)
              ? data
              : Array.isArray(data?.content)
                ? data.content
                : Array.isArray(data?.data)
                  ? data.data
                  : []
          );
        }
      } catch (err) {
        console.error("Failed to load complaints:", err);

        if (mounted) {
          setError(
            err?.response?.data?.message ||
            "Unable to load complaints."
          );
          setComplaints([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadComplaints();

    return () => {
      mounted = false;
    };
  }, [profile?.id]);


  const filteredComplaints = useMemo(() => {
    if (statusFilter === "ALL") {
      return complaints;
    }

    return complaints.filter(
      (complaint) => complaint.status === statusFilter
    );
  }, [complaints, statusFilter]);

  const stats = useMemo(
    () => ({
      total: complaints.length,
      pending: complaints.filter((item) => item.status === "PENDING").length,
      inProgress: complaints.filter((item) => item.status === "IN_PROGRESS")
        .length,
      resolved: complaints.filter((item) => item.status === "RESOLVED").length,
    }),
    [complaints]
  );

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;

    setFormData((previous) => ({
      ...previous,
      image: file,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "INFRASTRUCTURE",
      location: "",
      image: null,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      if (!profile?.id) {
        throw new Error("Student profile is not available. Please complete your student profile first.");
      }

      const complaintPayload = {
        ...formData,
        studentId: profile.id,
        ...(profile.departmentId != null
          ? { departmentId: Number(profile.departmentId) }
          : {}),
      };

      console.log("Submitting complaint:", {
        studentId: complaintPayload.studentId,
        departmentId: complaintPayload.departmentId,
        title: complaintPayload.title,
        category: complaintPayload.category,
        location: complaintPayload.location,
      });

      const createdComplaint = await createComplaint(complaintPayload);

      if (createdComplaint) {
        setComplaints((previous) => [
          createdComplaint,
          ...previous,
        ]);
      } else {
        const refreshed = await getAllComplaints();
        setComplaints(
          Array.isArray(refreshed)
            ? refreshed
            : Array.isArray(refreshed?.content)
              ? refreshed.content
              : Array.isArray(refreshed?.data)
                ? refreshed.data
                : []
        );
      }

      resetForm();
      setShowModal(false);
      setStatusFilter("ALL");
    } catch (err) {
      console.error("Failed to submit complaint:", err);

      setError(
        err?.response?.data?.message ||
        "Unable to submit complaint."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="complaints-empty">
        <div className="empty-icon">...</div>
        <h3>Loading student profile...</h3>
        <p>Fetching your student details before loading complaints.</p>
      </div>
    );
  }

  return (
    <div className="complaints-page">
      <section className="complaints-hero">
        <div className="complaints-hero-glow complaints-hero-glow-one" />
        <div className="complaints-hero-glow complaints-hero-glow-two" />

        <div className="container complaints-container">
          <div className="complaints-breadcrumb">
            <Link to="/student/dashboard">Dashboard</Link>
            <span>/</span>
            <span>Complaints</span>
          </div>

          <div className="complaints-hero-grid">
            <div className="complaints-hero-copy">

              <h1>
                Report an 
                <span> issue.</span>
              </h1>

              <p>
                Raise college-related issues and follow their progress from
                submission to resolution.
              </p>

              <div className="complaints-hero-actions">
                <button
                  className="complaint-primary-button"
                  onClick={() => setShowModal(true)}
                >
                  + New Complaint
                </button>

                <span className="complaints-hero-note">
                  <span className="complaints-note-dot" />
                  Your requests stay linked to your account.
                </span>
              </div>
            </div>

            <div className="complaints-hero-card">
              <div className="hero-card-top">
                <div>
                  <span>MY SUPPORT OVERVIEW</span>
                  <h2>Complaint status</h2>
                </div>

                <div className="hero-card-mark">IC</div>
              </div>

              <div className="hero-status-grid">
                <div>
                  <strong>{stats.total}</strong>
                  <span>Total</span>
                </div>
                <div>
                  <strong>{stats.pending}</strong>
                  <span>Pending</span>
                </div>
                <div>
                  <strong>{stats.inProgress}</strong>
                  <span>In progress</span>
                </div>
                <div>
                  <strong>{stats.resolved}</strong>
                  <span>Resolved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container complaints-main">
        {error && (
          <div className="complaints-api-error" role="alert">
            {error}
          </div>
        )}
        
        <section className="complaints-toolbar">
          <div>
            <span className="section-label">MY REQUESTS</span>
            <h2>All Complaints</h2>
            <p>View all reported college issues and their current status.</p>
          </div>

          <div className="complaint-filter-group">
            {statusFilters.map((status) => (
              <button
                key={status}
                type="button"
                className={
                  statusFilter === status
                    ? "complaint-filter active"
                    : "complaint-filter"
                }
                onClick={() => setStatusFilter(status)}
              >
                {status === "ALL" ? "All" : formatLabel(status)}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <section className="complaints-empty">
            <div className="empty-icon">...</div>
            <h3>Loading complaints...</h3>
            <p>Fetching complaints from the college system.</p>
          </section>
        ) : filteredComplaints.length > 0 ? (
          <section className="complaints-list">
            {filteredComplaints.map((complaint) => {
              const progress = getProgress(complaint.status);

              return (
                <article className="complaint-card" key={complaint.id}>
                  <div className="complaint-card-top">
                    <div className="complaint-card-heading">
                      <div className="complaint-icon">!</div>

                      <div>
                        <div className="complaint-tags">
                          <span>{formatLabel(complaint.category)}</span>
                          <span>{complaint.department || complaint.departmentCode || "Department"}</span>
                        </div>

                        <h3>{complaint.title}</h3>
                      </div>
                    </div>

                    <span
                      className={`complaint-status ${complaint.status
                        .toLowerCase()
                        .replace(/_/g, "-")}`}
                    >
                      {formatLabel(complaint.status)}
                    </span>
                  </div>

                  <p className="complaint-description">
                    {complaint.description}
                  </p>

                  <div className="complaint-meta">
                    <span>⌖ {complaint.location}</span>
                    <span>Created {complaint.createdAt}</span>
                    <span>Updated {complaint.updatedAt}</span>
                  </div>

                  {complaint.imageUrl && (
                    <div className="complaint-image-preview">
                      <img
                        src={complaint.imageUrl}
                        alt={complaint.title}
                      />
                    </div>
                  )}

                  <div className="complaint-progress">
                    <div className="complaint-progress-top">
                      <span>Resolution progress</span>
                      <strong>
                        {complaint.status === "RESOLVED"
                          ? "Completed"
                          : complaint.status === "IN_PROGRESS"
                            ? "In progress"
                            : "Submitted"}
                      </strong>
                    </div>

                    <div className="complaint-progress-track">
                      <div style={{ width: `${progress}%` }} />
                    </div>

                    <div className="complaint-progress-steps">
                      <span className={progress >= 34 ? "done" : ""}>
                        Submitted
                      </span>
                      <span className={progress >= 68 ? "done" : ""}>
                        In progress
                      </span>
                      <span className={progress >= 100 ? "done" : ""}>
                        Resolved
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="complaints-empty">
            <div className="empty-icon">✓</div>
            <h3>No complaints found</h3>
            <p>There are no requests matching the selected status.</p>
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
            >
              Show all complaints
            </button>
          </section>
        )}
      </main>

      {showModal && (
        <div
          className="complaint-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              setShowModal(false);
            }
          }}
        >
          <div
            className="complaint-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="complaint-modal-close"
              onClick={() => !submitting && setShowModal(false)}
              aria-label="Close"
            >
              ×
            </button>

            <div className="complaint-modal-heading">
              <span className="section-label">STUDENT SUPPORT</span>
              <h2>Report a complaint</h2>
              <p>
                Share the issue clearly so the college team can understand
                what needs attention.
              </p>
            </div>

            <form className="complaint-form" onSubmit={handleSubmit}>
              <div className="complaint-form-grid">
                <div className="complaint-form-group complaint-form-full">
                  <label htmlFor="complaint-title">Title</label>
                  <input
                    id="complaint-title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. WiFi not working in Block A"
                    required
                  />
                </div>

                <div className="complaint-form-group">
                  <label htmlFor="complaint-category">Category</label>
                  <select
                    id="complaint-category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {formatLabel(category)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="complaint-form-group">
                  <label htmlFor="complaint-location">Location</label>
                  <input
                    id="complaint-location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Block A, Room 204"
                    required
                  />
                </div>

                <div className="complaint-form-group complaint-form-full">
                  <label htmlFor="complaint-description">Description</label>
                  <textarea
                    id="complaint-description"
                    name="description"
                    rows={5}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what is happening..."
                    required
                  />
                </div>

                <div className="complaint-form-group complaint-form-full">
                  <label>Image <span>Optional</span></label>

                  <div className="complaint-file-box">
                    <input
                      id="complaint-image"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageChange}
                    />

                    <label htmlFor="complaint-image">
                      <span className="file-icon">IMG</span>

                      <div>
                        <strong>
                          {formData.image
                            ? formData.image.name
                            : "Attach an image"}
                        </strong>
                        <small>PNG, JPG or WEBP</small>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="complaint-form-actions">
                <button
                  type="button"
                  className="complaint-secondary-button"
                  onClick={() => !submitting && setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="complaint-submit-button"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Complaint →"}
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
