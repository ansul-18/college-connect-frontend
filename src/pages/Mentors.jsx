import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import {
  getAllMentors,
} from "../api/mentorApi";

import "./mentors.css";

function Mentors() {
  const navigate = useNavigate();

  // ==========================================================
  // STATES
  // ==========================================================

  const [mentors, setMentors] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [department, setDepartment] =
    useState("ALL");

  const [type, setType] =
    useState("ALL");

  const [skill, setSkill] =
    useState("ALL");

  // ==========================================================
  // LOAD MENTORS
  // ==========================================================

  useEffect(() => {
    const loadMentors = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getAllMentors();

        setMentors(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load mentors:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Failed to load mentors."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMentors();
  }, []);

  // ==========================================================
  // DEPARTMENTS
  // ==========================================================

  const departments = useMemo(() => {
    const values =
      mentors
        .map(
          (mentor) =>
            mentor.departmentName
        )
        .filter(Boolean);

    return [
      "ALL",
      ...new Set(values),
    ];
  }, [mentors]);

  // ==========================================================
  // SKILLS
  // ==========================================================

  const skills = useMemo(() => {
    const allSkills = [];

    mentors.forEach((mentor) => {
      if (
        Array.isArray(
          mentor.skills
        )
      ) {
        allSkills.push(
          ...mentor.skills
        );
      }
    });

    return [
      "ALL",
      ...new Set(allSkills),
    ];
  }, [mentors]);

  // ==========================================================
  // FILTER MENTORS
  // ==========================================================

  const filteredMentors =
    useMemo(() => {
      return mentors.filter(
        (mentor) => {

          const mentorName =
            mentor.name ||
            "";

          const matchesSearch =
            !search ||
            mentorName
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesDepartment =
            department === "ALL" ||
            mentor.departmentName ===
              department;

          const matchesType =
            type === "ALL" ||
            mentor.mentorType ===
              type;

          const matchesSkill =
            skill === "ALL" ||
            mentor.skills?.some(
              (item) =>
                item
                  .toLowerCase() ===
                skill.toLowerCase()
            );

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesType &&
            matchesSkill
          );
        }
      );
    }, [
      mentors,
      search,
      department,
      type,
      skill,
    ]);

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearAllFilters = () => {
    setSearch("");
    setDepartment("ALL");
    setType("ALL");
    setSkill("ALL");
  };

  // ==========================================================
  // INITIALS
  // ==========================================================

  const getInitials = (name) => {
    if (!name) {
      return "M";
    }

    const parts =
      name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[
        parts.length - 1
      ].charAt(0)
    ).toUpperCase();
  };

const getAboutPreview = (value) => {
    if (!value) return "";
    const text = String(value).replace(/\s+/g, " ").trim();
    return text.length > 110 ? `${text.slice(0, 110).trim()}…` : text;
  };

