import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getAllStudents,
    getAllMentors,
    getAllDepartments,
    getAllEvents,
    getAllAnnouncements,
    getAllResources,
    getAllComplaints,
    getAllPosts,
} from "../../api/adminApi";

import "./AdminDashboard.css";

function AdminDashboard() {

    const navigate = useNavigate();

    const [data, setData] = useState({
        students: [],
        mentors: [],
        departments: [],
        events: [],
        announcements: [],
        resources: [],
        complaints: [],
        posts: [],
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDashboard();
    }, []);


    const loadDashboard = async () => {

        try {

            setError("");

            if (data.students.length > 0) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const results = await Promise.allSettled([
                getAllStudents(),
                getAllMentors(),
                getAllDepartments(),
                getAllEvents(),
                getAllAnnouncements(),
                getAllResources(),
                getAllComplaints(),
                getAllPosts(),
            ]);

            const [
                studentsResult,
                mentorsResult,
                departmentsResult,
                eventsResult,
                announcementsResult,
                resourcesResult,
                complaintsResult,
                postsResult,
            ] = results;


            const getValue = (result) => {

                if (
                    result.status === "fulfilled" &&
                    Array.isArray(result.value)
                ) {
                    return result.value;
                }

                return [];
            };


            setData({
                students:
                    getValue(studentsResult),

                mentors:
                    getValue(mentorsResult),

                departments:
                    getValue(departmentsResult),

                events:
                    getValue(eventsResult),

                announcements:
                    getValue(
                        announcementsResult
                    ),

                resources:
                    getValue(resourcesResult),

                complaints:
                    getValue(complaintsResult),

                posts:
                    getValue(postsResult),
            });


            const failed =
                results.filter(
                    (result) =>
                        result.status === "rejected"
                ).length;

            if (failed > 0) {
                setError(
                    `${failed} service${
                        failed > 1 ? "s" : ""
                    } could not be loaded.`
                );
            }

        } catch (error) {

            console.error(
                "Dashboard loading failed:",
                error
            );

            setError(
                "Unable to load dashboard data."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);
        }
    };


    /* ==========================================
       COUNTS
    ========================================== */

    const complaintStats = useMemo(() => {

        const getCount = (status) =>
            data.complaints.filter(
                (item) =>
                    String(item.status)
                        .toUpperCase() === status
            ).length;

        return {
            pending: getCount("PENDING"),
            inProgress: getCount(
                "IN_PROGRESS"
            ),
            resolved: getCount("RESOLVED"),
            rejected: getCount("REJECTED"),
        };

    }, [data.complaints]);


    /* ==========================================
       EVENTS
    ========================================== */

    const upcomingEvents = useMemo(() => {

        return [...data.events]
            .filter((event) => {

                const status =
                    String(
                        event.status || ""
                    ).toUpperCase();

                return (
                    status === "UPCOMING" ||
                    status === "ONGOING"
                );

            })
            .sort((a, b) => {

                return (
                    getDateValue(a) -
                    getDateValue(b)
                );

            })
            .slice(0, 4);

    }, [data.events]);


    /* ==========================================
       ANNOUNCEMENTS
    ========================================== */

    const recentAnnouncements =
        useMemo(() => {

            return [...data.announcements]
                .sort((a, b) => {

                    return (
                        getDateValue(b) -
                        getDateValue(a)
                    );

                })
                .slice(0, 4);

        }, [data.announcements]);


    /* ==========================================
       COMPLAINT PERCENTAGE
    ========================================== */

    const totalComplaints =
        data.complaints.length;

    const resolvedPercentage =
        totalComplaints === 0
            ? 0
            : Math.round(
                  (complaintStats.resolved /
                      totalComplaints) *
                      100
              );


    /* ==========================================
       STATS
    ========================================== */

    const statCards = [
        {
            label: "Students",
            value: data.students.length,
            icon: "🎓",
            path: "/admin/students",
        },

        {
            label: "Mentors",
            value: data.mentors.length,
            icon: "👨‍🏫",
            path: "/admin/mentors",
        },

        {
            label: "Events",
            value: data.events.length,
            icon: "📅",
            path: "/admin/events",
        },

        {
            label: "Complaints",
            value: data.complaints.length,
            icon: "⚠️",
            path: "/admin/complaints",
        },
    ];


    if (loading) {

        return (
            <div className="admin-dashboard-modern">

                <div className="dashboard-loading">

                    <div className="loading-spinner" />

                    <span>
                        Loading dashboard...
                    </span>

                </div>

            </div>
        );
    }


    return (
        <div className="admin-dashboard-modern">

            {/* =====================================
                HERO
            ===================================== */}

            <section className="dashboard-hero">

                <div className="hero-content">

                    <span className="hero-eyebrow">
                        ADMINISTRATION
                    </span>

                    <h1>
                        Good to see you, Admin.
                    </h1>

                    <p>
                        Here's what's happening
                        across your IET Connect
                        platform today.
                    </p>

                </div>


                <button
                    className="dashboard-refresh"
                    onClick={loadDashboard}
                    disabled={refreshing}
                >
                    <span>
                        {refreshing ? "◌" : "↻"}
                    </span>

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}
                </button>

            </section>


            {/* ERROR */}

            {error && (

                <div className="dashboard-warning">

                    <span>
                        ⚠
                    </span>

                    {error}

                </div>

            )}


            {/* =====================================
                STAT CARDS
            ===================================== */}

            <section className="dashboard-stat-grid">

                {statCards.map((card) => (

                    <button
                        key={card.label}
                        className="dashboard-stat-card"
                        onClick={() =>
                            navigate(
                                card.path
                            )
                        }
                    >

                        <div className="stat-card-icon">
                            {card.icon}
                        </div>

                        <div className="stat-card-body">

                            <span>
                                {card.label}
                            </span>

                            <strong>
                                {card.value}
                            </strong>

                        </div>

                        <span className="stat-card-arrow">
                            →
                        </span>

                    </button>

                ))}

            </section>


            {/* =====================================
                MAIN GRID
            ===================================== */}

            <section className="dashboard-main-grid">

                {/* PLATFORM OVERVIEW */}

                <div className="dashboard-panel overview-panel">

                    <div className="panel-heading">

                        <div>

                            <span>
                                OVERVIEW
                            </span>

                            <h2>
                                Platform Overview
                            </h2>

                        </div>

                    </div>


                    <div className="overview-list">

                        <OverviewRow
                            icon="🏛️"
                            label="Departments"
                            value={
                                data.departments.length
                            }
                            path="/admin/departments"
                            onClick={navigate}
                        />

                        <OverviewRow
                            icon="📚"
                            label="Resources"
                            value={
                                data.resources.length
                            }
                            path="/admin/resources"
                            onClick={navigate}
                        />

                        <OverviewRow
                            icon="📢"
                            label="Announcements"
                            value={
                                data.announcements.length
                            }
                            path="/admin/announcements"
                            onClick={navigate}
                        />

                        <OverviewRow
                            icon="💬"
                            label="Community Posts"
                            value={
                                data.posts.length
                            }
                            path="/admin/community"
                            onClick={navigate}
                        />

                    </div>

                </div>


                {/* COMPLAINT OVERVIEW */}

                <div className="dashboard-panel complaint-panel">

                    <div className="panel-heading">

                        <div>

                            <span>
                                SUPPORT
                            </span>

                            <h2>
                                Complaint Overview
                            </h2>

                        </div>

                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/complaints"
                                )
                            }
                        >
                            View all
                        </button>

                    </div>


                    <div className="complaint-overview">

                        <div
                            className="complaint-circle"
                            style={{
                                "--progress":
                                    `${resolvedPercentage * 3.6}deg`,
                            }}
                        >

                            <div>

                                <strong>
                                    {
                                        resolvedPercentage
                                    }%
                                </strong>

                                <span>
                                    resolved
                                </span>

                            </div>

                        </div>


                        <div className="complaint-stats">

                            <ComplaintStat
                                label="Pending"
                                value={
                                    complaintStats.pending
                                }
                                className="pending"
                            />

                            <ComplaintStat
                                label="In Progress"
                                value={
                                    complaintStats.inProgress
                                }
                                className="progress"
                            />

                            <ComplaintStat
                                label="Resolved"
                                value={
                                    complaintStats.resolved
                                }
                                className="resolved"
                            />

                            <ComplaintStat
                                label="Rejected"
                                value={
                                    complaintStats.rejected
                                }
                                className="rejected"
                            />

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================
                LOWER GRID
            ===================================== */}

            <section className="dashboard-lower-grid">

                {/* UPCOMING EVENTS */}

                <div className="dashboard-panel">

                    <div className="panel-heading">

                        <div>

                            <span>
                                CALENDAR
                            </span>

                            <h2>
                                Upcoming Events
                            </h2>

                        </div>

                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/events"
                                )
                            }
                        >
                            Manage
                        </button>

                    </div>


                    <div className="event-list">

                        {upcomingEvents.length === 0 ? (

                            <EmptyState
                                icon="📅"
                                text="No upcoming events"
                            />

                        ) : (

                            upcomingEvents.map(
                                (event) => (

                                    <div
                                        className="dashboard-event"
                                        key={
                                            event.id
                                        }
                                    >

                                        <div className="event-date-box">

                                            <strong>
                                                {getDay(
                                                    event
                                                )}
                                            </strong>

                                            <span>
                                                {getMonth(
                                                    event
                                                )}
                                            </span>

                                        </div>


                                        <div className="dashboard-event-info">

                                            <strong>
                                                {
                                                    event.title ||
                                                    event.name ||
                                                    `Event #${event.id}`
                                                }
                                            </strong>

                                            <span>
                                                {event.venue ||
                                                    event.location ||
                                                    "College Event"}
                                            </span>

                                        </div>


                                        <span
                                            className={`mini-status ${
                                                String(
                                                    event.status ||
                                                        ""
                                                ).toLowerCase()
                                            }`}
                                        >
                                            {
                                                event.status ||
                                                "UPCOMING"
                                            }
                                        </span>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </div>


                {/* RECENT ANNOUNCEMENTS */}

                <div className="dashboard-panel">

                    <div className="panel-heading">

                        <div>

                            <span>
                                UPDATES
                            </span>

                            <h2>
                                Recent Announcements
                            </h2>

                        </div>

                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/announcements"
                                )
                            }
                        >
                            Manage
                        </button>

                    </div>


                    <div className="announcement-list">

                        {recentAnnouncements.length ===
                        0 ? (

                            <EmptyState
                                icon="📢"
                                text="No announcements yet"
                            />

                        ) : (

                            recentAnnouncements.map(
                                (announcement) => (

                                    <div
                                        className="dashboard-announcement"
                                        key={
                                            announcement.id
                                        }
                                    >

                                        <div className="announcement-dot">
                                            📢
                                        </div>

                                        <div>

                                            <strong>
                                                {
                                                    announcement.title ||
                                                    "Announcement"
                                                }
                                            </strong>

                                            <p>
                                                {
                                                    getAnnouncementPreview(
                                                        announcement
                                                    )
                                                }
                                            </p>

                                            <span>
                                                {
                                                    formatDate(
                                                        announcement
                                                    )
                                                }
                                            </span>

                                        </div>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </div>

            </section>


            {/* =====================================
                QUICK ACTIONS
            ===================================== */}

            <section className="quick-section">

                <div className="quick-header">

                    <div>

                        <span>
                            QUICK ACTIONS
                        </span>

                        <h2>
                            Manage your platform
                        </h2>

                    </div>

                </div>


                <div className="quick-grid">

                    <QuickAction
                        icon="👨‍🏫"
                        title="Add Mentor"
                        description="Manage mentor profiles"
                        onClick={() =>
                            navigate(
                                "/admin/students"
                            )
                        }
                    />

                    <QuickAction
                        icon="📅"
                        title="Create Event"
                        description="Publish a college event"
                        onClick={() =>
                            navigate(
                                "/admin/events"
                            )
                        }
                    />

                    <QuickAction
                        icon="📢"
                        title="Announcement"
                        description="Publish an update"
                        onClick={() =>
                            navigate(
                                "/admin/announcements"
                            )
                        }
                    />

                    <QuickAction
                        icon="📚"
                        title="Upload Resource"
                        description="Add academic material"
                        onClick={() =>
                            navigate(
                                "/admin/resources"
                            )
                        }
                    />

                </div>

            </section>

        </div>
    );
}


/* =================================================
   COMPONENTS
================================================= */

function OverviewRow({
    icon,
    label,
    value,
    path,
    onClick,
}) {

    return (
        <button
            className="overview-row"
            onClick={() =>
                onClick(path)
            }
        >

            <div className="overview-row-left">

                <div className="overview-icon">
                    {icon}
                </div>

                <span>
                    {label}
                </span>

            </div>

            <div className="overview-row-right">

                <strong>
                    {value}
                </strong>

                <span>
                    →
                </span>

            </div>

        </button>
    );
}


function ComplaintStat({
    label,
    value,
    className,
}) {

    return (
        <div className="complaint-stat">

            <span
                className={`status-dot ${className}`}
            />

            <span>
                {label}
            </span>

            <strong>
                {value}
            </strong>

        </div>
    );
}


function QuickAction({
    icon,
    title,
    description,
    onClick,
}) {

    return (
        <button
            className="quick-action"
            onClick={onClick}
        >

            <div className="quick-action-icon">
                {icon}
            </div>

            <div>

                <strong>
                    {title}
                </strong>

                <span>
                    {description}
                </span>

            </div>

            <span className="quick-arrow">
                →
            </span>

        </button>
    );
}


function EmptyState({
    icon,
    text,
}) {

    return (
        <div className="dashboard-empty">

            <span>
                {icon}
            </span>

            <p>
                {text}
            </p>

        </div>
    );
}


/* =================================================
   HELPERS
================================================= */

function getDateValue(item) {

    const value =
        item.date ||
        item.eventDate ||
        item.createdAt;

    if (!value) {
        return Number.MAX_SAFE_INTEGER;
    }

    const date =
        new Date(value);

    return Number.isNaN(
        date.getTime()
    )
        ? Number.MAX_SAFE_INTEGER
        : date.getTime();
}


function getDay(event) {

    const value =
        event.date ||
        event.eventDate ||
        event.createdAt;

    if (!value) {
        return "--";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "--";
    }

    return String(
        date.getDate()
    ).padStart(2, "0");
}


function getMonth(event) {

    const value =
        event.date ||
        event.eventDate ||
        event.createdAt;

    if (!value) {
        return "---";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "---";
    }

    return date
        .toLocaleString(
            "en-IN",
            {
                month: "short",
            }
        )
        .toUpperCase();
}


function formatDate(item) {

    const value =
        item.createdAt ||
        item.updatedAt ||
        item.date;

    if (!value) {
        return "Recently";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Recently";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}


function getAnnouncementPreview(
    announcement
) {

    const content =
        announcement.content ||
        announcement.description ||
        "";

    if (!content) {
        return "No additional details.";
    }

    return content.length > 95
        ? `${content.substring(0, 95)}...`
        : content;
}


export default AdminDashboard;