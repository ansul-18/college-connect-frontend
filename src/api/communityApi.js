import axiosInstance from "./axiosInstance";

const COMMUNITY_BASE = "/api/community";


// =========================================================
// POSTS
// =========================================================

export const getAllPosts = async () => {

    const response = await axiosInstance.get(
        `${COMMUNITY_BASE}/posts`
    );

    return response.data;
};


export const getPostById = async (postId) => {

    const response = await axiosInstance.get(
        `${COMMUNITY_BASE}/posts/${postId}`
    );

    return response.data;
};


export const createPost = async (postData) => {

    const response = await axiosInstance.post(
        `${COMMUNITY_BASE}/posts`,
        postData
    );

    return response.data;
};


export const deletePost = async (postId) => {

    const response = await axiosInstance.delete(
        `${COMMUNITY_BASE}/posts/${postId}`
    );

    return response.data;
};


// =========================================================
// ANSWERS
// =========================================================

export const getAnswersByPost = async (postId) => {

    const response = await axiosInstance.get(
        `${COMMUNITY_BASE}/posts/${postId}/answers`
    );

    return response.data;
};


export const createAnswer = async (
    postId,
    answerData
) => {

    const response = await axiosInstance.post(
        `${COMMUNITY_BASE}/posts/${postId}/answers`,
        answerData
    );

    return response.data;
};


// =========================================================
// POST COMMENTS
// =========================================================

export const getCommentsByPost = async (postId) => {

    const response = await axiosInstance.get(
        `${COMMUNITY_BASE}/posts/${postId}/comments`
    );

    return response.data;
};


export const createComment = async (
    postId,
    commentData
) => {

    const response = await axiosInstance.post(
        `${COMMUNITY_BASE}/posts/${postId}/comments`,
        commentData
    );

    return response.data;
};


// =========================================================
// ANSWER REPLIES
// =========================================================

export const createAnswerComment = async (
    answerId,
    commentData
) => {

    const response = await axiosInstance.post(
        `${COMMUNITY_BASE}/answers/${answerId}/comments`,
        commentData
    );

    return response.data;
};


export const getCommentsByAnswer = async (
    answerId
) => {

    const response = await axiosInstance.get(
        `${COMMUNITY_BASE}/answers/${answerId}/comments`
    );

    return response.data;
};