import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getStudentByAuthUserId } from "../api/userApi";
import "./CommunityUserProfile.css";

const formatYear = (year) => {
    if (year === null || year === undefined || year === "") {
        return "Year not available";
    }

    const value = Number(year);

    if (Number.isNaN(value)) {
        return String(year);
    }

    const suffix =
        value === 1 ? "st" :
        value === 2 ? "nd" :
        value === 3 ? "rd" : "th";

    return `${value}${suffix} Year`;
};

const getInitials = (name = "Student") => {
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (words.length === 1) {
        return words[0].slice(0, 2).toUpperCase();
    }

    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

const getDepartmentName = (student) => {
    return (
        student?.department?.name ||
        student?.departmentName ||
        student?.department?.departmentName ||
        "Department not available"
    );
};

const getDepartmentCode = (student) => {
    return (
        student?.department?.code ||
        student?.departmentCode ||
        student?.department?.departmentCode ||
        ""
    );
};

const normalizeUrl = (url) => {
    if (!url) return "";

    const value = String(url).trim();

    if (!value) return "";

    return value.startsWith("http://") || value.startsWith("https://")
        ? value
        : `https://${value}`;
};


const buildImageCandidates = (value) => {
    if (!value) {
        return [];
    }

    const url = String(value).trim();

    if (!url) {
        return [];
    }

    if (
        url.startsWith("data:") ||
        url.startsWith("blob:")
    ) {
        return [url];
    }

    const candidates = [];
    const add = (item) => {
        if (item && !candidates.includes(item)) {
            candidates.push(item);
        }
    };

    const apiBase = (
        import.meta.env.VITE_API_BASE_URL ||
        "http://localhost:8080"
    ).replace(/\/+$/, "");

    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        add(url);
    } else {
        const path = url.startsWith("/") ? url : `/${url}`;

        add(`${apiBase}${path}`);
        add(`${window.location.origin}${path}`);
    }

    return candidates;
};

const ProfileAvatar = ({ src, name, className = "" }) => {
    const candidates = buildImageCandidates(src);
    const [index, setIndex] = useState(0);

    const currentSrc = candidates[index];

    if (!currentSrc) {
        return (
            <div className={`${className} community-profile-avatar-fallback`}>
                {getInitials(name)}
            </div>
        );
    }

    return (
        <img
            src={currentSrc}
            alt={`${name}'s profile`}
            className={`${className} community-profile-avatar`}
            onError={() => {
                setIndex((current) => current + 1);
            }}
        />
    );
};

const getErrorMessage = (error) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to load this profile."
    );
};

