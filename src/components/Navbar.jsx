import { useState } from "react";
import {
    Link,
    NavLink,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
function Navbar() {

    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    

    const navigate = useNavigate();

    const {
        user,
        isAuthenticated,
        logout,
    } = useAuth();


    /*
     * ===============================
     * THEME
     * ===============================
     */

   


    const publicLinks = [
        {
            name: "Home",
            path: "/",
        },
        {
            name: "Events",
            path: "/events",
        },
        
        {
            name: "Community",
            path: "/community",
        },
        {
            name: "Mentors",
            path: "/mentors",
        },
        {
            name: "Resources",
            path: "/resources",
        },
        {
            name: "Announcements",
        path: "/announcements",
        },
    ];


    const getDashboardPath = () => {

        switch (user?.role) {

            case "STUDENT":
                return "/student/dashboard";

            case "MENTOR":
                return "/mentor/dashboard";

            case "ADMIN":
                return "/admin/dashboard";

            default:
                return "/";
        }
    };


    const getProfilePath = () => {

        switch (user?.role) {

            case "STUDENT":
                return "/student/profile";

            case "MENTOR":
                return "/mentor/profile";

            default:
                return "/";
        }
    };


    const getRoleName = () => {

        switch (user?.role) {

            case "STUDENT":
                return "Student";

            case "MENTOR":
                return "Mentor";

            case "ADMIN":
                return "Admin";

            default:
                return "User";
        }
    };


    const handleLogout = () => {

        logout();

        setProfileOpen(false);
        setMenuOpen(false);

        navigate("/");
    };


    const closeMenus = () => {

        setMenuOpen(false);
        setProfileOpen(false);

    };


    return (

        <header className="navbar">

            <div className="container navbar-inner">


                {/* ================= BRAND ================= */}

                <Link
                    to="/"
                    className="brand"
                    onClick={closeMenus}
                >

                    <div className="brand-logo">
                        IC
                    </div>

                    <div className="brand-text">

                        <span className="brand-title">
                            IET Connect
                        </span>

                        <span className="brand-subtitle">
                        For Engineering Students
                        </span>

                    </div>

                </Link>


                {/* ================= NAVIGATION ================= */}

                <nav
                    className={`nav-menu ${
                        menuOpen ? "active" : ""
                    }`}
                >

                    {/* PUBLIC LINKS */}

                    {publicLinks.map((link) => (

                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                isActive
                                    ? "nav-link active"
                                    : "nav-link"
                            }
                            onClick={() =>
                                setMenuOpen(false)
                            }
                        >
                            {link.name}
                        </NavLink>

                    ))}


                    {/* ================= MOBILE AUTH ================= */}

                    {isAuthenticated ? (

                        <div className="mobile-user-menu">

                            <Link
                                to={getDashboardPath()}
                                className="mobile-user-link"
                                onClick={() =>
                                    setMenuOpen(false)
                                }
                            >
                                Dashboard
                            </Link>


                            {user?.role !== "ADMIN" && (

                                <Link
                                    to={getProfilePath()}
                                    className="mobile-user-link"
                                    onClick={() =>
                                        setMenuOpen(false)
                                    }
                                >
                                    My Profile
                                </Link>

                            )}


                            {(user?.role === "STUDENT" ||
                                user?.role === "MENTOR") && (

                                <Link
                                    to={
                                        user?.role === "STUDENT"
                                            ? "/student/chats"
                                            : "/mentor/chats"
                                    }
                                    className="mobile-user-link"
                                    onClick={() =>
                                        setMenuOpen(false)
                                    }
                                >
                                    Chats
                                </Link>

                            )}


                            <button
                                className="mobile-logout"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>

                        </div>

                    ) : (

                        <div className="mobile-auth-buttons">

                            <Link
                                to="/login"
                                className="btn btn-outline"
                                onClick={() =>
                                    setMenuOpen(false)
                                }
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="btn btn-primary"
                                onClick={() =>
                                    setMenuOpen(false)
                                }
                            >
                                Get Started
                            </Link>

                        </div>

                    )}

                </nav>


                {/* ================= DESKTOP ================= */}

                <div className="desktop-auth-buttons">


                    {/* THEME TOGGLE */}


                    {!isAuthenticated ? (

                        <>

                            <Link
                                to="/login"
                                className="btn btn-outline"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="btn btn-primary"
                            >
                                Get Started
                            </Link>

                        </>

                    ) : (

                        <div className="profile-menu">


                            {/* PROFILE BUTTON */}

                            <button
                                className="profile-trigger"
                                onClick={() =>
                                    setProfileOpen(
                                        !profileOpen
                                    )
                                }
                            >

                                <div className="nav-avatar">

                                    {user?.name
                                        ?.charAt(0)
                                        ?.toUpperCase() ||
                                        "U"}

                                </div>


                                <div className="nav-user-info">

                                    <strong>
                                        {user?.name || "User"}
                                    </strong>

                                    <span>
                                        {getRoleName()}
                                    </span>

                                </div>


                                <span className="profile-arrow">

                                    {profileOpen
                                        ? "⌃"
                                        : "⌄"}

                                </span>

                            </button>


                            {/* PROFILE DROPDOWN */}

                            {profileOpen && (

                                <div className="profile-dropdown">


                                

                                    {user?.role !== "ADMIN" && (

                                        <Link
                                            to={getProfilePath()}
                                            onClick={() =>
                                                setProfileOpen(false)
                                            }
                                        >
                                            My Profile
                                        </Link>

                                    )}


                                    {(user?.role === "STUDENT" ||
                                        user?.role === "MENTOR") && (

                                        <Link
                                            to={
                                                user?.role === "STUDENT"
                                                    ? "/student/chats"
                                                    : "/mentor/chats"
                                            }
                                            onClick={() =>
                                                setProfileOpen(false)
                                            }
                                        >
                                            Chats
                                        </Link>

                                    )}


                                    <div className="dropdown-divider" />


                                    <button
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>

                                </div>

                            )}

                        </div>

                    )}

                </div>


                {/* ================= MOBILE BUTTON ================= */}

                <button
                    className="menu-toggle"
                    onClick={() =>
                        setMenuOpen(!menuOpen)
                    }
                    aria-label="Toggle navigation"
                >

                    <span></span>
                    <span></span>
                    <span></span>

                </button>

            </div>

        </header>
    );
}

export default Navbar;