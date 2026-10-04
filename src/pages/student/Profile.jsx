import { useEffect, useState } from "react";

import {
    createStudent,
    updateStudent
} from "../../api/userApi";

import { getAllDepartments } from "../../api/departmentApi";

import useUser from "../../hooks/useUser";
import { useAuth } from "../../hooks/useAuth";

import "./profile.css";

import CloudinaryUpload
    from "../../components/CloudinaryUpload";


function Profile() {

  const getInitials = (name) => {
    if (!name) {
        return "U";
    }

    return name
        .trim()
        .split(/\s+/)
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase();
};
    const { user } = useAuth();

    const {
        profile,
        loading,
        error,
        refreshProfile
    } = useUser();

    const [departments, setDepartments] = useState([]);
    const [departmentsLoading, setDepartmentsLoading] = useState(true);

    const [editing, setEditing] = useState(false);

    const [saving, setSaving] = useState(false);

    const [formError, setFormError] = useState("");


    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        rollNumber: "",
        departmentId: "",
        year: "",
        profileImage: "",
        bio: "",
        github: "",
        linkedin: ""
    });


    useEffect(() => {

      const loadDepartments = async () => {
  
          try {
  
              setDepartmentsLoading(true);
  
              const data = await getAllDepartments();
  
              setDepartments(data || []);
  
          } catch (err) {
  
              console.error(
                  "Failed to load departments:",
                  err
              );
  
          } finally {
  
              setDepartmentsLoading(false);
          }
      };
  
      loadDepartments();
  
  }, []);
    // =========================================================
    // FILL FORM
    // =========================================================
    useEffect(() => {

        if (profile) {

          setFormData({
            departmentId: profile.departmentId || "",
            year: profile.year || "",
        
            title: profile.title || "",
            experience: profile.experience || "",
            company: profile.company || "",
            designation: profile.designation || "",
        
            bio: profile.bio || "",
            profileImage: profile.profileImage || "",
        
            github: profile.github || "",
            linkedin: profile.linkedin || "",
        
            mentorType: profile.mentorType || "FREE",
            price: profile.price || "",
        
            skillsInput: profile.skills?.join(", ") || ""
        });

            const getInitials = (name) => {
              if (!name) {
                  return "U";
              }
          
              return name
                  .trim()
                  .split(/\s+/)
                  .map((part) => part.charAt(0))
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
          };
          
        }


        /*
         * Profile doesn't exist.
         *
         * Auto-fill information
         * from logged-in auth user.
         */

        setFormData({
            name: user?.name || "",
            email: user?.email || "",
            mobile: "",
            rollNumber: "",
            departmentId: "",
            year: "",
            profileImage: "",
            bio: "",
            github: "",
            linkedin: ""
        });

    }, [profile, user]);


    // =========================================================
    // INPUT CHANGE
    // =========================================================
    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };


    // =========================================================
    // EDIT PROFILE
    // =========================================================
    const handleEdit = () => {

        setFormError("");

        setEditing(true);
    };


    // =========================================================
    // CANCEL EDIT
    // =========================================================
    const handleCancel = () => {

        setFormError("");

        setEditing(false);

        /*
         * Put original profile values back
         */
        if (profile) {

            setFormData({
                name: profile.name || "",
                email: profile.email || "",
                mobile: profile.mobile || "",
                rollNumber: profile.rollNumber || "",
                departmentId:
                    profile.departmentId || "",
                year:
                    profile.year || "",
                profileImage:
                    profile.profileImage || "",
                bio:
                    profile.bio || "",
                github:
                    profile.github || "",
                linkedin:
                    profile.linkedin || ""
            });
        }
    };


    // =========================================================
    // SAVE / CREATE
    // =========================================================
    const handleSubmit = async (event) => {

        event.preventDefault();

        setSaving(true);
        setFormError("");


        try {

            /*
             * Existing profile
             * ----------------
             * UPDATE
             */

            if (profile) {

                await updateStudent(
                    profile.id,
                    formData
                );

            } else {

                /*
                 * No profile
                 * ----------
                 * CREATE
                 */

                await createStudent(
                    formData
                );
            }


            /*
             * Close edit mode
             */
            setEditing(false);


            /*
             * Reload profile from backend
             */
            await refreshProfile();

        } catch (err) {

            console.error(
                "Profile save failed:",
                err
            );


            setFormError(
                err?.response?.data?.message ||
                "Unable to save profile."
            );

        } finally {

            setSaving(false);
        }
    };


    // =========================================================
    // LOADING
    // =========================================================
    // =========================================================
