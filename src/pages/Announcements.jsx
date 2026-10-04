import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getAllAnnouncements } from "../api/collegeApi";
import { getAllDepartments } from "../api/departmentApi";

import "./Announcements.css";


function Announcements() {

    const [announcements, setAnnouncements] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("ALL");

    const [selectedAnnouncement, setSelectedAnnouncement] =
        useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    /* =========================================================
       LOAD ANNOUNCEMENTS
    ========================================================= */

    useEffect(() => {

        const loadAnnouncements = async () => {

            try {

                setLoading(true);
                setError("");

                const data =
                    await getAllAnnouncements();

                setAnnouncements(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (err) {

                console.error(
                    "Failed to load announcements:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Failed to load announcements."
                );

            } finally {

                setLoading(false);
            }
        };

        loadAnnouncements();

    }, []);


    /* =========================================================
       LOAD DEPARTMENTS
    ========================================================= */

    useEffect(() => {

        const loadDepartments = async () => {

            try {

                const data =
                    await getAllDepartments();

                setDepartments(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (err) {

                console.error(
                    "Failed to load departments:",
                    err
                );

                setDepartments([]);
            }
        };

        loadDepartments();

    }, []);


    /* =========================================================
       FILTER
    ========================================================= */

    const filteredAnnouncements = useMemo(() => {

        const query =
            search
                .trim()
                .toLowerCase();

        return announcements.filter(
            (announcement) => {

                const title =
                    String(
                        announcement?.title || ""
                    ).toLowerCase();

                const content =
                    String(
                        announcement?.content ||
                        ""
                    ).toLowerCase();

                const departmentCode =
                    String(
                        announcement?.departmentCode ||
                        ""
                    ).toLowerCase();

                const matchesSearch =
                    !query ||
                    title.includes(query) ||
                    content.includes(query) ||
                    departmentCode.includes(query);

                const announcementDepartment =
                    announcement?.departmentCode ||
                    "";

                const matchesDepartment =
                    department === "ALL" ||
                    announcementDepartment === department ||
                    announcement?.targetType === "ALL_BRANCHES";

                return (
                    matchesSearch &&
                    matchesDepartment
                );
            }
        );

    }, [
        announcements,
        search,
        department,
    ]);


    /* =========================================================
       HELPERS
    ========================================================= */

    const formatDate = (value) => {

        if (!value) {
            return "Recently published";
        }

        try {

            return new Date(value)
                .toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    }
                );

        } catch {

            return String(value);
        }
    };


    const formatTime = (value) => {

        if (!value) {
            return "";
        }

        try {

            return new Date(value)
                .toLocaleTimeString(
                    "en-IN",
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                    }
                );

        } catch {

            return "";
        }
    };


    const getDateParts = (value) => {

        if (!value) {
            return {
                day: "—",
                month: "",
                year: "",
            };
        }
    
        const date = new Date(value);
    
        if (Number.isNaN(date.getTime())) {
            return {
                day: "—",
                month: "",
                year: "",
            };
        }
    
        return {
            day: date
                .getDate()
                .toString()
                .padStart(2, "0"),
    
            month: date
                .toLocaleDateString("en-IN", {
                    month: "short",
                })
                .toUpperCase(),
    
            year: date.getFullYear(),
        };
    };
    const getPreview = (content) => {

        if (!content) {
            return "No additional details available.";
        }

        const text = String(content).replace(/\s+/g, " ").trim();

        if (text.length <= 150) {
            return text;
        }

        return `${text.substring(0, 150).trim()}...`;
    };


    const getTargetLabel = (announcement) => {

        if (
            announcement?.targetType ===
            "ALL_BRANCHES"
        ) {
            return "ALL DEPARTMENTS";
        }

        return announcement?.departmentCode ||
            "DEPARTMENT";
    };


    const clearFilters = () => {

        setSearch("");
        setDepartment("ALL");
    };


    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {

        return (
            <div className="announcements-page-state">
                <div className="state-icon">
                    📢
                </div>

                <h2>
                    Loading announcements...
                </h2>

                <p>
                    Please wait while we fetch the latest updates.
                </p>
            </div>
        );
    }


    /* =========================================================
       ERROR
    ========================================================= */

    if (error) {

        return (
            <div className="announcements-page-state">
                <div className="state-icon">
                    ⚠
                </div>

                <h2>
                    Unable to load announcements
                </h2>

                <p>
                    {error}
                </p>

                <button
                    className="state-button"
                    onClick={() =>
                        window.location.reload()
                    }
                >
                    Try Again
                </button>
            </div>
        );
    }


    return (
        <div className="announcements-page">

            {/* =================================================
                HERO
            ================================================= */}

            <section className="announcements-hero">

                <div className="hero-circle hero-circle-one" />
                <div className="hero-circle hero-circle-two" />

                <div className="announcements-container">

                    <div className="announcements-breadcrumb">

                        <Link to="/">
                            Home
                        </Link>

                        <span>/</span>

                        <span>
                            Announcements
                        </span>

                    </div>


                    <div className="announcements-hero-content">

                        <div className="hero-copy">

                            <span className="hero-kicker">
                                COLLEGE UPDATES
                            </span>

                            <h1>
                                Stay updated.
                                <br />
                                <span>
                                    Stay informed.
                                </span>
                            </h1>

                           

                        </div>


                        <div className="hero-stats">

                            <div className="hero-stat-main">

                                <span>
                                    UPDATES
                                </span>

                                <strong>
                                    {announcements.length}
                                </strong>

                            </div>





                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                CONTENT
            ================================================= */}

            <main className="announcements-container announcements-content">

                {/* SEARCH + FILTER */}

                <section className="announcement-filter-card">

                    <div className="filter-top">

                        <div>

                            <span className="section-label">
                                SEARCH
                            </span>

                            <h2>
                                Find an announcement
                            </h2>

                        </div>


                        {(search ||
                            department !== "ALL") && (

                            <button
                                className="clear-filter-button"
                                onClick={clearFilters}
                            >
                                Clear filters
                            </button>

                        )}

                    </div>


                    <div className="announcement-search-box">

                        <span className="search-icon">
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Search announcements..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                        {search && (

                            <button
                                className="search-clear"
                                onClick={() =>
                                    setSearch("")
                                }
                                aria-label="Clear search"
                            >
                                ×
                            </button>

                        )}

                    </div>


                    <div className="filter-row">

                        <div className="filter-label">
                            Department
                        </div>


                        <div className="department-pills">

                            <button
                                className={
                                    department === "ALL"
                                        ? "department-pill active"
                                        : "department-pill"
                                }
                                onClick={() =>
                                    setDepartment("ALL")
                                }
                            >
                                All Departments
                            </button>


                            {departments.map(
                                (item) => (

                                    <button
                                        key={
                                            item.id ||
                                            item.code
                                        }
                                        className={
                                            department ===
                                            item.code
                                                ? "department-pill active"
                                                : "department-pill"
                                        }
                                        onClick={() =>
                                            setDepartment(
                                                item.code
                                            )
                                        }
                                    >
                                        {item.code}
                                    </button>

                                )
                            )}

                        </div>

                    </div>

                </section>


                {/* =================================================
                    RESULTS HEADER
                ================================================= */}

                <section className="announcements-results">

                    <div className="results-header">

                        <div>

                            <span className="section-label">
                                ANNOUNCEMENTS
                            </span>

                            <h2>
                                Latest updates
                            </h2>

                        </div>


                        <span className="results-count">
                            {filteredAnnouncements.length}
                            {" "}
                            update
                            {filteredAnnouncements.length !== 1
                                ? "s"
                                : ""}
                        </span>

                    </div>


                    {/* =================================================
                        LIST
                    ================================================= */}

                    {filteredAnnouncements.length > 0 ? (

                        <div className="announcements-list">

                            {filteredAnnouncements.map(
                                (announcement) => {

                                    const dateParts =
                                        getDateParts(
                                            announcement.createdAt
                                        );

                                    return (

                                        <article
                                            key={
                                                announcement.id
                                            }
                                            className="announcement-card"
                                        >

                                            {/* DATE */}

                                            <div className="announcement-date">

                                                <strong>
                                                    {dateParts.day}
                                                </strong>

                                                <span>
                                                    {dateParts.month}
                                                </span>

                                                <small>
                                                    {dateParts.year}
                                                </small>

                                            </div>


                                            {/* CONTENT */}

                                            <div className="announcement-card-content">

                                                <div className="announcement-card-top">

                                                    <div className="announcement-tags">

                                                        <span className="target-tag">
                                                            {
                                                                getTargetLabel(
                                                                    announcement
                                                                )
                                                            }
                                                        </span>

                                                        
                                                    </div>


                                                    <span className="announcement-time">
                                                        {
                                                            formatTime(
                                                                announcement.createdAt
                                                            )
                                                        }
                                                    </span>

                                                </div>


                                                <h3>
                                                    {
                                                        announcement.title
                                                    }
                                                </h3>


                                                <p>
                                                    {
                                                        getPreview(
                                                            announcement.content
                                                        )
                                                    }
                                                </p>


                                                <div className="announcement-card-bottom">

                                                    <div className="published-info">

                                                        <span className="published-icon">
                                                            📢
                                                        </span>

                                                        <div>

                                                            <span>
                                                                Published by
                                                            </span>

                                                            <strong>
                                                                College Administration
                                                            </strong>

                                                        </div>

                                                    </div>


                                                    <button
                                                        className="read-button"
                                                        onClick={() =>
                                                            setSelectedAnnouncement(
                                                                announcement
                                                            )
                                                        }
                                                    >
                                                        Read Details
                                                        <span>
                                                            →
                                                        </span>
                                                    </button>

                                                </div>

                                            </div>

                                        </article>

                                    );
                                }
                            )}

                        </div>

                    ) : (

                        <div className="announcements-empty">

                            <div className="empty-icon">
                                📢
                            </div>

                            <h3>
                                No announcements found
                            </h3>

                            <p>
                                Try changing your search
                                or department filter.
                            </p>

                            <button
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </button>

                        </div>

                    )}

                </section>

            </main>


            {/* =================================================
                DETAILS MODAL
            ================================================= */}

            {selectedAnnouncement && (

                <div
                    className="announcement-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setSelectedAnnouncement(null);
                        }

                    }}
                >

                    <div className="announcement-modal">

                        <div className="modal-header">

                            <div>

                                <span className="modal-kicker">
                                    ANNOUNCEMENT
                                </span>

                                <h2>
                                    {
                                        selectedAnnouncement.title
                                    }
                                </h2>

                            </div>


                            <button
                                className="modal-close"
                                onClick={() =>
                                    setSelectedAnnouncement(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="modal-body">

                            <div className="modal-meta">

                                <span>
                                    {
                                        getTargetLabel(
                                            selectedAnnouncement
                                        )
                                    }
                                </span>

                                <span>
                                    {
                                        formatDate(
                                            selectedAnnouncement.createdAt
                                        )
                                    }
                                </span>

                            </div>


                            <div className="modal-content-text">

                                {
                                    selectedAnnouncement.content
                                }

                            </div>


                            <div className="modal-footer">

                                <span>
                                    Published by College Administration
                                </span>

                                <button
                                    onClick={() =>
                                        setSelectedAnnouncement(
                                            null
                                        )
                                    }
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Announcements;