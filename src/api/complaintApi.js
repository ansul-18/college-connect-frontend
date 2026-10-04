import axios from "axios";


const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8080"
).replace(/\/+$/, "");


const complaintsClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        Accept: "application/json",
    },
});


/*
 * Attach JWT when the user is logged in.
 */
complaintsClient.interceptors.request.use(
    (config) => {

        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken");

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    }
);


/*
 * GET ALL COMPLAINTS
 *
 * Backend:
 * GET /api/college/complaints
 */
export const getAllComplaints = async () => {

    const response =
        await complaintsClient.get(
            "/api/college/complaints"
        );

    return Array.isArray(response.data)
        ? response.data
        : [];
};


/*
 * GET MY COMPLAINTS
 *
 * Backend:
 * GET /api/college/complaints/student/{studentId}
 */
export const getMyComplaints = async (
    studentId
) => {

    const response =
        await complaintsClient.get(
            `/api/college/complaints/student/${studentId}`
        );

    return Array.isArray(response.data)
        ? response.data
        : [];
};


/*
 * GET COMPLAINT BY ID
 *
 * Backend:
 * GET /api/college/complaints/{id}
 */
export const getComplaintById = async (
    complaintId
) => {

    const response =
        await complaintsClient.get(
            `/api/college/complaints/${complaintId}`
        );

    return response.data;
};


/*
 * CREATE COMPLAINT
 *
 * Backend expects:
 *
 * multipart/form-data
 *   data  -> JSON string
 *   image -> optional MultipartFile
 *
 * The controller reads "data" using ObjectMapper.
 *
 * We therefore keep "image" outside the JSON object.
 */
export const createComplaint = async (
    complaintData
) => {

    const {
        image,
        ...requestData
    } = complaintData || {};


    const formData =
        new FormData();


    formData.append(
        "data",
        JSON.stringify(requestData)
    );


    if (image) {
        formData.append(
            "image",
            image
        );
    }


    const response =
        await complaintsClient.post(
            "/api/college/complaints",
            formData
        );


    return response.data;
};


/*
 * UPDATE COMPLAINT STATUS
 *
 * Backend:
 * PATCH /api/college/complaints/{id}/status?status=...
 */
export const updateComplaintStatus = async (
    complaintId,
    status
) => {

    const response =
        await complaintsClient.patch(
            `/api/college/complaints/${complaintId}/status`,
            null,
            {
                params: {
                    status,
                },
            }
        );


    return response.data;
};


/*
 * GET COMPLAINTS BY STATUS
 *
 * Backend:
 * GET /api/college/complaints/status/{status}
 */
export const getComplaintsByStatus = async (
    status
) => {

    const response =
        await complaintsClient.get(
            `/api/college/complaints/status/${status}`
        );


    return Array.isArray(response.data)
        ? response.data
        : [];
};
