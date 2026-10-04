import React from "react";

const ConversationList = ({
    conversations = [],
    selectedConversationId,
    onSelect
}) => {

    return (
        <div className="conversation-list">

            {conversations.length === 0 ? (

                <div className="empty-state">
                    No conversations yet.
                </div>

            ) : (

                conversations.map(
                    (conversation) => (

                        <div
                            key={conversation.id}
                            className={
                                `conversation-item ${
                                    Number(
                                        selectedConversationId
                                    ) ===
                                    Number(
                                        conversation.id
                                    )
                                        ? "active"
                                        : ""
                                }`
                            }
                            onClick={() =>
                                onSelect(
                                    conversation.id
                                )
                            }
                        >

                            <div className="conversation-title">
                                {conversation.studentId}
                                {" ↔ "}
                                {conversation.mentorId}
                            </div>

                            <div className="conversation-time">

                                {conversation.lastMessageAt
                                    ? new Date(
                                        conversation.lastMessageAt
                                    ).toLocaleString()
                                    : "No messages"}

                            </div>

                        </div>
                    )
                )
            )}

        </div>
    );
};

export default ConversationList;