import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getAllDepartments,
} from "../../api/adminApi";

import "./AdminAnnouncements.css";

function AdminAnnouncements() {

    const navigate = useNavigate();

    const [announcements, setAnnouncements] =
        useState([]);

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] =
        useState(false);

    const [editingAnnouncement, setEditingAnnouncement] =
        useState(null);

        const [formData, setFormData] = useState({
            title: "",
            content: "",
            departmentCode: "",
            targetType: "ALL_BRANCHES",
        });
        
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);


    /* ==========================================
       LOAD
    ========================================== */

    const loadAnnouncements = async () => {

        try {

            setLoading(true);

            const data =
                await getAllAnnouncements();

            setAnnouncements(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load announcements:",
                error
            );

            alert(
                "Unable to load announcements."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {
        loadAnnouncements();

        const loadDepartments = async () => {
            try {
                const data = await getAllDepartments();
        
                setDepartments(
                    Array.isArray(data)
                        ? data
                        : []
                );
            } catch (error) {
                console.error(
                    "Failed to load departments:",
                    error
                );
        
                setDepartments([]);
            }
        };
        loadDepartments();


    }, []);


    /* ==========================================
       FILTER
    ========================================== */

    const filteredAnnouncements = useMemo(() => {

        const searchText =
            search
                .toLowerCase()
                .trim();

        if (!searchText) {
            return announcements;
        }

        return announcements.filter(
            (announcement) => {

                const title =
                    String(
                        announcement.title ||
                        ""
                    ).toLowerCase();

                const content =
                    String(
                        announcement.content ||
                        announcement.description ||
                        ""
                    ).toLowerCase();

                return (
                    title.includes(searchText) ||
                    content.includes(searchText)
                );
            }
        );

    }, [
        announcements,
        search,
    ]);


    /* ==========================================
       OPEN CREATE
    ========================================== */

    const openCreateModal = () => {

        setEditingAnnouncement(null);

        setFormData({
            title: "",
    content: "",
    departmentCode: "",
    targetType: "ALL_BRANCHES",
        });

        setShowModal(true);
    };


    /* ==========================================
       OPEN EDIT
    ========================================== */

    const openEditModal = (
        announcement
    ) => {

        setEditingAnnouncement(
            announcement
        );

        setFormData({
            title: announcement.title || "",
        
            content:
                announcement.content ||
                announcement.description ||
                "",
        
            departmentCode:
                announcement.departmentCode || "",
        
            targetType:
                announcement.targetType ||
                "ALL_BRANCHES",
        });

        setShowModal(true);
    };


    /* ==========================================
       CLOSE
    ========================================== */

    const closeModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingAnnouncement(null);

        setFormData({
            title: "",
            content: "",
            departmentCode: "",
            targetType: "ALL_BRANCHES",
        });
    };


    /* ==========================================
       INPUT
    ========================================== */

    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };


    /* ==========================================
       CREATE / UPDATE
    ========================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();

        const title =
            formData.title.trim();

        const content =
            formData.content.trim();

        if (!title) {

            alert(
                "Announcement title is required."
            );

            return;
        }

        if (!content) {

            if (
                formData.targetType === "DEPARTMENT" &&
                !formData.departmentCode.trim()
            ) {
                alert("Please select a department.");
                return;
            }

            alert(
                "Announcement content is required."
            );

            return;
        }

        try {

            setSaving(true);

            const payload = {
                title,
                content,
                departmentCode:
                    formData.targetType === "DEPARTMENT"
                        ? formData.departmentCode
                              .trim()
                              .toUpperCase()
                        : null,
                targetType: formData.targetType,
            };

            if (editingAnnouncement) {

                const updated =
                    await updateAnnouncement(
                        editingAnnouncement.id,
                        payload
                    );

                setAnnouncements(
                    (current) =>
                        current.map(
                            (announcement) =>
                                announcement.id ===
                                editingAnnouncement.id
                                    ? updated
                                    : announcement
                        )
                );

                alert(
                    "Announcement updated successfully."
                );

            } else {

                const created =
                    await createAnnouncement(
                        payload
                    );

                setAnnouncements(
                    (current) => [
                        created,
                        ...current,
                    ]
                );

                alert(
                    "Announcement created successfully."
                );
            }

            closeModal();

        } catch (error) {

            console.error(
                "Announcement save failed:",
                error
            );

            alert(
                "Unable to save announcement."
            );

        } finally {

            setSaving(false);
        }
    };


    /* ==========================================
       DELETE
    ========================================== */

    const handleDelete = async (
        announcement
    ) => {

        const confirmed =
            window.confirm(
                `Delete "${announcement.title || "this announcement"}"?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setDeletingId(
                announcement.id
            );

            await deleteAnnouncement(
                announcement.id
            );

            setAnnouncements(
                (current) =>
                    current.filter(
                        (item) =>
                            item.id !==
                            announcement.id
                    )
            );

        } catch (error) {

            console.error(
                "Announcement delete failed:",
                error
            );

            alert(
                "Unable to delete announcement."
            );

        } finally {

            setDeletingId(null);
        }
    };


    /* ==========================================
       HELPERS
    ========================================== */

    const getDate = (announcement) => {

        const value =
            announcement.createdAt ||
            announcement.updatedAt ||
            announcement.date;

        if (!value) {
            return "—";
        }

        try {

            return new Date(
                value
            ).toLocaleDateString(
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


    const getPreview = (announcement) => {

        const content =
            announcement.content ||
            announcement.description ||
            "";

        if (content.length <= 150) {
            return content;
        }

        return (
            content.substring(0, 150) +
            "..."
        );
    };


    return (
        <div className="admin-announcements-page">

            {/* HEADER */}

            <div className="announcements-header">

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
                        ADMIN / ANNOUNCEMENTS
                    </span>

                    <h1>
                        Announcements
                    </h1>

                    <p>
                        Publish important updates
                        for students and mentors.
                    </p>

                </div>


                <div className="announcements-header-actions">

                    <button
                        className="refresh-button"
                        onClick={
                            loadAnnouncements
                        }
                    >
                        ↻ Refresh
                    </button>

                    <button
                        className="create-button"
                        onClick={
                            openCreateModal
                        }
                    >
                        + New Announcement
                    </button>

                </div>

            </div>


            {/* SUMMARY */}

            <div className="announcement-summary">

                <div className="summary-card">

                    <span>
                        Total Announcements
                    </span>

                    <strong>
                        {announcements.length}
                    </strong>

                </div>


                <div className="summary-card">

                    <span>
                        Showing
                    </span>

                    <strong>
                        {
                            filteredAnnouncements.length
                        }
                    </strong>

                </div>

            </div>


            {/* SEARCH */}

            <div className="announcement-toolbar">

                <div className="announcement-search">

                    <span>
                        ⌕
                    </span>

                    <input
                        type="text"
                        placeholder="Search announcements..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>

            </div>


            {/* CONTENT */}

            <div className="announcement-list">

                {loading ? (

                    <div className="announcement-state">
                        Loading announcements...
                    </div>

                ) : filteredAnnouncements.length ===
                  0 ? (

                    <div className="announcement-state">

                        <div className="empty-icon">
                            📢
                        </div>

                        <h3>
                            No announcements found
                        </h3>

                        <p>
                            Create your first
                            announcement.
                        </p>

                        <button
                            onClick={
                                openCreateModal
                            }
                        >
                            + Create Announcement
                        </button>

                    </div>

                ) : (

                    filteredAnnouncements.map(
                        (announcement) => (

                            <div
                                key={
                                    announcement.id
                                }
                                className="announcement-card"
                            >

                                <div className="announcement-icon">
                                    📢
                                </div>


                                <div className="announcement-main">

                                    <div className="announcement-title-row">

                                        <h3>
                                            {
                                                announcement.title ||
                                                "Untitled Announcement"
                                            }
                                        </h3>

                                        <span>
                                            {
                                                getDate(
                                                    announcement
                                                )
                                            }
                                        </span>

                                    </div>


                                    <p>
                                        {
                                            getPreview(
                                                announcement
                                            )
                                        }
                                    </p>

                                </div>


                                <div className="announcement-actions">

                                    <button
                                        className="edit-action"
                                        onClick={() =>
                                            openEditModal(
                                                announcement
                                            )
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="delete-action"
                                        disabled={
                                            deletingId ===
                                            announcement.id
                                        }
                                        onClick={() =>
                                            handleDelete(
                                                announcement
                                            )
                                        }
                                    >
                                        {
                                            deletingId ===
                                            announcement.id
                                                ? "..."
                                                : "Delete"
                                        }
                                    </button>

                                </div>

                            </div>

                        )
                    )

                )}

            </div>


            {/* CREATE / EDIT MODAL */}

            {showModal && (

                <div
                    className="announcement-modal-overlay"
                    onMouseDown={(e) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <div className="announcement-modal">

                        <div className="modal-header">

                            <div>

                                <span>
                                    {
                                        editingAnnouncement
                                            ? "EDIT ANNOUNCEMENT"
                                            : "NEW ANNOUNCEMENT"
                                    }
                                </span>

                                <h2>
                                    {
                                        editingAnnouncement
                                            ? "Edit Announcement"
                                            : "Create Announcement"
                                    }
                                </h2>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeModal
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

<div className="form-field">

<label>
    Title
</label>

<input
    type="text"
    name="title"
    placeholder="Enter announcement title"
    value={formData.title}
    onChange={handleChange}
    maxLength="150"
/>

</div>

<div className="form-field">

    <label>
        Content
    </label>

    <textarea
        name="content"
        rows="8"
        placeholder="Write announcement details..."
        value={formData.content}
        onChange={handleChange}
    />

</div>


{/* TARGET AUDIENCE */}

<div className="form-field">

    <label>
        Target Audience
    </label>

    <select
        name="targetType"
        value={formData.targetType}
        onChange={handleChange}
    >
        <option value="ALL_BRANCHES">
            All Departments
        </option>

        <option value="DEPARTMENT">
            Specific Department
        </option>
    </select>

</div>


{/* DEPARTMENT */}

{formData.targetType === "DEPARTMENT" && (

    <div className="form-field">

        <label>
            Department
        </label>

        <select
            name="departmentCode"
            value={formData.departmentCode}
            onChange={handleChange}
        >

            <option value="">
                Select Department
            </option>

            {departments.map((department) => (
                <option
                    key={department.id}
                    value={department.code}
                >
                    {department.code} - {department.name}
                </option>
            ))}

        </select>

    </div>

)}


<div className="modal-actions">

    <button
        type="button"
        className="cancel-button"
        onClick={closeModal}
    >
        Cancel
    </button>

    <button
        type="submit"
        className="save-button"
        disabled={saving}
    >
        {saving
            ? "Saving..."
            : editingAnnouncement
                ? "Save Changes"
                : "Publish Announcement"}
    </button>

</div>
                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AdminAnnouncements;