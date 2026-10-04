import axiosInstance from "./axiosInstance";

const AUTH_BASE = "/api/auth";

export const registerUser = async (registerData) => {
  const response = await axiosInstance.post(
    `${AUTH_BASE}/register`,
    registerData
  );

  return response.data;
};

export const loginUser = async (loginData) => {
  const response = await axiosInstance.post(
    `${AUTH_BASE}/login`,
    loginData
  );

  return response.data;
};

