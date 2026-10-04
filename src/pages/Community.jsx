import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  getAllPosts,
  createPost,
} from "../api/communityApi";

import {
  getStudentByAuthUserId,
} from "../api/userApi";

import {
  useAuth,
} from "../hooks/useAuth";

import "./community.css";


const categories = [
  "ALL",
  "QUESTION",
  "DISCUSSION",
  "PROJECT_HELP",
  "PLACEMENT",
];


const trendingTags = [
  "Java",
  "Spring Boot",
  "DSA",
  "React",
  "AI",
  "MySQL",
  "Placement",
];


// =========================================================
// HELPERS
// =========================================================

const formatCategory = (value) => {

  if (!value) {
    return "Discussion";
  }

  if (value === "ALL") {
    return "All";
  }

  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
};


const formatTimeAgo = (dateValue) => {

  if (!dateValue) {
    return "";
  }

  const date =
    new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now =
    new Date();

  const difference =
    Math.floor(
      (now.getTime() - date.getTime()) /
      1000
    );

  if (difference < 60) {
    return "Just now";
  }

  if (difference < 3600) {
    return `${Math.floor(difference / 60)} min ago`;
  }

  if (difference < 86400) {
    return `${Math.floor(difference / 3600)} hr ago`;
  }

  if (difference < 604800) {
    return `${Math.floor(difference / 86400)} days ago`;
  }

  return date.toLocaleDateString(
    [],
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


const getInitial = (name) => {

  return (
    name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() ||
    "U"
  );
};


const getTags = (post) => {

  if (Array.isArray(post?.tags)) {
    return post.tags;
  }

  if (
    typeof post?.tags === "string"
  ) {

    return post.tags
      .split(",")
      .map(
        (tag) =>
          tag.trim()
      )
      .filter(Boolean);
  }

  return [];
};


// =========================================================
// COMPONENT
// =========================================================

function Community() {

  const navigate =
    useNavigate();

  const {
    user,
  } = useAuth();


  // =========================================================
  // STATE
  // =========================================================

  const [
    posts,
    setPosts
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    error,
    setError
  ] = useState("");


  const [
    search,
    setSearch
  ] = useState("");


  const [
    activeCategory,
    setActiveCategory
  ] = useState("ALL");


  const [
    activeTag,
    setActiveTag
  ] = useState("ALL");


  const [
    showAskModal,
    setShowAskModal
  ] = useState(false);


  const [
    submittingPost,
    setSubmittingPost
  ] = useState(false);


  const [
    questionData,
    setQuestionData
  ] = useState({
    title: "",
    content: "",
    category: "QUESTION",
    tags: "",
  });


  // =========================================================
  // LOAD POSTS
  // =========================================================

  useEffect(() => {

    const loadPosts =
      async () => {

        try {

          setLoading(true);
          setError("");

          const data =
            await getAllPosts();


          const postList =
            Array.isArray(data)
              ? data
              : [];


          /*
           * Load student information
           * for every post author.
           *
           * If profile is not available,
           * post still remains visible.
           */
          const enrichedPosts =
            await Promise.all(

              postList.map(
                async (post) => {

                  let student =
                    null;

                  try {

                    if (
                      post?.authorId
                    ) {

                      student =
                        await getStudentByAuthUserId(
                          post.authorId
                        );

                    }

                  } catch (profileError) {

                    console.warn(
                      "Author profile not found:",
                      post?.authorId
                    );

                  }


                  return {
                    ...post,
                    student,
                  };

                }
              )
            );


          setPosts(
            enrichedPosts
          );

        } catch (err) {

          console.error(
            "Failed to load posts:",
            err
          );

          setError(
            err?.response?.data?.message ||
            "Failed to load community posts."
          );

        } finally {

          setLoading(false);

        }

      };


    loadPosts();

  }, []);


  // =========================================================
  // FILTER POSTS
  // =========================================================

  const filteredPosts =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      return posts.filter(
        (post) => {

          const title =
            post?.title ||
            "";

          const content =
            post?.content ||
            "";

          const excerpt =
            post?.excerpt ||
            "";

          const authorName =
            post?.student?.name ||
            post?.authorName ||
            post?.author ||
            "";


          const tags =
            getTags(post);


          const searchMatch =
            !query ||
            title
              .toLowerCase()
              .includes(query) ||
            content
              .toLowerCase()
              .includes(query) ||
            excerpt
              .toLowerCase()
              .includes(query) ||
            authorName
              .toLowerCase()
              .includes(query) ||
            tags.some(
              (tag) =>
                tag
                  .toLowerCase()
                  .includes(query)
            );


          const categoryMatch =
            activeCategory === "ALL" ||
            post?.category ===
              activeCategory;


          const tagMatch =
            activeTag === "ALL" ||
            tags.includes(activeTag);


          return (
            searchMatch &&
            categoryMatch &&
            tagMatch
          );

        }
      );

    }, [
      posts,
      search,
      activeCategory,
      activeTag,
    ]);


  // =========================================================
  // QUESTION CHANGE
  // =========================================================

  const handleQuestionChange =
    (event) => {

      const {
        name,
        value,
      } = event.target;


      setQuestionData(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );

    };


  // =========================================================
  // ASK QUESTION
  // =========================================================

  const handleAskQuestion = async (event) => {
    event.preventDefault();

    if (!user) {
        navigate("/login");
        return;
    }

    const title = questionData.title.trim();
    const content = questionData.content.trim();

    if (!title || !content) {
        return;
    }

    try {
        setSubmittingPost(true);

        const payload = {
            title,
            content,
            category: questionData.category,
            tags: questionData.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
        };

        const createdPost = await createPost(payload);

        setPosts((previous) => [
            createdPost,
            ...previous,
        ]);

        setQuestionData({
            title: "",
            content: "",
            category: "QUESTION",
            tags: "",
        });

        setShowAskModal(false);

    } catch (err) {
        console.error(
            "Failed to create post:",
            err
        );

        alert(
            err?.response?.data?.message ||
            "Failed to create post."
        );

    } finally {
        setSubmittingPost(false);
    }
};


  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {

    setSearch("");

    setActiveCategory(
      "ALL"
    );

    setActiveTag(
      "ALL"
    );

  };


  // =========================================================
  // OPEN AUTHOR PROFILE
  // =========================================================

  const openAuthorProfile = (
    event,
    authorId
  ) => {

    event.preventDefault();
    event.stopPropagation();


    if (!authorId) {
      return;
    }


    navigate(
      `/community/user/${authorId}`
    );

  };


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="community-page">

      {/* =================================================
          HEADER
      ================================================= */}

<section className="community-header">

<div className="container">

  <div className="community-breadcrumb">

    <Link to="/">
      Home
    </Link>

    <span>/</span>

    <span>
      Community
    </span>

  </div>


  <div className="community-hero-card">

    <div className="community-hero-left">

      <div className="community-hero-icon">
        💬
      </div>


      <div className="community-hero-info">

        <span className="community-hero-label">
          COLLEGE COMMUNITY
        </span>


        <h1>
          Learn from each other.
        </h1>


        <p>
          Ask questions, share ideas and help
          fellow students solve problems.
        </p>

      </div>

    </div>


    <button
      className="community-hero-button"
      onClick={() => {

        if (!user) {
          navigate("/login");
          return;
        }

        setShowAskModal(true);

      }}
    >
      + Ask Question
    </button>

  </div>

</div>

</section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="container community-content">

        <div className="community-layout">


          {/* =================================================
              MAIN
          ================================================= */}

          <div className="community-main">


            {/* SEARCH */}

            <div className="community-search-box">

              <span>
                ⌕
              </span>


              <input
                type="text"
                placeholder="Search questions and discussions..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />


              {search && (

                <button
                  className="community-search-clear"
                  onClick={() =>
                    setSearch("")
                  }
                >
                  ×
                </button>

              )}

            </div>


            {/* CATEGORY */}

            <div className="community-category-bar">

              {categories.map(
                (category) => (

                  <button
                    key={category}
                    className={
                      activeCategory ===
                      category
                        ? "community-category active"
                        : "community-category"
                    }
                    onClick={() =>
                      setActiveCategory(
                        category
                      )
                    }
                  >

                    {formatCategory(
                      category
                    )}

                  </button>

                )
              )}

            </div>


            {/* RESULT HEADER */}

            <div className="community-result-header">

              <div>

                <span className="section-label">
                  COMMUNITY
                </span>


                <h2>

                  {activeCategory ===
                  "ALL"

                    ? "Latest discussions"

                    : formatCategory(
                        activeCategory
                      )}

                </h2>

              </div>


              <div className="community-result-actions">

                <span>

                  {filteredPosts.length}

                  {" "}

                  post
                  {
                    filteredPosts.length !==
                    1
                      ? "s"
                      : ""
                  }

                </span>


                {(search ||
                  activeCategory !==
                    "ALL" ||
                  activeTag !==
                    "ALL") && (

                  <button
                    onClick={
                      clearFilters
                    }
                  >
                    Clear
                  </button>

                )}

              </div>

            </div>


            {/* LOADING */}

            {loading && (

              <div className="page-loader">
                Loading community...
              </div>

            )}


            {/* ERROR */}

            {!loading &&
              error && (

                <div className="page-error">
                  {error}
                </div>

              )}


            {/* POSTS */}

            {!loading &&
              !error &&
              filteredPosts.length >
                0 && (

                <div className="community-post-list">

                  {filteredPosts.map(
                    (post) => {

                      const tags =
                        getTags(post);


                      const student =
                        post?.student;


                      const authorName =
                        student?.name ||
                        post?.authorName ||
                        post?.author ||
                        `User #${post?.authorId}`;


                      const department =
                        student?.departmentName ||
                        post?.authorDepartmentName ||
                        post?.departmentName ||
                        post?.department ||
                        "Student";


                      const year =
                        student?.year ||
                        post?.authorYear ||
                        post?.year ||
                        "";


                      const profileImage =
                        student?.profileImage ||
                        post?.authorProfileImage ||
                        "";


                      const answerCount =
                        post?.answerCount ??
                        post?.answers ??
                        post?.commentsCount ??
                        0;


                      const viewCount =
                        post?.viewCount ??
                        post?.views ??
                        0;


                      return (

                        <article
                          className="community-post-card"
                          key={post.id}
                        >


                          {/* STATS */}

                          <div className="community-post-stats">

  <div>
    <strong>
      {answerCount}
    </strong>

    <span>
      {answerCount === 1
        ? "answer"
        : "answers"}
    </span>
  </div>

</div>


                          {/* POST */}

                          <div className="community-post-main">


                            <div className="community-post-top">

                              <div className="community-post-category">
                                {formatCategory(
                                  post?.category
                                )}
                              </div>


                              <span className="community-post-time">
                                {formatTimeAgo(
                                  post?.createdAt
                                )}
                              </span>

                            </div>


                            {/* TITLE */}

                            <Link
                              to={`/community/post/${post.id}`}
                              className="community-post-title"
                            >
                              {post?.title ||
                                "Untitled discussion"}
                            </Link>


                            {/* CONTENT */}

                            <p className="community-post-excerpt">

                              {post?.excerpt ||
                                post?.content ||
                                "No description available."}

                            </p>


                            {/* TAGS */}

                            {tags.length > 0 && (

                              <div className="community-post-tags">

                                {tags.map(
                                  (tag) => (

                                    <button
                                      key={tag}
                                      onClick={() =>
                                        setActiveTag(
                                          tag
                                        )
                                      }
                                    >
                                      #{tag}
                                    </button>

                                  )
                                )}

                              </div>

                            )}


                            {/* AUTHOR */}

                            <button
                              type="button"
                              className="community-post-author community-author-button"
                              onClick={(event) =>
                                openAuthorProfile(
                                  event,
                                  post?.authorId
                                )
                              }
                            >

                              <div className="community-author-avatar">

                                {profileImage ? (

                                  <img
                                    src={
                                      profileImage
                                    }
                                    alt={
                                      authorName
                                    }
                                  />

                                ) : (

                                  getInitial(
                                    authorName
                                  )

                                )}

                              </div>


                              <div>

                                <strong>
                                  {authorName}
                                </strong>


                                <span>

                                  {department}

                                  {year
                                    ? ` · Year ${year}`
                                    : ""}

                                </span>

                              </div>

                            </button>


                          </div>

                        </article>

                      );

                    }
                  )}

                </div>

              )}


            {/* EMPTY */}

            {!loading &&
              !error &&
              filteredPosts.length ===
                0 && (

                <div className="community-empty">

                  <div className="community-empty-icon">
                    ?
                  </div>


                  <h3>
                    No posts found
                  </h3>


                  <p>
                    Try a different search
                    or filter.
                  </p>


                  <button
                    onClick={
                      clearFilters
                    }
                  >
                    Clear Filters
                  </button>

                </div>

              )}

          </div>


          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="community-sidebar">


            {/* ASK */}

            <button
              className="sidebar-ask-card"
              onClick={() => {

                if (!user) {

                  navigate("/login");

                  return;
                }

                setShowAskModal(true);

              }}
            >

              <div className="sidebar-ask-icon">
                ?
              </div>


              <div>

                <strong>
                  Have a question?
                </strong>

                <span>
                  Ask the community and
                  get help.
                </span>

              </div>


              <b>
                →
              </b>

            </button>


            {/* TRENDING */}

            <section className="community-side-card">

              <div className="side-card-heading">

                <div>

                  <span className="section-label">
                    TRENDING
                  </span>

                  <h3>
                    Popular tags
                  </h3>

                </div>

              </div>


              <div className="trending-tags">

                <button
                  className={
                    activeTag === "ALL"
                      ? "trending-tag active"
                      : "trending-tag"
                  }
                  onClick={() =>
                    setActiveTag("ALL")
                  }
                >
                  All
                </button>


                {trendingTags.map(
                  (tag) => (

                    <button
                      key={tag}
                      className={
                        activeTag === tag
                          ? "trending-tag active"
                          : "trending-tag"
                      }
                      onClick={() =>
                        setActiveTag(
                          tag
                        )
                      }
                    >
                      #{tag}
                    </button>

                  )
                )}

              </div>

            </section>


            {/* INFO */}

            <section className="community-side-card">

              <span className="section-label">
                COMMUNITY
              </span>


              <h3>
                Help someone today.
              </h3>


              <p>
                Your answer might solve
                someone else's biggest
                problem.
              </p>


              <div className="community-info-stats">

                <div>

                  <strong>
                    {posts.length}
                  </strong>

                  <span>
                    Questions
                  </span>

                </div>


                <div>

                  <strong>
                    {posts.reduce(
                      (
                        total,
                        post
                      ) =>
                        total +
                        Number(
                          post?.answerCount ||
                          post?.answers ||
                          0
                        ),
                      0
                    )}
                  </strong>

                  <span>
                    Answers
                  </span>

                </div>

              </div>

            </section>


        
          </aside>

        </div>

      </main>


      {/* =================================================
          ASK QUESTION MODAL
      ================================================= */}

      {showAskModal && (

        <div
          className="community-modal-overlay"
          onClick={() =>
            setShowAskModal(false)
          }
        >

          <div
            className="community-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setShowAskModal(false)
              }
            >
              ×
            </button>


            <div className="modal-heading">

              <span className="section-label">
                COMMUNITY
              </span>


              <h2>
                Ask a question
              </h2>


              <p>
                Share your problem with the
                community and get useful
                answers.
              </p>

            </div>


            <form
              onSubmit={
                handleAskQuestion
              }
              className="ask-question-form"
            >


              {/* TITLE */}

              <div className="ask-form-group">

                <label>
                  Title
                </label>


                <input
                  type="text"
                  name="title"
                  value={
                    questionData.title
                  }
                  onChange={
                    handleQuestionChange
                  }
                  placeholder="What do you want to ask?"
                  required
                />

              </div>


              {/* CATEGORY */}

              <div className="ask-form-group">

                <label>
                  Category
                </label>


                <select
                  name="category"
                  value={
                    questionData.category
                  }
                  onChange={
                    handleQuestionChange
                  }
                >

                  <option value="QUESTION">
                    Question
                  </option>

                  <option value="DISCUSSION">
                    Discussion
                  </option>

                  <option value="PROJECT_HELP">
                    Project Help
                  </option>

                  <option value="PLACEMENT">
                    Placement
                  </option>

                </select>

              </div>


              {/* CONTENT */}

              <div className="ask-form-group">

                <label>
                  Description
                </label>


                <textarea
                  name="content"
                  rows="6"
                  value={
                    questionData.content
                  }
                  onChange={
                    handleQuestionChange
                  }
                  placeholder="Explain your question in detail..."
                  required
                />

              </div>


              {/* TAGS */}

              <div className="ask-form-group">

                <label>
                  Tags
                </label>


                <input
                  type="text"
                  name="tags"
                  value={
                    questionData.tags
                  }
                  onChange={
                    handleQuestionChange
                  }
                  placeholder="Java, Spring Boot, JWT"
                />


                <small>
                  Separate multiple tags with commas.
                </small>

              </div>


              {/* ACTIONS */}

              <div className="ask-form-actions">

                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() =>
                    setShowAskModal(false)
                  }
                  disabled={
                    submittingPost
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="modal-submit"
                  disabled={
                    submittingPost
                  }
                >

                  {submittingPost
                    ? "Posting..."
                    : "Post Question →"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}


export default Community;