// PROFILE DOES NOT EXIST
  // =========================================================
  if (loading) {
    return (
        <div className="profile-page-state">
            <div className="profile-state-card">
                <h2>Loading profile...</h2>
                <p>Please wait.</p>
            </div>
        </div>
    );
}
if (!profile && !editing) {
  return (
      <div className="student-profile-page">

          <div className="student-profile-container">

              <div className="student-profile-top">

                  <div>
                      <span className="profile-label">
                          MY PROFILE
                      </span>

                      <h1>
                          Complete Your Profile
                      </h1>

                      <p>
                          Your profile is not created yet.
                          Add your details so other students
                          can know more about you.
                      </p>
                  </div>

                  <button
                      type="button"
                      className="profile-btn primary"
                      onClick={handleEdit}
                  >
                      Create Profile →
                  </button>

              </div>


              <div className="profile-empty-card">

                  <div className="profile-empty-avatar">
                      {user?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                  </div>

                  <h2>
                      Welcome, {user?.name || "Student"}
                  </h2>

                  <p>
                      Your student profile hasn't been
                      created yet.
                  </p>

                  <button
                      type="button"
                      className="profile-btn primary"
                      onClick={handleEdit}
                  >
                      Create My Profile
                  </button>

              </div>

          </div>

      </div>
  );
}


    // =========================================================
    // ERROR
    // =========================================================
    if (error) {

        return (
            <div className="profile-page-state">

                <div className="profile-state-card">

                    <h2>
                        Unable to load profile
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        className="profile-btn primary"
                        onClick={refreshProfile}
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }


    // =========================================================
    // EDIT / CREATE MODE
    // =========================================================
    if (editing) {

        return (
            <div className="student-profile-page">

                <div className="student-profile-container">


                    {/* =================================================
                        TOP
                    ================================================= */}

                    <div className="student-profile-top">

                        <div>
                            <span className="profile-label">
                                MY PROFILE
                            </span>

                            <h1>
                                {profile
                                    ? "Edit Your Profile"
                                    : "Complete Your Profile"}
                            </h1>

                            <p>
                                Keep your profile updated
                                so other students can know
                                about you.
                            </p>
                        </div>


                        <button
                            className="profile-btn outline"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>

                    </div>


                    {/* =================================================
                        FORM
                    ================================================= */}

                    <form
                        className="student-profile-form"
                        onSubmit={handleSubmit}
                    >

                        {/* BASIC INFORMATION */}

                        <section className="profile-form-card">

                            <span className="profile-label">
                                BASIC INFORMATION
                            </span>

                            <h2>
                                Personal details
                            </h2>


                            <div className="profile-form-grid">

                                <div className="profile-field">

                                    <label>
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        required
                                    />

                                </div>


                                <div className="profile-field">

                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter email"
                                        required
                                    />

                                </div>


                                <div className="profile-field">

                                    <label>
                                        Mobile
                                    </label>

                                    <input
                                        type="text"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        placeholder="Enter mobile number"
                                    />

                                </div>


                                <div className="profile-field">

                                    <label>
                                        Roll Number
                                    </label>

                                    <input
                                        type="text"
                                        name="rollNumber"
                                        value={formData.rollNumber}
                                        onChange={handleChange}
                                        placeholder="Enter roll number"
                                        required
                                    />

                                </div>


                                <div className="profile-field">

<label>
    Department
</label>

<select
    name="departmentId"
    value={formData.departmentId}
    onChange={handleChange}
    required
    disabled={departmentsLoading}
>

    <option value="">
        {departmentsLoading
            ? "Loading departments..."
            : "Select Department"}
    </option>

    {departments.map((department) => (
        <option
            key={department.id}
            value={department.id}
        >
            {department.name} ({department.code})
        </option>
    ))}

</select>

</div>


                                <div className="profile-field">

                                    <label>
                                        Year
                                    </label>

                                    <select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        required
                                    >

                                        <option value="">
                                            Select year
                                        </option>

                                        <option value="1">
                                            1st Year
                                        </option>

                                        <option value="2">
                                            2nd Year
                                        </option>

                                        <option value="3">
                                            3rd Year
                                        </option>

                                        <option value="4">
                                            4th Year
                                        </option>

                                    </select>

                                </div>

                            </div>

                        </section>


                        {/* ABOUT */}

                        <section className="profile-form-card">

                            <span className="profile-label">
                                ABOUT
                            </span>

                            <h2>
                                Tell something about yourself
                            </h2>


                            <div className="profile-field">

                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Write a short bio..."
                                    rows="6"
                                />

                            </div>

                        </section>


                        {/* PROFESSIONAL */}

                        <section className="profile-form-card">

                            <span className="profile-label">
                                PROFESSIONAL LINKS
                            </span>

                            <h2>
                                Connect with me
                            </h2>


                            <div className="profile-form-grid">

                                <div className="profile-field">

                                    <label>
                                        GitHub
                                    </label>

                                    <input
                                        type="text"
                                        name="github"
                                        value={formData.github}
                                        onChange={handleChange}
                                        placeholder="https://github.com/username"
                                    />

                                </div>


                                <div className="profile-field">

                                    <label>
                                        LinkedIn
                                    </label>

                                    <input
                                        type="text"
                                        name="linkedin"
                                        value={formData.linkedin}
                                        onChange={handleChange}
                                        placeholder="https://linkedin.com/in/username"
                                    />

                                </div>


                                <div className="profile-field full">

    <label>
        Profile Photo
    </label>

    <CloudinaryUpload
        value={formData.profileImage}
        onUpload={(imageUrl) => {
            setFormData((prev) => ({
                ...prev,
                profileImage: imageUrl
            }));
        }}
    />

</div>

                            </div>

                        </section>


                        {/* ERROR */}

                        {formError && (

                            <div className="profile-form-error">
                                {formError}
                            </div>

                        )}


                        {/* SAVE */}

                        <div className="profile-form-actions">

                            <button
                                type="button"
                                className="profile-btn outline"
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="profile-btn primary"
                                disabled={saving}
                            >

                                {saving
                                    ? "Saving..."
                                    : profile
                                        ? "Save Changes"
                                        : "Create Profile"
                                }

                            </button>

                        </div>

                    </form>

                </div>

            </div>
        );
    }


    // =========================================================
    // PROFILE DOES NOT EXIST
    // =========================================================
    if (!profile) {

        return (
            <div className="student-profile-page">

                <div className="student-profile-container">


                    <div className="student-profile-top">

                        <div>

                            <span className="profile-label">
                                MY PROFILE
                            </span>

                            <h1>
                                Complete Your Profile
                            </h1>

                            <p>
                                Your profile is not created yet.
                                Add your details so other students
                                can know more about you.
                            </p>

                        </div>


                        <button
                            className="profile-btn primary"
                            onClick={handleEdit}
                        >
                            Edit Profile →
                        </button>

                    </div>


                    <div className="profile-empty-card">

                        <div className="profile-empty-avatar">

                            {user?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}

                        </div>


                        <h2>
                            Welcome, {user?.name || "Student"}
                        </h2>


                        <p>
                            Your student profile hasn't been
                            created yet.
                        </p>


                        <button
                            className="profile-btn primary"
                            onClick={handleEdit}
                        >
                            Create My Profile
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    // =========================================================
    // PROFILE VIEW
    // =========================================================
    return (
        <div className="student-profile-page">

            <div className="student-profile-container">


                {/* =================================================
                    PROFILE HEADER
                ================================================= */}

                <section className="student-profile-header">

                <div className="student-profile-avatar">
    {profile.profileImage ? (
        <img
            src={profile.profileImage}
            alt={profile.name}
        />
    ) : (
        getInitials(profile.name)
    )}
</div>


                    <div className="student-profile-header-info">

                        <span className="profile-label">
                            STUDENT PROFILE
                        </span>


                        <h1>
                            {profile.name}
                        </h1>


                        <div className="student-academic-line">

                            <span>
                                Student
                            </span>

                            <span>
                                •
                            </span>

                            <span>
                                Year {profile.year}
                            </span>

                            <span>
                                •
                            </span>

                            <span>
    {profile.departmentName ||
        `Department #${profile.departmentId}`}
</span>

                        </div>


                        <p className="student-profile-email">
                            {profile.email}
                        </p>

                    </div>


                    {/* EDIT BUTTON */}

                    <button
                        className="profile-btn outline profile-edit-button"
                        onClick={handleEdit}
                    >
                        ✏ Edit Profile
                    </button>

                </section>


                {/* =================================================
                    MAIN GRID
                ================================================= */}

                <div className="student-profile-grid">


                    {/* =================================================
                        MAIN COLUMN
                    ================================================= */}

                    <main className="student-profile-main">


                        {/* ABOUT */}

                        <section className="student-profile-card">

                            <span className="profile-label">
                                ABOUT
                            </span>

                            <h2>
                                About {profile.name?.split(" ")[0]}
                            </h2>


                            <p className="student-profile-bio">

                                {profile.bio ||
                                    "No bio added yet."}

                            </p>

                        </section>


                        {/* ACADEMIC */}

                        <section className="student-profile-card">

                            <span className="profile-label">
                                ACADEMIC
                            </span>

                            <h2>
                                Academic information
                            </h2>


                            <div className="student-info-grid">

                                <div>

                                    <small>
                                        Department
                                    </small>

                                    <strong>
    {profile.departmentName ||
        `Department #${profile.departmentId}`}
</strong>

                                </div>


                                <div>

                                    <small>
                                        Year
                                    </small>

                                    <strong>
                                        {profile.year}
                                    </strong>

                                </div>


                                <div>

                                    <small>
                                        Roll Number
                                    </small>

                                    <strong>
                                        {profile.rollNumber}
                                    </strong>

                                </div>


                                <div>

                                    <small>
                                        Status
                                    </small>

                                    <strong>
                                        {profile.accountStatus || "Active"}
                                    </strong>

                                </div>

                            </div>

                        </section>


                        {/* PROFESSIONAL LINKS */}

                        <section className="student-profile-card">

                            <span className="profile-label">
                                CONNECT
                            </span>

                            <h2>
                                Professional links
                            </h2>


                            <div className="student-social-links">

                                {profile.github && (

                                    <a
                                        href={
                                            profile.github.startsWith("http")
                                                ? profile.github
                                                : `https://${profile.github}`
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                    >

                                        <strong>
                                            GitHub
                                        </strong>

                                        <span>
                                            {profile.github}
                                        </span>

                                        <b>
                                            ↗
                                        </b>

                                    </a>

                                )}


                                {profile.linkedin && (

                                    <a
                                        href={
                                            profile.linkedin.startsWith("http")
                                                ? profile.linkedin
                                                : `https://${profile.linkedin}`
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                    >

                                        <strong>
                                            LinkedIn
                                        </strong>

                                        <span>
                                            {profile.linkedin}
                                        </span>

                                        <b>
                                            ↗
                                        </b>

                                    </a>

                                )}


                                {!profile.github &&
                                    !profile.linkedin && (

                                        <p>
                                            No professional links added.
                                        </p>

                                    )}

                            </div>

                        </section>

                    </main>


                    {/* =================================================
                        SIDEBAR
                    ================================================= */}

                    <aside className="student-profile-sidebar">


                        {/* CONTACT */}

                        <div className="student-sidebar-card">

                            <span className="profile-label">
                                CONTACT
                            </span>

                            <h3>
                                Contact information
                            </h3>


                            <div className="student-contact-item">

                                <small>
                                    Email
                                </small>

                                <strong>
                                    {profile.email}
                                </strong>

                            </div>


                            <div className="student-contact-item">

                                <small>
                                    Mobile
                                </small>

                                <strong>
                                    {profile.mobile || "Not added"}
                                </strong>

                            </div>

                        </div>


                        {/* ACCOUNT */}

                        <div className="student-sidebar-card">

                            <span className="profile-label">
                                ACCOUNT
                            </span>

                            <h3>
                                Profile status
                            </h3>


                            <div className="profile-status">

                                <span>
                                    ✓
                                </span>

                                <div>

                                    <strong>
                                        Profile Active
                                    </strong>

                                    <p>
                                        Your profile is
                                        available.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </aside>

                </div>

            </div>

        </div>
    );
}


export default Profile;