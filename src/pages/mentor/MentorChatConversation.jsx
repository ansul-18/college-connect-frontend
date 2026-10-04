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
    getMentorConversations,
    markConversationAsRead
} from "../../api/chatApi";

import {
    getStudentByAuthUserId
} from "../../api/userApi";


import useChatSocket
    from "../../hooks/useChatSocket";


import MessageList
    from "../../components/chat/MessageList";

import MessageInput
    from "../../components/chat/MessageInput";


import {
    useAuth
} from "../../hooks/useAuth";


import "../../styles/mentorChat.css";


const MentorChatConversation = () => {

    const {
        conversationId
    } = useParams();


    const navigate =
        useNavigate();


    const {
        user
    } = useAuth();


    const [
        conversation,
        setConversation
    ] = useState(null);


    const [
        student,
        setStudent
    ] = useState(null);


    const [
        conversations,
        setConversations
    ] = useState([]);


    const [
        messages,
        setMessages
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    const messagesEndRef =
        useRef(null);


    /*
     * WEBSOCKET MESSAGE
     */
    const handleSocketMessage =
        useCallback((message) => {

            setMessages((previous) => {

                const exists =
                    previous.some(
                        item =>
                            item.id ===
                            message.id
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
             * Current conversation is open,
             * so incoming messages are read.
             */
            const currentUserId =
                Number(
                    user?.id ??
                    user?.userId
                );


            const senderId =
                Number(
                    message.senderId
                );


            if (
                senderId !==
                currentUserId
            ) {

                markConversationAsRead(
                    conversationId
                ).catch((err) => {

                    console.error(
                        "Failed to mark as read:",
                        err
                    );

                });

            }


            /*
             * Update mentor inbox sidebar
             */
            setConversations(
                (previous) => {

                    const messageConversationId =
                        Number(
                            message.conversationId
                        );


                    const currentConversation =
                        Number(
                            conversationId
                        );


                    return previous
                        .map((item) => {

                            if (
                                Number(item.id) !==
                                messageConversationId
                            ) {

                                return item;
                            }


                            let preview =
                                "Message";


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

                                preview =
                                    "📷 Image";

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


                            const isIncoming =
                                senderId !==
                                currentUserId;


                            const isCurrent =
                                messageConversationId ===
                                currentConversation;


                            return {
                                ...item,

                                lastMessage:
                                    preview,

                                lastMessageType:
                                    message.messageType,

                                lastMessageAt:
                                    message.createdAt,

                                unreadCount:
                                    isIncoming &&
                                    !isCurrent
                                        ? Number(
                                            item.unreadCount || 0
                                        ) + 1
                                        : Number(
                                            item.unreadCount || 0
                                        )
                            };

                        })

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

                }
            );


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
     * AUTO SCROLL
     */
    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages]);


    /*
     * LOAD CHAT
     */
    useEffect(() => {

        if (!conversationId) {
            return;
        }


        loadChatPage();

    }, [conversationId]);


    const loadChatPage =
        async () => {

            try {

                setLoading(true);
                setError("");


                /*
                 * Conversation
                 */
                const conversationData =
                    await getConversation(
                        conversationId
                    );


                setConversation(
                    conversationData
                );


                /*
 * Student
 */
try {

    const studentData =
        await getStudentByAuthUserId(
            conversationData.studentId
        );

    setStudent(studentData);

} catch (err) {

    console.warn(
        "Student profile not found for auth user:",
        conversationData.studentId
    );

    setStudent(null);
}


/*
 * Messages
 */
const messagesData =
    await getConversationMessages(
        conversationId
    );

setMessages(messagesData || []);


                /*
                 * Read
                 */
                await markConversationAsRead(
                    conversationId
                );


            } catch (err) {

                console.error(
                    "Failed to load mentor chat:",
                    err
                );


                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load chat"
                );


            } finally {

                setLoading(false);
            }


            /*
             * SIDEBAR
             */
            try {

                const conversationList =
                    await getMentorConversations();


                const enriched =
                    await Promise.all(

                        (conversationList || [])
                            .map(
                                async (item) => {

                                    try {

                                        const studentData =
                                            await getStudentByAuthUserId(
                                                item.studentId
                                            );


                                        return {
                                            ...item,
                                            student:
                                                studentData
                                        };

                                    } catch {

                                        return {
                                            ...item,
                                            student: null
                                        };
                                    }

                                }
                            )
                    );


                setConversations(
                    enriched.map(
                        (item) =>
                            Number(item.id) ===
                            Number(conversationId)
                                ? {
                                    ...item,
                                    unreadCount: 0
                                }
                                : item
                    )
                );


            } catch (err) {

                console.error(
                    "Failed to load mentor sidebar:",
                    err
                );
            }
        };


    /*
     * SEND TEXT
     */
    const handleSend =
        (content) => {

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

                setError(
                    err?.message ||
                    "Unable to send message"
                );
            }
        };


    /*
     * FILTER SIDEBAR
     */
    const [
        search,
        setSearch
    ] = useState("");


    const filteredConversations =
        conversations.filter(
            (item) => {

                const name =
                    item.student?.name
                        ?.toLowerCase() || "";


                return name.includes(
                    search.toLowerCase()
                );
            }
        );


    /*
     * LOADING
     */
    if (loading) {

        return (

            <div className="mentor-chat-loading">

                <div className="mentor-chat-spinner">
                </div>

                <p>
                    Loading chat...
                </p>

            </div>
        );
    }


    /*
     * ERROR
     */
    if (error && !conversation) {

        return (

            <div className="mentor-chat-error">

                <h2>
                    Unable to open chat
                </h2>

                <p>
                    {error}
                </p>

                <button
                    onClick={() =>
                        navigate(
                            "/mentor/chats"
                        )
                    }
                >
                    Back to Chats
                </button>

            </div>
        );
    }


    return (

        <div className="mentor-chat-page">

            <main className="mentor-chat-layout">


                {/* ====================================
                    LEFT SIDEBAR
                ==================================== */}

                <aside className="mentor-chat-sidebar">

                    <div className="mentor-sidebar-header">

                        <div>

                            <h2>
                                Messages
                            </h2>

                            <span>
                                {conversations.length} conversations
                            </span>

                        </div>

                    </div>


                    <div className="mentor-sidebar-search">

                        <span>
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Search students..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    <div className="mentor-sidebar-list">

                        {filteredConversations.map(
                            (item) => {

                                const itemStudent =
                                    item.student;


                                const selected =
                                    Number(item.id) ===
                                    Number(conversationId);


                                return (

                                    <div
                                        key={item.id}
                                        className={
                                            selected
                                                ? "mentor-conversation active"
                                                : "mentor-conversation"
                                        }
                                        onClick={() =>
                                            navigate(
                                                `/mentor/chats/${item.id}`
                                            )
                                        }
                                    >

                                        <div className="mentor-side-avatar">

                                            {itemStudent?.profileImage ? (

                                                <img
                                                    src={
                                                        itemStudent.profileImage
                                                    }
                                                    alt={
                                                        itemStudent.name ||
                                                        "Student"
                                                    }
                                                />

                                            ) : (

                                                (
                                                    itemStudent?.name ||
                                                    "S"
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()

                                            )}

                                            <span>
                                            </span>

                                        </div>


                                        <div className="mentor-side-content">

                                            <div className="mentor-side-top">

                                                <strong>
                                                    {
                                                        itemStudent?.name ||
                                                        `Student #${item.studentId}`
                                                    }
                                                </strong>

                                                {Number(
                                                    item.unreadCount || 0
                                                ) > 0 && (

                                                    <span className="mentor-side-unread">
                                                        {
                                                            item.unreadCount
                                                        }
                                                    </span>

                                                )}

                                            </div>


                                            <p>
                                                {
                                                    item.lastMessage ||
                                                    "No messages yet"
                                                }
                                            </p>

                                        </div>

                                    </div>

                                );
                            }
                        )}

                    </div>

                </aside>


                {/* ====================================
                    CENTER CHAT
                ==================================== */}

                <section className="mentor-chat-center">

                    <div className="mentor-conversation-header">

                        <button
                            className="mentor-back-btn"
                            onClick={() =>
                                navigate(
                                    "/mentor/chats"
                                )
                            }
                        >
                            ←
                        </button>


                        <div className="mentor-student-header-avatar">

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


                        <div className="mentor-student-header-info">

                            <h2>
                                {
                                    student?.name ||
                                    `Student #${conversation?.studentId}`
                                }
                            </h2>

                            <p>
                                {
                                    student?.departmentName ||
                                    student?.department?.name ||
                                    "Student"
                                }
                            </p>

                            <span
                                className={
                                    connected
                                        ? "mentor-online"
                                        : "mentor-connecting"
                                }
                            >
                                {connected
                                    ? "● Online"
                                    : "● Connecting..."}
                            </span>

                        </div>

                    </div>


                    {error && (

                        <div className="mentor-chat-error-bar">
                            {error}
                        </div>
                    )}


                    {socketError && (

                        <div className="mentor-chat-error-bar">
                            {socketError}
                        </div>
                    )}


                    <div className="mentor-messages-area">

                        <MessageList
                            messages={messages}
                            currentUserId={
                                user?.id ??
                                user?.userId
                            }
                        />

                        <div
                            ref={
                                messagesEndRef
                            }
                        />

                    </div>


                    <MessageInput
                        conversationId={
                            Number(conversationId)
                        }
                        onSend={
                            handleSend
                        }
                        onAttachmentSent={(
                            newMessage
                        ) => {

                            setMessages(
                                (previous) => {

                                    const exists =
                                        previous.some(
                                            item =>
                                                item.id ===
                                                newMessage.id
                                        );


                                    if (exists) {
                                        return previous;
                                    }


                                    return [
                                        ...previous,
                                        newMessage
                                    ];

                                }
                            );

                        }}
                        disabled={false}
                    />

                </section>


                {/* ====================================
                    RIGHT STUDENT INFO
                ==================================== */}

                <aside className="mentor-student-info-panel">

                    <div className="mentor-student-card">

                        <div className="mentor-student-profile-top">

                            <div className="mentor-large-student-avatar">

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

                            </div>


                            <div>

                                <h2>
                                    {
                                        student?.name ||
                                        "Student"
                                    }
                                </h2>

                                <p>
                                    {
                                        student?.departmentName ||
                                        student?.department?.name ||
                                        "Student"
                                    }
                                </p>

                            </div>

                        </div>


                        <div className="mentor-info-divider">
                        </div>


                        {student?.bio && (

                            <div className="mentor-info-section">

                                <h3>
                                    ✦ About
                                </h3>

                                <p>
                                    {student.bio}
                                </p>

                            </div>
                        )}


                        <div className="mentor-info-section">

                            <h3>
                                🎓 Academic
                            </h3>

                            <p>
                                {
                                    student?.departmentName ||
                                    student?.department?.name ||
                                    "Department not specified"
                                }
                            </p>

                            <span>
                                Year {student?.year || "—"}
                            </span>

                        </div>


                        <div className="mentor-info-section">

                            <h3>
                                🎯 Roll Number
                            </h3>

                            <p>
                                {
                                    student?.rollNumber ||
                                    "Not specified"
                                }
                            </p>

                        </div>


                        <div className="mentor-info-section">

                            <h3>
                                📧 Email
                            </h3>

                            <p>
                                {
                                    student?.email ||
                                    "Not available"
                                }
                            </p>

                        </div>


                        <div className="mentor-info-section">

                            <h3>
                                📱 Mobile
                            </h3>

                            <p>
                                {
                                    student?.mobile ||
                                    "Not available"
                                }
                            </p>

                        </div>

                    </div>

                </aside>

            </main>

        </div>
    );
};


export default MentorChatConversation;