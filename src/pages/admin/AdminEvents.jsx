import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventRegistrations,
} from "../../api/adminApi";

import { getAllDepartments } from "../../api/departmentApi";
import { getStudentById } from "../../api/userApi";

import "./AdminEvents.css";


function AdminEvents() {

    const navigate = useNavigate();


    // =========================================================
    // STATE
    // =========================================================

    const [events, setEvents] = useState([]);

    const [departments, setDepartments] = useState([]);
    const [departmentsLoading, setDepartmentsLoading] =
        useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    const [selectedEvent, setSelectedEvent] = useState(null);

    const [registrations, setRegistrations] = useState([]);
    const [showRegistrations, setShowRegistrations] =
        useState(false);

    const [registrationsLoading, setRegistrationsLoading] =
        useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        time: "",
        venue: "",
        departmentCode: "",
        targetType: "ALL_BRANCHES",
        category: "OTHER",
        registrationRequired: false,
        registrationLimit: "",
        status: "UPCOMING",
    });

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);


    // =========================================================
    // LOAD EVENTS
    // =========================================================

    const loadEvents = async () => {

        try {

            setLoading(true);

            const data = await getAllEvents();

            setEvents(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load events:",
                error
            );

            alert("Unable to load events.");

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadEvents();

    }, []);


    // =========================================================
    // LOAD DEPARTMENTS
    // =========================================================

    useEffect(() => {

        const loadDepartments = async () => {

            try {

                setDepartmentsLoading(true);

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

                setDepartments([]);

            } finally {

                setDepartmentsLoading(false);
            }
        };

        loadDepartments();

    }, []);


    // =========================================================
    // SEARCH / FILTER
    // =========================================================

    const filteredEvents = useMemo(() => {

        const text =
            search
                .toLowerCase()
                .trim();


        return events.filter((event) => {

            const title =
                String(
                    event.title ||
                    event.name ||
                    ""
                ).toLowerCase();


            const description =
                String(
                    event.description ||
                    ""
                ).toLowerCase();


            const venue =
                String(
                    event.venue ||
                    event.location ||
                    ""
                ).toLowerCase();


            const department =
                String(
                    event.departmentCode ||
                    ""
                ).toLowerCase();


            const matchesSearch =
                !text ||
                title.includes(text) ||
                description.includes(text) ||
                venue.includes(text) ||
                department.includes(text);


            const matchesStatus =
                statusFilter === "ALL" ||
                event.status === statusFilter;


            return (
                matchesSearch &&
                matchesStatus
            );
        });

    }, [
        events,
        search,
        statusFilter,
    ]);


    // =========================================================
    // STATS
    // =========================================================

    const totalEvents =
        events.length;

    const upcomingEvents =
        events.filter(
            (event) =>
                event.status === "UPCOMING"
        ).length;

    const liveEvents =
        events.filter(
            (event) =>
                event.status === "LIVE"
        ).length;

    const completedEvents =
        events.filter(
            (event) =>
                event.status === "COMPLETED"
        ).length;


    // =========================================================
    // IMAGE PREVIEW
    // =========================================================

    const resetImage = () => {

        setImage(null);
        setImagePreview("");
    };


    const handleImageChange = (e) => {

        const file =
            e.target.files?.[0] || null;

        setImage(file);


        if (file) {

            const url =
                URL.createObjectURL(file);

            setImagePreview(url);

        } else {

            setImagePreview("");
        }
    };


    // =========================================================
    // CREATE
    // =========================================================

    const openCreateModal = () => {

        setEditingEvent(null);

        setFormData({
            title: "",
            description: "",
            date: "",
            time: "",
            venue: "",
            departmentCode: "",
            targetType: "ALL_BRANCHES",
            category: "OTHER",
            registrationRequired: false,
            registrationLimit: "",
            status: "UPCOMING",
        });

        resetImage();

        setShowModal(true);
    };


    // =========================================================
    // EDIT
    // =========================================================

    const openEditModal = (event) => {

        setEditingEvent(event);

        setFormData({
            title:
                event.title ||
                "",

            description:
                event.description ||
                "",

            date:
                extractDate(event),

            time:
                extractTime(event),

            venue:
                event.venue ||
                "",

            departmentCode:
                event.departmentCode ||
                "",

            targetType:
                event.targetType ||
                "ALL_BRANCHES",

            category:
                event.category ||
                "OTHER",

            registrationRequired:
                event.registrationRequired ??
                false,

            registrationLimit:
                event.registrationLimit ||
                "",

            status:
                event.status ||
                "UPCOMING",
        });

        setImage(null);

        setImagePreview(
            event.imageUrl ||
            event.image ||
            ""
        );

        setShowModal(true);
    };


    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const closeModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingEvent(null);

        setImage(null);
        setImagePreview("");
    };


    // =========================================================
    // FORM CHANGE
    // =========================================================

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


    // =========================================================
    // SAVE
    // =========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        if (!formData.title.trim()) {
            alert("Event title is required.");
            return;
        }


        if (!formData.description.trim()) {
            alert("Event description is required.");
            return;
        }


        if (!formData.date) {
            alert("Event date is required.");
            return;
        }


        if (!formData.time) {
            alert("Event time is required.");
            return;
        }


        if (!formData.targetType) {
            alert("Target department is required.");
            return;
        }


        if (!formData.category) {
            alert("Event category is required.");
            return;
        }


        if (
            formData.targetType === "DEPARTMENT" &&
            !formData.departmentCode.trim()
        ) {

            alert(
                "Department is required."
            );

            return;
        }


        if (
            formData.registrationRequired &&
            !formData.registrationLimit
        ) {

            alert(
                "Registration limit is required."
            );

            return;
        }


        try {

            setSaving(true);


            const payload = {

                title:
                    formData.title.trim(),

                description:
                    formData.description.trim(),

                date:
                    formData.date,

                time:
                    formData.time,

                venue:
                    formData.venue.trim(),

                departmentCode:
                    formData.targetType ===
                    "DEPARTMENT"

                        ? formData.departmentCode
                            .trim()
                            .toUpperCase()

                        : null,

                targetType:
                    formData.targetType,

                category:
                    formData.category,

                registrationRequired:
                    Boolean(
                        formData.registrationRequired
                    ),

                registrationLimit:
                    formData.registrationRequired &&
                    formData.registrationLimit

                        ? Number(
                            formData.registrationLimit
                        )

                        : null,

                status:
                    formData.status,
            };


            let savedEvent;


            if (editingEvent) {

                savedEvent =
                    await updateEvent(
                        editingEvent.id,
                        payload,
                        image
                    );


                setEvents((current) =>
                    current.map((event) =>
                        event.id ===
                        editingEvent.id
                            ? savedEvent
                            : event
                    )
                );


                alert(
                    "Event updated successfully."
                );

            } else {

                savedEvent =
                    await createEvent(
                        payload,
                        image
                    );


                setEvents((current) => [
                    savedEvent,
                    ...current,
                ]);


                alert(
                    "Event created successfully."
                );
            }


            closeModal();

        } catch (error) {

            console.error(
                "Event save failed:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "Unable to save event."
            );

        } finally {

            setSaving(false);
        }
    };


    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (event) => {

        const confirmed =
            window.confirm(
                `Delete "${event.title}"?`
            );


        if (!confirmed) {
            return;
        }


        try {

            setDeletingId(event.id);

            await deleteEvent(event.id);


            setEvents((current) =>
                current.filter(
                    (item) =>
                        item.id !== event.id
                )
            );

        } catch (error) {

            console.error(
                "Event delete failed:",
                error
            );

            alert(
                "Unable to delete event."
            );

        } finally {

            setDeletingId(null);
        }
    };


    // =========================================================
    // REGISTRATIONS + STUDENT DETAILS
    // =========================================================

    const openRegistrations = async (event) => {
        try {
    
            setSelectedEvent(event);
            setShowRegistrations(true);
            setRegistrationsLoading(true);
    
            const data = await getEventRegistrations(event.id);
    
            setRegistrations(
                Array.isArray(data)
                    ? data
                    : []
            );
    
        } catch (error) {
    
            console.error(
                "Registration loading failed:",
                error
            );
    
            setRegistrations([]);
    
            alert(
                error?.response?.data?.message ||
                "Unable to load registrations."
            );
    
        } finally {
    
            setRegistrationsLoading(false);
        }
    };

    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="admin-events-page">


            {/* =================================================
                HERO
            ================================================= */}

            <section className="events-hero">

                <div className="events-hero-circle events-hero-circle-one" />
                <div className="events-hero-circle events-hero-circle-two" />


                <div className="events-hero-top">

                    <div>

                        <button
                            type="button"
                            className="events-back-button"
                            onClick={() =>
                                navigate(
                                    "/admin/dashboard"
                                )
                            }
                        >
                            ← Dashboard
                        </button>


                        <span className="events-eyebrow">
                            ADMIN / EVENTS
                        </span>


                        <h1>
                            Event Management
                        </h1>


                        <p>
                            Create, organize and manage
                            college events from one place.
                        </p>

                    </div>


                    <div className="events-hero-actions">

                        <button
                            type="button"
                            className="events-refresh-button"
                            onClick={loadEvents}
                            disabled={loading}
                        >
                            ↻ Refresh
                        </button>


                        <button
                            type="button"
                            className="events-create-button"
                            onClick={openCreateModal}
                        >
                            + Create Event
                        </button>

                    </div>

                </div>


                <div className="events-hero-stats">

                    <HeroStat
                        label="Total Events"
                        value={totalEvents}
                    />

                    <HeroStat
                        label="Upcoming"
                        value={upcomingEvents}
                    />

                    <HeroStat
                        label="Live Now"
                        value={liveEvents}
                    />

                    <HeroStat
                        label="Completed"
                        value={completedEvents}
                    />

                </div>

            </section>



            {/* =================================================
                TOOLBAR
            ================================================= */}

            <main className="events-main">

                <section className="events-toolbar-card">

                    <div className="events-toolbar-heading">

                        <div>

                            <span>
                                EVENT DIRECTORY
                            </span>

                            <h2>
                                All events
                            </h2>

                        </div>


                        <div className="events-result-count">

                            {filteredEvents.length}

                            {" "}

                            event
                            {filteredEvents.length === 1
                                ? ""
                                : "s"}

                        </div>

                    </div>


                    <div className="events-toolbar">

                        <div className="event-search">

                            <span className="event-search-icon">
                                ⌕
                            </span>

                            <input
                                type="text"
                                placeholder="Search events..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                            {search && (
                                <button
                                    type="button"
                                    className="clear-search"
                                    onClick={() =>
                                        setSearch("")
                                    }
                                >
                                    ×
                                </button>
                            )}

                        </div>


                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                            className="event-status-filter"
                        >

                            <option value="ALL">
                                All Status
                            </option>

                            <option value="UPCOMING">
                                Upcoming
                            </option>

                            <option value="LIVE">
                                Live
                            </option>

                            <option value="COMPLETED">
                                Completed
                            </option>

                            <option value="CANCELLED">
                                Cancelled
                            </option>

                        </select>

                    </div>

                </section>



                {/* =================================================
                    EVENT CARDS
                ================================================= */}

                <section className="events-grid">

                    {loading ? (

                        <div className="events-state">

                            <div className="events-spinner" />

                            <h3>
                                Loading events
                            </h3>

                            <p>
                                Loading your event directory...
                            </p>

                        </div>

                    ) : filteredEvents.length === 0 ? (

                        <div className="events-state">

                            <div className="events-state-icon">
                                📅
                            </div>

                            <h3>
                                No events found
                            </h3>

                            <p>
                                Try changing the search
                                or filter.
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter("ALL");
                                }}
                            >
                                Clear Filters
                            </button>

                        </div>

                    ) : (

                        filteredEvents.map(
                            (event) => (

                                <EventCard
                                    key={event.id}
                                    event={event}
                                    onEdit={
                                        openEditModal
                                    }
                                    onDelete={
                                        handleDelete
                                    }
                                    onRegistrations={
                                        openRegistrations
                                    }
                                    deleting={
                                        deletingId ===
                                        event.id
                                    }
                                />

                            )
                        )

                    )}

                </section>

            </main>



            {/* =================================================
                CREATE / EDIT MODAL
            ================================================= */}

            {showModal && (

                <div
                    className="event-modal-overlay"
                    onMouseDown={(e) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <div className="event-modal">


                        <div className="modal-header">

                            <div>

                                <span>
                                    {
                                        editingEvent
                                            ? "EDIT EVENT"
                                            : "CREATE EVENT"
                                    }
                                </span>

                                <h2>
                                    {
                                        editingEvent
                                            ? "Edit Event"
                                            : "Create New Event"
                                    }
                                </h2>

                            </div>


                            <button
                                type="button"
                                onClick={closeModal}
                            >
                                ×
                            </button>

                        </div>



                        <form
                            onSubmit={handleSubmit}
                        >

                            <div className="form-grid">


                                <FormField
                                    label="Event Title"
                                    name="title"
                                    value={
                                        formData.title
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />


                                <div className="form-field">

                                    <label>
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            formData.status
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="UPCOMING">
                                            Upcoming
                                        </option>

                                        <option value="LIVE">
                                            Live
                                        </option>

                                        <option value="COMPLETED">
                                            Completed
                                        </option>

                                        <option value="CANCELLED">
                                            Cancelled
                                        </option>

                                    </select>

                                </div>


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

                                        <option value="WORKSHOP">
                                            Workshop
                                        </option>

                                        <option value="HACKATHON">
                                            Hackathon
                                        </option>

                                        <option value="SEMINAR">
                                            Seminar
                                        </option>

                                        <option value="COMPETITION">
                                            Competition
                                        </option>

                                        <option value="TECHNICAL">
                                            Technical
                                        </option>

                                        <option value="CULTURAL">
                                            Cultural
                                        </option>

                                        <option value="PLACEMENT">
                                            Placement
                                        </option>

                                        <option value="OTHER">
                                            Other
                                        </option>

                                    </select>

                                </div>


                                <div className="form-field">

                                    <label>
                                        Registration
                                    </label>

                                    <select
                                        value={
                                            formData.registrationRequired
                                                ? "true"
                                                : "false"
                                        }
                                        onChange={(e) =>
                                            setFormData(
                                                (current) => ({
                                                    ...current,
                                                    registrationRequired:
                                                        e.target.value ===
                                                        "true",
                                                })
                                            )
                                        }
                                    >

                                        <option value="false">
                                            Not Required
                                        </option>

                                        <option value="true">
                                            Required
                                        </option>

                                    </select>

                                </div>


                                {formData.registrationRequired && (

                                    <FormField
                                        label="Registration Limit"
                                        name="registrationLimit"
                                        type="number"
                                        value={
                                            formData.registrationLimit
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                )}


                                <FormField
                                    label="Date"
                                    name="date"
                                    type="date"
                                    value={
                                        formData.date
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />


                                <FormField
                                    label="Time"
                                    name="time"
                                    type="time"
                                    value={
                                        formData.time
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />


                                <FormField
                                    label="Venue"
                                    name="venue"
                                    value={
                                        formData.venue
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />


                                {/* TARGET DEPARTMENT */}

                                <div className="form-field">

                                    <label>
                                        Target Department
                                    </label>

                                    <select
                                        value={
                                            formData.targetType ===
                                            "ALL_BRANCHES"
                                                ? "ALL"
                                                : formData.departmentCode
                                        }
                                        disabled={
                                            departmentsLoading
                                        }
                                        onChange={(e) => {

                                            const value =
                                                e.target.value;


                                            if (
                                                value ===
                                                "ALL"
                                            ) {

                                                setFormData(
                                                    (current) => ({
                                                        ...current,
                                                        targetType:
                                                            "ALL_BRANCHES",
                                                        departmentCode:
                                                            "",
                                                    })
                                                );

                                                return;
                                            }


                                            setFormData(
                                                (current) => ({
                                                    ...current,
                                                    targetType:
                                                        "DEPARTMENT",
                                                    departmentCode:
                                                        value,
                                                })
                                            );
                                        }}
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
                                                        department.code
                                                    }
                                                >
                                                    {
                                                        department.code
                                                    }

                                                    {department.name
                                                        ? ` - ${department.name}`
                                                        : ""}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                            </div>



                            {/* DESCRIPTION */}

                            <div className="form-field">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    rows="5"
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Describe the event..."
                                />

                            </div>



                            {/* IMAGE */}

                            <div className="form-field">

                                <label>
                                    Event Image
                                </label>


                                <div className="event-image-upload">

                                    <div className="event-image-preview">

                                        {imagePreview ? (

                                            <img
                                                src={
                                                    imagePreview
                                                }
                                                alt="Event preview"
                                                onError={() =>
                                                    setImagePreview("")
                                                }
                                            />

                                        ) : (

                                            <div className="event-image-preview-empty">
                                                <span>📷</span>

                                                <small>
                                                    No image selected
                                                </small>
                                            </div>

                                        )}

                                    </div>


                                    <div className="event-upload-content">

                                        <strong>
                                            {image
                                                ? image.name
                                                : "Choose event image"}
                                        </strong>

                                        <span>
                                            Recommended: landscape
                                            JPG, PNG or WEBP
                                        </span>


                                        <label className="upload-button">

                                            Choose Image

                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={
                                                    handleImageChange
                                                }
                                            />

                                        </label>

                                    </div>

                                </div>

                            </div>



                            {/* ACTIONS */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={closeModal}
                                    disabled={saving}
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
                                        : editingEvent
                                            ? "Save Changes"
                                            : "Create Event"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}



            {/* =================================================
                REGISTRATIONS MODAL
            ================================================= */}

            {showRegistrations &&
                selectedEvent && (

                    <div
                        className="event-modal-overlay"
                        onMouseDown={(e) => {

                            if (
                                e.target ===
                                e.currentTarget
                            ) {

                                setShowRegistrations(
                                    false
                                );
                            }

                        }}
                    >

                        <div className="registrations-modal">


                            <div className="modal-header">

                                <div>

                                    <span>
                                        EVENT REGISTRATIONS
                                    </span>

                                    <h2>
                                        {
                                            selectedEvent.title
                                        }
                                    </h2>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowRegistrations(
                                            false
                                        )
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            {registrationsLoading ? (

                                <div className="registration-loading">

                                    <div className="events-spinner" />

                                    <p>
                                        Loading student details...
                                    </p>

                                </div>

                            ) : registrations.length === 0 ? (

                                <div className="registration-empty">

                                    <div className="registration-empty-icon">
                                        ◎
                                    </div>

                                    <strong>
                                        No registrations yet
                                    </strong>

                                    <span>
                                        Students who register
                                        will appear here.
                                    </span>

                                </div>

                            ) : (

                                <div className="registration-list">

{registrations.map((registration) => {

const student =
    registration.student;

const studentName =
    student?.name ||
    `Student #${registration.studentId}`;

const initials =
    studentName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            (word) =>
                word.charAt(0).toUpperCase()
        )
        .join("");

return (
    <div
        key={registration.id}
        className="registration-card"
    >

        {/* PROFILE */}

        <div className="registration-profile">

            {student?.profileImage ? (

                <img
                    src={student.profileImage}
                    alt={studentName}
                    onError={(e) => {
                        e.currentTarget.style.display =
                            "none";

                        if (
                            e.currentTarget.nextElementSibling
                        ) {
                            e.currentTarget
                                .nextElementSibling
                                .style.display = "flex";
                        }
                    }}
                />

            ) : null}


            <div
                className="registration-avatar-large"
                style={{
                    display:
                        student?.profileImage
                            ? "none"
                            : "flex",
                }}
            >
                {initials || "S"}
            </div>

        </div>


        {/* STUDENT */}

        <div className="registration-main">

            <div className="registration-name-row">

                <div>

                    <h3>
                        {studentName}
                    </h3>

                    <span>
                        Student ID:{" "}
                        {registration.studentId}
                    </span>

                </div>


                <span
                    className={
                        `registration-status ${
                            String(
                                registration.status ||
                                "REGISTERED"
                            ).toLowerCase()
                        }`
                    }
                >
                    {registration.status ||
                        "REGISTERED"}
                </span>

            </div>


            <div className="registration-details-grid">

                <StudentDetail
                    label="Roll Number"
                    value={
                        student?.rollNumber ||
                        "—"
                    }
                />


                <StudentDetail
                    label="Department"
                    value={
                        student?.departmentName ||
                        "—"
                    }
                />


                <StudentDetail
                    label="Year"
                    value={
                        student?.year
                            ? `Year ${student.year}`
                            : "—"
                    }
                />


                <StudentDetail
                    label="Email"
                    value={
                        student?.email ||
                        "—"
                    }
                />


                <StudentDetail
                    label="Mobile"
                    value={
                        student?.mobile ||
                        "—"
                    }
                />


                <StudentDetail
                    label="Registered At"
                    value={
                        formatDateTime(
                            registration.registeredAt
                        )
                    }
                />

            </div>

        </div>

    </div>
);
})}

                                </div>

                            )}

                        </div>

                    </div>

                )}

        </div>
    );
}


// =============================================================
// HERO STAT
// =============================================================

function HeroStat({
    label,
    value,
}) {

    return (

        <div className="hero-stat">

            <span>
                {label}
            </span>

            <strong>
                {value}
            </strong>

        </div>
    );
}


// =============================================================
// EVENT CARD
// =============================================================

function EventCard({
    event,
    onEdit,
    onDelete,
    onRegistrations,
    deleting,
}) {

    const title =
        event.title ||
        `Event #${event.id}`;


    const image =
        event.imageUrl ||
        event.image ||
        event.bannerImage ||
        "";


    const status =
        event.status ||
        "UPCOMING";


    const department =
        event.departmentCode ||
        "ALL DEPARTMENTS";


    const registrationCount =
        Number(
            event.registrationCount ||
            0
        );


    const registrationLimit =
        Number(
            event.registrationLimit ||
            0
        );


    return (

        <article className="event-card">


            {/* IMAGE */}

            <div className="event-card-image">

                {image ? (

                    <img
                        src={image}
                        alt={title}
                        onError={(e) => {
                            e.currentTarget.style.display =
                                "none";

                            e.currentTarget
                                .parentElement
                                ?.querySelector(
                                    ".event-card-image-fallback"
                                )
                                ?.classList.add(
                                    "show"
                                );
                        }}
                    />

                ) : null}


                <div
                    className={`event-card-image-fallback ${
                        image
                            ? ""
                            : "show"
                    }`}
                >
                    <span>📅</span>

                    <small>
                        Event Image
                    </small>
                </div>


                <span
                    className={`event-status-pill ${status.toLowerCase()}`}
                >
                    {status === "LIVE"
                        ? "● LIVE"
                        : status}
                </span>

            </div>



            {/* CONTENT */}

            <div className="event-card-body">


                <div className="event-card-title-row">

                    <div>

                        <span className="event-category">
                            {event.category ||
                                "OTHER"}
                        </span>

                        <h3>
                            {title}
                        </h3>

                    </div>

                </div>


                <p className="event-card-description">

                    {event.description ||
                        "No description available."}

                </p>


                <div className="event-meta-list">


                    {event.date && (

                        <div className="event-meta-row">

                            <span>
                                📅
                            </span>

                            <div>

                                <small>
                                    DATE
                                </small>

                                <strong>
                                    {formatDate(
                                        event.date
                                    )}
                                </strong>

                            </div>

                        </div>

                    )}


                    {event.time && (

                        <div className="event-meta-row">

                            <span>
                                🕐
                            </span>

                            <div>

                                <small>
                                    TIME
                                </small>

                                <strong>
                                    {formatTime(
                                        event.time
                                    )}
                                </strong>

                            </div>

                        </div>

                    )}


                    {event.venue && (

                        <div className="event-meta-row">

                            <span>
                                📍
                            </span>

                            <div>

                                <small>
                                    VENUE
                                </small>

                                <strong>
                                    {event.venue}
                                </strong>

                            </div>

                        </div>

                    )}


                    <div className="event-meta-row">

                        <span>
                            🏫
                        </span>

                        <div>

                            <small>
                                TARGET
                            </small>

                            <strong>
                                {department}
                            </strong>

                        </div>

                    </div>

                </div>



                {/* REGISTRATION */}

                {event.registrationRequired && (

                    <div className="event-registration-row">

                        <span>
                            Registrations
                        </span>

                        <strong>

                            {registrationCount}

                            {registrationLimit > 0
                                ? ` / ${registrationLimit}`
                                : ""}

                        </strong>

                    </div>

                )}



                {/* ACTIONS */}

                <div className="event-card-actions">

                    <button
                        type="button"
                        className="registration-button"
                        onClick={() =>
                            onRegistrations(
                                event
                            )
                        }
                    >
                        View Registrations
                    </button>


                    <button
                        type="button"
                        className="edit-button"
                        onClick={() =>
                            onEdit(event)
                        }
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        className="delete-event"
                        disabled={deleting}
                        onClick={() =>
                            onDelete(event)
                        }
                    >
                        {deleting
                            ? "..."
                            : "Delete"}
                    </button>

                </div>

            </div>

        </article>
    );
}


// =============================================================
// FORM FIELD
// =============================================================

function FormField({
    label,
    name,
    type = "text",
    value,
    onChange,
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


// =============================================================
// STUDENT DETAIL
// =============================================================

function StudentDetail({
    label,
    value,
}) {

    return (

        <div className="student-detail">

            <span>
                {label}
            </span>

            <strong>
                {value}
            </strong>

        </div>
    );
}


// =============================================================
// DATE
// =============================================================

function formatDate(value) {

    if (!value) {
        return "—";
    }


    try {

        return new Date(
            `${String(value).substring(0, 10)}T00:00:00`
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    } catch {

        return value;
    }
}


// =============================================================
// TIME
// =============================================================

function formatTime(value) {

    if (!value) {
        return "—";
    }


    try {

        const [
            hours,
            minutes,
        ] =
            String(value)
                .substring(0, 5)
                .split(":");


        const date =
            new Date();


        date.setHours(
            Number(hours),
            Number(minutes),
            0,
            0
        );


        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            }
        );

    } catch {

        return value;
    }
}


// =============================================================
// DATE + TIME
// =============================================================

function formatDateTime(value) {

    if (!value) {
        return "—";
    }


    try {

        return new Date(
            value
        ).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
            }
        );

    } catch {

        return value;
    }
}


// =============================================================
// EDIT DATE
// =============================================================

function extractDate(event) {

    if (event.date) {

        return String(
            event.date
        ).substring(0, 10);
    }


    if (event.eventDate) {

        return String(
            event.eventDate
        ).substring(0, 10);
    }


    return "";
}


// =============================================================
// EDIT TIME
// =============================================================

function extractTime(event) {

    if (event.time) {

        return String(
            event.time
        ).substring(0, 5);
    }


    if (event.eventTime) {

        return String(
            event.eventTime
        ).substring(0, 5);
    }


    return "";
}


export default AdminEvents;