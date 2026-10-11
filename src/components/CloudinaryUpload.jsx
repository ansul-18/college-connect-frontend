import { useRef } from "react";

const CloudinaryUpload = ({ value, onUpload }) => {
    const widgetRef = useRef(null);

    const openWidget = () => {
        const cloudName =
            import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

        const uploadPreset =
            import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!window.cloudinary?.createUploadWidget) {
            console.error(
                "Cloudinary Upload Widget script is not loaded."
            );
            alert("Photo upload service is not ready. Please try again.");
            return;
        }

        if (!cloudName || !uploadPreset) {
            console.error(
                "Cloudinary cloud name or upload preset is missing."
            );
            alert("Photo upload configuration is missing.");
            return;
        }

        try {
            if (!widgetRef.current) {
                widgetRef.current =
                    window.cloudinary.createUploadWidget(
                        {
                            cloudName,
                            uploadPreset,
                        },
                        (error, result) => {
                            if (error) {
                                console.error(
                                    "Cloudinary upload error:",
                                    error
                                );
                                return;
                            }

                            if (
                                result?.event === "success" &&
                                result.info?.secure_url
                            ) {
                                onUpload?.(
                                    result.info.secure_url
                                );
                            }
                        }
                    );
            }

            if (typeof widgetRef.current?.open !== "function") {
                console.error(
                    "Cloudinary widget could not be initialized."
                );
                widgetRef.current = null;
                return;
            }

            widgetRef.current.open();
        } catch (error) {
            console.error(
                "Unable to open Cloudinary widget:",
                error
            );
            widgetRef.current = null;
        }
    };

    return (
        <div
            className="cloudinary-upload"
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "16px",
            }}
        >
            {value && (
                <div
                    className="profile-image-preview"
                    style={{
                        width: "140px",
                        height: "140px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        flexShrink: 0,
                    }}
                >
                    <img
                        src={value}
                        alt="Profile preview"
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "block",
                            objectFit: "cover",
                        }}
                    />
                </div>
            )}

            <button
                type="button"
                className="profile-btn outline"
                onClick={openWidget}
            >
                {value ? "Change Photo" : "Upload Profile Photo"}
            </button>
        </div>
    );
};

export default CloudinaryUpload;