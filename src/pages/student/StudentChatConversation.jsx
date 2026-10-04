import React, {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    getConversation,
    getConversationMessages,
    getStudentConversations,
    markConversationAsRead
} from "../../api/chatApi";

import {
    getMentorById
} from "../../api/mentorApi";

import useChatSocket
    from "../../hooks/useChatSocket";

import MessageList
    from "../../components/chat/MessageList";

import MessageInput
    from "../../components/chat/MessageInput";

import {
    useAuth
} from "../../hooks/useAuth";

import "../../styles/studentChat.css";




const StudentChatConversation = () => {

    

    const {
        conversationId
    } = useParams();

    const navigate = useNavigate();

    const {
        user
    } = useAuth();


    const [conversation, setConversation] =
        useState(null);

    const [mentor, setMentor] =
        useState(null);

    const [conversations, setConversations] =
        useState([]);

    const [messages, setMessages] =
        useState([]);
    
    

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");
    
    const [activeFilter, setActiveFilter] =
        useState("ALL");
    
    const messagesEndRef =
        useRef(null);


    /*
     * WebSocket incoming message
     */
    const handleSocketMessage =
    useCallback((message) => {

        /*
         * Update messages in current conversation
         */
        setMessages((previous) => {

            const exists =
                previous.some(
                    item =>
                        item.id === message.id
                );

            if (exists) {
                return previous;
            }

            return [
                ...previous,
                message
            ];
        });


        /*
         * Update sidebar in real time
         */
        setConversations((previous) => {

            const messageConversationId =
                Number(message.conversationId);

            const currentConversationId =
                Number(conversationId);

            const currentUserId =
                Number(
                    user?.id ??
                    user?.userId
                );

            const exists =
                previous.some(
                    item =>
                        Number(item.id) ===
                        messageConversationId
                );

            /*
             * Conversation should normally
             * already exist in sidebar.
             */
            if (!exists) {
                return previous;
            }

            return previous
                .map((item) => {

                    if (
                        Number(item.id) !==
                        messageConversationId
                    ) {
                        return item;
                    }

                    /*
                     * Build sidebar preview
                     */
                    let preview = "Message";

                    if (
                        message.content &&
                        message.content.trim()
                    ) {

                        preview =
                            message.content.trim();

                    } else if (
                        message.messageType ===
                        "IMAGE"
                    ) {

                        preview = "📷 Image";

                    } else if (
                        message.messageType ===
                        "DOCUMENT"
                    ) {

                        preview =
                            "📄 " +
                            (
                                message.fileName ||
                                "Document"
                            );

                    }

                    /*
                     * If message is from
                     * the other person and
                     * conversation isn't open,
                     * increase unread count.
                     */
                    const isIncoming =
                        currentUserId !==
                        Number(message.senderId);

                    const isCurrentConversation =
                        messageConversationId ===
                        currentConversationId;

                    const unreadIncrement =
                        isIncoming &&
                        !isCurrentConversation
                            ? 1
                            : 0;

                    return {
                        ...item,

                        lastMessage:
                            preview,

                        lastMessageType:
                            message.messageType,

                        lastMessageAt:
                            message.createdAt,

                        unreadCount:
                            Number(
                                item.unreadCount || 0
                            ) +
                            unreadIncrement
                    };
                })

                /*
                 * Latest conversation first
                 */
                .sort((a, b) => {

                    const dateA =
                        a.lastMessageAt
                            ? new Date(
                                a.lastMessageAt
                            ).getTime()
                            : 0;

                    const dateB =
                        b.lastMessageAt
                            ? new Date(
                                b.lastMessageAt
                            ).getTime()
                            : 0;

                    return dateB - dateA;
                });
        });

    }, [
        conversationId,
        user
    ]);


    const {
        connected,
        error: socketError,
        sendMessage
    } = useChatSocket({

        conversationId:
            Number(conversationId),

        onMessage:
            handleSocketMessage
    });


    /*
     * Load complete chat page
     */
    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    
    }, [messages]);

    useEffect(() => {

        if (!conversationId) {
            return;
        }
    
        loadChatPage();
    
    }, [conversationId]);


    const loadChatPage = async () => {

        try {
    
            setLoading(true);
            setError("");
    
            console.log(
                "1. Loading conversation:",
                conversationId
            );
    
            /*
             * CURRENT CONVERSATION
             */
            const conversationData =
                await getConversation(
                    conversationId
                );
    
            console.log(
                "2. Conversation loaded:",
                conversationData
            );
    
            setConversation(
                conversationData
            );
    
    
            /*
             * MENTOR
             */
            console.log(
                "3. Loading mentor:",
                conversationData.mentorId
            );
    
            const mentorData =
                await getMentorById(
                    conversationData.mentorId
                );
    
            console.log(
                "4. Mentor loaded:",
                mentorData
            );
    
            setMentor(
                mentorData
            );
    
    
            /*
             * MESSAGES
             */
            console.log(
                "5. Loading messages:",
                conversationId
            );
    
            const messagesData =
                await getConversationMessages(
                    conversationId
                );
    
            console.log(
                "6. Messages loaded:",
                messagesData
            );
    
            setMessages(
                messagesData || []
            );
    
    
            /*
             * MARK READ
             */
            console.log(
                "7. Marking conversation as read"
            );
    
            await markConversationAsRead(
                conversationId
            );

            
    
            console.log(
                "8. Marked as read"
            );
    
        } catch (err) {
    
            console.error(
                "CHAT LOAD ERROR:",
                err
            );
    
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to load conversation"
            );
    
        } finally {
    
            /*
             * IMPORTANT:
             * Open current chat even if
             * sidebar loading has a problem.
             */
            setLoading(false);
        }
    
    
        /*
         * LOAD SIDEBAR SEPARATELY
         */
        try {
    
            console.log(
                "9. Loading student conversations"
            );
    
            const conversationList =
                await getStudentConversations();
    
            console.log(
                "10. Conversations loaded:",
                conversationList
            );
    
            const conversationsWithMentors =
                await Promise.all(
                    (conversationList || []).map(
                        async (item) => {
    
                            try {
    
                                const mentorData =
                                    await getMentorById(
                                        item.mentorId
                                    );
    
                                return {
                                    ...item,
                                    mentor: mentorData
                                };
    
                            } catch (err) {
    
                                console.error(
                                    "Failed to load mentor:",
                                    item.mentorId,
                                    err
                                );
    
                                return {
                                    ...item,
                                    mentor: null
                                };
                            }
                        }
                    )
                );

            setConversations(
                conversationsWithMentors.map((item) =>
                    Number(item.id) === Number(conversationId)
                        ? {
                            ...item,
                            unreadCount: 0
                        }
                        : item
                )
            );
    
        } catch (err) {
    
            console.error(
                "SIDEBAR LOAD ERROR:",
                err
            );
    
            /*
             * Sidebar failure should NOT
             * block the current chat.
             */
        }
    };

    /*
     * Send message
     */
    const handleSend = (content) => {

        if (!connected) {

            setError(
                "Chat connection is not ready."
            );

            return;
        }

        try {

            sendMessage(
                content.trim()
            );

        } catch (err) {

            console.error(
                "Failed to send message:",
                err
            );

            setError(
                err?.message ||
                "Unable to send message"
            );
        }
    };


    /*
     * Search conversations
     */
    const filteredConversations =
    conversations.filter((item) => {

        const mentorName =
            item.mentor?.name
                ?.toLowerCase() || "";

        const matchesSearch =
            mentorName.includes(
                search.toLowerCase()
            );

        const matchesFilter =
            activeFilter === "ALL"
                ? true
                : activeFilter === "MENTORS"
                    ? Boolean(item.mentor)
                    : activeFilter === "UNREAD"
                        ? Number(item.unreadCount) > 0
                        : true;

        return (
            matchesSearch &&
            matchesFilter
        );
    });


    if (loading) {

        return (
            <div className="chat-loading-page">

                <div className="chat-loading-card">

                    <div className="chat-spinner"></div>

                    <p>
                        Loading chat...
                    </p>

                </div>

            </div>
        );
    }


    if (error && !conversation) {

        return (

            <div className="chat-error-page">

                <div className="chat-error-card">

                    <div className="chat-error-icon">
                        !
                    </div>

                    <h2>
                        Unable to open chat
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                "/student/chats"
                            )
                        }
                    >
                        Back to Chats
                    </button>

                </div>

            </div>
        );
    }


    return (

        <div className="student-chat-page">

            <main className="chat-layout">


                {/* ======================================
                    LEFT SIDEBAR
                ======================================= */}

                <aside className="chat-sidebar">

                    <div className="chat-sidebar-header">

                        <div>

                            <h2>
                                Messages
                            </h2>

                            <span>
                                {conversations.length}{" "}
                                conversations
                            </span>

                        </div>

                    </div>


                    <div className="chat-search">

                        <span>
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    <div className="chat-filters">

    <button
        className={
            activeFilter === "ALL"
                ? "active"
                : ""
        }
        onClick={() =>
            setActiveFilter("ALL")
        }
    >
        All
    </button>

    <button
        className={
            activeFilter === "MENTORS"
                ? "active"
                : ""
        }
        onClick={() =>
            setActiveFilter("MENTORS")
        }
    >
        Mentors
    </button>

    <button
        className={
            activeFilter === "UNREAD"
                ? "active"
                : ""
        }
        onClick={() =>
            setActiveFilter("UNREAD")
        }
    >
        Unread
    </button>

</div>


                    <div className="conversation-list">

                        {filteredConversations.length === 0 ? (

                            <div className="empty-sidebar">

                                <div>
                                    💬
                                </div>

                                <p>
                                    No conversations
                                </p>

                            </div>

                        ) : (

                            filteredConversations.map(
                                (item) => {

                                    const itemMentor =
                                        item.mentor;

                                    const isSelected =
                                        Number(
                                            item.id
                                        ) ===
                                        Number(
                                            conversationId
                                        );


                                    return (

                                        <div
                                            key={
                                                item.id
                                            }
                                            className={
                                                isSelected
                                                    ? "conversation-item active"
                                                    : "conversation-item"
                                            }
                                            onClick={() =>
                                                navigate(
                                                    `/student/chats/${item.id}`
                                                )
                                            }
                                        >

                                            <div className="conversation-avatar">

                                                {itemMentor?.profileImage ? (

                                                    <img
                                                        src={
                                                            itemMentor.profileImage
                                                        }
                                                        alt={
                                                            itemMentor.name ||
                                                            "Mentor"
                                                        }
                                                    />

                                                ) : (

                                                    itemMentor?.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase()
                                                        || "M"

                                                )}

                                                <span className="online-dot">
                                                </span>

                                            </div>


                                            <div className="conversation-content">

                                            <div className="conversation-top">

    <strong>
        {
            itemMentor?.name ||
            `Mentor #${item.mentorId}`
        }
    </strong>

    <div className="conversation-meta">

        <span className="conversation-time">
            {item.lastMessageAt
                ? new Date(
                    item.lastMessageAt
                ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                })
                : ""}
        </span>

        {Number(item.unreadCount) > 0 && (
            <span className="unread-badge">
                {item.unreadCount}
            </span>
        )}

    </div>

</div>
<p
    className={
        item.unreadCount > 0
            ? "conversation-preview conversation-preview-unread"
            : "conversation-preview"
    }
>
    {item.lastMessage ||
        "No messages yet"}
</p>

                                            </div>

                                        </div>
                                    );
                                }
                            )

                        )}

                    </div>

                </aside>


                {/* ======================================
                    CENTER CHAT
                ======================================= */}

                <section className="chat-center">

                    <div className="conversation-header">

                        <button
                            className="back-chat-btn"
                            onClick={() =>
                                navigate(
                                    "/student/chats"
                                )
                            }
                        >
                            ←
                        </button>


                        <div className="mentor-header-avatar">

                            {mentor?.profileImage ? (

                                <img
                                    src={
                                        mentor.profileImage
                                    }
                                    alt={
                                        mentor.name
                                    }
                                />

                            ) : (

                                mentor?.name
                                    ?.charAt(0)
                                    ?.toUpperCase()
                                    || "M"

                            )}

                            <span
                                className={
                                    connected
                                        ? "online-dot"
                                        : "offline-dot"
                                }
                            />

                        </div>


                        <div className="mentor-header-info">

                            <h2>
                                {
                                    mentor?.name ||
                                    `Mentor #${conversation?.mentorId}`
                                }
                            </h2>

                            <p>
                                {mentor?.departmentName ||
                                    "Student Mentor"}
                            </p>

                            <span
                                className={
                                    connected
                                        ? "connection-status online"
                                        : "connection-status"
                                }
                            >
                                {connected
                                    ? "● Online"
                                    : "● Connecting..."}
                            </span>

                        </div>


                

                    </div>


                    {socketError && (

                        <div className="socket-error">
                            {socketError}
                        </div>
                    )}


                    <div className="today-divider">

                        <span>
                            Today
                        </span>

                    </div>


                    <div className="messages-area">

    <MessageList
        messages={messages}
        currentUserId={
            user?.id ??
            user?.userId
        }
    />

    <div ref={messagesEndRef} />

