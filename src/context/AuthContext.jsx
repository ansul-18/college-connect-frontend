import { createContext, useEffect, useState } from "react";

import {
    getStoredUser,
    getToken,
    saveAuth,
    clearAuth,
} from "../utils/auth";

export const AuthContext = createContext(null);


// =========================================================
// GET USER INFO FROM JWT
// =========================================================
const getUserInfoFromToken = (token) => {

    if (!token) {
        return {};
    }

    try {

        const parts = token.split(".");

        if (parts.length !== 3) {
            return {};
        }

        const payload = parts[1];

        const base64 = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map(
                    (char) =>
                        "%" +
                        ("00" + char.charCodeAt(0).toString(16))
                            .slice(-2)
                )
                .join("")
        );

        const payloadData = JSON.parse(jsonPayload);

        return {
            userId: payloadData.userId ?? null,
            role: payloadData.role ?? null,
            email: payloadData.sub ?? ""
        };

    } catch (error) {

        console.error(
            "Unable to read user information from JWT:",
            error
        );

        return {};
    }
};


export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    const [token, setToken] = useState(null);

    const [loading, setLoading] = useState(true);


    // =========================================================
    // RESTORE AUTH
    // =========================================================
    useEffect(() => {

        const storedToken = getToken();

        const storedUser = getStoredUser();


        if (storedToken) {

            const tokenUser =
                getUserInfoFromToken(storedToken);


            const restoredUser = {

                ...(storedUser || {}),

                userId:
                    storedUser?.userId ??
                    tokenUser.userId,

                email:
                    storedUser?.email ||
                    tokenUser.email ||
                    "",

                role:
                    storedUser?.role ||
                    tokenUser.role ||
                    "STUDENT"
            };


            setToken(storedToken);

            setUser(restoredUser);

        } else {

            setToken(null);

            setUser(null);
        }


        setLoading(false);

    }, []);


    // =========================================================
    // LOGIN
    // =========================================================
    const login = (
        userData,
        accessToken
    ) => {

        /*
         * Read user information from JWT.
         */
        const tokenUser =
            getUserInfoFromToken(accessToken);


        /*
         * First try userId from API response.
         * Otherwise use JWT.
         */
        const userId =
            userData?.userId ??
            userData?.id ??
            tokenUser.userId;


        /*
         * Create authenticated user object.
         */
        const authUser = {

            ...userData,

            userId,

            email:
                userData?.email ||
                tokenUser.email ||
                "",

            role:
                userData?.role ||
                tokenUser.role ||
                "STUDENT"
        };


        /*
         * Save complete auth information.
         */
        const authResponse = {

            ...authUser,

            token: accessToken
        };


        saveAuth(authResponse);


        /*
         * Update React state.
         */
        setToken(accessToken);

        setUser(authUser);


        console.log(
            "AUTH USER AFTER LOGIN:",
            authUser
        );


        return authUser;
    };


    // =========================================================
    // LOGOUT
    // =========================================================
    const logout = () => {

        clearAuth();

        setToken(null);

        setUser(null);
    };


    // =========================================================
    // AUTH STATUS
    // =========================================================
    const isAuthenticated =
        Boolean(token);


    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};