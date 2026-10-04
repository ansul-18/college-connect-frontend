import React, {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    getStudentConversations
} from "../../api/chatApi";

import axiosInstance from "../../api/axiosInstance";

import "../../styles/studentChats.css";


const StudentChats = () => {

    const navigate = useNavigate();


    const [conversations, setConversations] =
        useState([]);

    const [mentors, setMentors] =
        useState({});

    const [search, setSearch] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    /*
     * LOAD CONVERSATIONS
     */
    const loadChats = async (
        showLoader = true
    ) => {

        try {

            if (showLoader) {
                setLoading(true);
            }

            setError("");


            /*
             * Get student conversations
             */
            const data =
                await getStudentConversations();

            const conversationList =
                data || [];


            setConversations(
                conversationList
            );


            /*
             * Get mentor information
             */
            const mentorMap = {};


            await Promise.all(

                conversationList.map(
                    async (conversation) => {

                        try {

                            const response =
                                await axiosInstance.get(
                                    `/api/mentors/${conversation.mentorId}`
                                );

                            mentorMap[
                                conversation.mentorId
                            ] = response.data;

                        } catch (err) {

                            console.error(
                                `Failed to load mentor ${conversation.mentorId}`,
                                err
                            );

                        }

                    }
                )

            );


            setMentors(
                mentorMap
            );


        } catch (err) {

            console.error(
                "Failed to load conversations:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load conversations"
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
     * REFRESH UNREAD / LAST MESSAGE
     *
     * This keeps the inbox updated while
     * the student stays on /student/chats.
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
     * OPEN CHAT
     */
    const openChat = (
        conversationId
    ) => {

        navigate(
            `/student/chats/${conversationId}`
        );
    };


    /*
     * SEARCH
     */
    const filteredConversations =
    conversations.filter((conversation) => {

        const mentor =
            mentors[conversation.mentorId];

        const mentorName =
            mentor?.name?.toLowerCase() || "";

        const lastMessage =
            conversation.lastMessage
                ?.toLowerCase() || "";

        const query =
            search.toLowerCase();

        return (
            mentorName.includes(query) ||
            lastMessage.includes(query)
        );
    });


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
     * LOADING
     */
    if (loading) {

        return (
            <div className="student-chats-page">

                <div className="chats-loading">

                    <div className="chats-spinner">
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
            <div className="student-chats-page">

                <div className="chats-error">

                    <div className="chats-error-icon">
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

        <div className="student-chats-page">

            <div className="student-chats-container">


                {/* ============================
                    HEADER
                ============================= */}

                <div className="student-chats-heading">

                    <div>

                        <p className="heading-label">
                            MESSAGES
                        </p>

                        <h1>
                            Your Chats
                        </h1>

                        <p className="heading-description">
                            Continue conversations with your mentors.
                        </p>

                    </div>


                    <div className="chat-count">

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

                <div className="chat-list-search">

                    <span>
                        ⌕
                    </span>

                    <input
    type="text"
    placeholder="Search mentors or messages..."
    value={search}
    onChange={(e) =>
        setSearch(e.target.value)
    }
/>

                </div>


                {/* ============================
                    UNREAD SUMMARY
                ============================= */}

                {totalUnread > 0 && (

                    <div className="unread-summary">

                        <span className="unread-summary-dot">
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
                    EMPTY STATE
                ============================= */}

                {filteredConversations.length === 0 && (

                    <div className="no-conversations">

                        <div className="no-chat-icon">
                            💬
                        </div>

                        <h2>
                            {search
                                ? "No matching chats"
                                : "No conversations yet"}
                        </h2>

                        <p>
                            {search
                                ? "Try a different mentor name or message."
                                : "Find a mentor and start your first conversation."}
                        </p>

                        {!search && (

                            <button
                                onClick={() =>
                                    navigate(
                                        "/mentors"
                                    )
                                }
                            >
                                Explore Mentors
                            </button>
                        )}

                    </div>
                )}


                {/* ============================
                    CONVERSATIONS
                ============================= */}

                {filteredConversations.length > 0 && (

                    <div className="student-conversation-list">

                        {filteredConversations.map(
                            (conversation) => {

                                const mentor =
                                    mentors[
                                        conversation.mentorId
                                    ];


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
                                                ? "student-chat-card unread"
                                                : "student-chat-card"
                                        }
                                        onClick={() =>
                                            openChat(
                                                conversation.id
                                            )
                                        }
                                    >


                                        {/* =================
                                            AVATAR
                                        ================== */}

                                        <div className="student-chat-avatar">

                                            {mentor?.profileImage ? (

                                                <img
                                                    src={
                                                        mentor.profileImage
                                                    }
                                                    alt={
                                                        mentor.name ||
                                                        "Mentor"
                                                    }
                                                />

                                            ) : (

                                                (
                                                    mentor?.name ||
                                                    "M"
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()

                                            )}

                                            <span>
                                            </span>

                                        </div>


                                        {/* =================
                                            CONTENT
                                        ================== */}

                                        <div className="student-chat-content">


                                            <div className="student-chat-top">

                                                <div className="mentor-name-wrapper">

                                                    <h3>
                                                        {
                                                            mentor?.name ||
                                                            `Mentor #${conversation.mentorId}`
                                                        }
                                                    </h3>

                                                    {unreadCount > 0 && (

                                                        <span className="chat-unread-badge">
                                                            {unreadCount}
                                                        </span>

                                                    )}

                                                </div>


                                                <span className="chat-time">

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
                                                        : new Date(
                                                            conversation.createdAt
                                                        ).toLocaleDateString()}

                                                </span>

                                            </div>


                                            <p className="mentor-title">

                                                {mentor?.experience
                                                    ? `${mentor.experience} experience`
                                                    : "Student Mentor"}

                                            </p>


                                            <p
    className={
        Number(conversation.unreadCount) > 0
            ? "chat-last-message unread-message"
            : "chat-last-message"
    }
>
    {conversation.lastMessage ||
        (
            conversation.lastMessageType === "IMAGE"
                ? "📷 Image"
                : conversation.lastMessageType === "DOCUMENT"
                    ? `📄 ${
                        conversation.lastMessage ||
                        "Document"
                    }`
                    : "No messages yet"
        )}
</p>
                                        </div>


                                        {/* =================
                                            ARROW
                                        ================== */}

                                        <div className="chat-card-arrow">
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


export default StudentChats;