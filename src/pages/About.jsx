import React from "react";
import { Link } from "react-router-dom";

import "../styles/about.css";

const platformFeatures = [
    {
        icon: "👨‍🏫",
        title: "Mentorship",
        description:
            "Discover experienced mentors and get practical guidance for learning, projects and placements."
    },
    {
        icon: "📅",
        title: "College Events",
        description:
            "Find workshops, hackathons, seminars, competitions and other college activities."
    },
    {
        icon: "💬",
        title: "Student Community",
        description:
            "Ask questions, share knowledge and help fellow students solve their doubts."
    },
    {
        icon: "📚",
        title: "Study Resources",
        description:
            "Access notes, PYQs and useful academic resources from one place."
    },
    {
        icon: "📢",
        title: "Announcements",
        description:
            "Stay updated with important college announcements and platform updates."
    },
    {
        icon: "⚠️",
        title: "Complaints",
        description:
            "Submit complaints and keep track of their progress through the platform."
    }
];


const principles = [
    {
        number: "01",
        title: "Discover",
        description:
            "Find mentors, events, resources and discussions relevant to your college life."
    },
    {
        number: "02",
        title: "Connect",
        description:
            "Interact with mentors and students and build useful academic connections."
    },
    {
        number: "03",
        title: "Learn",
        description:
            "Learn through mentorship, discussions, events and shared study resources."
    },
    {
        number: "04",
        title: "Grow",
        description:
            "Turn the connections and knowledge you gain into better academic and career outcomes."
    }
];


const differentiators = [
    "College-wide student community",
    "Senior student mentorship",
    "In-app mentor chat",
    "Paid mentor access",
    "Events for all branches",
    "Department-based tagging",
    "Student directory",
    "PYQs and study resources",
    "Stack Overflow-style community",
    "Complaint tracking"
];


function About() {

    return (

        <div className="about-page">

            {/* =====================================================
                HERO
            ===================================================== */}

            <section className="about-hero">

                <div className="container">

                    <div className="about-breadcrumb">

                        <Link to="/">
                            Home
                        </Link>

                        <span>/</span>

                        <span>
                            About
                        </span>

                    </div>


                    <div className="about-hero-content">

                        <span className="about-label">
                            ABOUT IET Connect
                        </span>

                        <h1>
                            One connected platform
                            <span> for B.Tech students.</span>
                        </h1>

                        <p>
                            IET Connect brings college
                            events, announcements, resources,
                            mentorship, student discussions and
                            complaint management together in one
                            connected platform.
                        </p>

                    </div>

                </div>

            </section>


            {/* =====================================================
                INTRODUCTION
            ===================================================== */}

            <section className="about-intro section">

                <div className="container">

                    <div className="about-intro-grid">

                        <div className="about-section-heading">

                            <span className="section-label">
                                WHO WE ARE
                            </span>

                            <h2>
                                Everything students need,
                                in one place.
                            </h2>

                        </div>


                        <div className="about-intro-text">

                            <p>
                                IET Connect is designed
                                around the everyday needs of B.Tech
                                students. Instead of using separate
                                platforms for events, mentorship,
                                discussions, study resources and
                                college updates, students can find
                                these experiences in one place.
                            </p>

                            <p>
                                The platform connects students with
                                mentors and with their wider college
                                community while keeping useful
                                academic information easy to discover.
                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                FEATURES
            ===================================================== */}

            <section className="about-features section section-muted">

                <div className="container">

                    <div className="about-section-title">

                        <span className="section-label">
                            WHAT WE BRING TOGETHER
                        </span>

                        <h2>
                            Built around the student experience.
                        </h2>

                        <p>
                            The platform brings the most important
                            parts of college life into one connected
                            experience.
                        </p>

                    </div>


                    <div className="about-feature-grid">

                        {platformFeatures.map((feature) => (

                            <article
                                className="about-feature-card"
                                key={feature.title}
                            >

                                <div className="about-feature-icon">
                                    {feature.icon}
                                </div>

                                <h3>
                                    {feature.title}
                                </h3>

                                <p>
                                    {feature.description}
                                </p>

                            </article>

                        ))}

                    </div>

                </div>

            </section>


            {/* =====================================================
                CORE PHILOSOPHY
            ===================================================== */}

            <section className="about-connection section">

                <div className="container">

                    <div className="about-connection-card">

                        <div className="about-connection-content">

                            <span className="section-label">
                                OUR CORE PHILOSOPHY
                            </span>

                            <h2>
                                Every branch stays connected.
                            </h2>

                            <p>
                                Departments are used for tagging,
                                filtering and classification — not
                                for restricting students from
                                accessing useful college information.
                            </p>

                            <p>
                                A CSE student can discover an ECE
                                event. An IT student can explore a
                                CSE resource. College-wide activities
                                can reach everyone through the same
                                platform.
                            </p>

                        </div>


                        <div className="department-showcase">

                            <span className="department-pill">
                                CSE
                            </span>

                            <span className="department-pill">
                                IT
                            </span>

                            <span className="department-pill">
                                ECE
                            </span>

                            <span className="department-pill">
                                EE
                            </span>

                            <span className="department-pill">
                                ME
                            </span>

                            <span className="department-pill">
                                CE
                            </span>

                            <span className="department-pill all">
                                ALL BRANCHES
                            </span>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                HOW IT WORKS
            ===================================================== */}

            <section className="about-how section section-muted">

                <div className="container">

                    <div className="about-section-title">

                        <span className="section-label">
                            HOW STUDENTS USE IT
                        </span>

                        <h2>
                            Discover. Connect. Learn. Grow.
                        </h2>

                    </div>


                    <div className="about-process-grid">

                        {principles.map((item) => (

                            <div
                                className="about-process-card"
                                key={item.number}
                            >

                                <span className="process-number">
                                    {item.number}
                                </span>

                                <h3>
                                    {item.title}
                                </h3>

                                <p>
                                    {item.description}
                                </p>

                            </div>

                        ))}

                    </div>

                </div>

            </section>


            {/* =====================================================
                DIFFERENTIATORS
            ===================================================== */}

            <section className="about-difference section">

                <div className="container">

                    <div className="about-difference-grid">

                        <div>

                            <span className="section-label">
                                WHAT MAKES US DIFFERENT
                            </span>

                            <h2>
                                More than a college
                                information website.
                            </h2>

                            <p>
                                The platform combines community,
                                mentorship, events and academic
                                support into one student-focused
                                experience.
                            </p>

                        </div>


                        <div className="difference-list">

                            {differentiators.map(
                                (item, index) => (

                                    <div
                                        className="difference-item"
                                        key={item}
                                    >

                                        <span>
                                            {String(index + 1)
                                                .padStart(2, "0")}
                                        </span>

                                        <strong>
                                            {item}
                                        </strong>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                CTA
            ===================================================== */}

            <section className="about-cta">

                <div className="container">

                    <div className="about-cta-card">

                        <div>

                            <span className="section-label">
                            IET Connect                            </span>

                            <h2>
                                Learn together.
                                Connect better.
                                Grow together.
                            </h2>

                            <p>
                                Explore mentors, discover events and
                                become part of your college community.
                            </p>

                        </div>


                        <div className="about-cta-buttons">

                            <Link
                                to="/mentors"
                                className="about-btn about-btn-white"
                            >
                                Explore Mentors →
                            </Link>

                            <Link
                                to="/events"
                                className="about-btn about-btn-transparent"
                            >
                                Explore Events
                            </Link>

                        </div>

                    </div>

                </div>

            </section>

        </div>
    );
}


export default About;