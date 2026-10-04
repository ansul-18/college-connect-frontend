import { useEffect, useState } from "react";

import {
    createMentorProfile,
    getMyMentorProfile,
    updateMentorProfile
} from "../../api/mentorApi";

import { getAllDepartments } from "../../api/departmentApi";

import { useAuth } from "../../hooks/useAuth";

import CloudinaryUpload
    from "../../components/CloudinaryUpload";

import "./MentorProfile.css";


function MentorProfile() {

    // =========================================================
    // AUTH
    // =========================================================

    const { user } = useAuth();


    // =========================================================
    // STATE
    // =========================================================

    const [profile, setProfile] = useState(null);

    const [departments, setDepartments] = useState([]);

    const [loading, setLoading] = useState(true);

    const [departmentsLoading, setDepartmentsLoading] =
        useState(true);

    const [editing, setEditing] = useState(false);

    const [saving, setSaving] = useState(false);

    const [formError, setFormError] = useState("");


    // =========================================================
    // FORM DATA
    // =========================================================

    const [formData, setFormData] = useState({

        departmentId: "",
        year: "",

        title: "",
        experience: "",
        company: "",
        designation: "",

        bio: "",

        profileImage: "",

        github: "",
        linkedin: "",

        mentorType: "FREE",
        price: "",

        skillsInput: ""
    });


    // =========================================================
    // INITIALS
    // =========================================================

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


    // =========================================================
    // LOAD DEPARTMENTS
    // =========================================================

    useEffect(() => {

        const loadDepartments = async () => {

            try {

                setDepartmentsLoading(true);

                const data =
                    await getAllDepartments();

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
    // LOAD MENTOR PROFILE
    // =========================================================

    useEffect(() => {

        const loadProfile = async () => {

            if (!user?.userId) {
                setLoading(false);
                return;
            }

            try {

                setLoading(true);

                const data =
                    await getMyMentorProfile(
                        user.userId
                    );

                setProfile(data);

                setFormData({

                    departmentId:
                        data.departmentId || "",

                    year:
                        data.year || "",

                    title:
                        data.title || "",

                    experience:
                        data.experience || "",

                    company:
                        data.company || "",

                    designation:
                        data.designation || "",

                    bio:
                        data.bio || "",

                    profileImage:
                        data.profileImage || "",

                    github:
                        data.github || "",

                    linkedin:
                        data.linkedin || "",

                    mentorType:
                        data.mentorType || "FREE",

                    price:
                        data.price || "",

                    skillsInput:
                        data.skills?.join(", ") || ""
                });

            } catch (err) {

                // 404 means profile has not been created yet

                if (err?.response?.status === 404) {

                    setProfile(null);

                    setFormData({

                        departmentId: "",
                        year: "",

                        title: "",
                        experience: "",
                        company: "",
                        designation: "",

                        bio: "",

                        profileImage: "",

                        github: "",
                        linkedin: "",

                        mentorType: "FREE",
                        price: "",

                        skillsInput: ""
                    });

                } else {

                    console.error(
                        "Failed to load mentor profile:",
                        err
                    );

                    setFormError(
                        err?.response?.data?.message ||
                        "Unable to load mentor profile."
                    );
                }

            } finally {

                setLoading(false);

            }
        };

        loadProfile();

    }, [user]);


    // =========================================================
    // INPUT CHANGE
    // =========================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setFormData((prev) => ({

            ...prev,

            [name]: value

        }));
    };


    // =========================================================
    // EDIT
    // =========================================================

    const handleEdit = () => {

        setFormError("");

        setEditing(true);
    };


    // =========================================================
    // CANCEL
    // =========================================================

    const handleCancel = () => {

        setFormError("");

        setEditing(false);

        if (profile) {

            setFormData({

                departmentId:
                    profile.departmentId || "",

                year:
                    profile.year || "",

                title:
                    profile.title || "",

                experience:
                    profile.experience || "",

                company:
                    profile.company || "",

                designation:
                    profile.designation || "",

                bio:
                    profile.bio || "",

                profileImage:
                    profile.profileImage || "",

                github:
                    profile.github || "",

                linkedin:
                    profile.linkedin || "",

                mentorType:
                    profile.mentorType || "FREE",

                price:
                    profile.price || "",

                skillsInput:
                    profile.skills?.join(", ") || ""
            });
        } else {

            setFormData({

                departmentId: "",
                year: "",

                title: "",
                experience: "",
                company: "",
                designation: "",

                bio: "",

                profileImage: "",

                github: "",
                linkedin: "",

                mentorType: "FREE",
                price: "",

                skillsInput: ""
            });
        }
    };


    // =========================================================
    // SUBMIT
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setSaving(true);

        setFormError("");


        try {

            // Convert comma-separated skills
            const skills =
                formData.skillsInput
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter(Boolean);


            // Build backend payload
            const payload = {

                userId: user.userId,

                departmentId:
                    formData.departmentId
                        ? Number(formData.departmentId)
                        : null,

                year:
                    Number(formData.year),

                title:
                    formData.title || null,

                experience:
                    formData.experience || null,

                company:
                    formData.company || null,

                designation:
                    formData.designation || null,

                bio:
                    formData.bio || null,

                profileImage:
                    formData.profileImage || null,

                github:
                    formData.github || null,

                linkedin:
                    formData.linkedin || null,

                mentorType:
                    formData.mentorType,

                price:
                    formData.mentorType === "PAID"
                        ? Number(formData.price)
                        : 0,

                skills
            };


            console.log(
                "Mentor profile payload:",
                payload
            );


            // =================================================
            // UPDATE
            // =================================================

            if (profile) {

                const updated =
                    await updateMentorProfile(
                        profile.id,
                        payload
                    );

                setProfile(updated);


            }

            // =================================================
            // CREATE
            // =================================================

            else {

                const created =
                    await createMentorProfile(
                        payload
                    );

                setProfile(created);
            }


            setEditing(false);

            setFormError("");


        } catch (err) {

            console.error(
                "Mentor profile save failed:",
                err
            );

            setFormError(
                err?.response?.data?.message ||
                "Unable to save mentor profile."
            );

        } finally {

            setSaving(false);

        }
    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="mentor-profile-page">

                <div className="mentor-profile-state">

                    <h2>
                        Loading mentor profile...
                    </h2>

                    <p>
                        Please wait.
                    </p>

                </div>

            </div>
        );
    }


    // =========================================================
    // CREATE PROFILE
    // =========================================================

    if (!profile && !editing) {

        return (

            <div className="mentor-profile-page">

                <div className="mentor-profile-container">

                    <div className="mentor-profile-top">

                        <div>

                            <span className="section-label">
                                MENTOR PROFILE
                            </span>

                            <h1>
                                Complete Your Mentor Profile
                            </h1>

                            <p>
                                Add your professional details
                                so students can know more
                                about you.
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


                    <div className="mentor-profile-card">

                        <div className="mentor-profile-avatar">

                            {getInitials(
                                user?.name
                            )}

                        </div>


                        <h2>
                            Welcome, {user?.name || "Mentor"}
                        </h2>


                        <p>
                            Your mentor profile hasn't
                            been created yet.
                        </p>


                        <button
                            type="button"
                            className="profile-btn primary"
                            onClick={handleEdit}
                        >
                            Create My Mentor Profile
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    // =========================================================
    // EDIT / CREATE MODE
    // =========================================================

    if (editing) {

        return (

            <div className="mentor-profile-page">

                <div className="mentor-profile-container">


                    {/* ================= TOP ================= */}

                    <div className="mentor-profile-top">

                        <div>

                            <span className="section-label">
                                MENTOR PROFILE
                            </span>

                            <h1>
                                {profile
                                    ? "Edit Your Mentor Profile"
                                    : "Create Your Mentor Profile"}
                            </h1>

                            <p>
                                Keep your mentor information
                                updated for students.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="profile-btn outline"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>

                    </div>


                    {/* ================= FORM ================= */}

                    <form
                        className="mentor-profile-form"
                        onSubmit={handleSubmit}
                    >


                        {/* ================= ACADEMIC ================= */}

                        <section className="mentor-form-card">

                            <span className="section-label">
                                ACADEMIC
                            </span>

                            <h2>
                                Academic information
                            </h2>


                            <div className="mentor-form-grid">


                                {/* Department */}

                                <div className="mentor-form-group">

                                    <label>
                                        Department
                                    </label>

                                    <select
                                        name="departmentId"
                                        value={
                                            formData.departmentId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        disabled={
                                            departmentsLoading
                                        }
                                    >

                                        <option value="">
                                            {departmentsLoading
                                                ? "Loading departments..."
                                                : "Select Department"}
                                        </option>


                                        {departments.map(
                                            (department) => (

                                                <option
                                                    key={
                                                        department.id
                                                    }
                                                    value={
                                                        department.id
                                                    }
                                                >
                                                    {department.name}
                                                    {department.code
                                                        ? ` (${department.code})`
                                                        : ""}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                {/* Year */}

                                <div className="mentor-form-group">

                                    <label>
                                        Year
                                    </label>

                                    <select
                                        name="year"
                                        value={
                                            formData.year
                                        }
                                        onChange={
                                            handleChange
                                        }
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


                        {/* ================= PROFESSIONAL ================= */}

                        <section className="mentor-form-card">

                            <span className="section-label">
                                PROFESSIONAL
                            </span>

                            <h2>
                                Professional information
                            </h2>


                            <div className="mentor-form-grid">


                                {/* Title */}

                                <div className="mentor-form-group">

                                    <label>
                                        Title
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={
                                            formData.title
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Full Stack Developer"
                                    />

                                </div>


                                {/* Experience */}

                                <div className="mentor-form-group">

                                    <label>
                                        Experience
                                    </label>

                                    <input
                                        type="text"
                                        name="experience"
                                        value={
                                            formData.experience
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Fresher, 2 years"
                                    />

                                </div>


                                {/* Company */}

                                <div className="mentor-form-group">

                                    <label>
                                        Company
                                    </label>

                                    <input
                                        type="text"
                                        name="company"
                                        value={
                                            formData.company
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Optional"
                                    />

                                </div>


                                {/* Designation */}

                                <div className="mentor-form-group">

                                    <label>
                                        Designation
                                    </label>

                                    <input
                                        type="text"
                                        name="designation"
                                        value={
                                            formData.designation
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Student, Software Engineer"
                                    />

                                </div>

                            </div>

                        </section>


                        {/* ================= ABOUT ================= */}

                        <section className="mentor-form-card">

                            <span className="section-label">
                                ABOUT
                            </span>

                            <h2>
                                Tell something about yourself
                            </h2>


                            <div className="mentor-form-group">

                                <textarea
                                    name="bio"
                                    value={
                                        formData.bio
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Tell students about yourself..."
                                    rows="6"
                                />

                            </div>

                        </section>


                        {/* ================= EXPERTISE ================= */}

                        <section className="mentor-form-card">

                            <span className="section-label">
                                EXPERTISE
                            </span>

                            <h2>
                                Your skills
                            </h2>


                            <div className="mentor-form-group">

                                <label>
                                    Skills
                                </label>

                                <input
                                    type="text"
                                    name="skillsInput"
                                    value={
                                        formData.skillsInput
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Java, Spring Boot, React, MySQL"
                                />

                                <small>
                                    Separate skills with commas
                                </small>

                            </div>

                        </section>


                        {/* ================= SOCIAL ================= */}

                        <section className="mentor-form-card">

                            <span className="section-label">
                                SOCIAL LINKS
                            </span>

                            <h2>
                                Connect with me
                            </h2>


                            <div className="mentor-form-grid">


                                {/* GitHub */}

                                <div className="mentor-form-group">

                                    <label>
                                        GitHub
                                    </label>

                                    <input
                                        type="url"
                                        name="github"
                                        value={
                                            formData.github
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="https://github.com/username"
                                    />

                                </div>


                                {/* LinkedIn */}

                                <div className="mentor-form-group">

                                    <label>
                                        LinkedIn
                                    </label>

                                    <input
                                        type="url"
                                        name="linkedin"
                                        value={
                                            formData.linkedin
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="https://linkedin.com/in/username"
                                    />

                                </div>

                            </div>

                        </section>


                        {/* ================= PROFILE PHOTO ================= */}

                        <section className="mentor-form-card">

                            <span className="section-label">
                                PROFILE
                            </span>

                            <h2>
                                Profile photo
                            </h2>


                            <div className="mentor-form-group">

                                <label>
                                    Profile Photo
                                </label>

                                <CloudinaryUpload
                                    value={
                                        formData.profileImage
                                    }
                                    onUpload={(
                                        imageUrl
                                    ) => {

                                        setFormData(
                                            (prev) => ({
                                                ...prev,
                                                profileImage:
                                                    imageUrl
                                            })
                                        );

                                    }}
                                />

                            </div>

                        </section>


                        {/* ================= MENTORSHIP ================= */}

                        <section className="mentor-form-card">

                            <span className="section-label">
                                MENTORSHIP
                            </span>

                            <h2>
                                Mentorship settings
                            </h2>


                            <div className="mentor-form-grid">


                                {/* Mentor Type */}

                                <div className="mentor-form-group">

                                    <label>
                                        Mentor Type
                                    </label>

                                    <select
                                        name="mentorType"
                                        value={
                                            formData.mentorType
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >

                                        <option value="FREE">
                                            Free
                                        </option>

                                        <option value="PAID">
                                            Paid
                                        </option>

                                    </select>

                                </div>


                                {/* Price */}

                                {formData.mentorType ===
                                    "PAID" && (

                                    <div className="mentor-form-group">

                                        <label>
                                            Price
                                        </label>

                                        <input
                                            type="number"
                                            name="price"
                                            value={
                                                formData.price
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            min="1"
                                            step="0.01"
                                            placeholder="Enter session price"
                                            required
                                        />

                                    </div>

                                )}

                            </div>

                        </section>


                        {/* ================= ERROR ================= */}

                        {formError && (

                            <div className="mentor-form-error">
                                {formError}
                            </div>

                        )}


                        {/* ================= ACTIONS ================= */}

                        <div className="mentor-form-actions">

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
                                        : "Create Profile"}

                            </button>

                        </div>

                    </form>

                </div>

            </div>
        );
    }


    // =========================================================
// PROFILE VIEW
// =========================================================

return (
  <div className="mentor-profile-page mentor-profile-view">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="mentor-profile-hero">

          <div className="mentor-profile-container">

              {/* Breadcrumb */}

              <div className="mentor-profile-breadcrumb">

                  <span>Home</span>

                  <span>/</span>

                  <span>Mentor Profile</span>

              </div>


              {/* Profile Header */}

              <div className="mentor-profile-header">

                  {/* Avatar */}

                  <div className="mentor-profile-avatar">

                      {profile.profileImage ? (

                          <img
                              src={profile.profileImage}
                              alt={profile.name}
                          />

                      ) : (

                          getInitials(profile.name)

                      )}

                  </div>


                  {/* Header Info */}

                  <div className="mentor-profile-header-info">

                      <span className="section-label">
                          MENTOR PROFILE
                      </span>

                      <h1>
                          {profile.name}
                      </h1>

                      <p className="mentor-profile-title">
                          {profile.title || "Mentor"}
                      </p>


                      <div className="mentor-academic-line">

                          <span>
                              Year {profile.year}
                          </span>

                          <span>•</span>

                          <span>
                              {profile.departmentName ||
                                  `Department #${profile.departmentId}`}
                          </span>

                      </div>


                      {profile.experience && (

                          <p className="mentor-profile-experience">
                              {profile.experience}
                          </p>

                      )}


                      {profile.email && (

                          <p className="mentor-profile-email">
                              {profile.email}
                          </p>

                      )}

                  </div>


                  {/* Edit */}

                  <button
                      type="button"
                      className="profile-btn outline profile-edit-button"
                      onClick={handleEdit}
                  >
                      ✏ Edit Profile
                  </button>

              </div>

          </div>

      </section>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="mentor-profile-container mentor-profile-content">

          <div className="mentor-profile-grid">


              {/* =================================================
                  MAIN COLUMN
              ================================================= */}

              <div className="mentor-profile-main">


                  {/* ABOUT */}

                  <section className="mentor-profile-card">

                      <span className="section-label">
                          ABOUT
                      </span>

                      <h2>
                          About {profile.name?.split(" ")[0]}
                      </h2>

                      <p className="mentor-profile-bio">
                          {profile.bio ||
                              "No bio added yet."}
                      </p>

                  </section>


                  {/* SKILLS */}

                  <section className="mentor-profile-card">

                      <span className="section-label">
                          EXPERTISE
                      </span>

                      <h2>
                          Skills & expertise
                      </h2>

                      {profile.skills &&
                      profile.skills.length > 0 ? (

                          <div className="mentor-skills">

                              {profile.skills.map(
                                  (skill, index) => (

                                      <span
                                          key={index}
                                          className="mentor-skill"
                                      >
                                          {skill}
                                      </span>

                                  )
                              )}

                          </div>

                      ) : (

                          <p>
                              No skills added yet.
                          </p>

                      )}

                  </section>


                  {/* PROFESSIONAL */}

                  <section className="mentor-profile-card">

                      <span className="section-label">
                          PROFESSIONAL
                      </span>

                      <h2>
                          Professional information
                      </h2>


                      <div className="mentor-info-grid">

                          <div>

                              <small>
                                  Title
                              </small>

                              <strong>
                                  {profile.title ||
                                      "Not added"}
                              </strong>

                          </div>


                          <div>

                              <small>
                                  Experience
                              </small>

                              <strong>
                                  {profile.experience ||
                                      "Not added"}
                              </strong>

                          </div>


                          <div>

                              <small>
                                  Company
                              </small>

                              <strong>
                                  {profile.company ||
                                      "Not added"}
                              </strong>

                          </div>


                          <div>

                              <small>
                                  Designation
                              </small>

                              <strong>
                                  {profile.designation ||
                                      "Not added"}
                              </strong>

                          </div>

                      </div>

                  </section>


                  {/* ACADEMIC */}

                  <section className="mentor-profile-card">

                      <span className="section-label">
                          ACADEMIC
                      </span>

                      <h2>
                          Academic information
                      </h2>


                      <div className="mentor-info-grid">

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
                                  {profile.year
                                      ? `${profile.year}${
                                          profile.year === 1
                                              ? "st"
                                              : profile.year === 2
                                                  ? "nd"
                                                  : profile.year === 3
                                                      ? "rd"
                                                      : "th"
                                      } Year`
                                      : "Not added"}
                              </strong>

                          </div>

                      </div>

                  </section>


                  {/* WHAT YOU CAN OFFER */}

                  <section className="mentor-profile-card">

                      <span className="section-label">
                          MENTORING
                      </span>

                      <h2>
                          What students can learn
                      </h2>


                      <div className="learning-grid">

                          <div className="learning-item">

                              <div className="learning-icon">
                                  💻
                              </div>

                              <div>

                                  <h3>
                                      Practical Projects
                                  </h3>

                                  <p>
                                      Build projects and understand
                                      real-world implementation.
                                  </p>

                              </div>

                          </div>


                          <div className="learning-item">

                              <div className="learning-icon">
                                  🧠
                              </div>

                              <div>

                                  <h3>
                                      Technical Skills
                                  </h3>

                                  <p>
                                      Learn through practical
                                      examples and discussions.
                                  </p>

                              </div>

                          </div>


                          <div className="learning-item">

                              <div className="learning-icon">
                                  🎯
                              </div>

                              <div>

                                  <h3>
                                      Career Guidance
                                  </h3>

                                  <p>
                                      Get guidance on projects,
                                      placements and growth.
                                  </p>

                              </div>

                          </div>


                          <div className="learning-item">

                              <div className="learning-icon">
                                  🚀
                              </div>

                              <div>

                                  <h3>
                                      Industry Insights
                                  </h3>

                                  <p>
                                      Understand industry expectations
                                      and development practices.
                                  </p>

                              </div>

                          </div>

                      </div>

                  </section>

              </div>


              {/* =================================================
                  SIDEBAR
              ================================================= */}

              <aside className="mentor-profile-sidebar">


                  {/* MENTORSHIP */}

                  <div className="mentor-profile-access-card">

                      <div className="profile-access-top">

                          <span className="section-label">
                              MENTOR ACCESS
                          </span>

                          <div className="profile-access-price">

                              {profile.mentorType === "FREE"
                                  ? "Free"
                                  : (
                                      <>
                                          ₹{profile.price}

                                          <small>
                                              / access
                                          </small>
                                      </>
                                  )}

                          </div>

                      </div>


                      <div className="profile-access-status">

                          <div className="profile-access-icon">
                              {profile.mentorType === "FREE"
                                  ? "✓"
                                  : "₹"}
                          </div>

                          <div>

                              <strong>
                                  {profile.mentorType === "FREE"
                                      ? "Free mentor"
                                      : "Premium mentor"}
                              </strong>

                              <p>
                                  {profile.mentorType === "FREE"
                                      ? "Chat access is available."
                                      : "Students can purchase access to chat."}
                              </p>

                          </div>

                      </div>


                      <div className="profile-access-note">
                          🔒 Secure mentor access
                      </div>

                  </div>


                  {/* PROFILE STATUS */}

                  <div className="mentor-sidebar-card">

                      <span className="section-label">
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
                                  {profile.active
                                      ? "Active Mentor"
                                      : "Inactive Mentor"}
                              </strong>

                              <p>
                                  {profile.active
                                      ? "Your mentor profile is active."
                                      : "Your mentor profile is inactive."}
                              </p>

                          </div>

                      </div>

                  </div>


                  {/* SOCIAL */}

                  <div className="mentor-sidebar-card">

                      <span className="section-label">
                          CONNECT
                      </span>

                      <h3>
                          Professional links
                      </h3>


                      <div className="mentor-social-links">

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

                                  <div className="social-small-icon">
                                      GH
                                  </div>

                                  <div>

                                      <strong>
                                          GitHub
                                      </strong>

                                      <span>
                                          {profile.github}
                                      </span>

                                  </div>

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

                                  <div className="social-small-icon">
                                      IN
                                  </div>

                                  <div>

                                      <strong>
                                          LinkedIn
                                      </strong>

                                      <span>
                                          {profile.linkedin}
                                      </span>

                                  </div>

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

                  </div>


              </aside>

          </div>

      </main>

  </div>
);
}


export default MentorProfile;