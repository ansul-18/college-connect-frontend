import { useRef } from "react";

const CloudinaryUpload = ({ value, onUpload }) => {

    const widgetRef = useRef(null);

    const openWidget = () => {

        if (!window.cloudinary) {
            console.error("Cloudinary widget not loaded.");
            return;
        }

        if (!widgetRef.current) {

            widgetRef.current =
                window.cloudinary.createUploadWidget(
                    {
                        cloudName:
                            import.meta.env
                                .VITE_CLOUDINARY_CLOUD_NAME,

                        uploadPreset:
                            import.meta.env
                                .VITE_CLOUDINARY_UPLOAD_PRESET,

                        sources: [
                            "local",
                            "camera"
                        ],

                        multiple: false,

                        maxFileSize: 2 * 1024 * 1024,

                        clientAllowedFormats: [
                            "jpg",
                            "jpeg",
                            "png",
                            "webp"
                        ],

                        cropping: true,

                        croppingAspectRatio: 1,

                        folder:
                            "btech-college-connect/students",
                    },

                    (error, result) => {

                        if (error) {
                            console.error(
                                "Cloudinary upload error:",
                                error
                            );
                            return;
                        }

                        if (result.event === "success") {

                            onUpload(
                                result.info.secure_url
                            );
                        }
                    }
                );
        }

        widgetRef.current.open();
    };


    return (
        <div
            className="cloudinary-upload"
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "16px"
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
                        position: "relative"
                    }}
                >

                    <img
                        src={value}
                        alt="Profile preview"
                        style={{
                            width: "100%",
                            height: "100%",
                            maxWidth: "100%",
                            maxHeight: "100%",
                            display: "block",
                            objectFit: "cover"
                        }}
                    />

                </div>
            )}

            <button
                type="button"
                className="profile-btn outline"
                onClick={openWidget}
            >
                {value
                    ? "Change Photo"
                    : "Upload Profile Photo"}
            </button>

        </div>
    );
};

export default CloudinaryUpload;