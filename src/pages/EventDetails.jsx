import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
    getEventById,
    registerForEvent,
  cancelEventRegistration,
  getStudentEventRegistrations,
} from "../api/collegeApi";

import useUser from "../hooks/useUser";
import { useAuth } from "../hooks/useAuth";

import "./event-details.css";


function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { user, isAuthenticated } = useAuth();
    const { profile, loading: profileLoading } = useUser();

    const studentId = profile?.id || null;

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [registered, setRegistered] = useState(false);
    const [registrationLoading, setRegistrationLoading] = useState(false);

    useEffect(() => {

        let mounted = true;

        const loadEvent = async () => {

            try {

                setLoading(true);
                setError("");

                const data = await getEventById(id);

                if (!mounted) return;

                setEvent(data);

                if (
                    data?.registrationRequired &&
                    isAuthenticated &&
                    user?.role === "STUDENT" &&
                    studentId
                ) {

                    const registrations =
                        await getStudentEventRegistrations(studentId);

                    if (!mounted) return;

                    const alreadyRegistered =
                        Array.isArray(registrations) &&
                        registrations.some(
                            (registration) =>
                                Number(registration.eventId) === Number(data.id) &&
                                String(registration.status).toUpperCase() === "REGISTERED"
                        );

                    setRegistered(alreadyRegistered);

                } else {
                    setRegistered(false);
                }

            } catch (err) {

                console.error("Failed to load event:", err);

                if (mounted) {
                    setError(
                        err?.response?.data?.message ||
                        "Failed to load event."
                    );
                }

            } finally {

                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadEvent();

        return () => {
            mounted = false;
        };

    }, [id, isAuthenticated, user?.role, studentId]);

    const handleRegistration = async () => {

        if (!event?.id) return;

        if (!isAuthenticated) {
            alert("Please login first to register for this event.");
            navigate("/login");
            return;
        }

        if (user?.role !== "STUDENT") {
            alert("Only students can register for events.");
            return;
        }

        if (!studentId) {
            alert("Student profile not found. Please complete your student profile first.");
            navigate("/student/profile");
            return;
        }

        try {
            setRegistrationLoading(true);

            await registerForEvent(event.id, studentId);
            setRegistered(true);

            setEvent((current) => ({
                ...current,
                registrationCount: Number(current.registrationCount || 0) + 1,
            }));

        } catch (err) {
            console.error("Failed to register for event:", err);
            alert(err?.response?.data?.message || "Registration failed.");

        } finally {
            setRegistrationLoading(false);
        }
    };


    const handleCancelRegistration = async () => {

        if (!event?.id) return;

        if (!isAuthenticated || user?.role !== "STUDENT") {
            alert("Please login as a student to manage your registration.");
            return;
        }

        if (!studentId) {
            alert("Student profile not found. Please complete your student profile first.");
            navigate("/student/profile");
            return;
        }

        try {
            setRegistrationLoading(true);

            await cancelEventRegistration(event.id, studentId);
            setRegistered(false);

            setEvent((current) => ({
                ...current,
                registrationCount: Math.max(Number(current.registrationCount || 0) - 1, 0),
            }));

        } catch (err) {
            console.error("Failed to cancel event registration:", err);
            alert(err?.response?.data?.message || "Cancellation failed.");

        } finally {
            setRegistrationLoading(false);
        }
    };


    if (loading || profileLoading) {
        return (
            <div className="event-details-page">
                <section className="event-details-loading">
                    <div className="event-state-spinner" />
                    <p>Loading event...</p>
                </section>
            </div>
        );
    }

    if (error) {
        return (
            <div className="event-details-page">
                <section className="event-details-state">
                    <div className="event-state-icon">!</div>
                    <h2>Unable to load event</h2>
                    <p>{error}</p>

                    <Link to="/events" className="event-state-link">
                        ← Back to Events
                    </Link>
                </section>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="event-details-page">
                <section className="event-details-state">
                    <div className="event-state-icon">404</div>
                    <h2>Event not found</h2>
                    <p>
                        The event you are looking for does not exist.
                    </p>

                    <Link to="/events" className="event-state-link">
                        ← Back to Events
                    </Link>
                </section>
            </div>
        );
    }

    const status = String(event.status || "UPCOMING").toUpperCase();
    const department = event.departmentCode || "ALL DEPARTMENTS";
    const registeredCount = Number(event.registrationCount || 0);
    const registrationLimit = Number(event.registrationLimit || 0);

    const spotsLeft =
        registrationLimit > 0
            ? Math.max(registrationLimit - registeredCount, 0)
            : null;

    const registrationPercentage =
        registrationLimit > 0
            ? Math.min(
                (registeredCount / registrationLimit) * 100,
                100
            )
            : 0;

    const image = event.imageUrl || "/default-event.jpg";

    const formattedDate = event.date
        ? new Date(`${event.date}T00:00:00`).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric",
            }
        )
        : "Date not available";

    const formattedTime = event.time
        ? formatTime(event.time)
        : "Time not available";

    const statusLabel =
        status === "LIVE"
            ? "● LIVE NOW"
            : status;

    const isFull =
        Boolean(event.registrationRequired) &&
        registrationLimit > 0 &&
        spotsLeft === 0;

    return (
        <div className="event-details-page">

            {/* =====================================================
                HERO
               ===================================================== */}
            <section className="event-detail-hero">
                <div className="event-hero-decoration hero-decoration-one" />
                <div className="event-hero-decoration hero-decoration-two" />

                <div className="event-detail-container">

                    <div className="event-detail-breadcrumb">
                        <Link to="/">Home</Link>
                        <span>/</span>
                        <Link to="/events">Events</Link>
                        <span>/</span>
                        <span>{event.title}</span>
                    </div>

                    <div className="event-hero-card">

                        <div className="event-hero-image-wrap">
                            <img
                                src={image}
                                alt={event.title}
                                className="event-hero-image"
                                onError={(e) => {
                                    if (e.currentTarget.src.endsWith("/default-event.jpg")) {
                                        return;
                                    }

                                    e.currentTarget.src = "/default-event.jpg";
                                }}
                            />

                            <div className="event-image-badge">
                                {statusLabel}
                            </div>
                        </div>

                        <div className="event-hero-content">

                            <span className="event-eyebrow">
                                COLLEGE EVENT
                            </span>

                            <div className="event-hero-tags">
                                <span className="event-tag">
                                    {department}
                                </span>

                                {event.category && (
                                    <span className="event-tag">
                                        {event.category}
                                    </span>
                                )}

                                <span
                                    className={`event-tag event-tag-status event-tag-${status.toLowerCase()}`}
                                >
                                    {statusLabel}
                                </span>
                            </div>

                            <h1>{event.title}</h1>

                            <p className="event-hero-description">
                                {
                                    "Join this college event and be part of the experience."}
                            </p>

                            <div className="event-hero-meta">

                                <HeroMeta
                                    icon="📅"
                                    label="Date"
                                    value={formattedDate}
                                />

                                <HeroMeta
                                    icon="🕐"
                                    label="Time"
                                    value={formattedTime}
                                />

                                <HeroMeta
                                    icon="📍"
                                    label="Venue"
                                    value={event.venue || "To be announced"}
                                />

                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* =====================================================
                MAIN CONTENT
               ===================================================== */}
            <main className="event-detail-main">
                <div className="event-detail-container">
                    <div className="event-detail-layout">

                        {/* =================================================
                            LEFT CONTENT
                           ================================================= */}
                        <div className="event-detail-left">

                            <section className="event-content-card">
                                <span className="event-section-label">
                                    ABOUT THE EVENT
                                </span>

                                <h2>About this event</h2>

                                <p className="event-description">
                                    {event.description ||
                                        "No description available for this event."}
                                </p>
                            </section>

                            <section className="event-content-card">
                                <span className="event-section-label">
                                    EVENT INFORMATION
                                </span>

                                <h2>Event details</h2>

                                <div className="event-information-grid">

                                    <EventInfo
                                        icon="📅"
                                        label="Date"
                                        value={formattedDate}
                                    />

                                    <EventInfo
                                        icon="🕐"
                                        label="Time"
                                        value={formattedTime}
                                    />

                                    <EventInfo
                                        icon="📍"
                                        label="Venue"
                                        value={event.venue || "To be announced"}
                                    />

                                    <EventInfo
                                        icon="🏫"
                                        label="Department"
                                        value={department}
                                    />

                                </div>
                            </section>

                            {event.registrationRequired && (
                                <section className="event-content-card">
                                    <span className="event-section-label">
                                        REGISTRATION
                                    </span>

                                    <h2>Reserve your spot</h2>

                                    <div className="registration-box">

                                        <div className="registration-summary">

                                            <div>
                                                <span className="registration-summary-label">
                                                    REGISTERED
                                                </span>

                                                <div className="registration-count">
                                                    {registeredCount}

                                                    {registrationLimit > 0 && (
                                                        <span>
                                                            / {registrationLimit}
                                                        </span>
                                                    )}
                                                </div>

                                                <p>
                                                    seats filled
                                                </p>
                                            </div>

                                            <div className="registration-spots">
                                                {registrationLimit > 0
                                                    ? spotsLeft
                                                    : "∞"}

                                                <span>
                                                    spots left
                                                </span>
                                            </div>

                                        </div>

                                        {registrationLimit > 0 && (
                                            <div
                                                className="registration-progress"
                                                aria-label={`${Math.round(registrationPercentage)} percent filled`}
                                            >
                                                <div
                                                    className="registration-progress-fill"
                                                    style={{
                                                        width: `${registrationPercentage}%`,
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {registered ? (
                                            <div className="registered-state">

                                                <div className="registered-message">
                                                    <span className="registered-icon">
                                                        ✓
                                                    </span>

                                                    <div>
                                                        <strong>
                                                            You're registered!
                                                        </strong>

                                                        <span>
                                                            Your seat has been reserved for this event.
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="cancel-registration-button"
                                                    onClick={handleCancelRegistration}
                                                    disabled={registrationLoading}
                                                >
                                                    {registrationLoading
                                                        ? "Cancelling..."
                                                        : "Cancel Registration"}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="registration-action">

                                                <div>
                                                    <strong>
                                                        {status === "LIVE"
                                                            ? "Event is live"
                                                            : isFull
                                                                ? "Registration is full"
                                                                : "Registration is open"}
                                                    </strong>

                                                    <span>
                                                        {isFull
                                                            ? "No more seats are available."
                                                            : "Register before all seats are filled."}
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="register-button"
                                                    onClick={handleRegistration}
                                                    disabled={
                                                        registrationLoading ||
                                                        isFull
                                                    }
                                                >
                                                    {registrationLoading
                                                        ? "Registering..."
                                                        : isFull
                                                            ? "Event Full"
                                                            : "Register Now →"}
                                                </button>

                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* =================================================
                            RIGHT SIDEBAR
                           ================================================= */}
                        <aside className="event-detail-sidebar">

                            <div className="event-sidebar-card event-access-card">
                                <div className="sidebar-decoration sidebar-decoration-one" />
                                <div className="sidebar-decoration sidebar-decoration-two" />

                                <span className="sidebar-overline">
                                    EVENT ACCESS
                                </span>

                                <div
                                    className={`sidebar-status sidebar-status-${status.toLowerCase()}`}
                                >
                                    {statusLabel}
                                </div>

                                <div className="sidebar-date-block">
                                    <span>EVENT DATE</span>
                                    <strong>{formattedDate}</strong>
                                </div>

                                <div className="sidebar-details">

                                    <SidebarDetail
                                        label="Time"
                                        value={formattedTime}
                                    />

                                    <SidebarDetail
                                        label="Venue"
                                        value={event.venue || "To be announced"}
                                    />

                                    <SidebarDetail
                                        label="Department"
                                        value={department}
                                    />

                                    <SidebarDetail
                                        label="Category"
                                        value={event.category || "Other"}
                                    />

                                </div>

                                {event.registrationRequired && (
                                    <>
                                        <div className="sidebar-divider" />

                                        <div className="sidebar-registration">
                                            <span>Registration</span>

                                            <strong>
                                                {registeredCount}
                                                {registrationLimit > 0
                                                    ? ` / ${registrationLimit}`
                                                    : ""}
                                            </strong>
                                        </div>

                                        <button
                                            type="button"
                                            className={
                                                registered
                                                    ? "sidebar-cancel-button"
                                                    : "sidebar-register-button"
                                            }
                                            onClick={
                                                registered
                                                    ? handleCancelRegistration
                                                    : handleRegistration
                                            }
                                            disabled={
                                                registrationLoading ||
                                                (!registered && isFull)
                                            }
                                        >
                                            {registrationLoading
                                                ? "Please wait..."
                                                : registered
                                                    ? "✓ Registered"
                                                    : isFull
                                                        ? "Event Full"
                                                        : "Register for Event →"}
                                        </button>
                                    </>
                                )}
                            </div>

                        
                            <Link
                                to="/events"
                                className="back-events-link"
                            >
                                ← Back to all events
                            </Link>

                        </aside>

                    </div>
                </div>
            </main>
        </div>
    );
}


function HeroMeta({ icon, label, value }) {
    return (
        <div className="hero-meta-item">
            <span className="hero-meta-icon">{icon}</span>

            <div>
                <small>{label}</small>
                <strong>{value}</strong>
            </div>
        </div>
    );
}


function EventInfo({ icon, label, value }) {
    return (
        <div className="event-info-box">
            <div className="event-info-icon">{icon}</div>

            <div>
                <span>{label}</span>
                <strong>{value}</strong>
            </div>
        </div>
    );
}


function SidebarDetail({ label, value }) {
    return (
        <div>
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}


function formatTime(value) {
    try {
        const [hours, minutes] = String(value)
            .substring(0, 5)
            .split(":");

        const date = new Date();

        date.setHours(
            Number(hours),
            Number(minutes),
            0,
            0
        );

        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            }
        );
    } catch {
        return value;
    }
}


export default EventDetails;
