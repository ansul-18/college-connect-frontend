import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getAllMentors,
    getAllDepartments,
    updateMentor,
    deactivateMentor,
    deleteMentor,
} from "../../api/adminApi";

import "./AdminMentors.css";

function AdminMentors() {

    const navigate = useNavigate();

    const [mentors, setMentors] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [departmentFilter, setDepartmentFilter] =
        useState("ALL");

    const [selectedMentor, setSelectedMentor] =
        useState(null);

    const [editMode, setEditMode] = useState(false);

    const [formData, setFormData] = useState({
        userId: "",
        departmentId: "",
        year: "",
        bio: "",
        experience: "",
        mentorType: "FREE",
        price: "",
        profileImage: "",
        active: true,
    });

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] =
        useState(null);


    /* ==========================================
       LOAD DATA
    ========================================== */

    const loadMentors = async () => {

        try {

            setLoading(true);

            const [
                mentorData,
                departmentData,
            ] = await Promise.all([
                getAllMentors(),
                getAllDepartments(),
            ]);

            setMentors(
                Array.isArray(mentorData)
                    ? mentorData
                    : []
            );

            setDepartments(
                Array.isArray(departmentData)
                    ? departmentData
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load mentors:",
                error
            );

            alert(
                "Unable to load mentors."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {
        loadMentors();
    }, []);


    /* ==========================================
       HELPERS
    ========================================== */

    const getDepartmentName = (departmentId) => {

        const department =
            departments.find(
                (item) =>
                    String(item.id) ===
                    String(departmentId)
            );

        return (
            department?.name ||
            department?.departmentName ||
            "Unknown"
        );
    };


    const getMentorName = (mentor) => {

        return (
            mentor.name ||
            mentor.mentorName ||
            mentor.userName ||
            `Mentor #${mentor.id}`
        );
    };


    const getMentorSkills = (mentor) => {

        if (Array.isArray(mentor.skills)) {
            return mentor.skills.join(", ");
        }

        return (
            mentor.skills ||
            "No skills added"
        );
    };


    const getInitials = (name) => {

        if (!name) {
            return "M";
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


    /* ==========================================
       FILTER
    ========================================== */

    const filteredMentors = useMemo(() => {

        return mentors.filter((mentor) => {

            const searchText =
                search
                    .toLowerCase()
                    .trim();

            const mentorName =
                getMentorName(
                    mentor
                ).toLowerCase();

            const mentorSkills =
                getMentorSkills(
                    mentor
                ).toLowerCase();

            const matchesSearch =
                !searchText ||
                mentorName.includes(
                    searchText
                ) ||
                mentorSkills.includes(
                    searchText
                ) ||
                String(
                    mentor.userId || ""
                ).includes(searchText);

            const matchesType =
                typeFilter === "ALL" ||
                mentor.mentorType ===
                    typeFilter;

            const matchesDepartment =
                departmentFilter === "ALL" ||
                String(
                    mentor.departmentId
                ) ===
                    String(
                        departmentFilter
                    );

            return (
                matchesSearch &&
                matchesType &&
                matchesDepartment
            );
        });

    }, [
        mentors,
        search,
        typeFilter,
        departmentFilter,
    ]);


    /* ==========================================
       EDIT
    ========================================== */

    const openEdit = (mentor) => {

        setSelectedMentor(mentor);

        setFormData({
            userId:
                mentor.userId || "",
            departmentId:
                mentor.departmentId || "",
            year:
                mentor.year || "",
            bio:
                mentor.bio || "",
            experience:
                mentor.experience ?? "",
            mentorType:
                mentor.mentorType || "FREE",
            price:
                mentor.price ?? "",
            profileImage:
                mentor.profileImage || "",
            active:
                mentor.active !== false,
        });

        setEditMode(true);
    };


    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked,
        } = e.target;

        setFormData((current) => ({
            ...current,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };


    const handleUpdate = async (e) => {

        e.preventDefault();

        if (!selectedMentor) {
            return;
        }

        try {

            setActionLoading(
                `update-${selectedMentor.id}`
            );

            const updatedMentor =
                await updateMentor(
                    selectedMentor.id,
                    {
                        ...formData,

                        userId:
                            formData.userId
                                ? Number(
                                      formData.userId
                                  )
                                : null,

                        departmentId:
                            formData.departmentId
                                ? Number(
                                      formData.departmentId
                                  )
                                : null,

                        year:
                            formData.year
                                ? Number(
                                      formData.year
                                  )
                                : null,

                        experience:
                            formData.experience
                                ? Number(
                                      formData.experience
                                  )
                                : 0,

                        price:
                            formData.price
                                ? Number(
                                      formData.price
                                  )
                                : 0,
                    }
                );

            setMentors((current) =>
                current.map((mentor) =>
                    mentor.id ===
                    selectedMentor.id
                        ? updatedMentor
                        : mentor
                )
            );

            setEditMode(false);
            setSelectedMentor(null);

            alert(
                "Mentor updated successfully."
            );

        } catch (error) {

            console.error(
                "Mentor update failed:",
                error
            );

            alert(
                "Unable to update mentor."
            );

        } finally {

            setActionLoading(null);
        }
    };


    /* ==========================================
       DEACTIVATE
    ========================================== */

    const handleDeactivate = async (mentor) => {

        const confirmed =
            window.confirm(
                `Deactivate ${getMentorName(
                    mentor
                )}?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setActionLoading(
                `deactivate-${mentor.id}`
            );

            await deactivateMentor(
                mentor.id
            );

            setMentors((current) =>
                current.map((item) =>
                    item.id === mentor.id
                        ? {
                              ...item,
                              active: false,
                          }
                        : item
                )
            );

        } catch (error) {

            console.error(
                "Deactivate mentor failed:",
                error
            );

            alert(
                "Unable to deactivate mentor."
            );

        } finally {

            setActionLoading(null);
        }
    };


    /* ==========================================
       DELETE
    ========================================== */

    const handleDelete = async (mentor) => {

        const confirmed =
            window.confirm(
                `Delete ${getMentorName(
                    mentor
                )}? This action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        try {

            setActionLoading(
                `delete-${mentor.id}`
            );

            await deleteMentor(
                mentor.id
            );

            setMentors((current) =>
                current.filter(
                    (item) =>
                        item.id !==
                        mentor.id
                )
            );

        } catch (error) {

            console.error(
                "Delete mentor failed:",
                error
            );

            alert(
                "Unable to delete mentor."
            );

        } finally {

            setActionLoading(null);
        }
    };


    /* ==========================================
       UI
    ========================================== */

    return (
        <div className="admin-mentors-page">

            {/* HEADER */}

            <div className="mentors-header">

                <div>

                    <button
                        className="back-button"
                        onClick={() =>
                            navigate(
                                "/admin/dashboard"
                            )
                        }
                    >
                        ← Dashboard
                    </button>

                    <span className="admin-label">
                        ADMIN / MENTORS
                    </span>

                    <h1>
                        Mentors
                    </h1>

                    <p>
                        Manage mentor profiles
                        and availability.
                    </p>

                </div>


                <div className="mentor-header-actions">

                    <button
                        className="secondary-header-button"
                        onClick={() =>
                            navigate(
                                "/admin/students"
                            )
                        }
                    >
                        Add from Students
                    </button>

                    <button
                        className="refresh-button"
                        onClick={loadMentors}
                    >
                        ↻ Refresh
                    </button>

                </div>

            </div>


            {/* SUMMARY */}

            <div className="mentor-summary">

                <div className="summary-card">

                    <span>
                        Total Mentors
                    </span>

                    <strong>
                        {mentors.length}
                    </strong>

                </div>


                <div className="summary-card">

                    <span>
                        Active
                    </span>

                    <strong>
                        {
                            mentors.filter(
                                (mentor) =>
                                    mentor.active !==
                                    false
                            ).length
                        }
                    </strong>

                </div>


                <div className="summary-card">

                    <span>
                        Free
                    </span>

                    <strong>
                        {
                            mentors.filter(
                                (mentor) =>
                                    mentor.mentorType ===
                                    "FREE"
                            ).length
                        }
                    </strong>

                </div>


                <div className="summary-card">

                    <span>
                        Paid
                    </span>

                    <strong>
                        {
                            mentors.filter(
                                (mentor) =>
                                    mentor.mentorType ===
                                    "PAID"
                            ).length
                        }
                    </strong>

                </div>

            </div>


            {/* FILTER BAR */}

            <div className="mentors-toolbar">

                <div className="mentor-search">

                    <span>
                        ⌕
                    </span>

                    <input
                        type="text"
                        placeholder="Search mentors or skills..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>


                <select
                    value={typeFilter}
                    onChange={(e) =>
                        setTypeFilter(
                            e.target.value
                        )
                    }
                >

                    <option value="ALL">
                        All Types
                    </option>

                    <option value="FREE">
                        Free
                    </option>

                    <option value="PAID">
                        Paid
                    </option>

                </select>


                <select
                    value={departmentFilter}
                    onChange={(e) =>
                        setDepartmentFilter(
                            e.target.value
                        )
                    }
                >

                    <option value="ALL">
                        All Departments
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

            </div>


            {/* TABLE */}

            <div className="mentors-table-card">

                {loading ? (

                    <div className="mentors-loading">
                        Loading mentors...
                    </div>

                ) : filteredMentors.length ===
                  0 ? (

                    <div className="mentors-empty">

                        <div className="empty-icon">
                            👨‍🏫
                        </div>

                        <h3>
                            No mentors found
                        </h3>

                        <p>
                            No mentors match your
                            current filters.
                        </p>

                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/students"
                                )
                            }
                        >
                            Go to Students
                        </button>

                    </div>

                ) : (

                    <div className="mentors-table-wrapper">

                        <table className="mentors-table">

                            <thead>

                                <tr>

                                    <th>
                                        Mentor
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Type
                                    </th>

                                    <th>
                                        Experience
                                    </th>

                                    <th>
                                        Price
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredMentors.map(
                                    (mentor) => (

                                        <tr
                                            key={
                                                mentor.id
                                            }
                                        >

                                            <td>

                                                <div className="mentor-info">

                                                    {mentor.profileImage ? (

                                                        <img
                                                            src={
                                                                mentor.profileImage
                                                            }
                                                            alt={
                                                                getMentorName(
                                                                    mentor
                                                                )
                                                            }
                                                        />

                                                    ) : (

                                                        <div className="mentor-avatar">
                                                            {
                                                                getInitials(
                                                                    getMentorName(
                                                                        mentor
                                                                    )
                                                                )
                                                            }
                                                        </div>

                                                    )}


                                                    <div>

                                                        <strong>
                                                            {
                                                                getMentorName(
                                                                    mentor
                                                                )
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                getMentorSkills(
                                                                    mentor
                                                                )
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>
                                                {
                                                    getDepartmentName(
                                                        mentor.departmentId
                                                    )
                                                }
                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        mentor.mentorType ===
                                                        "PAID"
                                                            ? "type-badge paid"
                                                            : "type-badge free"
                                                    }
                                                >
                                                    {
                                                        mentor.mentorType ||
                                                        "FREE"
                                                    }
                                                </span>

                                            </td>


                                            <td>
                                                {
                                                    mentor.experience ??
                                                    0
                                                }{" "}
                                                years
                                            </td>


                                            <td>
                                                {
                                                    mentor.mentorType ===
                                                    "PAID"
                                                        ? `₹${
                                                              mentor.price ??
                                                              0
                                                          }`
                                                        : "Free"
                                                }
                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        mentor.active !==
                                                        false
                                                            ? "status-badge active"
                                                            : "status-badge inactive"
                                                    }
                                                >
                                                    {mentor.active !==
                                                    false
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>

                                            </td>


                                            <td>

                                                <div className="mentor-actions">

                                                    <button
                                                        className="action-edit"
                                                        onClick={() =>
                                                            openEdit(
                                                                mentor
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>


                                                    {mentor.active !==
                                                        false && (

                                                        <button
                                                            className="action-deactivate"
                                                            disabled={
                                                                actionLoading ===
                                                                `deactivate-${mentor.id}`
                                                            }
                                                            onClick={() =>
                                                                handleDeactivate(
                                                                    mentor
                                                                )
                                                            }
                                                        >
                                                            {actionLoading ===
                                                            `deactivate-${mentor.id}`
                                                                ? "..."
                                                                : "Deactivate"}
                                                        </button>

                                                    )}


                                                    <button
                                                        className="action-delete"
                                                        disabled={
                                                            actionLoading ===
                                                            `delete-${mentor.id}`
                                                        }
                                                        onClick={() =>
                                                            handleDelete(
                                                                mentor
                                                            )
                                                        }
                                                    >
                                                        {actionLoading ===
                                                        `delete-${mentor.id}`
                                                            ? "..."
                                                            : "Delete"}
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* EDIT MODAL */}

            {editMode && selectedMentor && (

                <div
                    className="modal-overlay"
                    onMouseDown={(e) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            setEditMode(false);
                        }

                    }}
                >

                    <div className="mentor-modal">

                        <div className="modal-header">

                            <div>

                                <span>
                                    EDIT MENTOR
                                </span>

                                <h2>
                                    {getMentorName(
                                        selectedMentor
                                    )}
                                </h2>

                            </div>

                            <button
                                onClick={() =>
                                    setEditMode(
                                        false
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleUpdate
                            }
                        >

                            <div className="modal-grid">

                                <FormField
                                    label="Auth User ID"
                                    name="userId"
                                    value={
                                        formData.userId
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />


                                <div className="form-field">

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
                                    >

                                        <option value="">
                                            Select Department
                                        </option>

                                        {departments.map(
                                            (
                                                department
                                            ) => (

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

                                </div>


                                <div className="form-field">

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

                                </div>


                                <FormField
                                    label="Experience (years)"
                                    name="experience"
                                    type="number"
                                    value={
                                        formData.experience
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />


                                <div className="form-field">

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
                                    >

                                        <option value="FREE">
                                            Free
                                        </option>

                                        <option value="PAID">
                                            Paid
                                        </option>

                                    </select>

                                </div>


                                <FormField
                                    label="Price"
                                    name="price"
                                    type="number"
                                    value={
                                        formData.price
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            <FormField
                                label="Profile Image URL"
                                name="profileImage"
                                value={
                                    formData.profileImage
                                }
                                onChange={
                                    handleChange
                                }
                            />


                            <div className="form-field">

                                <label>
                                    Bio
                                </label>

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

                            </div>


                            <label className="active-checkbox">

                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={
                                        formData.active
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                                Mentor is active

                            </label>


                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() =>
                                        setEditMode(
                                            false
                                        )
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-button"
                                    disabled={
                                        actionLoading ===
                                        `update-${selectedMentor.id}`
                                    }
                                >
                                    {
                                        actionLoading ===
                                        `update-${selectedMentor.id}`
                                            ? "Saving..."
                                            : "Save Changes"
                                    }
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}


/* ==========================================
   FORM FIELD
========================================== */

function FormField({
    label,
    name,
    value,
    onChange,
    type = "text",
}) {

    return (
        <div className="form-field">

            <label>
                {label}
            </label>

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
            />

        </div>
    );
}


export default AdminMentors;