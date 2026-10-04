import axiosInstance from "./axiosInstance";

const DEPARTMENT_BASE = "/api/departments";

export const getAllDepartments = async () => {
    const response = await axiosInstance.get(DEPARTMENT_BASE);
    return response.data;
};