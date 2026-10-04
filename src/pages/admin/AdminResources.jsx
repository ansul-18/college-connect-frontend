import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getAllResources,
    getAllDepartments,
    uploadResource,
    deleteResource,
} from "../../api/adminApi";

import "./AdminResources.css";

function AdminResources() {

    const navigate = useNavigate();

    const [resources, setResources] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] =
        useState("ALL");
    const [departmentFilter, setDepartmentFilter] =
        useState("ALL");
    const [yearFilter, setYearFilter] =
        useState("ALL");

    const [showUploadModal, setShowUploadModal] =
        useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        departmentId: "",
        year: "",
    });

    const [file, setFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] =
        useState(null);


    /* ==========================================
       LOAD
    ========================================== */

    const loadResources = async () => {

        try {

            setLoading(true);

            const [
                resourceData,
                departmentData,
            ] = await Promise.all([
                getAllResources(),
                getAllDepartments(),
            ]);

            setResources(
                Array.isArray(resourceData)
                    ? resourceData
                    : []
            );

            setDepartments(
                Array.isArray(departmentData)
                    ? departmentData
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load resources:",
                error
            );

            alert(
                "Unable to load resources."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {
        loadResources();
    }, []);


    /* ==========================================
       DEPARTMENT NAME
    ========================================== */

    const getDepartmentName = (
        departmentId
    ) => {

        const department =
            departments.find(
                (item) =>
                    String(item.id) ===
                    String(departmentId)
            );

        return (
            department?.name ||
            department?.departmentName ||
            "All Departments"
        );
    };


    /* ==========================================
       FILTER
    ========================================== */

    const filteredResources = useMemo(() => {

        const searchText =
            search
                .toLowerCase()
                .trim();

        return resources.filter(
            (resource) => {

                const title =
                    String(
                        resource.title ||
                        ""
                    ).toLowerCase();

                const description =
                    String(
                        resource.description ||
                        ""
                    ).toLowerCase();

                const matchesSearch =
                    !searchText ||
                    title.includes(searchText) ||
                    description.includes(
                        searchText
                    );

                const matchesCategory =
                    categoryFilter === "ALL" ||
                    resource.category ===
                        categoryFilter;

                const matchesDepartment =
                    departmentFilter === "ALL" ||
                    String(
                        resource.departmentId
                    ) ===
                        String(
                            departmentFilter
                        );

                const matchesYear =
                    yearFilter === "ALL" ||
                    String(
                        resource.year
                    ) ===
                        String(yearFilter);

                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesDepartment &&
                    matchesYear
                );
            }
        );

    }, [
        resources,
        search,
        categoryFilter,
        departmentFilter,
        yearFilter,
    ]);


    /* ==========================================
       MODAL
    ========================================== */

    const openUploadModal = () => {

        setFormData({
            title: "",
            description: "",
            category: "",
            departmentId: "",
            year: "",
        });

        setFile(null);

        setShowUploadModal(true);
    };


    const closeUploadModal = () => {

        if (uploading) {
            return;
        }

        setShowUploadModal(false);
        setFile(null);
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


    const handleFileChange = (e) => {

        const selected =
            e.target.files?.[0] || null;

        setFile(selected);
    };


    /* ==========================================
       UPLOAD
    ========================================== */

    const handleUpload = async (e) => {

        e.preventDefault();

        if (!formData.title.trim()) {

            alert(
                "Resource title is required."
            );

            return;
        }

        if (!formData.category) {

            alert(
                "Please select a category."
            );

            return;
        }

        if (!formData.year) {

            alert(
                "Please select a year."
            );

            return;
        }

        if (!file) {

            alert(
                "Please select a file."
            );

            return;
        }

        /*
         * Your backend requires uploadedBy.
         *
         * We read the logged-in user's ID from
         * the common localStorage names used
         * in the project.
         */

        const uploadedBy =
            getLoggedInUserId();

        if (!uploadedBy) {

            alert(
                "Admin user ID could not be found."
            );

            return;
        }

        try {

            setUploading(true);

            const created =
                await uploadResource({
                    title:
                        formData.title.trim(),

                    description:
                        formData.description.trim(),

                    category:
                        formData.category,

                    departmentId:
                        formData.departmentId
                            ? Number(
                                  formData.departmentId
                              )
                            : null,

                    year:
                        Number(
                            formData.year
                        ),

                    uploadedBy:
                        Number(uploadedBy),

                    file,
                });

            setResources(
                (current) => [
                    created,
                    ...current,
                ]
            );

            closeUploadModal();

            alert(
                "Resource uploaded successfully."
            );

        } catch (error) {

            console.error(
                "Resource upload failed:",
                error
            );

            alert(
                "Unable to upload resource."
            );

        } finally {

            setUploading(false);
        }
    };


    /* ==========================================
       DELETE
    ========================================== */

    const handleDelete = async (
        resource
    ) => {

        const confirmed =
            window.confirm(
                `Delete "${resource.title || "this resource"}"?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setDeletingId(
                resource.id
            );

            await deleteResource(
                resource.id
            );

            setResources(
                (current) =>
                    current.filter(
                        (item) =>
                            item.id !==
                            resource.id
                    )
            );

        } catch (error) {

            console.error(
                "Resource delete failed:",
                error
            );

            alert(
                "Unable to delete resource."
            );

        } finally {

            setDeletingId(null);
        }
    };


    /* ==========================================
       HELPERS
    ========================================== */

    const getFileIcon = (resource) => {

        const type =
            String(
                resource.fileType ||
                resource.contentType ||
                ""
            ).toLowerCase();

        const name =
            String(
                resource.fileName ||
                ""
            ).toLowerCase();

        if (
            type.includes("pdf") ||
            name.endsWith(".pdf")
        ) {
            return "📕";
        }

        if (
            type.includes("word") ||
            name.endsWith(".doc") ||
            name.endsWith(".docx")
        ) {
            return "📘";
        }

        if (
            type.includes("image") ||
            /\.(png|jpg|jpeg|webp)$/i.test(
                name
            )
        ) {
            return "🖼️";
        }

        if (
            type.includes("video") ||
            /\.(mp4|mov|avi)$/i.test(name)
        ) {
            return "🎬";
        }

        return "📄";
    };


    const getFileName = (resource) => {

        return (
            resource.fileName ||
            resource.originalFileName ||
            resource.name ||
            "Resource file"
        );
    };


    return (
        <div className="admin-resources-page">

            {/* HEADER */}

            <div className="resources-header">

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
                        ADMIN / RESOURCES
                    </span>

                    <h1>
                        Resources
                    </h1>

                    <p>
                        Upload and manage academic
                        resources.
                    </p>

                </div>


                <div className="resources-header-actions">

                    <button
                        className="refresh-button"
                        onClick={
                            loadResources
                        }
                    >
                        ↻ Refresh
                    </button>

                    <button
                        className="upload-button"
                        onClick={
                            openUploadModal
                        }
                    >
                        + Upload Resource
                    </button>

                </div>

            </div>


            {/* SUMMARY */}

            <div className="resources-summary">

                <div className="summary-card">

                    <span>
                        Total Resources
                    </span>

                    <strong>
                        {resources.length}
                    </strong>

                </div>


                <div className="summary-card">

                    <span>
                        Showing
                    </span>

                    <strong>
                        {
                            filteredResources.length
                        }
                    </strong>

                </div>

            </div>


            {/* FILTER BAR */}

            <div className="resources-toolbar">

                <div className="resource-search">

                    <span>
                        ⌕
                    </span>

                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>


                <select
                    value={categoryFilter}
                    onChange={(e) =>
                        setCategoryFilter(
                            e.target.value
                        )
                    }
                >

                    <option value="ALL">
                        All Categories
                    </option>

                    {/* 
                      Keep these values exactly
                      same as ResourceCategory enum.
                    */}

                    <option value="NOTES">
                        Notes
                    </option>

                    <option value="PYQ">
                        PYQ
                    </option>

                    <option value="ASSIGNMENT">
                        Assignment
                    </option>

                    <option value="SYLLABUS">
                        Syllabus
                    </option>

                    <option value="OTHER">
                        Other
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


                <select
                    value={yearFilter}
                    onChange={(e) =>
                        setYearFilter(
                            e.target.value
                        )
                    }
                >

                    <option value="ALL">
                        All Years
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


            {/* RESOURCE LIST */}

            <div className="resources-table-card">

                {loading ? (

                    <div className="resources-loading">
                        Loading resources...
                    </div>

                ) : filteredResources.length ===
                  0 ? (

                    <div className="resources-empty">

                        <div className="empty-icon">
                            📚
                        </div>

                        <h3>
                            No resources found
                        </h3>

                        <p>
                            Upload a resource or
                            change your filters.
                        </p>

                        <button
                            onClick={
                                openUploadModal
                            }
                        >
                            + Upload Resource
                        </button>

                    </div>

                ) : (

                    <div className="resources-table-wrapper">

                        <table className="resources-table">

                            <thead>

                                <tr>

                                    <th>
                                        Resource
                                    </th>

                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Year
                                    </th>

                                    <th>
                                        File
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredResources.map(
                                    (resource) => (

                                        <tr
                                            key={
                                                resource.id
                                            }
                                        >

                                            <td>

                                                <div className="resource-info">

                                                    <div className="resource-icon">
                                                        {
                                                            getFileIcon(
                                                                resource
                                                            )
                                                        }
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                resource.title ||
                                                                "Untitled Resource"
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                resource.description ||
                                                                "No description"
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <span className="category-badge">
                                                    {
                                                        resource.category ||
                                                        "OTHER"
                                                    }
                                                </span>

                                            </td>


                                            <td>
                                                {
                                                    getDepartmentName(
                                                        resource.departmentId
                                                    )
                                                }
                                            </td>


                                            <td>
                                                {
                                                    resource.year ||
                                                    "—"
                                                }
                                            </td>


                                            <td>

                                                <span className="file-name">
                                                    {
                                                        getFileName(
                                                            resource
                                                        )
                                                    }
                                                </span>

                                            </td>


                                            <td>

                                                <div className="resource-actions">

                                                    {resource.fileUrl && (

                                                        <a
                                                            className="view-file"
                                                            href={
                                                                resource.fileUrl
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            View
                                                        </a>

                                                    )}


                                                    <button
                                                        className="delete-action"
                                                        disabled={
                                                            deletingId ===
                                                            resource.id
                                                        }
                                                        onClick={() =>
                                                            handleDelete(
                                                                resource
                                                            )
                                                        }
                                                    >
                                                        {
                                                            deletingId ===
                                                            resource.id
                                                                ? "..."
                                                                : "Delete"
                                                        }
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


            {/* UPLOAD MODAL */}

            {showUploadModal && (

                <div
                    className="resource-modal-overlay"
                    onMouseDown={(e) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            closeUploadModal();
                        }

                    }}
                >

                    <div className="resource-modal">

                        <div className="modal-header">

                            <div>

                                <span>
                                    NEW RESOURCE
                                </span>

                                <h2>
                                    Upload Resource
                                </h2>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeUploadModal
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleUpload
                            }
                        >

                            <div className="form-field">

                                <label>
                                    Title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    placeholder="e.g. DBMS Unit 1 Notes"
                                    value={
                                        formData.title
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            <div className="form-field">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    rows="4"
                                    placeholder="Describe this resource..."
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            <div className="resource-form-grid">

                                <div className="form-field">

                                    <label>
                                        Category
                                    </label>

                                    <select
                                        name="category"
                                        value={
                                            formData.category
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="">
                                            Select Category
                                        </option>

                                        <option value="NOTES">
                                            Notes
                                        </option>

                                        <option value="PYQ">
                                            PYQ
                                        </option>

                                        <option value="ASSIGNMENT">
                                            Assignment
                                        </option>

                                        <option value="SYLLABUS">
                                            Syllabus
                                        </option>

                                        <option value="OTHER">
                                            Other
                                        </option>

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

                            </div>


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
                                        All Departments
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


                            <div className="file-upload-field">

                                <label>
                                    Resource File
                                </label>

                                <label className="file-drop-area">

                                    <span className="upload-icon">
                                        📁
                                    </span>

                                    <strong>
                                        {
                                            file
                                                ? file.name
                                                : "Choose a file"
                                        }
                                    </strong>

                                    <small>
                                        Click to browse
                                    </small>

                                    <input
                                        type="file"
                                        onChange={
                                            handleFileChange
                                        }
                                    />

                                </label>

                            </div>


                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={
                                        closeUploadModal
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-button"
                                    disabled={
                                        uploading
                                    }
                                >
                                    {
                                        uploading
                                            ? "Uploading..."
                                            : "Upload Resource"
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
   LOGGED-IN USER ID
========================================== */

function getLoggedInUserId() {

    const possibleKeys = [
        "userId",
        "authUserId",
        "user_id",
    ];

    for (const key of possibleKeys) {

        const value =
            localStorage.getItem(key);

        if (value) {
            return value;
        }
    }


    /*
     * Some projects store complete user data.
     */

    const possibleObjects = [
        "user",
        "currentUser",
        "authUser",
    ];

    for (
        const key of possibleObjects
    ) {

        const raw =
            localStorage.getItem(key);

        if (!raw) {
            continue;
        }

        try {

            const parsed =
                JSON.parse(raw);

            const id =
                parsed?.userId ??
                parsed?.id;

            if (id) {
                return id;
            }

        } catch {
            // Ignore invalid JSON.
        }
    }

    return null;
}


export default AdminResources;