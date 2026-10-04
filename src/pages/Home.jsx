import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    getAllEvents,
} from "../api/collegeApi";

import {
    getAllMentors,
} from "../api/mentorApi";

import {
    getAllPosts,
} from "../api/communityApi";

import {
    getAllAnnouncements,
} from "../api/collegeApi";

import "./Home.css";


// =========================================================
// HELPERS
// =========================================================

const formatDate = (value) => {
    if (!value) {
        return {
            day: "--",
            month: "",
        };
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return {
            day: "--",
            month: "",
        };
    }

    return {
        day: date.getDate(),
        month: date.toLocaleString("en-IN", {
            month: "short",
        }).toUpperCase(),
    };
};


const formatFullDate = (value) => {
    if (!value) {
        return "Date TBA";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


const formatTime = (value) => {
    if (!value) {
        return "Time TBA";
    }

    const text = String(value).trim();

    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(text)) {
        const [hoursText, minutesText] = text.split(":");
        const hours = Number(hoursText);
        const minutes = minutesText;

        if (hours >= 0 && hours <= 23) {
            const period = hours >= 12 ? "PM" : "AM";
            const displayHour = hours % 12 || 12;

            return `${String(displayHour).padStart(2, "0")}:${minutes} ${period}`;
        }
    }

    return text;
};


const formatCategory = (value) => {
    if (!value) {
        return "";
    }

    return String(value)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
};


const formatTarget = (announcement) => {
    const targetType = String(
        announcement?.targetType || ""
    ).toUpperCase();

    if (targetType === "DEPARTMENT") {
        return announcement?.departmentCode
            ? `${String(announcement.departmentCode).toUpperCase()} Department`
            : "Department";
    }

    return "All Departments";
};


const formatEventTarget = (event) => {
    const targetType = String(
        event?.targetType || ""
    ).toUpperCase();

    if (targetType === "DEPARTMENT") {
        return event?.departmentCode
            ? String(event.departmentCode).toUpperCase()
            : "Department";
    }

    return "All Departments";
};


const getEventImage = (event) => {
    return (
        event?.imageUrl ||
        event?.image ||
        event?.bannerImage ||
        event?.posterUrl ||
        ""
    );
};


const getEventLocation = (event) => {
    return event?.venue || event?.location || "Location TBA";
};


const getInitials = (name = "") => {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase() || "U";
};


const getTags = (post) => {
    if (Array.isArray(post?.tags)) {
        return post.tags;
    }

    if (typeof post?.tags === "string") {
        return post.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);
    }

    return [];
};


const getEventDateValue = (event) => {
    return (
        event?.date ||
        event?.eventDate ||
        event?.startDate ||
        event?.startAt
    );
};


const getAnnouncementDateValue = (announcement) => {
    return (
        announcement?.createdAt ||
        announcement?.updatedAt ||
        announcement?.date
    );
};


const getAnnouncementPreview = (content) => {
    if (!content) {
        return "No additional details available.";
    }

    const text = String(content).replace(/\s+/g, " ").trim();

    if (text.length <= 125) {
        return text;
    }

    return `${text.slice(0, 125).trim()}…`;
};


// =========================================================
// HOME
// =========================================================

