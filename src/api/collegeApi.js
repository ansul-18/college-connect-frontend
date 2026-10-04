import axiosInstance from "./axiosInstance";

const COLLEGE_BASE = "/api/college";

// ============================================================
// EVENTS
// ============================================================

export const getAllEvents = async () => {
  const response = await axiosInstance.get(
    `${COLLEGE_BASE}/events`
  );

  return response.data;
};

export const getEventById = async (eventId) => {
  const response = await axiosInstance.get(
    `${COLLEGE_BASE}/events/${eventId}`
  );

  return response.data;
};

export const registerForEvent = async (
  eventId,
  studentId
) => {
  const response = await axiosInstance.post(
    `${COLLEGE_BASE}/events/${eventId}/register/${studentId}`
  );

  return response.data;
};

export const cancelEventRegistration = async (
  eventId,
  studentId
) => {
  const response = await axiosInstance.delete(
    `${COLLEGE_BASE}/events/${eventId}/register/${studentId}`
  );

  return response.data;
};

// ============================================================
// ANNOUNCEMENTS
// ============================================================

export const getAllAnnouncements = async () => {
  const response = await axiosInstance.get(
    `${COLLEGE_BASE}/announcements`
  );

  return response.data;
};

// ============================================================
// RESOURCES
// ============================================================

export const getAllResources = async () => {
  const response = await axiosInstance.get(
    `${COLLEGE_BASE}/resources`
  );

  return response.data;
};

// ============================================================
// COMPLAINTS
// ============================================================

export const getMyComplaints = async (studentId) => {
  const response = await axiosInstance.get(
    `${COLLEGE_BASE}/complaints/student/${studentId}`
  );

  return response.data;
};

export const createComplaint = async (complaintData) => {
  const response = await axiosInstance.post(
    `${COLLEGE_BASE}/complaints`,
    complaintData
  );

  return response.data;
};

export const getStudentEventRegistrations = async (studentId) => {
  const response = await axiosInstance.get(
    `${COLLEGE_BASE}/events/student/${studentId}`
  );

  return response.data;
};