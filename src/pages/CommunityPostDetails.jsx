import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    getPostById,
    getAnswersByPost,
    getCommentsByPost,
    createAnswer,
    createAnswerComment,
} from "../api/communityApi";

import {
    getStudentByAuthUserId,
} from "../api/userApi";

import { useAuth } from "../hooks/useAuth";

import "./community-post-details.css";


// =========================================================
// HELPERS
// =========================================================

const normalizeArray = (data) => {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.content)) {
        return data.content;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    return [];
};


const getInitials = (name = "") => {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();
};


const resolveImageUrl = (value) => {
    if (!value) {
        return "";
    }

    const url = String(value).trim();

    if (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("data:") ||
        url.startsWith("blob:")
    ) {
        return url;
    }

    const apiBase = (
        import.meta.env.VITE_API_BASE_URL ||
        "http://localhost:8080"
    ).replace(/\/$/, "");

    return url.startsWith("/")
        ? `${apiBase}${url}`
        : `${apiBase}/${url}`;
};


const formatDateTime = (value) => {
    if (!value) {
        return "Recently";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Recently";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};


const formatDate = (value) => {
    if (!value) {
        return "Recently";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Recently";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


const formatYear = (year) => {
    const value = Number(year);

    if (value === 1) return "1st Year";
    if (value === 2) return "2nd Year";
    if (value === 3) return "3rd Year";
    if (value === 4) return "4th Year";

    return year ? `Year ${year}` : "";
};


const formatCategory = (category) => {
    return String(category || "QUESTION")
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
};


const getTags = (post) => {
    if (Array.isArray(post?.tags)) {
        return post.tags;
    }

    if (typeof post?.tags === "string") {
        return post.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);
    }

    return [];
};


// =========================================================
// COMPONENT
// =========================================================

function CommunityPostDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { isAuthenticated } = useAuth();

    const [post, setPost] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [comments, setComments] = useState([]);

    const [answerText, setAnswerText] = useState("");
    const [commentText, setCommentText] = useState("");

    const [replyToAnswer, setReplyToAnswer] = useState(null);

    const [loading, setLoading] = useState(true);
    const [answerLoading, setAnswerLoading] = useState(true);
    const [commentLoading, setCommentLoading] = useState(true);

    const [submittingAnswer, setSubmittingAnswer] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);

    const [error, setError] = useState("");
    const [submitError, setSubmitError] = useState("");

    // =====================================================
    // LOAD POST + POST AUTHOR
    // =====================================================

    useEffect(() => {
        let mounted = true;

        const loadPost = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getPostById(id);

                if (!mounted) {
                    return;
                }

                let student = null;

                try {
                    if (data?.authorId) {
                        student = await getStudentByAuthUserId(
                            data.authorId
                        );
                    }
                } catch (profileError) {
                    console.warn(
                        "Post author profile not found:",
                        profileError
                    );
                }

                if (mounted) {
                    setPost({
                        ...data,
                        student,
                    });
                }
            } catch (err) {
                console.error(
                    "Failed to load post:",
                    err
                );

                if (mounted) {
                    setError(
                        err?.response?.data?.message ||
                        "Failed to load discussion."
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        if (id) {
            loadPost();
        }

        return () => {
            mounted = false;
        };
    }, [id]);

    // =====================================================
    // LOAD ANSWERS + AUTHOR PROFILES
    // =====================================================

    useEffect(() => {
        let mounted = true;

        const loadAnswers = async () => {
            try {
                setAnswerLoading(true);

                const data = await getAnswersByPost(id);
                const answerList = normalizeArray(data);

                const enrichedAnswers = await Promise.all(
                    answerList.map(async (answer) => {
                        let student = null;

                        try {
                            if (answer?.authorId) {
                                student =
                                    await getStudentByAuthUserId(
                                        answer.authorId
                                    );
                            }
                        } catch (profileError) {
                            console.warn(
                                "Answer author profile not found:",
                                profileError
                            );
                        }

                        return {
                            ...answer,
                            student,
                        };
                    })
                );

                if (mounted) {
                    setAnswers(enrichedAnswers);
                }
            } catch (err) {
                console.error(
                    "Failed to load answers:",
                    err
                );

                if (mounted) {
                    setAnswers([]);
                }
            } finally {
                if (mounted) {
                    setAnswerLoading(false);
                }
            }
        };

        if (id) {
            loadAnswers();
        }

        return () => {
            mounted = false;
        };
    }, [id]);

    // =====================================================
    // LOAD COMMENTS + AUTHOR PROFILES
    // =====================================================

    useEffect(() => {
        let mounted = true;

        const loadComments = async () => {
            try {
                setCommentLoading(true);

                const data = await getCommentsByPost(id);
                const commentList = normalizeArray(data);

                const enrichedComments = await Promise.all(
                    commentList.map(async (comment) => {
                        let student = null;

                        try {
                            if (comment?.authorId) {
                                student =
                                    await getStudentByAuthUserId(
                                        comment.authorId
                                    );
                            }
                        } catch (profileError) {
                            console.warn(
                                "Comment author profile not found:",
                                profileError
                            );
                        }

                        return {
                            ...comment,
                            student,
                        };
                    })
                );

                if (mounted) {
                    setComments(enrichedComments);
                }
            } catch (err) {
                console.error(
                    "Failed to load comments:",
                    err
                );

                if (mounted) {
                    setComments([]);
                }
            } finally {
                if (mounted) {
                    setCommentLoading(false);
                }
            }
        };

        if (id) {
            loadComments();
        }

        return () => {
            mounted = false;
        };
    }, [id]);

    // =====================================================
    // POST ANSWER
    // =====================================================

    const handleAnswerSubmit = async (event) => {
        event.preventDefault();
        setSubmitError("");

        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        const content = answerText.trim();

        if (!content) {
            setSubmitError("Please write your answer.");
            return;
        }

        try {
            setSubmittingAnswer(true);

            const createdAnswer = await createAnswer(id, {
                content,
            });

            let student = null;

            try {
                if (createdAnswer?.authorId) {
                    student =
                        await getStudentByAuthUserId(
                            createdAnswer.authorId
                        );
                }
            } catch (profileError) {
                console.warn(
                    "New answer author profile not found:",
                    profileError
                );
            }

            if (createdAnswer) {
                setAnswers((previous) => [
                    {
                        ...createdAnswer,
                        student,
                    },
                    ...previous,
                ]);
            } else {
                const refreshed = await getAnswersByPost(id);
                setAnswers(normalizeArray(refreshed));
            }

            setAnswerText("");
        } catch (err) {
            console.error(
                "Failed to post answer:",
                err
            );

            setSubmitError(
                err?.response?.data?.message ||
                "Unable to post your answer."
            );
        } finally {
            setSubmittingAnswer(false);
        }
    };

    // =====================================================
    // POST COMMENT / ANSWER REPLY
    // =====================================================

    const handleCommentSubmit = async (event) => {
        event.preventDefault();
        setSubmitError("");

        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        const content = commentText.trim();

        if (!content) {
            setSubmitError("Please write a reply.");
            return;
        }

        try {
            setSubmittingComment(true);

            if (!replyToAnswer?.id) {
                setSubmitError("Select an answer to reply to.");
                return;
            }

            const createdComment = await createAnswerComment(
                replyToAnswer.id,
                {
                    content,
                }
            );

            let student = null;

            try {
                if (createdComment?.authorId) {
                    student =
                        await getStudentByAuthUserId(
                            createdComment.authorId
                        );
                }
            } catch (profileError) {
                console.warn(
                    "New comment author profile not found:",
                    profileError
                );
            }

            if (createdComment) {
                setComments((previous) => [
                    {
                        ...createdComment,
                        student,
                    },
                    ...previous,
                ]);
            } else {
                const refreshed =
                    await getCommentsByPost(id);

                setComments(
                    normalizeArray(refreshed)
                );
            }

            setCommentText("");
            setReplyToAnswer(null);
        } catch (err) {
            console.error(
                "Failed to post comment:",
                err
            );

            setSubmitError(
                err?.response?.data?.message ||
                "Unable to post your reply."
            );
        } finally {
            setSubmittingComment(false);
        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="community-post-page">
                <section className="community-post-hero">
                    <div className="container">
                        <div className="community-post-breadcrumb">
                            <Link to="/">Home</Link>
                            <span>/</span>
                            <Link to="/community">
                                Community
                            </Link>
                            <span>/</span>
                            <span>Discussion</span>
                        </div>
                    </div>
                </section>

                <main className="community-post-layout">
                    <div className="community-post-loading-card">
                        <div className="loading-skeleton loading-small" />
                        <div className="loading-skeleton loading-heading" />
                        <div className="loading-skeleton loading-line" />
                        <div className="loading-skeleton loading-line short" />
                        <div className="loading-skeleton loading-body" />
                    </div>
                </main>
            </div>
        );
    }

    // =====================================================
    // ERROR
    // =====================================================

    if (error || !post) {
        return (
            <div className="community-post-page">
                <main className="community-post-error-wrapper">
                    <div className="community-post-error">
                        <div className="community-post-error-code">
                            404
                        </div>

                        <h1>Post not found</h1>

                        <p>
                            {error ||
                                "This discussion could not be found."}
                        </p>

                        <Link
                            to="/community"
                            className="community-back-button"
                        >
                            ← Back to Community
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    // =====================================================
    // POST DATA
    // =====================================================

    const authorName =
        post.student?.name ||
        post.authorName ||
        post.author?.name ||
        `User #${post.authorId}`;

    const authorDepartment =
        post.student?.departmentName ||
        post.authorDepartmentName ||
        post.departmentName ||
        post.author?.departmentName ||
        "Department";

    const authorYear =
        post.student?.year ||
        post.authorYear ||
        post.author?.year ||
        post.year ||
        "";

    const authorImage =
        post.student?.profileImage ||
        post.authorProfileImage ||
        post.author?.profileImage ||
        "";

    const tags = getTags(post);

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="community-post-page">

            {/* =================================================
                HERO
            ================================================= */}

           

            {/* =================================================
                CONTENT
            ================================================= */}

            <main className="community-post-layout">

                {/* =================================================
                    LEFT SIDE
                    QUESTION + ONLY POSTED ANSWERS + COMMENTS
                ================================================= */}

                <div className="community-post-main">

                    {/* QUESTION */}

                    <article className="community-main-post">

                        <div className="community-main-post-top">
                            <div className="community-question-heading-row">
                                <span className="community-section-label">
                                    QUESTION
                                </span>

                                <Link
                                    to={`/community/user/${post.authorId}`}
                                    className="community-question-author"
                                >
                                    

                                    <div className="community-question-author-details">
                                        <strong>{authorName}</strong>

                                        <span>
                                            {authorDepartment}
                                            {authorYear && (
                                                <>
                                                    {" · "}
                                                    {formatYear(authorYear)}
                                                </>
                                            )}
                                        </span>
                                    </div>
                                    <div className="community-question-author-avatar">
                                        {authorImage ? (
                                            <img
                                                src={resolveImageUrl(authorImage)}
                                                alt={authorName}
                                                onError={(event) => {
                                                    event.currentTarget.style.display = "none";
                                                    event.currentTarget.parentElement.classList.add("image-fallback");
                                                }}
                                            />
                                        ) : null}

                                        <span>
                                            {getInitials(authorName) || "U"}
                                        </span>
                                    </div>
                                </Link>
                            </div>

                            <h2>
                                {post.title ||
                                    "Untitled question"}
                            </h2>
                        </div>


                


                        <div className="community-question-content">
                            {post.content}
                        </div>


                        {tags.length > 0 && (
                            <div className="community-post-tags">
                                {tags.map((tag) => (
                                    <span key={tag}>
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}


                        <div className="community-question-footer">

                            <span>
                                {answers.length}{" "}
                                {answers.length === 1
                                    ? "Answer"
                                    : "Answers"}
                            </span>

                            <span>
                            Posted {formatDateTime(post.createdAt)}
                            </span>

                        </div>

                    </article>


                    {/* ANSWERS */}

                    <section className="community-section-card">

                        <div className="community-section-header">

                            <div>
                                <span className="community-section-label">
                                    COMMUNITY ANSWERS
                                </span>

                                <h2>
                                    {answers.length}{" "}
                                    {answers.length === 1
                                        ? "Answer"
                                        : "Answers"}
                                </h2>
                            </div>

                        </div>


                        {answerLoading ? (

                            <div className="community-loading-box">
                                Loading answers...
                            </div>

                        ) : answers.length > 0 ? (

                            <div className="community-answers-list">

                                {answers.map(
                                    (answer, index) => {

                                        const answerAuthor =
                                            answer.student?.name ||
                                            answer.authorName ||
                                            answer.author?.name ||
                                            `User #${answer.authorId}`;

                                        const answerDepartment =
                                            answer.student?.departmentName ||
                                            answer.authorDepartmentName ||
                                            answer.departmentName ||
                                            answer.author?.departmentName ||
                                            "Department";

                                        const answerYear =
                                            answer.student?.year ||
                                            answer.authorYear ||
                                            answer.author?.year ||
                                            answer.year ||
                                            "";

                                        const answerImage =
                                            answer.student?.profileImage ||
                                            answer.authorProfileImage ||
                                            answer.author?.profileImage ||
                                            "";

                                        return (
                                            <article
                                                key={
                                                    answer.id ||
                                                    `${answer.authorId}-${index}`
                                                }
                                                className="community-answer-card"
                                            >

                                                <div className="community-answer-top">

                                                    <Link
                                                        to={`/community/user/${answer.authorId}`}
                                                        className="community-profile-link"
                                                    >

                                                        <div className="community-avatar">

                                                            {answerImage ? (
                                                                <img
                                                                    src={resolveImageUrl(answerImage)}
                                                                    alt={answerAuthor}
                                                                />
                                                            ) : (
                                                                getInitials(
                                                                    answerAuthor
                                                                ) || "U"
                                                            )}

                                                        </div>


                                                        <div className="community-author-info">

                                                            <strong>
                                                                {answerAuthor}
                                                            </strong>

                                                            <span>
                                                                {answerDepartment}

                                                                {answerYear && (
                                                                    <>
                                                                        {" · "}
                                                                        {formatYear(
                                                                            answerYear
                                                                        )}
                                                                    </>
                                                                )}
                                                            </span>

                                                        </div>

                                                    </Link>


                                                    <span>
                                                        {formatDateTime(
                                                            answer.createdAt
                                                        )}
                                                    </span>

                                                </div>


                                                <div className="community-answer-content">
                                                    {answer.content}
                                                </div>

                                                <button
                                                    type="button"
                                                    className="community-reply-button"
                                                    onClick={() => {
                                                        setReplyToAnswer({
                                                            id: answer.id,
                                                            name: answerAuthor,
                                                        });

                                                        setCommentText(
                                                            `@${answerAuthor} `
                                                        );
                                                    }}
                                                >
                                                    Reply
                                                </button>

                                                {comments.filter(
                                                    (comment) =>
                                                        Number(comment?.answerId) ===
                                                        Number(answer.id)
                                                ).length > 0 && (

                                                    <div className="community-answer-comments">

                                                        {comments
                                                            .filter(
                                                                (comment) =>
                                                                    Number(comment?.answerId) ===
                                                                    Number(answer.id)
                                                            )
                                                            .map(
                                                                (comment, commentIndex) => {

                                                                    const replyAuthor =
                                                                        comment.student?.name ||
                                                                        comment.authorName ||
                                                                        comment.author?.name ||
                                                                        `User #${comment.authorId}`;

                                                                    const replyImage =
                                                                        comment.student?.profileImage ||
                                                                        comment.authorProfileImage ||
                                                                        comment.author?.profileImage ||
                                                                        "";

                                                                    return (
                                                                        <div
                                                                            key={
                                                                                comment.id ||
                                                                                `${comment.authorId}-${commentIndex}`
                                                                            }
                                                                            className="community-answer-comment"
                                                                        >

                                                                            <Link
                                                                                to={`/community/user/${comment.authorId}`}
                                                                                className="community-avatar small"
                                                                            >
                                                                                {replyImage ? (
                                                                                    <img
                                                                                        src={resolveImageUrl(replyImage)}
                                                                                        alt={replyAuthor}
                                                                                    />
                                                                                ) : (
                                                                                    getInitials(
                                                                                        replyAuthor
                                                                                    ) || "U"
                                                                                )}
                                                                            </Link>

                                                                            <div className="community-answer-comment-body">

                                                                                <div className="community-comment-top">

                                                                                    <Link
                                                                                        to={`/community/user/${comment.authorId}`}
                                                                                        className="community-comment-author"
                                                                                    >
                                                                                        {replyAuthor}
                                                                                    </Link>

                                                                                    <span>
                                                                                        {formatDateTime(
                                                                                            comment.createdAt
                                                                                        )}
                                                                                    </span>

                                                                                </div>

                                                                                <p>
                                                                                    {comment.content}
                                                                                </p>

                                                                            </div>

                                                                        </div>
                                                                    );
                                                                }
                                                            )}

                                                    </div>
                                                )}

                                            </article>
                                        );
                                    }
                                )}

                            </div>

                        ) : (

                            <div className="community-empty-state">

                                <div className="community-empty-icon">
                                    ?
                                </div>

                                <h3>
                                    No answers yet
                                </h3>

                                <p>
                                    No one has answered this
                                    question yet.
                                </p>

                            </div>

                        )}

                    </section>

                    {submitError && (
                        <div className="community-submit-error">
                            {submitError}
                        </div>
                    )}

                </div>


                {/* =================================================
                    RIGHT SIDE
                    ONLY USER ACTION FORMS
                ================================================= */}

                <aside className="community-post-sidebar">

                    {/* SHARE YOUR KNOWLEDGE */}

                    {isAuthenticated ? (

                        <form
                            className="community-side-composer"
                            onSubmit={
                                handleAnswerSubmit
                            }
                        >

                            <span className="community-section-label">
                                SHARE YOUR KNOWLEDGE
                            </span>

                            <h3>
                                Your answer
                            </h3>

                            <textarea
                                value={answerText}
                                onChange={(event) =>
                                    setAnswerText(
                                        event.target.value
                                    )
                                }
                                placeholder="Write a clear and helpful answer..."
                                rows={9}
                                disabled={submittingAnswer}
                            />

                            <p className="composer-help-text">
                                Help another student understand
                                the problem.
                            </p>

                            <button
                                type="submit"
                                disabled={
                                    submittingAnswer ||
                                    !answerText.trim()
                                }
                            >
                                {submittingAnswer
                                    ? "Posting..."
                                    : "Post Answer →"}
                            </button>

                        </form>

                    ) : (

                        <div className="community-side-composer">

                            <span className="community-section-label">
                                SHARE YOUR KNOWLEDGE
                            </span>

                            <h3>
                                Your answer
                            </h3>

                           

<Link
    to="/login"
    className="community-submit-button"
>
    Login to Answer →
</Link>

                        </div>

                    )}
                    {/* JOIN THE DISCUSSION — shown only while replying */}
                    {isAuthenticated && replyToAnswer && (
                        <form
                            className="community-side-composer community-reply-composer"
                            onSubmit={handleCommentSubmit}
                        >
                            <span className="community-section-label">
                                JOIN THE DISCUSSION
                            </span>

                            <h3>
                                Reply to @{replyToAnswer.name}
                            </h3>

                            <button
                                type="button"
                                className="community-cancel-reply"
                                onClick={() => {
                                    setReplyToAnswer(null);
                                    setCommentText("");
                                    setSubmitError("");
                                }}
                            >
                                Cancel reply
                            </button>

                            <input
                                type="text"
                                value={commentText}
                                onChange={(event) =>
                                    setCommentText(event.target.value)
                                }
                                placeholder="Write your reply..."
                                disabled={submittingComment}
                            />

                            <button
                                type="submit"
                                disabled={
                                    submittingComment ||
                                    !commentText.trim()
                                }
                            >
                                {submittingComment
                                    ? "Replying..."
                                    : "Reply →"}
                            </button>
                        </form>
                    )}

</aside>

            </main>

        </div>
    );
}

export default CommunityPostDetails;
