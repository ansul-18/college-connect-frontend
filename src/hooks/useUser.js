import { useCallback, useEffect, useState } from "react";
import { getCurrentUserProfile } from "../api/userApi";
import { useAuth } from "./useAuth";

const useUser = () => {

    const { user } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadProfile = useCallback(async () => {

        // User not available yet
        if (!user?.userId) {
            setProfile(null);
            setError("");
            setLoading(false);
            return;
        }

        try {

            setLoading(true);
            setError("");

            const data = await getCurrentUserProfile(user.userId);

            setProfile(data);

        } catch (err) {

            // Profile doesn't exist yet
            if (err?.response?.status === 404) {

                setProfile(null);
                setError("");

                // 404 is expected for a new user
                console.log("Student profile not created yet.");

            } else {

                console.error(
                    "Failed to load student profile:",
                    err
                );

                setProfile(null);

                setError(
                    err?.response?.data?.message ||
                    "Unable to load profile."
                );
            }

        } finally {

            setLoading(false);
        }

    }, [user?.userId]);


    useEffect(() => {

        loadProfile();

    }, [loadProfile]);


    return {
        profile,
        loading,
        error,
        refreshProfile: loadProfile
    };
};

export default useUser;