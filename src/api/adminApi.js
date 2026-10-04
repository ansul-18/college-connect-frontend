import axiosInstance from "./axiosInstance";

/* =========================================================
   STUDENTS
========================================================= */

export const getAllStudents = async () => {
    const response = await axiosInstance.get(
        "/api/users/students"
    );

    return response.data;
};

export const getStudentById = async (id) => {
    const response = await axiosInstance.get(
        `/api/users/students/${id}`
    );

    return response.data;
};

export const getStudentsByDepartment = async (
    departmentId
) => {
    const response = await axiosInstance.get(
        `/api/users/students/department/${departmentId}`
    );

    return response.data;
};

export const getStudentsByYear = async (year) => {
    const response = await axiosInstance.get(
        `/api/users/students/year/${year}`
    );

    return response.data;
};

export const updateStudent = async (
    id,
    data
) => {
    const response = await axiosInstance.put(
        `/api/users/students/${id}`,
        data
    );

    return response.data;
};

export const deleteStudent = async (id) => {
    await axiosInstance.delete(
        `/api/users/students/${id}`
    );
};


/* =========================================================
   MENTORS
========================================================= */

export const getAllMentors = async () => {
    const response = await axiosInstance.get(
        "/api/mentors"
    );

    return response.data;
};

export const createMentor = async (data) => {
    const response = await axiosInstance.post(
        "/api/mentors",
        data
    );

    return response.data;
};

export const updateMentor = async (id, data) => {
    const response = await axiosInstance.put(
        `/api/mentors/${id}`,
        data
    );

    return response.data;
};

export const deactivateMentor = async (id) => {
    await axiosInstance.patch(
        `/api/mentors/${id}/deactivate`
    );
};

export const deleteMentor = async (id) => {
    await axiosInstance.delete(
        `/api/mentors/${id}`
    );
};

export const makeMentor = async (userId) => {
    const response = await axiosInstance.patch(
        `/api/auth/admin/mentors/${userId}`
    );

    return response.data;
};


/* =========================================================
   DEPARTMENTS
========================================================= */

export const getAllDepartments = async () => {
    const response = await axiosInstance.get(
        "/api/departments"
    );

    return response.data;
};

export const createDepartment = async (data) => {
    const response = await axiosInstance.post(
        "/api/departments",
        data
    );

    return response.data;
};

export const updateDepartment = async (id, data) => {
    const response = await axiosInstance.put(
        `/api/departments/${id}`,
        data
    );

    return response.data;
};

export const deleteDepartment = async (id) => {
    await axiosInstance.delete(
        `/api/departments/${id}`
    );
};


/* =========================================================
   EVENTS
========================================================= */

export const createEvent = async (data, image) => {

   const formData = new FormData();

   formData.append(
       "data",
       JSON.stringify(data)
   );

   if (image) {
       formData.append("image", image);
   }

   const response = await axiosInstance.post(
       "/api/college/events",
       formData
   );

   return response.data;
};


export const updateEvent = async (
   id,
   data,
   image
) => {

   const formData = new FormData();

   formData.append(
       "data",
       JSON.stringify(data)
   );

   if (image) {
       formData.append("image", image);
   }

   const response = await axiosInstance.put(
       `/api/college/events/${id}`,
       formData
   );

   return response.data;
};


export const getAllEvents = async () => {

   const response = await axiosInstance.get(
       "/api/college/events"
   );

   return response.data;
};


export const getEventsByStatus = async (
   status
) => {

   const response = await axiosInstance.get(
       `/api/college/events/status/${status}`
   );

   return response.data;
};


export const deleteEvent = async (id) => {

   await axiosInstance.delete(
       `/api/college/events/${id}`
   );
};


export const getEventRegistrations = async (
   eventId
) => {

   const response = await axiosInstance.get(
       `/api/college/events/${eventId}/registrations`
   );

   return response.data;
};
/* =========================================================
   ANNOUNCEMENTS
========================================================= */

export const getAllAnnouncements = async () => {
    const response = await axiosInstance.get(
        "/api/college/announcements"
    );

    return response.data;
};

export const createAnnouncement = async (data) => {
    const response = await axiosInstance.post(
        "/api/college/announcements",
        data
    );

    return response.data;
};

export const updateAnnouncement = async (
    id,
    data
) => {
    const response = await axiosInstance.put(
        `/api/college/announcements/${id}`,
        data
    );

    return response.data;
};

export const deleteAnnouncement = async (id) => {
    await axiosInstance.delete(
        `/api/college/announcements/${id}`
    );
};


/* =========================================================
   RESOURCES
========================================================= */

export const getAllResources = async () => {
   const response = await axiosInstance.get(
       "/api/college/resources"
   );

   return response.data;
};


export const getResourcesByCategory = async (
   category
) => {
   const response = await axiosInstance.get(
       `/api/college/resources/category/${category}`
   );

   return response.data;
};


export const getResourcesByDepartment = async (
   departmentId
) => {
   const response = await axiosInstance.get(
       `/api/college/resources/department/${departmentId}`
   );

   return response.data;
};


export const getResourcesByYear = async (
   year
) => {
   const response = await axiosInstance.get(
       `/api/college/resources/year/${year}`
   );

   return response.data;
};


export const uploadResource = async ({
   title,
   description,
   category,
   departmentId,
   year,
   uploadedBy,
   file,
}) => {

   const formData = new FormData();

   formData.append("title", title);

   if (description) {
       formData.append(
           "description",
           description
       );
   }

   formData.append(
       "category",
       category
   );

   if (departmentId) {
       formData.append(
           "departmentId",
           departmentId
       );
   }

   formData.append(
       "year",
       year
   );

   formData.append(
       "uploadedBy",
       uploadedBy
   );

   formData.append(
       "file",
       file
   );

   const response = await axiosInstance.post(
       "/api/college/resources",
       formData
   );

   return response.data;
};


export const deleteResource = async (id) => {

   await axiosInstance.delete(
       `/api/college/resources/${id}`
   );
};


/* =========================================================
   COMPLAINTS
========================================================= */

export const getAllComplaints = async () => {
   const response = await axiosInstance.get(
       "/api/college/complaints"
   );

   return response.data;
};


export const getComplaintsByStatus = async (
   status
) => {
   const response = await axiosInstance.get(
       `/api/college/complaints/status/${status}`
   );

   return response.data;
};


export const getComplaintById = async (id) => {
   const response = await axiosInstance.get(
       `/api/college/complaints/${id}`
   );

   return response.data;
};


export const updateComplaintStatus = async (
   id,
   status
) => {
   const response = await axiosInstance.patch(
       `/api/college/complaints/${id}/status`,
       null,
       {
           params: {
               status,
           },
       }
   );

   return response.data;
};

/* =========================================================
   COMMUNITY
========================================================= */

export const getAllPosts = async () => {
   const response = await axiosInstance.get(
       "/api/community/posts"
   );

   return response.data;
};

export const getPostById = async (id) => {
   const response = await axiosInstance.get(
       `/api/community/posts/${id}`
   );

   return response.data;
};

export const deletePost = async (id) => {
   await axiosInstance.delete(
       `/api/community/posts/${id}`
   );
};


/* =========================================================
   PASSWORD
========================================================= */

export const resetUserPassword = async (
    userId,
    newPassword
) => {
    const response = await axiosInstance.put(
        `/api/auth/admin/reset-password/${userId}`,
        null,
        {
            params: {
                newPassword
            }
        }
    );

    return response.data;
};