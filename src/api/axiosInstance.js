import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
});

axiosInstance.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("token");

        /*
         * Only login/register should NOT receive JWT.
         */
        const isPublicAuthRequest =
            config.url === "/api/auth/login" ||
            config.url === "/api/auth/register";

        if (token && !isPublicAuthRequest) {

            config.headers =
                config.headers || {};

            config.headers.Authorization =
                `Bearer ${token}`;
        }

        /*
         * FormData -> browser/Axios sets multipart boundary.
         */
        if (config.data instanceof FormData) {

            delete config.headers["Content-Type"];

        } else {

            config.headers["Content-Type"] =
                "application/json";
        }

        return config;
    },

    (error) => Promise.reject(error)
);

export default axiosInstance;