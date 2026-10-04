import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getAllComplaints,
    updateComplaintStatus,
} from "../../api/adminApi";

import "./AdminComplaints.css";

function AdminComplaints() {

    const navigate = useNavigate();

    const [complaints, setComplaints] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [selectedComplaint, setSelectedComplaint] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [statusLoadingId, setStatusLoadingId] =
        useState(null);


    /* ==========================================
       LOAD COMPLAINTS
    ========================================== */

    const loadComplaints = async () => {

        try {

            setLoading(true);

            const data =
                await getAllComplaints();

            setComplaints(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load complaints:",
                error
            );

            alert(
                "Unable to load complaints."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {
        loadComplaints();
    }, []);


    /* ==========================================
       FILTER
    ========================================== */

    const filteredComplaints = useMemo(() => {

        const searchText =
            search
                .toLowerCase()
                .trim();

        return complaints.filter(
            (complaint) => {

                const title =
                    String(
                        complaint.title ||
                        complaint.subject ||
                        ""
                    ).toLowerCase();

                const description =
                    String(
                        complaint.description ||
                        complaint.content ||
                        complaint.message ||
                        ""
                    ).toLowerCase();

                const student =
                    String(
                        complaint.studentId ||
                        complaint.userId ||
                        ""
                    ).toLowerCase();

                const matchesSearch =
                    !searchText ||
                    title.includes(searchText) ||
                    description.includes(
                        searchText
                    ) ||
                    student.includes(
                        searchText
                    );

                const matchesStatus =
                    statusFilter === "ALL" ||
                    complaint.status ===
                        statusFilter;

                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );

    }, [
        complaints,
        search,
        statusFilter,
    ]);


    /* ==========================================
       STATUS COUNTS
    ========================================== */

    const pendingCount =
        complaints.filter(
            (complaint) =>
                complaint.status === "PENDING"
        ).length;

    const inProgressCount =
        complaints.filter(
            (complaint) =>
                complaint.status ===
                "IN_PROGRESS"
        ).length;

    const resolvedCount =
        complaints.filter(
            (complaint) =>
                complaint.status === "RESOLVED"
        ).length;


    /* ==========================================
       UPDATE STATUS
    ========================================== */

    const handleStatusChange = async (
        complaintId,
        status
    ) => {

        try {

            setStatusLoadingId(
                complaintId
            );

            const updated =
                await updateComplaintStatus(
                    complaintId,
                    status
                );

            setComplaints(
                (current) =>
                    current.map(
                        (complaint) =>
                            complaint.id ===
                            complaintId
                                ? updated
                                : complaint
                    )
            );

            setSelectedComplaint(
                (current) =>
                    current &&
                    current.id ===
                        complaintId
                        ? updated
                        : current
            );

        } catch (error) {

            console.error(
                "Complaint status update failed:",
                error
            );

            alert(
                "Unable to update complaint status."
            );

        } finally {

            setStatusLoadingId(null);
        }
    };


    /* ==========================================
       HELPERS
    ========================================== */

    const getStatusClass = (status) => {

        if (!status) {
            return "unknown";
        }

        return String(status)
            .toLowerCase()
            .replaceAll(
                "_",
                "-"
            );
    };


    const getComplaintTitle = (
        complaint
    ) => {

        return (
            complaint.title ||
            complaint.subject ||
            `Complaint #${complaint.id}`
        );
    };


    const getComplaintDescription = (
        complaint
    ) => {

        return (
            complaint.description ||
            complaint.content ||
            complaint.message ||
            "No description available."
        );
    };


    const getDate = (complaint) => {

        const value =
            complaint.createdAt ||
            complaint.updatedAt ||
            complaint.date;

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


    const closeDetails = () => {
        setSelectedComplaint(null);
    };


    return (
        <div className="admin-complaints-page">

            {/* HEADER */}

            <div className="complaints-header">

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
                        ADMIN / COMPLAINTS
                    </span>

                    <h1>
                        Complaints
                    </h1>

                    <p>
                        Review and manage student
                        complaints.
                    </p>

                </div>


                <button
                    className="refresh-button"
                    onClick={
                        loadComplaints
                    }
                >
                    ↻ Refresh
                </button>

            </div>


            {/* SUMMARY */}

            <div className="complaints-summary">

                <div className="summary-card">

                    <span>
                        Total
                    </span>

                    <strong>
                        {complaints.length}
                    </strong>

                </div>


                <div className="summary-card">

                    <span>
                        Pending
                    </span>

                    <strong>
                        {pendingCount}
                    </strong>

                </div>


                <div className="summary-card">

                    <span>
                        In Progress
                    </span>

                    <strong>
                        {inProgressCount}
                    </strong>

                </div>


                <div className="summary-card">

                    <span>
                        Resolved
                    </span>

                    <strong>
                        {resolvedCount}
                    </strong>

                </div>

            </div>


            {/* FILTER */}

            <div className="complaints-toolbar">

                <div className="complaint-search">

                    <span>
                        ⌕
                    </span>

                    <input
                        type="text"
                        placeholder="Search complaints or student ID..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>


                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(
                            e.target.value
                        )
                    }
                >

                    <option value="ALL">
                        All Status
                    </option>

                    <option value="PENDING">
                        Pending
                    </option>

                    <option value="IN_PROGRESS">
                        In Progress
                    </option>

                    <option value="RESOLVED">
                        Resolved
                    </option>

                    <option value="REJECTED">
                        Rejected
                    </option>

                </select>

            </div>


            {/* TABLE */}

            <div className="complaints-table-card">

                {loading ? (

                    <div className="complaints-loading">
                        Loading complaints...
                    </div>

                ) : filteredComplaints.length ===
                  0 ? (

                    <div className="complaints-empty">

                        <div className="empty-icon">
                            ⚠️
                        </div>

                        <h3>
                            No complaints found
                        </h3>

                        <p>
                            No complaints match the
                            selected filters.
                        </p>

                    </div>

                ) : (

                    <div className="complaints-table-wrapper">

                        <table className="complaints-table">

                            <thead>

                                <tr>

                                    <th>
                                        Complaint
                                    </th>

                                    <th>
                                        Student
                                    </th>

                                    <th>
                                        Date
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

                                {filteredComplaints.map(
                                    (complaint) => (

                                        <tr
                                            key={
                                                complaint.id
                                            }
                                        >

                                            <td>

                                                <div className="complaint-info">

                                                    <div className="complaint-icon">
                                                        ⚠️
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                getComplaintTitle(
                                                                    complaint
                                                                )
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                getComplaintDescription(
                                                                    complaint
                                                                )
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <span className="student-id">
                                                    {complaint.studentId
                                                        ? `Student #${complaint.studentId}`
                                                        : complaint.userId
                                                            ? `User #${complaint.userId}`
                                                            : "Unknown"}
                                                </span>

                                            </td>


                                            <td>
                                                {
                                                    getDate(
                                                        complaint
                                                    )
                                                }
                                            </td>


                                            <td>

                                                <span
                                                    className={`complaint-status ${getStatusClass(
                                                        complaint.status
                                                    )}`}
                                                >
                                                    {
                                                        complaint.status ||
                                                        "UNKNOWN"
                                                    }
                                                </span>

                                            </td>


                                            <td>

                                                <div className="complaint-actions">

                                                    <button
                                                        onClick={() =>
                                                            setSelectedComplaint(
                                                                complaint
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>


                                                    <select
                                                        value={
                                                            complaint.status ||
                                                            ""
                                                        }
                                                        disabled={
                                                            statusLoadingId ===
                                                            complaint.id
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            handleStatusChange(
                                                                complaint.id,
                                                                e.target.value
                                                            )
                                                        }
                                                    >

                                                        <option value="">
                                                            Status
                                                        </option>

                                                        <option value="PENDING">
                                                            Pending
                                                        </option>

                                                        <option value="IN_PROGRESS">
                                                            In Progress
                                                        </option>

                                                        <option value="RESOLVED">
                                                            Resolved
                                                        </option>

                                                        <option value="REJECTED">
                                                            Rejected
                                                        </option>

                                                    </select>

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


            {/* DETAILS MODAL */}

            {selectedComplaint && (

                <div
                    className="complaint-modal-overlay"
                    onMouseDown={(e) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            closeDetails();
                        }

                    }}
                >

                    <div className="complaint-modal">

                        <div className="modal-header">

                            <div>

                                <span>
                                    COMPLAINT DETAILS
                                </span>

                                <h2>
                                    {
                                        getComplaintTitle(
                                            selectedComplaint
                                        )
                                    }
                                </h2>

                            </div>

                            <button
                                onClick={
                                    closeDetails
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="complaint-details">

                            <div className="detail-row">

                                <span>
                                    Complaint ID
                                </span>

                                <strong>
                                    #
                                    {
                                        selectedComplaint.id
                                    }
                                </strong>

                            </div>


                            <div className="detail-row">

                                <span>
                                    Student
                                </span>

                                <strong>
                                    {
                                        selectedComplaint.studentId
                                            ? `Student #${selectedComplaint.studentId}`
                                            : "Unknown"
                                    }
                                </strong>

                            </div>


                            <div className="detail-row">

                                <span>
                                    Date
                                </span>

                                <strong>
                                    {
                                        getDate(
                                            selectedComplaint
                                        )
                                    }
                                </strong>

                            </div>


                            <div className="detail-row">

                                <span>
                                    Status
                                </span>

                                <select
                                    value={
                                        selectedComplaint.status ||
                                        ""
                                    }
                                    disabled={
                                        statusLoadingId ===
                                        selectedComplaint.id
                                    }
                                    onChange={(e) =>
                                        handleStatusChange(
                                            selectedComplaint.id,
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="PENDING">
                                        Pending
                                    </option>

                                    <option value="IN_PROGRESS">
                                        In Progress
                                    </option>

                                    <option value="RESOLVED">
                                        Resolved
                                    </option>

                                    <option value="REJECTED">
                                        Rejected
                                    </option>

                                </select>

                            </div>


                            <div className="detail-description">

                                <span>
                                    Description
                                </span>

                                <p>
                                    {
                                        getComplaintDescription(
                                            selectedComplaint
                                        )
                                    }
                                </p>

                            </div>


                            {selectedComplaint.imageUrl && (

                                <div className="complaint-image-section">

                                    <span>
                                        Attached Image
                                    </span>

                                    <img
                                        src={
                                            selectedComplaint.imageUrl
                                        }
                                        alt="Complaint attachment"
                                    />

                                </div>

                            )}

                        </div>


                        <div className="modal-footer">

                            <button
                                onClick={
                                    closeDetails
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AdminComplaints;