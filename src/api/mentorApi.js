import axiosInstance from "./axiosInstance";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MENTOR_BASE = "/api/mentors";

/*
 * ==================================================
 * PUBLIC MENTOR APIs
 * ==================================================
 */

/*
 * Get all mentors
 */
export const getAllMentors = async () => {
  const response = await axios.get(
    `${BASE_URL}${MENTOR_BASE}`
  );

  return response.data;
};

/*
 * Get mentor by ID
 */
export const getMentorById = async (mentorId) => {
  const response = await axios.get(
    `${BASE_URL}${MENTOR_BASE}/${mentorId}`
  );

  return response.data;
};

/*
 * Search mentors by skill
 */
export const searchMentors = async (skill) => {
  const response = await axios.get(
    `${BASE_URL}${MENTOR_BASE}/search`,
    {
      params: {
        skill,
      },
    }
  );

  return response.data;
};

/*
 * Get mentors by department
 */
export const getMentorsByDepartment = async (departmentId) => {
  const response = await axios.get(
    `${BASE_URL}${MENTOR_BASE}/department/${departmentId}`
  );

  return response.data;
};

/*
 * Get mentors by type
 */
export const getMentorsByType = async (mentorType) => {
  const response = await axios.get(
    `${BASE_URL}${MENTOR_BASE}/type/${mentorType}`
  );

  return response.data;
};

/*
 * ==================================================
 * MENTOR PROFILE
 * ==================================================
 */

/*
 * Get mentor profile ID of logged-in mentor
 */
export const getMyMentorProfileId = async (userId) => {
  const response = await axiosInstance.get(
    `${MENTOR_BASE}/by-user/${userId}/id`
  );

  return response.data;
};


/*
 * Get mentor profile by profile ID
 */
export const getMyMentorProfile = async (userId) => {

  const mentorId =
    await getMyMentorProfileId(userId);

  const response = await axiosInstance.get(
    `${MENTOR_BASE}/${mentorId}`
  );

  return response.data;
};


/*
 * Create mentor profile
 */
export const createMentorProfile = async (data) => {

  const response = await axiosInstance.post(
    MENTOR_BASE,
    data
  );

  return response.data;
};


/*
 * Update mentor profile
 */
export const updateMentorProfile = async (
  mentorId,
  data
) => {

  const response = await axiosInstance.put(
    `${MENTOR_BASE}/${mentorId}`,
    data
  );

  return response.data;
};
/*
 * ==================================================
 * AUTHENTICATED MENTOR APIs
 * ==================================================
 */

/*
 * Check whether student can chat with mentor
 */
export const checkChatAccess = async (mentorId) => {
  const response = await axiosInstance.get(
    `${MENTOR_BASE}/access/chat`,
    {
      params: {
        mentorId,
      },
    }
  );

  return response.data;
};

/*
 * Alternative name
 */
export const canChatWithMentor = async ({
  mentorId,
}) => {

  return checkChatAccess(
    mentorId
  );
};


/*
 * ==================================================
 * PAYMENT
 * ==================================================
 */

/*
 * Create Razorpay order
 */
export const createMentorPaymentOrder = async (
  mentorId
) => {
  const response = await axiosInstance.post(
    `${MENTOR_BASE}/payment/order`,
    {
      mentorId,
    }
  );

  return response.data;
};


/*
 * Verify Razorpay payment
 */
export const verifyMentorPayment = async ({
  mentorId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const response = await axiosInstance.post(
    `${MENTOR_BASE}/payment/verify`,
    {
      mentorId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    }
  );

  return response.data;
};


/*
 * Get mentor access
 */
export const getMentorAccess = async ({
  studentId,
  mentorId,
}) => {
  const response = await axiosInstance.get(
    `${MENTOR_BASE}/access`,
    {
      params: {
        studentId,
        mentorId,
      },
    }
  );

  return response.data;
};

/*
 * ==================================================
 * MENTOR DASHBOARD
 * ==================================================
 */

/*
 * Get mentor conversations
 */
export const getMyMentorConversations = async () => {

  const response = await axiosInstance.get(
    "/api/chat/conversations/mentor"
  );

  return response.data;
};


/*
 * Get college events
 */
export const getCollegeEvents = async () => {

  const response = await axiosInstance.get(
    "/api/college/events"
  );

  return response.data;
};



/*
 * Get college announcements
 */
export const getCollegeAnnouncements = async () => {

  const response = await axiosInstance.get(
    "/api/college/announcements"
  );

  return response.data;
};

export const getAllPosts = async () => {
  const response = await axiosInstance.get(
      "/api/community/posts"
  );

  return response.data;
};

export const getPostById = async (postId) => {
  const response = await axiosInstance.get(
      `/api/community/posts/${postId}`
  );

  return response.data;
};