function Home() {

    // =====================================================
    // DATA
    // =====================================================

    const [events, setEvents] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [announcements, setAnnouncements] = useState([]);


    // =====================================================
    // LOADING
    // =====================================================

    const [loading, setLoading] = useState({
        events: true,
        mentors: true,
        questions: true,
        announcements: true,
    });


    // =====================================================
    // LOAD HOME DATA FROM BACKEND
    // =====================================================

    useEffect(() => {
        let mounted = true;

        const loadHomeData = async () => {
            const results = await Promise.allSettled([
                getAllEvents(),
                getAllMentors(),
                getAllPosts(),
                getAllAnnouncements(),
            ]);

            if (!mounted) {
                return;
            }

            const [
                eventsResult,
                mentorsResult,
                questionsResult,
                announcementsResult,
            ] = results;

            if (eventsResult.status === "fulfilled") {
                const eventList = Array.isArray(eventsResult.value)
                    ? eventsResult.value
                    : [];

                setEvents(
                    eventList
                        .filter((event) => {
                            const status = String(
                                event?.status || ""
                            ).toUpperCase();

                            return (
                                status === "UPCOMING" ||
                                status === "ONGOING" ||
                                status === ""
                            );
                        })
                        .sort((a, b) => {
                            const aTime = new Date(
                                getEventDateValue(a) || 0
                            ).getTime();
                            const bTime = new Date(
                                getEventDateValue(b) || 0
                            ).getTime();

                            return aTime - bTime;
                        })
                );
            } else {
                console.error(
                    "Failed to load home events:",
                    eventsResult.reason
                );
                setEvents([]);
            }

            if (mentorsResult.status === "fulfilled") {
                const mentorList = Array.isArray(mentorsResult.value)
                    ? mentorsResult.value
                    : [];

                setMentors(
                    mentorList.filter(
                        (mentor) => mentor?.active !== false
                    )
                );
            } else {
                console.error(
                    "Failed to load home mentors:",
                    mentorsResult.reason
                );
                setMentors([]);
            }

            if (questionsResult.status === "fulfilled") {
                const postList = Array.isArray(questionsResult.value)
                    ? questionsResult.value
                    : [];

                setQuestions(
                    [...postList].sort((a, b) => {
                        const aTime = new Date(
                            a?.createdAt || a?.updatedAt || 0
                        ).getTime();
                        const bTime = new Date(
                            b?.createdAt || b?.updatedAt || 0
                        ).getTime();

                        return bTime - aTime;
                    })
                );
            } else {
                console.error(
                    "Failed to load home community:",
                    questionsResult.reason
                );
                setQuestions([]);
            }

            if (announcementsResult.status === "fulfilled") {
                const announcementList = Array.isArray(
                    announcementsResult.value
                )
                    ? announcementsResult.value
                    : [];

                setAnnouncements(
                    [...announcementList].sort((a, b) => {
                        const aTime = new Date(
                            getAnnouncementDateValue(a) || 0
                        ).getTime();
                        const bTime = new Date(
                            getAnnouncementDateValue(b) || 0
                        ).getTime();

                        return bTime - aTime;
                    })
                );
            } else {
                console.error(
                    "Failed to load home announcements:",
                    announcementsResult.reason
                );
                setAnnouncements([]);
            }

            setLoading({
                events: false,
                mentors: false,
                questions: false,
                announcements: false,
            });
        };

        loadHomeData();

        return () => {
            mounted = false;
        };
    }, []);


    // =====================================================
    // HOME COUNTS
    // =====================================================

    const counts = useMemo(() => {
        return {
            events: events.length,
            mentors: mentors.length,
            questions: questions.length,
            announcements: announcements.length,
        };
    }, [events, mentors, questions, announcements]);


    const upcomingEvents = events.slice(0, 3);
    const featuredMentors = mentors.slice(0, 3);
    const latestQuestions = questions.slice(0, 4);
    const latestAnnouncements = announcements.slice(0, 3);


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="home-page">

            {/* =================================================
                HERO
            ================================================= */}

            <section className="hero-section">
                <div className="container hero-grid">

                    <div className="hero-content">

                        <div className="hero-kicker">
                        IET CONNECT
                        </div>

                        <h1>
                            Your IET campus,
                            <span> connected.</span>
                        </h1>

                        <p>
                        One place for students to discover events, connect with mentors, share ideas and stay updated.
                        </p>

                        <div className="hero-buttons">
                            <Link
                                to="/events"
                                className="btn btn-primary btn-large"
                            >
                                View Events
                                <span>→</span>
                            </Link>

                            <Link
                                to="/community"
                                className="btn btn-secondary btn-large"
                            >
                                Visit Community
                            </Link>
                        </div>

                        

                    </div>

                    <div className="hero-visual">
                        <div className="campus-card">

                            <div className="campus-card-heading">
                                <div>
                                    <span>IET AYODHYA CAMPUS</span>
                                    <h3>Campus updates</h3>
                                </div>

                                <div className="campus-mark">
                                    IC
                                </div>
                            </div>

                            <div className="campus-row">
                                <div className="campus-row-icon">EV</div>
                                <div>
                                    <strong>Upcoming events</strong>
                                    <span>College events, workshops and activities</span>
                                </div>
                                <b>{counts.events}</b>
                            </div>

                            <div className="campus-row">
                                <div className="campus-row-icon">ME</div>
                                <div>
                                    <strong>Active mentors</strong>
                                    <span>Mentors from different departments</span>
                                </div>
                                <b>{counts.mentors}</b>
                            </div>

                            <div className="campus-row">
                                <div className="campus-row-icon">CM</div>
                                <div>
                                    <strong>Community questions</strong>
                                    <span>Student questions and discussions</span>
                                </div>
                                <b>{counts.questions}</b>
                            </div>

                            <div className="campus-footer">
                                <span>{counts.announcements} announcements</span>
                                <span>•</span>
                                <span>Official college updates</span>
                            </div>

                        </div>
                    </div>

                </div>
            </section>


            {/* =================================================
                STATS
            ================================================= */}

            

            {/* =================================================
                EVENTS
            ================================================= */}

            <section className="section">
                <div className="container">

                    <div className="section-heading">
                        <div>
                            <span className="section-label">CAMPUS ACTIVITIES</span>
                            <h2>Upcoming Events</h2>
                            <p>College events, workshops and activities for students.</p>
                        </div>

                        <Link
                            to="/events"
                            className="view-all"
                        >
                            View all events →
                        </Link>
                    </div>

                    {loading.events ? (
                        <div className="page-loader">Loading events...</div>
                    ) : upcomingEvents.length > 0 ? (
                        <div className="events-grid">
                            {upcomingEvents.map((event) => {
                                const date = formatDate(
                                    getEventDateValue(event)
                                );

                                const imageUrl = getEventImage(event);

                                const status = String(
                                    event?.status || ""
                                ).toUpperCase();

                                return (
                                    <Link
                                        to={`/events/${event.id}`}
                                        className="event-card"
                                        key={event.id}
                                    >
                                        <div className="event-card-image">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={event.title || "Event"}
                                                    loading="lazy"
                                                    onError={(imageEvent) => {
                                                        imageEvent.currentTarget.style.display = "none";
                                                        imageEvent.currentTarget.parentElement.classList.add(
                                                            "event-image-failed"
                                                        );
                                                    }}
                                                />
                                            ) : null}

                                            <div className="event-image-fallback">
                                                <span>COLLEGE EVENT</span>
                                            </div>

                                            <div className="event-date-badge">
                                                <strong>{date.day}</strong>
                                                <span>{date.month || "DATE"}</span>
                                            </div>

                                            {status === "ONGOING" && (
                                                <span className="event-live-badge">
                                                    ● LIVE NOW
                                                </span>
                                            )}
                                        </div>

                                        <div className="event-card-body">
                                            <div className="event-top">
                                                <span className="event-target">
                                                    {formatEventTarget(event)}
                                                </span>

                                                {event.category && (
                                                    <span className="event-type">
                                                        {formatCategory(event.category)}
                                                    </span>
                                                )}
                                            </div>

                                            <h3>{event.title}</h3>

                                            <div className="event-meta">
                                                <span className="event-meta-item">
                                                    <b>TIME</b>
                                                    {formatTime(event.time)}
                                                </span>

                                                <span className="event-meta-item">
                                                    <b>LOCATION</b>
                                                    {getEventLocation(event)}
                                                </span>
                                            </div>

                                            <div className="event-card-footer">
                                                <span>
                                                    {formatFullDate(
                                                        getEventDateValue(event)
                                                    )}
                                                </span>
                                                <span className="event-arrow">→</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="home-empty-section">
                            No upcoming events available right now.
                        </div>
                    )}

                </div>
            </section>


            {/* =================================================
                MENTORS
            ================================================= */}

            <section className="section section-muted">
                <div className="container">

                    <div className="section-heading">
                        <div>
                            <span className="section-label">MENTOR SUPPORT</span>
                            <h2>Meet Our Mentors</h2>
                            <p>Get guidance from mentors across college departments.</p>
                        </div>

                        <Link
                            to="/mentors"
                            className="view-all"
                        >
                            View all mentors →
                        </Link>
                    </div>

                    {loading.mentors ? (
                        <div className="page-loader">Loading mentors...</div>
                    ) : featuredMentors.length > 0 ? (
                        <div className="mentor-grid">
                            {featuredMentors.map((mentor) => {
                                const mentorType = String(
                                    mentor?.mentorType || ""
                                ).toUpperCase();

                                const hasPrice =
                                    mentorType === "PAID" &&
                                    mentor?.price !== null &&
                                    mentor?.price !== undefined;

                                const department =
                                    mentor?.departmentName || "College Mentor";

                                const mentorYear =
                                    mentor?.year !== null &&
                                    mentor?.year !== undefined &&
                                    String(mentor.year).trim() !== ""
                                        ? `Year ${String(mentor.year).replace(/^Year\s+/i, "")}`
                                        : "Year not added";

                                return (
                                    <div
                                        className="mentor-card mentor-card-premium"
                                        key={mentor.id}
                                    >
                                        <div className="mentor-card-topline">
                                            <span>COLLEGE MENTOR</span>

                                            <span
                                                className={
                                                    mentorType === "FREE"
                                                        ? "mentor-badge free"
                                                        : "mentor-badge paid"
                                                }
                                            >
                                                {mentorType === "FREE" ? "FREE" : "PAID"}
                                            </span>
                                        </div>

                                        <div className="mentor-profile-row">
                                            <div className="mentor-photo-wrap">
                                                {mentor.profileImage ? (
                                                    <img
                                                        src={mentor.profileImage}
                                                        alt={mentor.name || "Mentor"}
                                                        loading="lazy"
                                                        onError={(imageEvent) => {
                                                            imageEvent.currentTarget.style.display = "none";
                                                            imageEvent.currentTarget.parentElement.classList.add(
                                                                "mentor-image-failed"
                                                            );
                                                        }}
                                                    />
                                                ) : null}

                                                <div className="mentor-image-fallback">
                                                    {getInitials(mentor.name)}
                                                </div>
                                            </div>

                                            <div className="mentor-heading-info">
                                                <h3>{mentor.name || "Mentor"}</h3>
                                                <span>College mentor</span>
                                            </div>
                                        </div>

                                        <div className="mentor-card-divider" />

                                        <div className="mentor-detail-row">
                                            <div>
                                                <span className="mentor-detail-label">DEPARTMENT</span>
                                                <strong>{department}</strong>
                                            </div>

                                            <div>
                                                <span className="mentor-detail-label">YEAR</span>
                                                <strong>{mentorYear}</strong>
                                            </div>
                                        </div>

                                        <div className="mentor-skills-block">
                                            <span className="mentor-detail-label">SKILLS</span>

                                            {Array.isArray(mentor.skills) && mentor.skills.length > 0 ? (
                                                <div className="skill-list">
                                                    {mentor.skills
                                                        .slice(0, 5)
                                                        .map((skill) => (
                                                            <span key={skill}>{skill}</span>
                                                        ))}
                                                </div>
                                            ) : (
                                                <div className="mentor-no-skills">Skills not added</div>
                                            )}
                                        </div>

                                        <div className="mentor-card-footer">
                                            <div className="mentor-price">
                                                <span className="mentor-detail-label">
                                                    MENTOR ACCESS
                                                </span>

                                                {hasPrice ? (
                                                    <strong>
                                                        ₹{Number(mentor.price).toLocaleString("en-IN")}
                                                        <small>/ access</small>
                                                    </strong>
                                                ) : (
                                                    <strong>
                                                        Free
                                                        <small>/ access</small>
                                                    </strong>
                                                )}
                                            </div>

                                            <Link
                                                to={`/mentors/${mentor.id}`}
                                                className="mentor-chat-btn"
                                            >
                                                View Mentor →
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="home-empty-section">
                            No mentors available right now.
                        </div>
                    )}

                </div>
            </section>

            {/* =================================================
                COMMUNITY
            ================================================= */}

            <section className="section">
                <div className="container">

                    <div className="section-heading">
                        <div>
                            <span className="section-label">STUDENT COMMUNITY</span>
                            <h2>Latest Questions</h2>
                            <p>Ask questions and see what other students are discussing.</p>
                        </div>

                        <Link
                            to="/community"
                            className="view-all"
                        >
                            View community →
                        </Link>
                    </div>

                    {loading.questions ? (
                        <div className="page-loader">Loading community...</div>
                    ) : latestQuestions.length > 0 ? (
                        <div className="questions-list">
                            {latestQuestions.map((question) => {
                                const tags = getTags(question);

                                return (
                                    <Link
                                        to={`/community/post/${question.id}`}
                                        className="question-card"
                                        key={question.id}
                                    >
                                        <div className="question-main">
                                            <div className="question-icon">Q</div>

                                            <div>
                                                <h3>{question.title}</h3>

                                                <p>
                                                    {question.authorName ||
                                                        question.author?.name ||
                                                        "Student"}
                                                    {question.departmentName || question.department
                                                        ? ` · ${question.departmentName || question.department}`
                                                        : ""}
                                                    {question.year
                                                        ? ` · ${question.year}`
                                                        : ""}
                                                </p>

                                                {tags.length > 0 && (
                                                    <div className="question-tags">
                                                        {tags.slice(0, 3).map((tag) => (
                                                            <span key={tag}>#{tag}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="answer-count">
                                            <strong>
                                                {question.answerCount ?? question.answers ?? 0}
                                            </strong>
                                            <span>Answers</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="home-empty-section">
                            No community questions yet.
                        </div>
                    )}

                </div>
            </section>


            {/* =================================================
                ANNOUNCEMENTS
            ================================================= */}

            <section className="section section-muted">
                <div className="container">

                    <div className="section-heading">
                        <div>
                            <span className="section-label">COLLEGE UPDATES</span>
                            <h2>Announcements</h2>
                            <p>Important college notices, announcements and updates.</p>
                        </div>

                        <Link
                            to="/announcements"
                            className="view-all"
                        >
                            View all →
                        </Link>
                    </div>

                    {loading.announcements ? (
                        <div className="page-loader">Loading announcements...</div>
                    ) : latestAnnouncements.length > 0 ? (
                        <div className="announcement-list">
                            {latestAnnouncements.map((announcement) => (
                                <Link
                                    to="/announcements"
                                    className="announcement-card"
                                    key={announcement.id}
                                >
                                    <div className="announcement-icon">
                                        <span>ANN</span>
                                    </div>

                                    <div className="announcement-content">
                                        <div className="announcement-meta">
                                            <span className="announcement-target">
                                                {formatTarget(announcement)}
                                            </span>

                                            <span className="announcement-date">
                                                {formatFullDate(
                                                    getAnnouncementDateValue(announcement)
                                                )}
                                            </span>
                                        </div>

                                        <h3>{announcement.title}</h3>

                                        <p>
                                            {getAnnouncementPreview(
                                                announcement.content
                                            )}
                                        </p>
                                    </div>

                                    <span className="announcement-arrow">→</span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="home-empty-section">
                            No announcements available right now.
                        </div>
                    )}

                </div>
            </section>


            {/* =================================================
                COMPLAINTS
            ================================================= */}

            <section className="section complaints-section">
                <div className="container">

                    <div className="section-heading">
                        <div>
                            <span className="section-label">STUDENT SUPPORT</span>
                            <h2>Complaints</h2>
                            <p>Report a college issue and get it checked by the admin team.</p>
                        </div>

                        <Link
                            to="/complaints"
                            className="view-all"
                        >
                            View complaints →
                        </Link>
                    </div>

                    <div className="complaint-card">
                        <div className="complaint-icon">
                            <span>!</span>
                        </div>

                        <div className="complaint-content">
                            <h3>Have an issue on campus?</h3>
                            <p>Raise a complaint about classes, facilities, departments or other college services.</p>

                            <div className="complaint-tags">
                                <span>Classes</span>
                                <span>Facilities</span>
                                <span>Department</span>
                                <span>Other</span>
                            </div>
                        </div>

                        <Link
                            to="/complaints"
                            className="complaint-btn"
                        >
                            Raise Complaint →
                        </Link>
                    </div>

                </div>
            </section>


            {/* =================================================
                CTA
            ================================================= */}

            <section className="cta-section">
                <div className="container">
                    <div className="cta-card">
                        <div>
                            <span className="section-label">
                            IET CONNECT
                            </span>
                            <h2>
                                Stay informed. Stay connected.
                            </h2>
                            <p>
                                Explore events, meet mentors, participate in discussions
                                and keep up with college announcements.
                            </p>
                        </div>

                        <div className="cta-buttons">
                            <Link
                                to="/events"
                                className="btn btn-white btn-large"
                            >
                                Explore Events →
                            </Link>

                            <Link
                                to="/community"
                                className="btn btn-transparent btn-large"
                            >
                                Open Community
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}


export default Home;
