import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getStudentById,
    getAllDepartments,
    updateStudent,
    resetUserPassword,
} from "../../api/adminApi";

import "./AdminStudentDetails.css";

function AdminStudentDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [departments, setDepartments] = useState([]);

    const [editMode, setEditMode] = useState(false);

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
        linkedin: "",
    });

    const [newPassword, setNewPassword] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        loadStudent();
    }, [id]);


    const loadStudent = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                studentData,
                departmentData,
            ] = await Promise.all([
                getStudentById(id),
                getAllDepartments(),
            ]);

            setStudent(studentData);

            setDepartments(
                Array.isArray(departmentData)
                    ? departmentData
                    : []
            );

            setFormData({
                name: studentData?.name || "",
                email: studentData?.email || "",
                mobile: studentData?.mobile || "",
                rollNumber:
                    studentData?.rollNumber || "",
                departmentId:
                    studentData?.departmentId || "",
                year:
                    studentData?.year || "",
                profileImage:
                    studentData?.profileImage || "",
                bio:
                    studentData?.bio || "",
                github:
                    studentData?.github || "",
                linkedin:
                    studentData?.linkedin || "",
            });

        } catch (err) {

            console.error(
                "Failed to load student:",
                err
            );

            setError(
                "Unable to load student profile."
            );

        } finally {

            setLoading(false);
        }
    };


    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };


    const handleSave = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);
            setError("");
            setMessage("");

            const updated =
                await updateStudent(
                    id,
                    formData
                );

            setStudent(updated);

            setFormData({
                name: updated?.name || "",
                email: updated?.email || "",
                mobile: updated?.mobile || "",
                rollNumber:
                    updated?.rollNumber || "",
                departmentId:
                    updated?.departmentId || "",
                year:
                    updated?.year || "",
                profileImage:
                    updated?.profileImage || "",
                bio:
                    updated?.bio || "",
                github:
                    updated?.github || "",
                linkedin:
                    updated?.linkedin || "",
            });

            setEditMode(false);

            setMessage(
                "Student profile updated successfully."
            );

        } catch (err) {

            console.error(
                "Update student failed:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to update student."
            );

        } finally {

            setSaving(false);
        }
    };


    const handleResetPassword = async () => {

        if (!newPassword.trim()) {

            alert(
                "Please enter a new password."
            );

            return;
        }

        if (newPassword.length < 6) {

            alert(
                "Password must contain at least 6 characters."
            );

            return;
        }

        const userId =
            student?.authUserId ??
            student?.userId;

        if (!userId) {

            alert(
                "Auth user ID is not available."
            );

            return;
        }

        const confirmed = window.confirm(
            "Reset this student's password?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setResetting(true);
            setError("");
            setMessage("");

            await resetUserPassword(
                userId,
                newPassword
            );

            setNewPassword("");

            setMessage(
                "Password updated successfully."
            );

        } catch (err) {

            console.error(
                "Password reset failed:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to reset password."
            );

        } finally {

            setResetting(false);
        }
    };


    const getDepartmentName = () => {

        const department =
            departments.find(
                (item) =>
                    String(item.id) ===
                    String(
                        student?.departmentId
                    )
            );

        return (
            department?.name ||
            department?.departmentName ||
            "Not assigned"
        );
    };


    const getInitials = (name) => {

        if (!name) {
            return "S";
        }

        return name
            .split(" ")
            .map(
                (part) =>
                    part.charAt(0)
            )
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };


    if (loading) {

        return (
            <div className="admin-student-details">
                <div className="student-details-loading">
                    Loading student...
                </div>
            </div>
        );
    }


    if (!student) {

        return (
            <div className="admin-student-details">

                <button
                    className="back-button"
                    onClick={() =>
                        navigate(
                            "/admin/students"
                        )
                    }
                >
                    ← Students
                </button>

                <div className="student-details-empty">
                    <h2>
                        Student not found
                    </h2>

                    <p>
                        The requested student
                        profile could not be loaded.
                    </p>
                </div>

            </div>
        );
    }


    return (
        <div className="admin-student-details">

            {/* HEADER */}

            <div className="student-details-header">

                <div>

                    <button
                        className="back-button"
                        onClick={() =>
                            navigate(
                                "/admin/students"
                            )
                        }
                    >
                        ← Back to Students
                    </button>

                    <span className="admin-label">
                        ADMIN / STUDENTS / PROFILE
                    </span>

                    <h1>
                        Student Profile
                    </h1>

                </div>


                <div className="header-actions">

                    {!editMode && (
                        <button
                            className="edit-button"
                            onClick={() => {
                                setMessage("");
                                setError("");
                                setEditMode(true);
                            }}
                        >
                            Edit Profile
                        </button>
                    )}

                    {editMode && (
                        <>
                            <button
                                className="cancel-button"
                                onClick={() => {
                                    setEditMode(false);
                                    loadStudent();
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                className="save-button"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>
                        </>
                    )}

                </div>

            </div>


            {/* MESSAGES */}

            {error && (
                <div className="student-error">
                    {error}
                </div>
            )}

            {message && (
                <div className="student-success">
                    {message}
                </div>
            )}


            <div className="student-details-grid">

                {/* LEFT PROFILE */}

                <div className="student-profile-card">

                    <div className="profile-avatar-wrapper">

                        {student.profileImage ? (

                            <img
                                src={student.profileImage}
                                alt={
                                    student.name ||
                                    "Student"
                                }
                                className="large-profile-image"
                            />

                        ) : (

                            <div className="large-profile-avatar">
                                {getInitials(
                                    student.name
                                )}
                            </div>

                        )}

                    </div>

                    <h2>
                        {student.name ||
                            "Unnamed Student"}
                    </h2>

                    <p className="profile-username">
                        {student.username ||
                            `Student #${student.id}`}
                    </p>

                    <div className="profile-divider" />

                    <div className="profile-item">
                        <span>
                            Student ID
                        </span>
                        <strong>
                            #{student.id}
                        </strong>
                    </div>

                    <div className="profile-item">
                        <span>
                            Department
                        </span>
                        <strong>
                            {getDepartmentName()}
                        </strong>
                    </div>

                    <div className="profile-item">
                        <span>
                            Year
                        </span>
                        <strong>
                            {student.year ||
                                "Not assigned"}
                        </strong>
                    </div>

                </div>


                {/* RIGHT CONTENT */}

                <div className="student-details-main">

                    {/* PROFILE INFORMATION */}

                    <section className="details-section">

                        <div className="section-title">

                            <div>
                                <span>
                                    PROFILE
                                </span>

                                <h2>
                                    Personal Information
                                </h2>
                            </div>

                        </div>


                        <form
                            className="details-form"
                            onSubmit={handleSave}
                        >

                            <div className="form-grid">

                                <div className="form-field">

                                    <label>
                                        Full Name
                                    </label>

                                    {editMode ? (

                                        <input
                                            name="name"
                                            value={
                                                formData.name
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        />

                                    ) : (

                                        <div className="readonly-value">
                                            {student.name ||
                                                "—"}
                                        </div>

                                    )}

                                </div>


                                <div className="form-field">

                                    <label>
                                        Email
                                    </label>

                                    {editMode ? (

                                        <input
                                            type="email"
                                            name="email"
                                            value={
                                                formData.email
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    ) : (

                                        <div className="readonly-value">
                                            {student.email ||
                                                "—"}
                                        </div>

                                    )}

                                </div>


                                <div className="form-field">

                                    <label>
                                        Mobile
                                    </label>

                                    {editMode ? (

                                        <input
                                            name="mobile"
                                            value={
                                                formData.mobile
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    ) : (

                                        <div className="readonly-value">
                                            {student.mobile ||
                                                "—"}
                                        </div>

                                    )}

                                </div>


                                <div className="form-field">

                                    <label>
                                        Roll Number
                                    </label>

                                    {editMode ? (

                                        <input
                                            name="rollNumber"
                                            value={
                                                formData.rollNumber
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    ) : (

                                        <div className="readonly-value">
                                            {student.rollNumber ||
                                                "—"}
                                        </div>

                                    )}

                                </div>


                                <div className="form-field">

                                    <label>
                                        Department
                                    </label>

                                    {editMode ? (

                                        <select
                                            name="departmentId"
                                            value={
                                                formData.departmentId
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        >

                                            <option value="">
                                                Select Department
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
                                                        {
                                                            department.name ||
                                                            department.departmentName
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    ) : (

                                        <div className="readonly-value">
                                            {
                                                getDepartmentName()
                                            }
                                        </div>

                                    )}

                                </div>


                                <div className="form-field">

                                    <label>
                                        Year
                                    </label>

                                    {editMode ? (

                                        <select
                                            name="year"
                                            value={
                                                formData.year
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        >

                                            <option value="">
                                                Select Year
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

                                    ) : (

                                        <div className="readonly-value">
                                            {student.year
                                                ? `${student.year}${getYearSuffix(student.year)} Year`
                                                : "—"}
                                        </div>

                                    )}

                                </div>

                            </div>


                            <div className="form-field">

                                <label>
                                    Bio
                                </label>

                                {editMode ? (

                                    <textarea
                                        name="bio"
                                        rows="4"
                                        value={
                                            formData.bio
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                ) : (

                                    <div className="readonly-value textarea-value">
                                        {student.bio ||
                                            "No bio added."}
                                    </div>

                                )}

                            </div>


                            <div className="social-links-grid">

                                <div className="form-field">

                                    <label>
                                        GitHub
                                    </label>

                                    {editMode ? (

                                        <input
                                            name="github"
                                            value={
                                                formData.github
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="GitHub profile URL"
                                        />

                                    ) : (

                                        <div className="readonly-value">
                                            {student.github ||
                                                "—"}
                                        </div>

                                    )}

                                </div>


                                <div className="form-field">

                                    <label>
                                        LinkedIn
                                    </label>

                                    {editMode ? (

                                        <input
                                            name="linkedin"
                                            value={
                                                formData.linkedin
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="LinkedIn profile URL"
                                        />

                                    ) : (

                                        <div className="readonly-value">
                                            {student.linkedin ||
                                                "—"}
                                        </div>

                                    )}

                                </div>

                            </div>


                            {editMode && (
                                <button
                                    type="submit"
                                    className="mobile-save-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>
                            )}

                        </form>

                    </section>


                    {/* ACCOUNT INFORMATION */}

                    <section className="details-section">

                        <div className="section-title">

                            <div>
                                <span>
                                    ACCOUNT
                                </span>

                                <h2>
                                    Authentication
                                </h2>
                            </div>

                        </div>


                        <div className="account-info">

                            <div className="account-row">

                                <div>
                                    <span>
                                        Auth User ID
                                    </span>

                                    <strong>
                                        {
                                            student.authUserId ??
                                            student.userId ??
                                            "Not linked"
                                        }
                                    </strong>
                                </div>

                                <span className="account-status">
                                    {(
                                        student.authUserId ??
                                        student.userId
                                    )
                                        ? "Linked"
                                        : "Not Linked"}
                                </span>

                            </div>

                        </div>

                    </section>


                    {/* PASSWORD */}

                    <section className="details-section password-section">

                        <div className="section-title">

                            <div>
                                <span>
                                    SECURITY
                                </span>

                                <h2>
                                    Reset Password
                                </h2>
                            </div>

                        </div>


                        <div className="password-reset">

                            <div className="form-field">

                                <label>
                                    New Password
                                </label>

                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter new password"
                                />

                            </div>

                            <button
                                className="reset-password-button"
                                onClick={
                                    handleResetPassword
                                }
                                disabled={resetting}
                            >
                                {resetting
                                    ? "Updating..."
                                    : "Reset Password"}
                            </button>

                        </div>

                    </section>

                </div>

            </div>

        </div>
    );
}


function getYearSuffix(year) {

    const value = Number(year);

    if (value === 1) return "st";
    if (value === 2) return "nd";
    if (value === 3) return "rd";

    return "th";
}


export default AdminStudentDetails;