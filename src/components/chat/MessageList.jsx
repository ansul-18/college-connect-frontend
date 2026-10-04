import React from "react";
import "./messageList.css";

const CHAT_SERVICE_URL = "http://localhost:8087";

const MessageList = ({
    messages = [],
    currentUserId
}) => {

    return (
        <div className="message-list">

            {messages.map((message) => {

                const isMine =
                    Number(message.senderId) ===
                    Number(currentUserId);

                const fileUrl = message.fileUrl
                    ? message.fileUrl.startsWith("http")
                        ? message.fileUrl
                        : `${CHAT_SERVICE_URL}${message.fileUrl}`
                    : null;

                return (
                    <div
                        key={message.id}
                        className={`message-row ${
                            isMine
                                ? "message-row-right"
                                : "message-row-left"
                        }`}
                    >

                        <div
                            className={`message-bubble ${
                                isMine
                                    ? "message-bubble-mine"
                                    : "message-bubble-other"
                            }`}
                        >

                            {/* IMAGE */}
                            {message.messageType === "IMAGE" &&
                                fileUrl && (
                                    <div className="message-image-wrapper">
                                        <img
                                            src={fileUrl}
                                            alt={
                                                message.fileName ||
                                                "Attached image"
                                            }
                                            className="message-image"
                                            onClick={() =>
                                                window.open(
                                                    fileUrl,
                                                    "_blank"
                                                )
                                            }
                                        />
                                    </div>
                                )}

                            {/* DOCUMENT */}
                            {message.messageType === "DOCUMENT" &&
                                fileUrl && (
                                    <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="message-document"
                                    >
                                        <div className="document-icon">
                                            📄
                                        </div>

                                        <div className="document-info">
                                            <div className="document-name">
                                                {message.fileName ||
                                                    "Document"}
                                            </div>

                                            <div className="document-type">
                                                {message.fileType ||
                                                    "Document"}
                                            </div>
                                        </div>
                                    </a>
                                )}

                            {/* CAPTION / TEXT */}
                            {message.content && (
                                <div className="message-text">
                                    {message.content}
                                </div>
                            )}

                            {/* TIME */}
                            <div className="message-time">
                                {message.createdAt
                                    ? new Date(
                                          message.createdAt
                                      ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit"
                                      })
                                    : ""}
                            </div>

                        </div>

                    </div>
                );
            })}

        </div>
    );
};

export default MessageList;