const CommunityUserProfile = () => {
    const { authUserId } = useParams();
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        const loadProfile = async () => {
            try {
                setLoading(true);
                setError("");

                if (!authUserId) {
                    throw new Error("User profile not found.");
                }

                const data = await getStudentByAuthUserId(authUserId);

                if (mounted) {
                    setStudent(data);
                }
            } catch (err) {
                console.error("Failed to load community user profile:", err);

                if (mounted) {
                    setError(getErrorMessage(err));
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            mounted = false;
        };
    }, [authUserId]);

    if (loading) {
        return (
            <div className="community-profile-page">
                <section className="community-profile-hero">
                    <div className="community-profile-container">
                        <div className="community-profile-loading">
                            <div className="community-profile-spinner" />
                            <span>Loading profile...</span>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="community-profile-page">
                <section className="community-profile-hero community-profile-hero-error">
                    <div className="community-profile-container">
                        <div className="community-profile-error">
                            <div className="community-profile-error-icon">!</div>
                            <h2>Profile unavailable</h2>
                            <p>{error || "This user profile could not be found."}</p>

                            <button
                                type="button"
                                onClick={() => navigate("/community")}
                                className="community-profile-back-btn"
                            >
                                ← Back to Community
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    const name = student.name || "Student";
    const departmentName = getDepartmentName(student);
    const departmentCode = getDepartmentCode(student);
    const year = formatYear(student.year);

    const profileImage = student.profileImage || "";
    const githubUrl = normalizeUrl(student.github);
    const linkedinUrl = normalizeUrl(student.linkedin);

    return (
        <div className="community-profile-page">

            {/* =====================================================
                DARK PROFILE HERO
               ===================================================== */}
            <section className="community-profile-hero">
                <div className="community-profile-orbit orbit-one" />
                <div className="community-profile-orbit orbit-two" />
                <div className="community-profile-glow glow-one" />
                <div className="community-profile-glow glow-two" />

                <div className="community-profile-container">

                    <div className="community-profile-breadcrumb">
                        <Link to="/community">Home</Link>
                        <span>/</span>
                        <span>Community Profile</span>
                    </div>

                    <div className="community-profile-hero-card">

                        <div className="community-profile-avatar-wrap">
                            <ProfileAvatar
                                src={profileImage}
                                name={name}
                            />
                        </div>

                        <div className="community-profile-hero-info">
                            <span className="community-profile-kicker">
                                STUDENT PROFILE
                            </span>

                            <h1>{name}</h1>

                            <div className="community-profile-role">
                                B.Tech Student
                            </div>

                            <div className="community-profile-meta-row">
                                <span>{year}</span>
                                <span className="community-profile-meta-dot">•</span>

                                <span>
                                    {departmentCode
                                        ? `${departmentCode} · ${departmentName}`
                                        : departmentName}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* =====================================================
                PROFILE CONTENT
               ===================================================== */}
            <main className="community-profile-main">
                <div className="community-profile-content-container">

                    <div className="community-profile-left">

                        {/* ABOUT */}
                        <section className="community-profile-card">
                            <div className="community-profile-card-heading">
                                <span className="community-profile-card-line" />

                                <div>
                                    <span className="community-profile-section-label">
                                        ABOUT
                                    </span>
                                    <h2>About {name}</h2>
                                </div>
                            </div>

                            <div className="community-profile-card-body">
                                {student.bio ? (
                                    <p className="community-profile-bio">
                                        {student.bio}
                                    </p>
                                ) : (
                                    <p className="community-profile-muted">
                                        This student hasn't added a bio yet.
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* ACADEMIC */}
                        <section className="community-profile-card">
                            <div className="community-profile-card-heading">
                                <span className="community-profile-card-line" />

                                <div>
                                    <span className="community-profile-section-label">
                                        ACADEMIC
                                    </span>
                                    <h2>Academic details</h2>
                                </div>
                            </div>

                            <div className="community-profile-academic-grid">
                                <div className="community-profile-academic-item">
                                    <span className="community-profile-small-label">
                                        DEPARTMENT
                                    </span>

                                    <strong>{departmentName}</strong>

                                    {departmentCode && (
                                        <span className="community-profile-small-value">
                                            {departmentCode}
                                        </span>
                                    )}
                                </div>

                                <div className="community-profile-academic-item">
                                    <span className="community-profile-small-label">
                                        CURRENT YEAR
                                    </span>

                                    <strong>{year}</strong>
                                </div>
                            </div>
                        </section>

                        {/* LINKS */}
                        <section className="community-profile-card">
                            <div className="community-profile-card-heading">
                                <span className="community-profile-card-line" />

                                <div>
                                    <span className="community-profile-section-label">
                                        LINKS
                                    </span>
                                    <h2>Connect</h2>
                                </div>
                            </div>

                            <div className="community-profile-links">
                                {githubUrl && (
                                    <a
                                        href={githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="community-profile-link-card"
                                    >
                                        <span className="community-profile-link-icon github">
                                            GH
                                        </span>

                                        <span className="community-profile-link-copy">
                                            <strong>GitHub</strong>
                                            <small>View GitHub profile</small>
                                        </span>

                                        <span className="community-profile-link-arrow">
                                            ↗
                                        </span>
                                    </a>
                                )}

                                {linkedinUrl && (
                                    <a
                                        href={linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="community-profile-link-card"
                                    >
                                        <span className="community-profile-link-icon linkedin">
                                            in
                                        </span>

                                        <span className="community-profile-link-copy">
                                            <strong>LinkedIn</strong>
                                            <small>View LinkedIn profile</small>
                                        </span>

                                        <span className="community-profile-link-arrow">
                                            ↗
                                        </span>
                                    </a>
                                )}

                                {!githubUrl && !linkedinUrl && (
                                    <p className="community-profile-muted">
                                        No public links have been added.
                                    </p>
                                )}
                            </div>
                        </section>

                    </div>

                    {/* =================================================
                        RIGHT SIDEBAR
                       ================================================= */}
                    <aside className="community-profile-sidebar">

                        <section className="community-profile-sidebar-card dark">

                            <div className="community-profile-sidebar-pattern pattern-one" />
                            <div className="community-profile-sidebar-pattern pattern-two" />

                            <span className="community-profile-sidebar-label">
                                COMMUNITY PROFILE
                            </span>

                            <div className="community-profile-sidebar-title-row">
                                <span className="community-profile-sidebar-avatar">
                                    {getInitials(name)}
                                </span>

                                <div>
                                    <strong>{name}</strong>
                                    <span>Student</span>
                                </div>
                            </div>

                            <div className="community-profile-sidebar-divider" />

                            <div className="community-profile-sidebar-info">
                                <div>
                                    <span>Department</span>
                                    <strong>
                                        {departmentCode || departmentName}
                                    </strong>
                                </div>

                                <div>
                                    <span>Year</span>
                                    <strong>{student.year || "—"}</strong>
                                </div>
                            </div>

                        
                        </section>

                       

                    </aside>

                </div>
            </main>
        </div>
    );
};

export default CommunityUserProfile;
