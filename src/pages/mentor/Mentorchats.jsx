import React, {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    getMentorConversations
} from "../../api/chatApi";

import {
    getStudentByAuthUserId
} from "../../api/userApi";

import "../../styles/mentorChats.css";


const MentorChats = () => {

    const navigate =
        useNavigate();


    const [
        conversations,
        setConversations
    ] = useState([]);


    const [
        search,
        setSearch
    ] = useState("");


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    /*
     * LOAD CHATS
     */
    const loadChats = async (
        showLoader = true
    ) => {

        try {

            if (showLoader) {
                setLoading(true);
            }

            setError("");


            const data =
                await getMentorConversations();


            const conversationList =
                data || [];


            /*
         * Load student information
         *
         * conversation.studentId
         * = AUTH USER ID
         */
            const enriched =
                await Promise.all(

                    conversationList.map(
                        async (conversation) => {

                            try {

                                const student =
                                await getStudentByAuthUserId(
                                    conversation.studentId
                                );

                                return {
                                    ...conversation,
                                    student
                                };

                            } catch (err) {

                                console.error(
                                    "Failed to load student:",
                                    conversation.studentId,
                                    err
                                );

                                return {
                                    ...conversation,
                                    student: null
                                };
                            }
                        }
                    )
                );


            setConversations(
                enriched
            );


        } catch (err) {

            console.error(
                "Failed to load mentor conversations:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load chats"
            );

        } finally {

            if (showLoader) {
                setLoading(false);
            }
        }
    };


    /*
     * INITIAL LOAD
     */
    useEffect(() => {

        loadChats(true);

    }, []);


    /*
     * REFRESH INBOX
     *
     * Picks up new messages/unread
     * while mentor stays on inbox.
     */
    useEffect(() => {

        const interval =
            setInterval(() => {

                loadChats(false);

            }, 5000);


        return () => {

            clearInterval(interval);

        };

    }, []);


    /*
     * SEARCH
     */
    const filteredConversations =
        conversations.filter(
            (conversation) => {

                const student =
                    conversation.student;


                const studentName =
                    student?.name
                        ?.toLowerCase() || "";


                const lastMessage =
                    conversation.lastMessage
                        ?.toLowerCase() || "";


                const query =
                    search.toLowerCase();


                return (
                    studentName.includes(query) ||
                    lastMessage.includes(query)
                );
            }
        );


    /*
     * TOTAL UNREAD
     */
    const totalUnread =
        conversations.reduce(
            (total, conversation) =>
                total +
                Number(
                    conversation.unreadCount || 0
                ),
            0
        );


    /*
     * OPEN CHAT
     */
    const openChat = (
        conversationId
    ) => {

        navigate(
            `/mentor/chats/${conversationId}`
        );
    };


    /*
     * LOADING
     */
    if (loading) {

        return (

            <div className="mentor-chats-page">

                <div className="mentor-chats-loading">

                    <div className="mentor-chats-spinner">
                    </div>

                    <p>
                        Loading your chats...
                    </p>

                </div>

            </div>
        );
    }


    /*
     * ERROR
     */
    if (error) {

        return (

            <div className="mentor-chats-page">

                <div className="mentor-chats-error">

                    <div className="mentor-error-icon">
                        !
                    </div>

                    <h2>
                        Unable to load chats
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            loadChats(true)
                        }
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }


    return (

        <div className="mentor-chats-page">

            <div className="mentor-chats-container">


                {/* ============================
                    HEADER
                ============================= */}

                <div className="mentor-chats-heading">

                    <div>

                        <p className="mentor-heading-label">
                            MESSAGES
                        </p>

                        <h1>
                            Student Chats
                        </h1>

                        <p className="mentor-heading-description">
                            Manage conversations with your students.
                        </p>

                    </div>


                    <div className="mentor-chat-count">

                        <strong>
                            {conversations.length}
                        </strong>

                        <span>
                            Conversations
                        </span>

                    </div>

                </div>


                {/* ============================
                    SEARCH
                ============================= */}

                <div className="mentor-chat-search">

                    <span>
                        ⌕
                    </span>

                    <input
                        type="text"
                        placeholder="Search students or messages..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>


                {/* ============================
                    UNREAD SUMMARY
                ============================= */}

                {totalUnread > 0 && (

                    <div className="mentor-unread-summary">

                        <span className="mentor-unread-dot">
                        </span>

                        <span>
                            {totalUnread} unread{" "}
                            {totalUnread === 1
                                ? "message"
                                : "messages"}
                        </span>

                    </div>
                )}


                {/* ============================
                    EMPTY
                ============================= */}

                {filteredConversations.length === 0 && (

                    <div className="mentor-no-conversations">

                        <div className="mentor-no-chat-icon">
                            💬
                        </div>

                        <h2>
                            {search
                                ? "No matching chats"
                                : "No student conversations yet"}
                        </h2>

                        <p>
                            {search
                                ? "Try another student name or message."
                                : "Students who start conversations with you will appear here."}
                        </p>

                    </div>
                )}


                {/* ============================
                    CONVERSATIONS
                ============================= */}

                {filteredConversations.length > 0 && (

                    <div className="mentor-conversation-list">

                        {filteredConversations.map(
                            (conversation) => {

                                const student =
                                    conversation.student;


                                const unreadCount =
                                    Number(
                                        conversation.unreadCount || 0
                                    );


                                return (

                                    <div
                                        key={
                                            conversation.id
                                        }
                                        className={
                                            unreadCount > 0
                                                ? "mentor-chat-card unread"
                                                : "mentor-chat-card"
                                        }
                                        onClick={() =>
                                            openChat(
                                                conversation.id
                                            )
                                        }
                                    >

                                        {/* AVATAR */}

                                        <div className="mentor-student-avatar">

                                            {student?.profileImage ? (

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

                                                (
                                                    student?.name ||
                                                    "S"
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()

                                            )}

                                            <span>
                                            </span>

                                        </div>


                                        {/* CONTENT */}

                                        <div className="mentor-chat-content">

                                            <div className="mentor-chat-top">

                                                <div className="mentor-student-name">

                                                    <h3>
                                                        {
                                                            student?.name ||
                                                            `Student #${conversation.studentId}`
                                                        }
                                                    </h3>

                                                    {unreadCount > 0 && (

                                                        <span className="mentor-unread-badge">
                                                            {unreadCount}
                                                        </span>

                                                    )}

                                                </div>


                                                <span className="mentor-chat-time">

                                                    {conversation.lastMessageAt
                                                        ? new Date(
                                                            conversation.lastMessageAt
                                                        ).toLocaleTimeString(
                                                            [],
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            }
                                                        )
                                                        : ""}

                                                </span>

                                            </div>


                                            <p className="student-subtitle">

                                                {student?.departmentName ||
                                                    student?.department?.name ||
                                                    "Student"}

                                            </p>


                                            <p
                                                className={
                                                    unreadCount > 0
                                                        ? "mentor-last-message unread"
                                                        : "mentor-last-message"
                                                }
                                            >

                                                {conversation.lastMessage ||
                                                    "No messages yet"}

                                            </p>

                                        </div>


                                        {/* ARROW */}

                                        <div className="mentor-chat-arrow">
                                            →
                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

            </div>

        </div>
    );
};


export default MentorChats;