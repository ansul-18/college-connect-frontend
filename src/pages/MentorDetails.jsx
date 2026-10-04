import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getMentorById,
  checkChatAccess,
} from "../api/mentorApi";

import { createConversation } from "../api/chatApi";

import MentorPaymentButton from "./mentor/MentorPaymentButton";

import { useAuth } from "../hooks/useAuth";

import "./mentor-details.css";


function MentorDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();


  const [mentor, setMentor] = useState(null);

  const [chatAllowed, setChatAllowed] = useState(false);

  const [loading, setLoading] = useState(true);

  const [checkingAccess, setCheckingAccess] = useState(false);

  const [error, setError] = useState("");


  /*
   * LOAD MENTOR
   */
  useEffect(() => {

    const loadMentor = async () => {

      try {

        setLoading(true);
        setError("");

        const data = await getMentorById(id);

        setMentor(data);

      } catch (err) {

        console.error(
          "Failed to load mentor:",
          err
        );

        setError(
          err?.response?.data?.message ||
          "Unable to load mentor."
        );

      } finally {

        setLoading(false);

      }
    };


    loadMentor();

  }, [id]);


  /*
   * CHECK CHAT ACCESS
   *
   * This is mainly useful for paid mentors.
   */
  useEffect(() => {

    const checkAccess = async () => {

      if (!user || !mentor) {
        return;
      }

      if (mentor.mentorType === "FREE") {

        setChatAllowed(true);

        return;
      }


      try {

        setCheckingAccess(true);

        const allowed = await checkChatAccess(
          mentor.id
        );

        setChatAllowed(
          allowed === true
        );

      } catch (err) {

        console.error(
          "Failed to check chat access:",
          err
        );

        setChatAllowed(false);

      } finally {

        setCheckingAccess(false);

      }
    };


    checkAccess();

  }, [user, mentor]);


  /*
 * START / OPEN CHAT
 */
