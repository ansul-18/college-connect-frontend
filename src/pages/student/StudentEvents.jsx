import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "./student-events.css";
import { getAllEvents } from "../../api/collegeApi";

const statusFilters = [
  "ALL",
  "UPCOMING",
  "LIVE",
  "COMPLETED",
];

const categoryFilters = [
  "ALL",
  "WORKSHOP",
  "HACKATHON",
  "SEMINAR",
  "COMPETITION",
  "TECHNICAL",
  "CULTURAL",
  "PLACEMENT",
];

const departmentFilters = [
  "ALL",
  "CSE",
  "IT",
  "ECE",
  "EE",
  "ME",
  "CE",
];

function StudentEvents() {
  const [events, setEvents] = useState([]);

  const [status, setStatus] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [department, setDepartment] = useState("ALL");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAllEvents();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load events:", err);

        setError(
          err?.response?.data?.message ||
            "Failed to load events."
        );
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return events.filter((event) => {
      const eventStatus = String(
        event.status || ""
      ).toUpperCase();

      const eventCategory = String(
        event.category || ""
      ).toUpperCase();

      const eventDepartment = String(
        event.department ||
          event.departmentCode ||
          ""
      ).toUpperCase();

      const statusMatch =
        status === "ALL" ||
        eventStatus === status;

      const categoryMatch =
        category === "ALL" ||
        eventCategory === category;

      const departmentMatch =
        department === "ALL" ||
        eventDepartment === department ||
        eventDepartment === "ALL BRANCHES" ||
        eventDepartment === "ALL DEPARTMENTS";

      const searchMatch =
        !searchText ||
        event.title
          ?.toLowerCase()
          .includes(searchText) ||
        event.description
          ?.toLowerCase()
          .includes(searchText);

      return (
        statusMatch &&
        categoryMatch &&
        departmentMatch &&
        searchMatch
      );
    });
  }, [
    events,
    status,
    category,
    department,
    search,
  ]);

  const formatLabel = (value) => {
    if (value === "ALL") {
      return "All";
    }

    return value
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  const clearFilters = () => {
    setStatus("ALL");
    setCategory("ALL");
    setDepartment("ALL");
    setSearch("");
  };

  const getEventDateParts = (event) => {
    if (event.date) {
      const raw = String(event.date);

      if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
        const parts = raw.substring(0, 10).split("-");
        const dateObject = new Date(
          `${parts[0]}-${parts[1]}-${parts[2]}T00:00:00`
        );

        if (!Number.isNaN(dateObject.getTime())) {
          return {
            day: dateObject.toLocaleDateString("en-IN", {
              day: "2-digit",
            }),
            month: dateObject.toLocaleDateString("en-IN", {
              month: "short",
            }),
          };
        }
      }

      return {
        day: raw,
        month: event.month || "",
      };
    }

    return {
      day: "--",
      month: "DATE",
    };
  };

  const upcomingCount = events.filter(
    (event) =>
      String(event.status || "").toUpperCase() ===
      "UPCOMING"
  ).length;

  const liveCount = events.filter(
    (event) =>
      String(event.status || "").toUpperCase() ===
      "LIVE"
  ).length;

  const completedCount = events.filter(
    (event) =>
      String(event.status || "").toUpperCase() ===
      "COMPLETED"
  ).length;

  if (loading) {
    return (
      <div className="student-events-page">
        <div className="events-page-state">
          <div className="events-page-spinner" />
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-events-page">
        <div className="events-page-state">
          <div className="events-state-icon">!</div>
          <h2>Unable to load events</h2>
          <p>{error}</p>

          <button
            type="button"
            className="events-state-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-events-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="events-page-header">

        <div className="events-hero-circle events-hero-circle-one" />
        <div className="events-hero-circle events-hero-circle-two" />

        <div className="events-page-container">

          <div className="events-breadcrumb">
            <Link to="/student/dashboard">
              Home
            </Link>

            <span>/</span>

            <Link to="/events">
              Events
            </Link>

            <span>/</span>

            <span>All Events</span>
          </div>

          <div className="events-hero-card">

            <div className="events-hero-copy">
              <span className="events-hero-kicker">
                COLLEGE EVENTS
              </span>

              <h1>Discover Events</h1>

              <p>
                Workshops, hackathons, seminars,
                competitions and more.
              </p>
            </div>

            <div className="events-hero-stat-panel">

              <div className="events-count-card">
                <span>EVENTS</span>
                <strong>{filteredEvents.length}</strong>
              </div>

              <div className="events-quick-counts">

                <div>
                  <strong>{upcomingCount}</strong>
                  <span>Upcoming</span>
                </div>

                <div>
                  <strong>{liveCount}</strong>
                  <span>Live</span>
                </div>

                <div>
                  <strong>{completedCount}</strong>
                  <span>Completed</span>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="student-events-content">

        <div className="events-page-container">

          <div className="events-page-layout">

            {/* =================================================
                LEFT
            ================================================= */}

            <section className="events-main-column">

              {/* SEARCH */}

              <section className="events-search-card">

                <div className="events-search-card-top">

                  <div>
                    <span className="events-panel-kicker">
                      SEARCH
                    </span>

                    <h2>Find an event</h2>
                  </div>

                  {search && (
                    <button
                      type="button"
                      className="search-clear-text"
                      onClick={() => setSearch("")}
                    >
                      Clear
                    </button>
                  )}

                </div>

                <div className="events-search-box">

                  <span className="events-search-icon">
                    ⌕
                  </span>

                  <input
                    type="text"
                    value={search}
                    placeholder="Search events by title or description..."
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                  />

                  {search && (
                    <button
                      type="button"
                      className="events-search-clear"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}

                </div>

              </section>

              {/* RESULTS */}

              <section className="student-events-results">

                <div className="results-header">

                  <div>
                    <span className="section-label">
                      EVENTS
                    </span>

                    <h2>
                      {status === "ALL"
                        ? "All Events"
                        : `${formatLabel(status)} Events`}
                    </h2>
                  </div>

                  <span className="results-count">
                    {filteredEvents.length} result
                    {filteredEvents.length !== 1
                      ? "s"
                      : ""}
                  </span>

                </div>

                {filteredEvents.length > 0 ? (

                  <div className="student-events-list">

                    {filteredEvents.map((event) => {

                      const eventStatus = String(
                        event.status || ""
                      ).toUpperCase();

                      const registrationLimit =
                        Number(
                          event.registrationLimit || 0
                        );

                      const registered = Number(
                        event.registered ||
                          event.registrationCount ||
                          0
                      );

                      const progress =
                        registrationLimit > 0
                          ? Math.min(
                              (registered /
                                registrationLimit) *
                                100,
                              100
                            )
                          : 0;

                      const dateParts =
                        getEventDateParts(event);

                      return (
                        <article
                          className="student-event-item"
                          key={event.id}
                        >

                          {/* DATE */}

                          <div className="event-item-date">
                            <strong>
                              {dateParts.day}
                            </strong>

                            <span>
                              {dateParts.month}
                            </span>
                          </div>

                          {/* DETAILS */}

                          <div className="event-item-content">

                            <div className="event-item-tags">

                              {event.department && (
                                <span className="event-dept-tag">
                                  {event.department}
                                </span>
                              )}

                              {event.category && (
                                <span className="event-category-tag">
                                  {event.category}
                                </span>
                              )}

                              {eventStatus === "LIVE" && (
                                <span className="event-live-tag">
                                  ● LIVE
                                </span>
                              )}

                              {eventStatus === "COMPLETED" && (
                                <span className="event-completed-tag">
                                  COMPLETED
                                </span>
                              )}

                            </div>

                            <h3>{event.title}</h3>

                            <div className="event-item-meta">

                              <span>
                                🕐{" "}
                                {event.time ||
                                  "Time not available"}
                              </span>

                              <span>
                                📍{" "}
                                {event.venue ||
                                  "Venue not available"}
                              </span>

                              <span>
                                📅{" "}
                                {event.fullDate ||
                                  event.date ||
                                  "Date not available"}
                              </span>

                            </div>

                            {event.registrationRequired &&
                              registrationLimit > 0 && (
                                <div className="registration-progress">

                                  <div className="registration-text">

                                    <span>
                                      Registration
                                    </span>

                                    <strong>
                                      {registered}/
                                      {registrationLimit}
                                    </strong>

                                  </div>

                                  <div className="progress-bar">
                                    <div
                                      style={{
                                        width: `${progress}%`,
                                      }}
                                    />
                                  </div>

                                </div>
                            )}

                          </div>

                          {/* OPTIONAL IMAGE */}

                          <div className="event-item-image">

                            {event.imageUrl ? (
                              <img
                                src={event.imageUrl}
                                alt={event.title}
                                loading="lazy"
                                onError={(imageEvent) => {
                                  imageEvent.currentTarget.style.display =
                                    "none";

                                  imageEvent.currentTarget.parentElement.classList.add(
                                    "image-fallback-visible"
                                  );
                                }}
                              />
                            ) : null}

                            <div className="event-image-fallback">
                              <span>EVENT</span>
                            </div>

                          </div>

                          {/* ACTION */}

                          <div className="event-item-action">

                            {eventStatus === "COMPLETED" ? (
                              <span className="completed-label">
                                Completed
                              </span>
                            ) : (
                              <Link
                                to={`/events/${event.id}`}
                                className="register-event-button"
                              >
                                {event.registrationRequired
                                  ? "Register"
                                  : "View Event"}
                              </Link>
                            )}

                            <Link
                              to={`/events/${event.id}`}
                              className="event-details-link"
                            >
                              View Event
                              <span>Details →</span>
                            </Link>

                          </div>

                        </article>
                      );
                    })}

                  </div>

                ) : (

                  <div className="events-empty-state">

                    <div className="empty-icon">
                      🔎
                    </div>

                    <h3>No events found</h3>

                    <p>
                      Try changing your filters or search
                      for another event.
                    </p>

                    <button
                      type="button"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </button>

                  </div>
                )}

              </section>

            </section>

            {/* =================================================
                RIGHT FILTER SIDEBAR
            ================================================= */}

            <aside className="events-filter-sidebar">

              <section className="events-filter-panel">

                <div className="events-filter-panel-heading">

                  <div>
                    <span className="events-panel-kicker">
                      FILTERS
                    </span>

                    <h2>Events</h2>
                  </div>

                  <button
                    type="button"
                    className="clear-filters-button"
                    onClick={clearFilters}
                  >
                    Clear all
                  </button>

                </div>

                {/* STATUS */}

                <div className="event-filter-group">

                  <span className="filter-label">
                    Status
                  </span>

                  <div className="filter-pills">

                    {statusFilters.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={
                          status === item
                            ? "filter-pill active"
                            : "filter-pill"
                        }
                        onClick={() =>
                          setStatus(item)
                        }
                      >
                        {formatLabel(item)}
                      </button>
                    ))}

                  </div>

                </div>

                {/* CATEGORY */}

                <div className="event-filter-group">

                  <span className="filter-label">
                    Category
                  </span>

                  <div className="filter-pills">

                    {categoryFilters.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={
                          category === item
                            ? "filter-pill active"
                            : "filter-pill"
                        }
                        onClick={() =>
                          setCategory(item)
                        }
                      >
                        {formatLabel(item)}
                      </button>
                    ))}

                  </div>

                </div>

                {/* DEPARTMENT */}

                <div className="event-filter-group">

                  <span className="filter-label">
                    Department
                  </span>

                  <div className="filter-pills">

                    {departmentFilters.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={
                          department === item
                            ? "filter-pill active"
                            : "filter-pill"
                        }
                        onClick={() =>
                          setDepartment(item)
                        }
                      >
                        {item === "ALL"
                          ? "All Departments"
                          : item}
                      </button>
                    ))}

                  </div>

                </div>

              </section>

              

            </aside>

          </div>

        </div>
      </main>

    </div>
  );
}

export default StudentEvents;
