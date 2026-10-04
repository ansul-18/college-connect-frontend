import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
} from "../../api/adminApi";

import "./AdminDepartments.css";

function AdminDepartments() {

    const navigate = useNavigate();

    const [departments, setDepartments] = useState([]);

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingDepartment, setEditingDepartment] =
        useState(null);

    const [formData, setFormData] = useState({
        name: "",
        code: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);


    /* ==========================================
       LOAD DEPARTMENTS
    ========================================== */

    const loadDepartments = async () => {

        try {

            setLoading(true);

            const data =
                await getAllDepartments();

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

            alert(
                "Unable to load departments."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {
        loadDepartments();
    }, []);


    /* ==========================================
       FILTER
    ========================================== */

    const filteredDepartments = useMemo(() => {

        const searchText =
            search
                .toLowerCase()
                .trim();

        if (!searchText) {
            return departments;
        }

        return departments.filter(
            (department) => {

                const name =
                    String(
                        department.name ||
                        department.departmentName ||
                        ""
                    ).toLowerCase();

                const code =
                    String(
                        department.code ||
                        ""
                    ).toLowerCase();

                return (
                    name.includes(searchText) ||
                    code.includes(searchText)
                );
            }
        );

    }, [departments, search]);


    /* ==========================================
       OPEN CREATE
    ========================================== */

    const openCreateModal = () => {

        setEditingDepartment(null);

        setFormData({
            name: "",
            code: "",
        });

        setShowModal(true);
    };


    /* ==========================================
       OPEN EDIT
    ========================================== */

    const openEditModal = (department) => {

        setEditingDepartment(
            department
        );

        setFormData({
            name:
                department.name ||
                department.departmentName ||
                "",
            code:
                department.code ||
                "",
        });

        setShowModal(true);
    };


    /* ==========================================
       CLOSE MODAL
    ========================================== */

    const closeModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingDepartment(null);
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
       SAVE
    ========================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();

        const name =
            formData.name.trim();

        const code =
            formData.code
                .trim()
                .toUpperCase();

        if (!name) {

            alert(
                "Department name is required."
            );

            return;
        }

        if (!code) {

            alert(
                "Department code is required."
            );

            return;
        }

        try {

            setSaving(true);

            const payload = {
                name,
                code,
            };

            if (editingDepartment) {

                const updated =
                    await updateDepartment(
                        editingDepartment.id,
                        payload
                    );

                setDepartments(
                    (current) =>
                        current.map(
                            (department) =>
                                department.id ===
                                editingDepartment.id
                                    ? updated
                                    : department
                        )
                );

                alert(
                    "Department updated successfully."
                );

            } else {

                const created =
                    await createDepartment(
                        payload
                    );

                setDepartments(
                    (current) => [
                        ...current,
                        created,
                    ]
                );

                alert(
                    "Department created successfully."
                );
            }

            closeModal();

        } catch (error) {

            console.error(
                "Department save failed:",
                error
            );

            alert(
                "Unable to save department."
            );

        } finally {

            setSaving(false);
        }
    };


    /* ==========================================
       DELETE
    ========================================== */

    const handleDelete = async (
        department
    ) => {

        const name =
            department.name ||
            department.departmentName ||
            "this department";

        const confirmed =
            window.confirm(
                `Delete "${name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setDeletingId(
                department.id
            );

            await deleteDepartment(
                department.id
            );

            setDepartments(
                (current) =>
                    current.filter(
                        (item) =>
                            item.id !==
                            department.id
                    )
            );

        } catch (error) {

            console.error(
                "Department delete failed:",
                error
            );

            alert(
                "Unable to delete department. It may be referenced by students, mentors or other records."
            );

        } finally {

            setDeletingId(null);
        }
    };


    return (
        <div className="admin-departments-page">

            {/* HEADER */}

            <div className="departments-header">

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
                        ADMIN / DEPARTMENTS
                    </span>

                    <h1>
                        Departments
                    </h1>

                    <p>
                        Manage college departments
                        and department codes.
                    </p>

                </div>


                <div className="department-header-actions">

                    <button
                        className="refresh-button"
                        onClick={
                            loadDepartments
                        }
                    >
                        ↻ Refresh
                    </button>

                    <button
                        className="add-button"
                        onClick={
                            openCreateModal
                        }
                    >
                        + Add Department
                    </button>

                </div>

            </div>


            {/* SUMMARY */}

            <div className="department-summary">

                <div className="summary-card">

                    <span>
                        Total Departments
                    </span>

                    <strong>
                        {departments.length}
                    </strong>

                </div>

                <div className="summary-card">

                    <span>
                        Showing
                    </span>

                    <strong>
                        {
                            filteredDepartments.length
                        }
                    </strong>

                </div>

            </div>


            {/* SEARCH */}

            <div className="departments-toolbar">

                <div className="department-search">

                    <span>
                        ⌕
                    </span>

                    <input
                        type="text"
                        placeholder="Search by department name or code..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>

            </div>


            {/* TABLE */}

            <div className="departments-table-card">

                {loading ? (

                    <div className="departments-loading">
                        Loading departments...
                    </div>

                ) : filteredDepartments.length ===
                  0 ? (

                    <div className="departments-empty">

                        <div className="empty-icon">
                            🏛️
                        </div>

                        <h3>
                            No departments found
                        </h3>

                        <p>
                            Create your first
                            department.
                        </p>

                        <button
                            onClick={
                                openCreateModal
                            }
                        >
                            + Add Department
                        </button>

                    </div>

                ) : (

                    <div className="departments-table-wrapper">

                        <table className="departments-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Code
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredDepartments.map(
                                    (department) => (

                                        <tr
                                            key={
                                                department.id
                                            }
                                        >

                                            <td>
                                                #
                                                {
                                                    department.id
                                                }
                                            </td>


                                            <td>

                                                <div className="department-info">

                                                    <div className="department-icon">
                                                        🏛️
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                department.name ||
                                                                department.departmentName ||
                                                                "Unnamed"
                                                            }
                                                        </strong>

                                                        <span>
                                                            Department
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <span className="code-badge">
                                                    {
                                                        department.code ||
                                                        "—"
                                                    }
                                                </span>

                                            </td>


                                            <td>

                                                <div className="department-actions">

                                                    <button
                                                        className="edit-action"
                                                        onClick={() =>
                                                            openEditModal(
                                                                department
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>


                                                    <button
                                                        className="delete-action"
                                                        disabled={
                                                            deletingId ===
                                                            department.id
                                                        }
                                                        onClick={() =>
                                                            handleDelete(
                                                                department
                                                            )
                                                        }
                                                    >
                                                        {
                                                            deletingId ===
                                                            department.id
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


            {/* CREATE / EDIT MODAL */}

            {showModal && (

                <div
                    className="department-modal-overlay"
                    onMouseDown={(e) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <div className="department-modal">

                        <div className="department-modal-header">

                            <div>

                                <span>
                                    {editingDepartment
                                        ? "EDIT DEPARTMENT"
                                        : "NEW DEPARTMENT"}
                                </span>

                                <h2>
                                    {editingDepartment
                                        ? "Edit Department"
                                        : "Add Department"}
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

                            <div className="department-form-field">

                                <label>
                                    Department Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Computer Science and Engineering"
                                    value={
                                        formData.name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            <div className="department-form-field">

                                <label>
                                    Department Code
                                </label>

                                <input
                                    type="text"
                                    name="code"
                                    placeholder="e.g. CSE"
                                    maxLength="10"
                                    value={
                                        formData.code
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            <div className="department-modal-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={
                                        closeModal
                                    }
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
                                        : editingDepartment
                                            ? "Save Changes"
                                            : "Create Department"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AdminDepartments;