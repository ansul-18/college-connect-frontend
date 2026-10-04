import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// import "../../styles/studentProfileS.css";
import "../../styles/studentProfileSetup.css"

function StudentProfile() {

    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        loadProfile();

    }, []);

    const loadProfile = async () => {

        try {

            setLoading(true);
            setError("");

            /*
             * Yahan apne existing userApi ka
             * "get my student profile" function call karna hai.
             *
             * Example:
             *
             * const data = await getMyStudentProfile();
             * setProfile(data);
             */

        } catch (err) {

            console.error(
                "Unable to load student profile:",
                err
            );

            /*
             * IMPORTANT:
             *
             * Agar backend 404 return kare,
             * iska matlab profile abhi create nahi hui.
             */

            if (err?.response?.status === 404) {

                setProfile(null);

            } else {

                setError(
                    err?.response?.data?.message ||
                    "Unable to load profile"
                );
            }

        } finally {

            setLoading(false);
        }
    };


    if (loading) {

        return (
            <div className="student-profile-loading">
                Loading profile...
            </div>
        );
    }


    if (error) {

        return (
            <div className="student-profile-error-page">
                <h2>
                    Something went wrong
                </h2>

                <p>
                    {error}
                </p>
            </div>
        );
    }


    /*
     * PROFILE DOES NOT EXIST
     */

    if (!profile) {

        return (

            <div className="student-profile-page">

                <div className="student-profile-empty">

                    <div className="student-profile-empty-icon">
                        👤
                    </div>

                    <span className="section-label">
                        MY PROFILE
                    </span>

                    <h1>
                        Your profile isn't created yet
                    </h1>

                    <p>
                        Create your student profile to showcase
                        your academic details, bio and developer
                        profiles to the college community.
                    </p>

                    <button
                        className="btn btn-primary"
                        onClick={() =>
                            navigate(
                                "/student/profile/setup"
                            )
                        }
                    >
                        Create Profile →
                    </button>

                </div>

            </div>
        );
    }


    /*
     * PROFILE EXISTS
     */

    return (

        <div className="student-profile-page">

            <div className="student-profile-view-card">

                <div className="student-profile-view-header">

                    {profile.profileImage ? (

                        <img
                            src={profile.profileImage}
                            alt={profile.name}
                            className="student-profile-avatar"
                        />

                    ) : (

                        <div className="student-profile-avatar-placeholder">
                            {profile.name
                                ?.charAt(0)
                                ?.toUpperCase()}
                        </div>
                    )}


                    <div>

                        <span className="section-label">
                            MY PROFILE
                        </span>

                        <h1>
                            {profile.name}
                        </h1>

                        <p>
                            {profile.email}
                        </p>

                    </div>

                </div>


                <div className="student-profile-details">

                    <div>
                        <span>Roll Number</span>
                        <strong>
                            {profile.rollNumber || "-"}
                        </strong>
                    </div>

                    <div>
                        <span>Department</span>
                        <strong>
                            {profile.departmentId || "-"}
                        </strong>
                    </div>

                    <div>
                        <span>Year</span>
                        <strong>
                            {profile.year
                                ? `${profile.year} Year`
                                : "-"}
                        </strong>
                    </div>

                    <div>
                        <span>Mobile</span>
                        <strong>
                            {profile.mobile || "-"}
                        </strong>
                    </div>

                </div>


                {profile.bio && (

                    <div className="student-profile-bio">

                        <h3>
                            About Me
                        </h3>

                        <p>
                            {profile.bio}
                        </p>

                    </div>
                )}


                <div className="student-profile-links">

                    {profile.github && (

                        <a
                            href={profile.github}
                            target="_blank"
                            rel="noreferrer"
                        >
                            GitHub →
                        </a>
                    )}

                    {profile.linkedin && (

                        <a
                            href={profile.linkedin}
                            target="_blank"
                            rel="noreferrer"
                        >
                            LinkedIn →
                        </a>
                    )}

                </div>

            </div>

        </div>
    );
}

export default StudentProfile;