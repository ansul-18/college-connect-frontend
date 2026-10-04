import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getAllPosts,
    deletePost,
} from "../../api/adminApi";

import "./AdminCommunity.css";

function AdminCommunity() {

    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const [selectedPost, setSelectedPost] =
        useState(null);


    /* ==========================================
       LOAD POSTS
    ========================================== */

    const loadPosts = async () => {

        try {

            setLoading(true);

            const data = await getAllPosts();

            setPosts(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load community posts:",
                error
            );

            alert(
                "Unable to load community posts."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {
        loadPosts();
    }, []);


    /* ==========================================
       FILTER
    ========================================== */

    const filteredPosts = useMemo(() => {

        const searchText =
            search
                .toLowerCase()
                .trim();

        if (!searchText) {
            return posts;
        }

        return posts.filter((post) => {

            const title =
                String(
                    post.title ||
                    ""
                ).toLowerCase();

            const content =
                String(
                    post.content ||
                    post.description ||
                    post.body ||
                    ""
                ).toLowerCase();

            const author =
                String(
                    post.userId ||
                    post.studentId ||
                    post.authorId ||
                    ""
                ).toLowerCase();

            return (
                title.includes(searchText) ||
                content.includes(searchText) ||
                author.includes(searchText)
            );
        });

    }, [posts, search]);


    /* ==========================================
       DELETE
    ========================================== */

    const handleDelete = async (post) => {

        const confirmed =
            window.confirm(
                `Delete post #${post.id}?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setDeletingId(post.id);

            await deletePost(post.id);

            setPosts((current) =>
                current.filter(
                    (item) =>
                        item.id !== post.id
                )
            );

            setSelectedPost(null);

        } catch (error) {

            console.error(
                "Delete post failed:",
                error
            );

            alert(
                "Unable to delete post."
            );

        } finally {

            setDeletingId(null);
        }
    };


    /* ==========================================
       HELPERS
    ========================================== */

    const getContent = (post) => {

        return (
            post.content ||
            post.description ||
            post.body ||
            "No content available."
        );
    };


    const getTitle = (post) => {

        return (
            post.title ||
            "Community Post"
        );
    };


    const getAuthor = (post) => {

        return (
            post.authorName ||
            post.username ||
            post.userName ||
            (post.userId
                ? `User #${post.userId}`
                : post.studentId
                    ? `Student #${post.studentId}`
                    : "Unknown User")
        );
    };


    const getDate = (post) => {

        const value =
            post.createdAt ||
            post.updatedAt ||
            post.date;

        if (!value) {
            return "—";
        }

        try {

            return new Date(
                value
            ).toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );

        } catch {

            return String(value);
        }
    };


    const getPreview = (post) => {

        const content =
            getContent(post);

        if (content.length <= 220) {
            return content;
        }

        return (
            content.substring(0, 220) +
            "..."
        );
    };


    return (
        <div className="admin-community-page">

            {/* HEADER */}

            <div className="community-header">

                <div>

                    <button
                        className="back-button"
                        onClick={() =>
                            navigate(
                                "/admin/dashboard"
                            )
                        }
                    >
                        ← Dashboard
                    </button>

                    <span className="admin-label">
                        ADMIN / COMMUNITY
                    </span>

                    <h1>
                        Community
                    </h1>

                    <p>
                        Review and moderate
                        community posts.
                    </p>

                </div>


                <button
                    className="refresh-button"
                    onClick={loadPosts}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* SUMMARY */}

            <div className="community-summary">

                <div className="summary-card">

                    <span>
                        Total Posts
                    </span>

                    <strong>
                        {posts.length}
                    </strong>

                </div>


                <div className="summary-card">

                    <span>
                        Showing
                    </span>

                    <strong>
                        {filteredPosts.length}
                    </strong>

                </div>

            </div>


            {/* SEARCH */}

            <div className="community-toolbar">

                <div className="community-search">

                    <span>
                        ⌕
                    </span>

                    <input
                        type="text"
                        placeholder="Search posts, content or user..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>

            </div>


            {/* POSTS */}

            <div className="community-posts">

                {loading ? (

                    <div className="community-state">
                        Loading community posts...
                    </div>

                ) : filteredPosts.length ===
                  0 ? (

                    <div className="community-state">

                        <div className="empty-icon">
                            💬
                        </div>

                        <h3>
                            No posts found
                        </h3>

                        <p>
                            There are no community
                            posts matching your search.
                        </p>

                    </div>

                ) : (

                    filteredPosts.map(
                        (post) => (

                            <article
                                className="community-post-card"
                                key={post.id}
                            >

                                <div className="post-top">

                                    <div className="post-author">

                                        <div className="author-avatar">
                                            {getInitials(
                                                getAuthor(
                                                    post
                                                )
                                            )}
                                        </div>

                                        <div>

                                            <strong>
                                                {
                                                    getAuthor(
                                                        post
                                                    )
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    getDate(
                                                        post
                                                    )
                                                }
                                            </span>

                                        </div>

                                    </div>

                                    <span className="post-id">
                                        #{post.id}
                                    </span>

                                </div>


                                <h3>
                                    {getTitle(post)}
                                </h3>


                                <p className="post-preview">
                                    {
                                        getPreview(
                                            post
                                        )
                                    }
                                </p>


                                <div className="post-footer">

                                    <button
                                        className="view-post-button"
                                        onClick={() =>
                                            setSelectedPost(
                                                post
                                            )
                                        }
                                    >
                                        View
                                    </button>

                                    <button
                                        className="delete-post-button"
                                        disabled={
                                            deletingId ===
                                            post.id
                                        }
                                        onClick={() =>
                                            handleDelete(
                                                post
                                            )
                                        }
                                    >
                                        {
                                            deletingId ===
                                            post.id
                                                ? "Deleting..."
                                                : "Delete"
                                        }
                                    </button>

                                </div>

                            </article>

                        )
                    )

                )}

            </div>


            {/* DETAILS MODAL */}

            {selectedPost && (

                <div
                    className="post-modal-overlay"
                    onMouseDown={(e) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            setSelectedPost(null);
                        }

                    }}
                >

                    <div className="post-modal">

                        <div className="modal-header">

                            <div>

                                <span>
                                    COMMUNITY POST
                                </span>

                                <h2>
                                    {
                                        getTitle(
                                            selectedPost
                                        )
                                    }
                                </h2>

                            </div>

                            <button
                                onClick={() =>
                                    setSelectedPost(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="post-details">

                            <div className="post-detail-meta">

                                <div className="author-avatar">
                                    {getInitials(
                                        getAuthor(
                                            selectedPost
                                        )
                                    )}
                                </div>

                                <div>

                                    <strong>
                                        {
                                            getAuthor(
                                                selectedPost
                                            )
                                        }
                                    </strong>

                                    <span>
                                        {
                                            getDate(
                                                selectedPost
                                            )
                                        }
                                    </span>

                                </div>

                            </div>


                            <div className="post-full-content">
                                {
                                    getContent(
                                        selectedPost
                                    )
                                }
                            </div>


                            {selectedPost.imageUrl && (

                                <img
                                    className="post-image"
                                    src={
                                        selectedPost.imageUrl
                                    }
                                    alt={
                                        getTitle(
                                            selectedPost
                                        )
                                    }
                                />

                            )}

                        </div>


                        <div className="post-modal-footer">

                            <button
                                className="close-post-button"
                                onClick={() =>
                                    setSelectedPost(
                                        null
                                    )
                                }
                            >
                                Close
                            </button>

                            <button
                                className="delete-post-button"
                                disabled={
                                    deletingId ===
                                    selectedPost.id
                                }
                                onClick={() =>
                                    handleDelete(
                                        selectedPost
                                    )
                                }
                            >
                                {
                                    deletingId ===
                                    selectedPost.id
                                        ? "Deleting..."
                                        : "Delete Post"
                                }
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}


/* ==========================================
   HELPERS
========================================== */

function getInitials(name) {

    if (!name) {
        return "U";
    }

    return name
        .split(" ")
        .map(
            (part) =>
                part.charAt(0)
        )
        .slice(0, 2)
        .join("")
        .toUpperCase();
}


export default AdminCommunity;