import axiosInstance from "./axiosInstance";

const USER_BASE = "/api/users";


// =========================================================
// CREATE MY PROFILE
// =========================================================
export const createStudent = async (studentData) => {

    const response = await axiosInstance.post(
        `${USER_BASE}/students/me`,
        studentData
    );

    return response.data;
};


// =========================================================
// GET STUDENT BY STUDENT PROFILE ID
// =========================================================
export const getStudentById = async (studentId) => {

    const response = await axiosInstance.get(
        `${USER_BASE}/students/${studentId}`
    );

    return response.data;
};


// =========================================================
// GET MY PROFILE BY AUTH USER ID
// =========================================================
export const getCurrentUserProfile = async (authUserId) => {

    const response = await axiosInstance.get(
        `${USER_BASE}/students/auth/${authUserId}`
    );

    return response.data;
};


// =========================================================
// GET STUDENT BY AUTH USER ID
// =========================================================
export const getStudentByAuthUserId = async (authUserId) => {

    const response = await axiosInstance.get(
        `${USER_BASE}/students/auth/${authUserId}`
    );

    return response.data;
};


// =========================================================
// UPDATE STUDENT
// =========================================================
export const updateStudent = async (
    studentId,
    studentData
) => {

    const response = await axiosInstance.put(
        `${USER_BASE}/students/${studentId}`,
        studentData
    );

    return response.data;
};