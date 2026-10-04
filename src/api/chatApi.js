import axiosInstance from "./axiosInstance";

/*
 * Create or get existing conversation
 */
export const createConversation = async (
    mentorId
) => {

    const response =
        await axiosInstance.post(
            "/api/chat/conversations",
            {
                mentorId
            }
        );

    return response.data;
};

export const uploadAttachment = async (
    conversationId,
    file,
    caption = ""
) => {

    const formData = new FormData();

    formData.append("file", file);

    if (caption.trim()) {
        formData.append(
            "caption",
            caption.trim()
        );
    }

    const response = await axiosInstance.post(
        `/api/chat/conversations/${conversationId}/attachments`,
        formData
    );

    return response.data;
};

/*
 * Student conversations
 */
export const getStudentConversations =
    async () => {

        const response =
            await axiosInstance.get(
                "/api/chat/conversations/student"
            );

        return response.data;
    };


/*
 * Mentor conversations
 */
export const getMentorConversations =
    async () => {

        const response =
            await axiosInstance.get(
                "/api/chat/conversations/mentor"
            );

        return response.data;
    };


/*
 * Single conversation
 */
export const getConversation =
    async (conversationId) => {

        const response =
            await axiosInstance.get(
                `/api/chat/conversations/${conversationId}`
            );

        return response.data;
    };


/*
 * Old messages
 */
export const getConversationMessages =
    async (conversationId) => {

        const response =
            await axiosInstance.get(
                `/api/chat/conversations/${conversationId}/messages`
            );

        return response.data;
    };


/*
 * Mark messages as read
 */
export const markConversationAsRead =
    async (conversationId) => {

        await axiosInstance.patch(
            `/api/chat/conversations/${conversationId}/read`
        );
    };