const handleChat = async () => {

   if (!user) {

       navigate("/login");

       return;
   }

   if (!mentor) {
       return;
   }

   try {

       const conversation =
           await createConversation(
               mentor.id
           );

       navigate(
           `/student/chats/${conversation.id}`
       );

   } catch (err) {

       console.error(
           "Failed to start chat:",
           err
       );

       alert(
           err?.response?.data?.message ||
           "Unable to start chat."
       );
   }
};
  /*
   * PAYMENT SUCCESS
   *
   * MentorPaymentButton should call this
   * after successful payment.
   */
  const handlePaymentSuccess = (access) => {
    if (access?.chatAllowed === true) {
      setChatAllowed(true);
      return;
    }
  
    setError("Payment successful, but chat access could not be confirmed.");
  };


  /*
   * PAYMENT ORDER
   *
   * Keep this only if you are using
   * payment directly from this page.
   */
  // const handlePurchase = async () => {

  //   if (!user) {

  //     navigate("/login");

  //     return;
  //   }


  //   if (!mentor) {

  //     return;
  //   }


  //   try {

  //     const order =
  //       await createMentorPaymentOrder(
  //         mentor.id
  //       );


  //     console.log(
  //       "Razorpay order:",
  //       order
  //     );


  //     /*
  //      * Razorpay checkout can be opened here.
  //      *
  //      * If MentorPaymentButton is already
  //      * handling payment, this function
  //      * does not need to be used.
  //      */

  //   } catch (err) {

  //     console.error(
  //       "Payment order creation failed:",
  //       err
  //     );


  //     alert(
  //       err?.response?.data?.message ||
  //       "Unable to create payment order."
  //     );
  //   }
  // };


  /*
   * LOADING
   */
  if (loading) {

    return (
      <div className="mentor-not-found">

        <div>

          <h1>
            Loading mentor...
          </h1>

        </div>

      </div>
    );
  }


  /*
   * ERROR / NOT FOUND
   */
  if (error || !mentor) {

    return (
      <div className="mentor-not-found">

        <div>

          <div className="mentor-not-found-icon">
            404
          </div>

          <h1>
            Mentor not found
          </h1>

          <p>
            {error ||
              "The mentor profile you're looking for doesn't exist."}
          </p>

          <Link to="/mentors">
            ← Back to Mentors
          </Link>

        </div>

      </div>
    );
  }


  return (

    <div className="mentor-details-page">


      {/* =====================================================
          TOP AREA
      ===================================================== */}

      <section className="mentor-detail-top">

        <div className="container">

          <div className="mentor-detail-breadcrumb">

            <Link to="/">
              Home
            </Link>

            <span>
              /
            </span>

            <Link to="/mentors">
              Mentors
            </Link>

            <span>
              /
            </span>

            <span>
              {mentor.name}
            </span>

          </div>


          <div className="mentor-profile-header">

  <div className="mentor-large-avatar">
    {mentor.profileImage ? (
      <img
        src={mentor.profileImage}
        alt={mentor.name}
      />
    ) : (
      mentor.name?.charAt(0)?.toUpperCase()
    )}
  </div>

  <div className="mentor-header-info">
    <div className="mentor-name-line">
      <div>
        <h1>{mentor.name}</h1>
        <p>{mentor.title || "Mentor"}</p>
      </div>

      <span
        className={
          mentor.mentorType === "FREE"
            ? "detail-type free"
            : "detail-type paid"
        }
      >
        {mentor.mentorType}
      </span>
    </div>

    <div className="mentor-academic-info">
      {mentor.departmentName && (
        <span>{mentor.departmentName}</span>
      )}
    </div>

    <p className="mentor-experience">
      {mentor.experience || "Experience not added"}
    </p>

    <div className="mentor-rating">
      <span>★ {mentor.rating || "4.9"}</span>
      <span>{mentor.sessions || 0} sessions</span>
      <span>{mentor.students || 0} students mentored</span>
    </div>
  </div>

</div>
        

        </div>

      </section>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="container mentor-details-content">

        <div className="mentor-details-grid">


          {/* =================================================
              MAIN COLUMN
          ================================================= */}

          <div className="mentor-main-column">


            {/* ABOUT */}

            <section className="mentor-detail-card">

              <span className="section-label">
                ABOUT
              </span>

              <h2>
                About {mentor.name?.split(" ")[0]}
              </h2>

              <p className="mentor-full-bio">

                {mentor.bio ||
                  "No bio available."}

              </p>

            </section>


            {/* SKILLS */}

            <section className="mentor-detail-card">

              <span className="section-label">
                EXPERTISE
              </span>

              <h2>
                Skills & expertise
              </h2>


              <div className="mentor-detail-skills">

                {(mentor.skills || []).length > 0 ? (

                  mentor.skills.map(
                    (skill) => (

                      <span key={skill}>
                        {skill}
                      </span>

                    )
                  )

                ) : (

                  <p>
                    No skills added.
                  </p>

                )}

              </div>

            </section>

{/* =================================================
    PROFESSIONAL
================================================= */}

<section className="mentor-detail-card">

    <span className="section-label">
        PROFESSIONAL
    </span>

    <h2>
        Professional information
    </h2>

    <div className="mentor-info-grid">

        <div>

            <small>
                Title
            </small>

            <strong>
                {mentor.title || "Not added"}
            </strong>

        </div>


        <div>

            <small>
                Experience
            </small>

            <strong>
                {mentor.experience || "Not added"}
            </strong>

        </div>


        <div>

            <small>
                Company
            </small>

            <strong>
                {mentor.company || "Not added"}
            </strong>

        </div>


        <div>

            <small>
                Designation
            </small>

            <strong>
                {mentor.designation || "Not added"}
            </strong>

        </div>

    </div>

</section>
            {/* WHAT YOU CAN LEARN */}

            <section className="mentor-detail-card">

              <span className="section-label">
                MENTORING
              </span>

              <h2>
                What you can learn
              </h2>


              <div className="learning-grid">


                <div className="learning-item">

                  <div className="learning-icon">
                    💻
                  </div>

                  <div>

                    <h3>
                      Practical Projects
                    </h3>

                    <p>
                      Build projects and understand
                      real-world implementation.
                    </p>

                  </div>

                </div>


                <div className="learning-item">

                  <div className="learning-icon">
                    🧠
                  </div>

                  <div>

                    <h3>
                      Technical Skills
                    </h3>

                    <p>
                      Learn concepts through practical
                      examples and discussions.
                    </p>

                  </div>

                </div>


                <div className="learning-item">

                  <div className="learning-icon">
                    🎯
                  </div>

                  <div>

                    <h3>
                      Career Guidance
                    </h3>

                    <p>
                      Get guidance on projects,
                      placements and growth.
                    </p>

                  </div>

                </div>


                <div className="learning-item">

                  <div className="learning-icon">
                    🚀
                  </div>

                  <div>

                    <h3>
                      Industry Insights
                    </h3>

                    <p>
                      Understand industry expectations
                      and development practices.
                    </p>

                  </div>

                </div>


              </div>

            </section>
            
{/* =================================================
    ACADEMIC
================================================= */}

<section className="">

    <span className="section-label">
        ACADEMIC
    </span>

    <h2>
        Academic information
    </h2>

    <div className="mentor-info-grid">

        <div>

            <small>
                Department
            </small>

            <strong>
                {mentor.departmentName ||
                    "Not added"}
            </strong>

        </div>


        <div>

            <small>
                Year
            </small>

            <strong>
                {mentor.year
                    ? `${mentor.year}${mentor.year === 1
                        ? "st"
                        : mentor.year === 2
                            ? "nd"
                            : mentor.year === 3
                                ? "rd"
                                : "th"} Year`
                    : "Not added"}
            </strong>

        </div>

    </div>

</section>

            
          </div>


          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="mentor-detail-sidebar">


            {/* ACCESS CARD */}

            <div className="mentor-access-card">


              <div className="access-card-top">

                <span className="section-label">
                  MENTOR ACCESS
                </span>


                {mentor.mentorType === "FREE" ? (

                  <div className="access-price">
                    Free
                  </div>

                ) : (

                  <div className="access-price">

                    ₹{mentor.price}

                    <small>
                      {" "}
                      / access
                    </small>

                  </div>

                )}

              </div>


              {/* FREE MENTOR */}

              {mentor.mentorType === "FREE" ? (

                <div className="access-info">

                  <div className="access-status free">

                    <span>
                      ✓
                    </span>

                    <div>

                      <strong>
                        Free mentor
                      </strong>

                      <p>
                        Chat access is available.
                      </p>

                    </div>

                  </div>

                </div>

              ) : (

                /* PAID MENTOR */

                <div className="access-info">

                  <div className="access-status paid">

                    <span>
                      ₹
                    </span>

                    <div>

                      <strong>
                        Premium mentor
                      </strong>

                      <p>
                        Purchase access to start chatting.
                      </p>

                    </div>

                  </div>

                </div>

              )}


              {/* =================================================
                  ACCESS BUTTON
              ================================================= */}

              {mentor.mentorType === "FREE" ? (

                <button
                  type="button"
                  className="mentor-access-button unlocked"
                  onClick={handleChat}
                >

                  Start Chat →

                </button>

              ) : checkingAccess ? (

                <button
                  type="button"
                  className="mentor-access-button"
                  disabled
                >

                  Checking access...

                </button>

              ) : chatAllowed ? (

                <button
                  type="button"
                  className="mentor-access-button unlocked"
                  onClick={handleChat}
                >

                  Start Chat →

                </button>

              ) : (

                <MentorPaymentButton
                  mentor={mentor}
                  onPaymentSuccess={
                    handlePaymentSuccess
                  }
                />

              )}


              <div className="access-note">

                🔒 Secure mentor access

              </div>

            </div>


            {/* QUICK STATS */}

            <div className="mentor-sidebar-stats">


              <div>

                <strong>
                  {mentor.rating || "4.9"}
                </strong>

                <span>
                  Rating
                </span>

              </div>


              <div>

                <strong>
                  {mentor.sessions || 0}+
                </strong>

                <span>
                  Sessions
                </span>

              </div>


              <div>

                <strong>
                  {mentor.students || 0}+
                </strong>

                <span>
                  Students
                </span>

              </div>


            </div>

{/* =================================================
    PROFESSIONAL LINKS
================================================= */}

<div className="mentor-sidebar-social">

    <span className="section-label">
        CONNECT
    </span>

    <h3>
        Professional links
    </h3>

    <div className="mentor-social-links">

        {mentor.github && (
            <a
                href={
                    mentor.github.startsWith("http")
                        ? mentor.github
                        : `https://${mentor.github}`
                }
                target="_blank"
                rel="noreferrer"
            >

                <div className="social-small-icon">
                    GH
                </div>

                <div>
                    <strong>
                        GitHub
                    </strong>

                    <span>
                        {mentor.github}
                    </span>
                </div>

                <b>
                    ↗
                </b>

            </a>
        )}


        {mentor.linkedin && (
            <a
                href={
                    mentor.linkedin.startsWith("http")
                        ? mentor.linkedin
                        : `https://${mentor.linkedin}`
                }
                target="_blank"
                rel="noreferrer"
            >

                <div className="social-small-icon">
                    IN
                </div>

                <div>
                    <strong>
                        LinkedIn
                    </strong>

                    <span>
                        {mentor.linkedin}
                    </span>
                </div>

                <b>
                    ↗
                </b>

            </a>
        )}


        {!mentor.github &&
            !mentor.linkedin && (
                <p className="no-social-links">
                    No professional links available.
                </p>
            )}

    </div>

</div>


{/* EXPLORE OTHER MENTORS */}

            <Link
              to="/mentors"
              className="back-mentor-link"
            >

              ← Explore other mentors

            </Link>

          </aside>

        </div>

      </main>

    </div>
  );
}


export default MentorDetails;