import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getAllStudents,
    getAllDepartments,
    deleteStudent,
    makeMentor,
} from "../../api/adminApi";

import "./AdminStudents.css";

function AdminStudents() {

    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] =
        useState("ALL");
    const [yearFilter, setYearFilter] =
        useState("ALL");

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] =
        useState(null);

    const loadStudents = async () => {

        try {

            setLoading(true);

            const [
                studentData,
                departmentData,
            ] = await Promise.all([
                getAllStudents(),
                getAllDepartments(),
            ]);

            setStudents(
                Array.isArray(studentData)
                    ? studentData
                    : []
            );

            setDepartments(
                Array.isArray(departmentData)
                    ? departmentData
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load students:",
                error
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {
        loadStudents();
    }, []);


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
            "Unknown Department"
        );
    };


    const filteredStudents = useMemo(() => {

        return students.filter((student) => {

            const searchText =
                search.toLowerCase().trim();

            const matchesSearch =
                !searchText ||
                String(
                    student.name || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||
                String(
                    student.email || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||
                String(
                    student.rollNumber || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||
                String(
                    student.username || ""
                )
                    .toLowerCase()
                    .includes(searchText);

            const matchesDepartment =
                departmentFilter === "ALL" ||
                String(student.departmentId) ===
                    String(departmentFilter);

            const matchesYear =
                yearFilter === "ALL" ||
                String(student.year) ===
                    String(yearFilter);

            return (
                matchesSearch &&
                matchesDepartment &&
                matchesYear
            );
        });

    }, [
        students,
        search,
        departmentFilter,
        yearFilter,
    ]);


    const handleDelete = async (student) => {

        const confirmed = window.confirm(
            `Delete student "${student.name || "this student"}"?`
        );

        if (!confirmed) {
            return;
        }

        try {

            setActionLoading(
                `delete-${student.id}`
            );

            await deleteStudent(student.id);

            setStudents((current) =>
                current.filter(
                    (item) =>
                        item.id !== student.id
                )
            );

        } catch (error) {

            console.error(
                "Delete student failed:",
                error
            );

            alert(
                "Unable to delete student."
            );

        } finally {

            setActionLoading(null);
        }
    };


    const handleMakeMentor = async (student) => {
      console.log("========== MAKE MENTOR ==========");
      console.log("FULL STUDENT:", student);
      console.log("STUDENT PROFILE ID:", student.id);
      console.log("AUTH USER ID:", student.authUserId);
      console.log("USER ID:", student.userId);
        const userId =
            student.authUserId ??
            student.userId;

        if (!userId) {

            alert(
                "Auth user ID is not available for this student."
            );

            return;
        }

        const confirmed = window.confirm(
            `Make "${student.name || "this student"}" a mentor?`
        );

        if (!confirmed) {
            return;
        }

        try {

            setActionLoading(
                `mentor-${student.id}`
            );

            await makeMentor(userId);

            alert(
                "Student role updated to MENTOR successfully."
            );

        } catch (error) {

            console.error(
                "Make mentor failed:",
                error
            );

            alert(
                "Unable to make this student a mentor."
            );

        } finally {

            setActionLoading(null);
        }
    };


    const getInitials = (name) => {

        if (!name) {
            return "S";
        }

        return name
            .split(" ")
            .map((part) => part.charAt(0))
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };


    return (
        <div className="admin-students-page">

            {/* HEADER */}
            <div className="students-header">

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
                        ADMIN / STUDENTS
                    </span>

                    <h1>
                        Students
                    </h1>

                    <p>
                        View and manage registered
                        students.
                    </p>
                </div>

                <button
                    className="refresh-button"
                    onClick={loadStudents}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* SUMMARY */}
            <div className="students-summary">

                <div className="summary-card">

                    <span>Total Students</span>

                    <strong>
                        {students.length}
                    </strong>

                </div>

                <div className="summary-card">

                    <span>Showing</span>

                    <strong>
                        {filteredStudents.length}
                    </strong>

                </div>

            </div>


            {/* FILTER BAR */}
            <div className="students-toolbar">

                <div className="students-search">

                    <span>⌕</span>

                    <input
                        type="text"
                        placeholder="Search by name, email or roll number..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>


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
                                key={department.id}
                                value={department.id}
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


            {/* TABLE */}
            <div className="students-table-card">

                {loading ? (

                    <div className="students-loading">
                        Loading students...
                    </div>

                ) : filteredStudents.length === 0 ? (

                    <div className="students-empty">

                        <div className="empty-icon">
                            🎓
                        </div>

                        <h3>
                            No students found
                        </h3>

                        <p>
                            Try changing the search
                            or filters.
                        </p>

                    </div>

                ) : (

                    <div className="students-table-wrapper">

                        <table className="students-table">

                            <thead>
                                <tr>

                                    <th>
                                        Student
                                    </th>

                                    <th>
                                        Roll Number
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Year
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>
                            </thead>


                            <tbody>

                                {filteredStudents.map(
                                    (student) => (

                                        <tr
                                            key={
                                                student.id
                                            }
                                        >

                                            <td>

                                                <div className="student-info">

                                                    {student.profileImage ? (

                                                        <img
                                                            src={
                                                                student.profileImage
                                                            }
                                                            alt={
                                                                student.name ||
                                                                "Student"
                                                            }
                                                        />

                                                    ) : (

                                                        <div className="student-avatar">
                                                            {
                                                                getInitials(
                                                                    student.name
                                                                )
                                                            }
                                                        </div>

                                                    )}

                                                    <div>

                                                        <strong>
                                                            {
                                                                student.name ||
                                                                "Unnamed Student"
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                student.username ||
                                                                `Student #${student.id}`
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>
                                                {
                                                    student.rollNumber ||
                                                    "—"
                                                }
                                            </td>


                                            <td>
                                                {
                                                    getDepartmentName(
                                                        student.departmentId
                                                    )
                                                }
                                            </td>


                                            <td>
                                                {
                                                    student.year
                                                        ? `${student.year}${getYearSuffix(student.year)}`
                                                        : "—"
                                                }
                                            </td>


                                            <td>
                                                {
                                                    student.email ||
                                                    "—"
                                                }
                                            </td>


                                            <td>

                                                <div className="student-actions">

                                                    <button
                                                        className="action-view"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/students/${student.id}`
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>


                                                    <button
                                                        className="action-mentor"
                                                        disabled={
                                                            actionLoading ===
                                                            `mentor-${student.id}`
                                                        }
                                                        onClick={() =>
                                                            handleMakeMentor(
                                                                student
                                                            )
                                                        }
                                                    >
                                                        {
                                                            actionLoading ===
                                                            `mentor-${student.id}`
                                                                ? "..."
                                                                : "Make Mentor"
                                                        }
                                                    </button>


                                                    <button
                                                        className="action-delete"
                                                        disabled={
                                                            actionLoading ===
                                                            `delete-${student.id}`
                                                        }
                                                        onClick={() =>
                                                            handleDelete(
                                                                student
                                                            )
                                                        }
                                                    >
                                                        {
                                                            actionLoading ===
                                                            `delete-${student.id}`
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


export default AdminStudents;