</div>

<MessageInput
    conversationId={Number(conversationId)}
    onSend={handleSend}
    onAttachmentSent={(newMessage) => {
        setMessages((previous) => {

            const exists = previous.some(
                item => item.id === newMessage.id
            );

            if (exists) {
                return previous;
            }

            return [
                ...previous,
                newMessage
            ];
        });
    }}
    disabled={false}
/>
                </section>


                {/* ======================================
                    RIGHT MENTOR SUMMARY
                ======================================= */}

                <aside className="mentor-info-panel">

                    <div className="mentor-profile-card">

                        <div className="mentor-profile-top">

                            <div className="large-mentor-avatar">

                                {mentor?.profileImage ? (

                                    <img
                                        src={
                                            mentor.profileImage
                                        }
                                        alt={
                                            mentor.name
                                        }
                                    />

                                ) : (

                                    mentor?.name
                                        ?.charAt(0)
                                        ?.toUpperCase()
                                        || "M"

                                )}

                                <span className="online-dot">
                                </span>

                            </div>


                            <div>

                                <h2>
                                    {
                                        mentor?.name ||
                                        "Mentor"
                                    }
                                </h2>

                                <p>
                                    {mentor?.departmentName ||
                                        "Student Mentor"}
                                </p>

                                <span className="profile-online">

                                    ● {mentor?.active
                                        ? "Available"
                                        : "Unavailable"}

                                </span>

                            </div>

                        </div>


                        <div className="profile-divider">
                        </div>


                        {/* Mentor Bio */}

                        

                        {/* Skills */}

                        <div className="profile-section">

                            <h3>
                                Expertise
                            </h3>

                            <div className="skill-tags">

                                {mentor?.skills?.length ? (

                                    mentor.skills.map(
                                        (skill) => (

                                            <span
                                                key={skill}
                                            >
                                                {skill}
                                            </span>

                                        )
                                    )

                                ) : (

                                    <span>
                                        No skills added
                                    </span>

                                )}

                            </div>

                        </div>


                        {/* Experience */}

                        


                        {/* Department / Year */}

                        <div className="profile-section">

                            <h3>
                                Academic
                            </h3>

                            <p className="profile-value">

                                {mentor?.departmentName ||
                                    "Department not specified"}

                            </p>

                            <span className="profile-muted">

                                Year {mentor?.year ||
                                    "—"}

                            </span>

                        </div>


                        {/* Mentor Type */}

                        <div className="profile-section">

                            <h3>
                                💳 Access
                            </h3>

                            <p className="profile-value">

                                {mentor?.mentorType === "FREE"
                                    ? "Free Mentor"
                                    : `Paid Mentor • ₹${mentor?.price ?? 0}`}

                            </p>

                        </div>


                        <button
                            className="view-profile-btn"
                            onClick={() =>
                                navigate(
                                    `/mentors/${mentor?.id}`
                                )
                            }
                        >
                            View Full Profile ↗
                        </button>

                    </div>


                    

                </aside>

            </main>

        </div>
    );
};


export default StudentChatConversation;