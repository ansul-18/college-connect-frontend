import React, { useRef, useState } from "react";
import { uploadAttachment } from "../../api/chatApi";
import "./messageInput.css";

const MessageInput = ({
    conversationId,
    onSend,
    onAttachmentSent,
    disabled = false
}) => {

    const [content, setContent] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [sendingFile, setSendingFile] = useState(false);

    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {

        const file = e.target.files?.[0];

        if (!file) return;

        // 10 MB
        if (file.size > 10 * 1024 * 1024) {
            alert("File size cannot exceed 10 MB.");
            e.target.value = "";
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        if (!allowedTypes.includes(file.type)) {
            alert(
                "Only JPG, PNG, WEBP, PDF, DOC and DOCX files are allowed."
            );
            e.target.value = "";
            return;
        }

        setSelectedFile(file);
    };


    const removeSelectedFile = () => {

        setSelectedFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };


    const handleSend = async () => {
        console.log("conversationId =", conversationId);
        const trimmedContent = content.trim();

        // Nothing to send
        if (!trimmedContent && !selectedFile) {
            return;
        }

        /*
         * FILE MESSAGE
         */
        if (selectedFile) {

            try {

                setSendingFile(true);

                const newMessage =
                    await uploadAttachment(
                        conversationId,
                        selectedFile,
                        trimmedContent
                    );

                // Send newly created message to parent
                if (onAttachmentSent) {
                    onAttachmentSent(newMessage);
                }

                setContent("");
                removeSelectedFile();

            } catch (error) {

                console.error(
                    "Attachment upload failed:",
                    error
                );

                alert(
                    error?.response?.data?.message ||
                    "Failed to upload attachment."
                );

            } finally {

                setSendingFile(false);
            }

            return;
        }


        /*
         * NORMAL TEXT MESSAGE
         */
        if (trimmedContent) {

            onSend(trimmedContent);

            setContent("");
        }
    };


    const handleKeyDown = (e) => {

        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {
            e.preventDefault();
            handleSend();
        }
    };


    return (
        <div className="message-input-container">

            {selectedFile && (

                <div className="selected-file-preview">

                    <div className="selected-file-details">

                        <span className="selected-file-icon">
                            {selectedFile.type.startsWith("image/")
                                ? "🖼️"
                                : "📄"}
                        </span>

                        <div className="selected-file-text">

                            <strong>
                                {selectedFile.name}
                            </strong>

                            <span>
                                {(
                                    selectedFile.size /
                                    1024 /
                                    1024
                                ).toFixed(2)} MB
                            </span>

                        </div>

                    </div>

                    <button
                        type="button"
                        className="remove-file-btn"
                        onClick={removeSelectedFile}
                    >
                        ×
                    </button>

                </div>
            )}


            <div className="message-input-row">

                {/* ATTACHMENT */}

                <button
                    type="button"
                    className="attachment-btn"
                    onClick={() =>
                        fileInputRef.current?.click()
                    }
                    disabled={
                        disabled ||
                        sendingFile
                    }
                >
                    📎
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                    onChange={handleFileSelect}
                />


                {/* TEXT */}

                <input
                    type="text"
                    className="message-input"
                    placeholder={
                        selectedFile
                            ? "Add a caption..."
                            : "Type a message..."
                    }
                    value={content}
                    onChange={(e) =>
                        setContent(e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    disabled={
                        disabled ||
                        sendingFile
                    }
                />


                {/* SEND */}

                <button
                    type="button"
                    className="send-btn"
                    onClick={handleSend}
                    disabled={
                        disabled ||
                        sendingFile ||
                        (
                            !content.trim() &&
                            !selectedFile
                        )
                    }
                >
                    {sendingFile
                        ? "..."
                        : "➤"}
                </button>

            </div>

        </div>
    );
};

export default MessageInput;