const resolveProfileImage = (value) => {
    if (!value) return "";

    const url = String(value).trim();

    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("data:") ||
      url.startsWith("blob:")
    ) {
      return url;
    }

    if (url.startsWith("/")) {
      return `${window.location.origin}${url}`;
    }

    return `${window.location.origin}/${url}`;
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="mentors-page">

        <section className="mentors-header">

          <div className="container">

            <div className="mentors-header-content">
             <div className="mentors-header-copy">
               <span className="dashboard-eyebrow">
                 MENTOR COMMUNITY
               </span>

               <h1>
                 Learn from people
                 <span>{" "}who've done it.</span>
               </h1>

               <p>
                 Connect with experienced mentors, learn practical skills
                 and get career guidance.
               </p>
             </div>

             <div className="mentor-header-stat">
               <strong>{mentors.length}</strong>
               <span>Mentors available</span>
             </div>
           </div>
         </div>
       </section>

        <main className="container mentors-content">

          <section className="mentors-empty">

            <div className="mentors-empty-icon">
              ...
            </div>

            <h3>
              Loading mentors...
            </h3>

            <p>
              Please wait while we load
              available mentors.
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
    <div className="mentors-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="mentors-header">

        <div className="container">

          <div className="mentors-breadcrumb">

            <Link to="/">
              Home
            </Link>

            <span>/</span>

            <span>
              Mentors
            </span>

          </div>

          <div className="mentors-header-content">

            <div>

              <span className="dashboard-eyebrow">
                MENTOR COMMUNITY
              </span>

              <h1>
                Learn from people
                <span>
                  {" "}
                  who've done it.
                </span>
              </h1>

              <p>
                Connect with experienced
                mentors, learn practical
                skills and get career
                guidance.
              </p>

            </div>

            <div className="mentor-header-stat">

              <strong>
                {mentors.length}
              </strong>

              <span>
                Mentors available
              </span>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="container mentors-content">

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
            SEARCH & FILTER
        ================================================== */}

        <section className="mentor-search-card">

          {/* SEARCH */}

          <div className="mentor-search">

            <span className="mentor-search-icon">
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search mentors by name..."
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>
            )}

          </div>

          {/* DEPARTMENT */}

          <div className="mentor-filter-group">

            <span>
              DEPARTMENT
            </span>

            <div className="mentor-filter-pills">

              {departments.map(
                (item) => (

                  <button
                    key={item}
                    type="button"
                    className={
                      department === item
                        ? "mentor-filter active"
                        : "mentor-filter"
                    }
                    onClick={() =>
                      setDepartment(
                        item
                      )
                    }
                  >
                    {item === "ALL"
                      ? "All Departments"
                      : item}
                  </button>

                )
              )}

            </div>

          </div>

          {/* TYPE */}

          <div className="mentor-filter-group">

            <span>
              MENTOR TYPE
            </span>

            <div className="mentor-filter-pills">

              {[
                "ALL",
                "FREE",
                "PAID",
              ].map((item) => (

                <button
                  key={item}
                  type="button"
                  className={
                    type === item
                      ? "mentor-filter active"
                      : "mentor-filter"
                  }
                  onClick={() =>
                    setType(item)
                  }
                >
                  {item === "ALL"
                    ? "All"
                    : item}
                </button>

              ))}

            </div>

          </div>

          {/* SKILL */}

          <div className="mentor-filter-group">

            <span>
              SKILLS
            </span>

            <div className="mentor-filter-pills">

              {skills.map(
                (item) => (

                  <button
                    key={item}
                    type="button"
                    className={
                      skill === item
                        ? "mentor-filter active"
                        : "mentor-filter"
                    }
                    onClick={() =>
                      setSkill(item)
                    }
                  >
                    {item === "ALL"
                      ? "All Skills"
                      : item}
                  </button>

                )
              )}

            </div>

          </div>

        </section>

        {/* ==================================================
            RESULTS
        ================================================== */}

        <section className="mentors-results">

          <div className="mentors-results-header">

            <div>

              <span className="section-label">
                MENTOR DIRECTORY
              </span>

              <h2>
                {filteredMentors.length}{" "}
                {filteredMentors.length ===
                1
                  ? "Mentor"
                  : "Mentors"}
              </h2>

            </div>

            {(search ||
              department !== "ALL" ||
              type !== "ALL" ||
              skill !== "ALL") && (

              <button
                type="button"
                className="clear-all-filters"
                onClick={
                  clearAllFilters
                }
              >
                Clear Filters
              </button>

            )}

          </div>

          {/* ==================================================
              GRID
          ================================================== */}

          {filteredMentors.length >
          0 ? (

            <div className="mentors-grid">

              {filteredMentors.map(
                (mentor) => {

                  const mentorType =
                    mentor.mentorType ||
                    "FREE";

                  return (

                    <article
                      className="mentor-page-card"
                      key={mentor.id}
                    >
                      <div className="mentor-card-label-row">
                        <span className="mentor-card-label">
                          COLLEGE MENTOR
                        </span>

                        <span
                          className={
                            mentorType === "FREE"
                              ? "mentor-page-type free"
                              : "mentor-page-type paid"
                          }
                        >
                          {mentorType}
                        </span>
                      </div>

                      <div className="mentor-page-profile">
                        <div className="mentor-avatar-wrap">
                          {mentor.profileImage ? (
                            <img
                              src={resolveProfileImage(mentor.profileImage)}
                              alt={mentor.name || "Mentor"}
                              className="mentor-page-avatar mentor-page-avatar-image"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                                event.currentTarget.nextElementSibling.style.display = "grid";
                              }}
                            />
                          ) : null}

                          <div
                            className="mentor-page-avatar mentor-page-avatar-fallback"
                            style={{
                              display: mentor.profileImage ? "none" : "grid",
                            }}
                          >
                            {getInitials(mentor.name)}
                          </div>
                        </div>

                        <div className="mentor-page-profile-info">
                          <h3>{mentor.name || "Mentor"}</h3>

                          <p>
                            {mentor.username
                              ? `@${mentor.username.replace(/^@/, "")}`
                              : "College Mentor"}
                          </p>
                        </div>
                      </div>

                      <div className="mentor-page-meta">
                        <div>
                          <span className="mentor-meta-label">DEPARTMENT</span>
                          <strong>
                            {mentor.departmentName || "Department"}
                          </strong>
                        </div>

                        <div>
                          <span className="mentor-meta-label">YEAR</span>
                          <strong>{mentor.year || "—"}</strong>
                        </div>
                      </div>

                      <div className="mentor-page-skills">
                        {Array.isArray(mentor.skills) &&
                        mentor.skills.length > 0 ? (
                          mentor.skills.slice(0, 5).map((mentorSkill) => (
                            <span key={mentorSkill}>{mentorSkill}</span>
                          ))
                        ) : (
                          <small>Skills not added</small>
                        )}
                      </div>

                      {getAboutPreview(mentor.bio) && (
                        <div className="mentor-about">
                          <span className="mentor-about-label">ABOUT</span>
                          <p>{getAboutPreview(mentor.bio)}</p>
                        </div>
                      )}

                      <div className="mentor-access">
                        <div>
                          <span className="mentor-access-label">
                            MENTOR ACCESS
                          </span>

                          {mentorType === "FREE" ? (
                            <div className="mentor-access-price">
                              Free
                              <span> / access</span>
                            </div>
                          ) : (
                            <div className="mentor-access-price">
                              ₹
                              {mentor.price !== null &&
                              mentor.price !== undefined
                                ? Number(mentor.price).toLocaleString("en-IN")
                                : "—"}
                              <span> / access</span>
                            </div>
                          )}
                        </div>

                        <Link
                          to={
                            mentorType === "FREE"
                              ? `/student/chats?mentorId=${mentor.id}`
                              : `/mentors/${mentor.id}`
                          }
                          className="mentor-chat-button"
                        >
                          {mentorType === "FREE" ? "Chat" : "Get Access"}
                          <span>→</span>
                        </Link>
                      </div>
                    </article>

                  );
                }
              )}

            </div>

          ) : (

            /* =================================================
               EMPTY
            ================================================= */

            <div className="mentors-empty">

              <div className="mentors-empty-icon">
                ?
              </div>

              <h3>
                No mentors found
              </h3>

              <p>
                Try changing your search
                or filters.
              </p>

              <button
                type="button"
                onClick={
                  clearAllFilters
                }
              >
                Clear Filters
              </button>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default Mentors;