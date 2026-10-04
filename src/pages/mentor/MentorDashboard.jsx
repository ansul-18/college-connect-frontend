import React, { useEffect, useMemo, useState } from "react";
import {
  getMyMentorProfile,
  getMyMentorConversations,
  getCollegeEvents,
  getCollegeAnnouncements,
} from "../../api/mentorApi";

import "./MentorDashboard.css";

function MentorDashboard() {
  const [mentor, setMentor] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUserId = () => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user?.id || user?.userId;
      } catch {
        return null;
      }
    }

    const userId = localStorage.getItem("userId");
    return userId || null;
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const userId = getUserId();

      if (!userId) {
        console.error("Mentor userId not found");
        return;
      }

      const [mentorRes, chatRes, eventRes, announcementRes] =
        await Promise.allSettled([
          getMyMentorProfile(userId),
          getMyMentorConversations(),
          getCollegeEvents(),
          getCollegeAnnouncements(),
        ]);

      if (mentorRes.status === "fulfilled") {
        setMentor(mentorRes.value);
      }

      if (chatRes.status === "fulfilled") {
        setConversations(chatRes.value || []);
      }

      if (eventRes.status === "fulfilled") {
        setEvents(eventRes.value || []);
      }

      if (announcementRes.status === "fulfilled") {
        setAnnouncements(announcementRes.value || []);
      }
    } catch (error) {
      console.error("Mentor dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = useMemo(() => {
    return conversations.reduce(
      (total, item) => total + (item.unreadCount || 0),
      0
    );
  }, [conversations]);

  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter((event) => event.status !== "CANCELLED")
      .slice(0, 4);
  }, [events]);

  const recentAnnouncements = useMemo(() => {
    return [...announcements].slice(0, 4);
  }, [announcements]);

  const mentorName = mentor?.name || mentor?.fullName || "Mentor";

  const firstLetter = mentorName.charAt(0).toUpperCase();

  const formatDate = (value) => {
    if (!value) return "Date not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="mentor-dashboard-page">
        <div className="mentor-dashboard-container">
          <div className="mentor-dashboard-loading">
            <div className="mentor-loading-spinner"></div>
            <p>Loading mentor dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mentor-dashboard-page">

      {/* HERO */}
      <section className="mentor-dashboard-hero">
        <div className="mentor-dashboard-container">

          <div className="mentor-dashboard-breadcrumb">
            <span>Home</span>
            <b>/</b>
            <span>Mentor Dashboard</span>
          </div>

          <div className="mentor-dashboard-hero-inner">

            <div className="mentor-dashboard-hero-content">

              <span className="section-label">
                Mentor Portal
              </span>

              <h1>
                Welcome back, {mentorName} 👋
              </h1>

              <p>
                Manage your mentoring activity, connect with students,
                and stay updated with your college community.
              </p>

              <div className="mentor-dashboard-status">
                <span className="status-dot"></span>
                Mentor profile active
              </div>

            </div>

            <div className="mentor-dashboard-hero-avatar">
              {mentor?.profileImage ? (
                <img
                  src={mentor.profileImage}
                  alt={mentorName}
                />
              ) : (
                firstLetter
              )}
            </div>

          </div>
        </div>
      </section>

      <main className="mentor-dashboard-container mentor-dashboard-content">

        {/* STATS */}
        <section className="mentor-dashboard-stats">

          <div className="mentor-stat-card">
            <div className="mentor-stat-icon">💬</div>
            <div>
              <span>Total Conversations</span>
              <strong>{conversations.length}</strong>
              <small>Student conversations</small>
            </div>
          </div>

          <div className="mentor-stat-card">
            <div className="mentor-stat-icon">🔔</div>
            <div>
              <span>Unread Messages</span>
              <strong>{unreadCount}</strong>
              <small>Need your attention</small>
            </div>
          </div>

          <div className="mentor-stat-card">
            <div className="mentor-stat-icon">👨‍🏫</div>
            <div>
              <span>Mentor Type</span>
              <strong>
                {mentor?.mentorType || "Mentor"}
              </strong>
              <small>Current profile</small>
            </div>
          </div>

          <div className="mentor-stat-card">
            <div className="mentor-stat-icon">📅</div>
            <div>
              <span>Events</span>
              <strong>{events.length}</strong>
              <small>College activities</small>
            </div>
          </div>

        </section>

        {/* MAIN GRID */}
        <section className="mentor-dashboard-grid">

          {/* LEFT */}
          <div className="mentor-dashboard-main">

            {/* CHAT ACTIVITY */}
            <div className="mentor-dashboard-card">

              <div className="mentor-dashboard-card-header">
                <div>
                  <span className="section-label">
                    Communication
                  </span>

                  <h2>Recent conversations</h2>

                  <p>
                    Keep track of your latest student conversations.
                  </p>
                </div>

                <a href="/mentor/chats" className="dashboard-link">
                  View all →
                </a>
              </div>

              {conversations.length === 0 ? (
                <div className="mentor-empty-state">
                  <div className="empty-icon">💬</div>
                  <h3>No conversations yet</h3>
                  <p>
                    Student conversations will appear here.
                  </p>
                </div>
              ) : (
                <div className="mentor-conversation-list">

                  {conversations.slice(0, 5).map((conversation) => (

                    <div
                      className="mentor-conversation-item"
                      key={conversation.id}
                    >

                      <div className="conversation-avatar">
                        S
                      </div>

                      <div className="conversation-info">
                        <strong>
                          Student #{conversation.studentId}
                        </strong>

                        <span>
                          {conversation.lastMessage ||
                            "No messages yet"}
                        </span>
                      </div>

                      <div className="conversation-meta">

                        {conversation.lastMessageAt && (
                          <small>
                            {formatTime(
                              conversation.lastMessageAt
                            )}
                          </small>
                        )}

                        {conversation.unreadCount > 0 && (
                          <b>
                            {conversation.unreadCount}
                          </b>
                        )}

                      </div>

                    </div>

                  ))}

                </div>
              )}

            </div>

            {/* EVENTS */}
            <div className="mentor-dashboard-card">

              <div className="mentor-dashboard-card-header">
                <div>
                  <span className="section-label">
                    College
                  </span>

                  <h2>Upcoming events 📅</h2>

                  <p>
                    Stay informed about upcoming college activities.
                  </p>
                </div>

                <a href="/events" className="dashboard-link">
                  View events →
                </a>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="mentor-empty-state compact">
                  <div className="empty-icon">📅</div>
                  <p>No upcoming events available.</p>
                </div>
              ) : (
                <div className="mentor-event-list">

                  {upcomingEvents.map((event) => (

                    <div
                      className="mentor-event-item"
                      key={event.id}
                    >

                      <div className="event-date-box">
                        <strong>
                          {event.date
                            ? new Date(event.date).getDate()
                            : "—"}
                        </strong>

                        <span>
                          {event.date
                            ? new Date(event.date)
                                .toLocaleDateString("en-IN", {
                                  month: "short",
                                })
                                .toUpperCase()
                            : "DATE"}
                        </span>
                      </div>

                      <div className="event-info">
                        <strong>
                          {event.title || "College Event"}
                        </strong>

                        <span>
                          {event.description ||
                            "College activity and event"}
                        </span>

                        <small>
                          {formatDate(event.date)}
                        </small>
                      </div>

                    </div>

                  ))}

                </div>
              )}

            </div>

          </div>

          {/* RIGHT */}
          <aside className="mentor-dashboard-sidebar">

            {/* PROFILE */}
            <div className="mentor-dashboard-sidebar-card profile-summary-card">

              <span className="section-label">
                Profile
              </span>

              <div className="profile-summary-avatar">
                {mentor?.profileImage ? (
                  <img
                    src={mentor.profileImage}
                    alt={mentorName}
                  />
                ) : (
                  firstLetter
                )}
              </div>

              <h3>{mentorName}</h3>

              <p>
                {mentor?.title ||
                  mentor?.designation ||
                  "Mentor"}
              </p>

              <div className="profile-summary-meta">

                <div>
                  <small>Department</small>
                  <strong>
                    {mentor?.departmentName ||
                      "Computer Science"}
                  </strong>
                </div>

                <div>
                  <small>Experience</small>
                  <strong>
                    {mentor?.experience || "—"}
                  </strong>
                </div>

              </div>

              <a
                href="/mentor/profile"
                className="dashboard-dark-button"
              >
                👤 View Profile
              </a>

            </div>

            {/* QUICK ACTIONS */}
            <div className="mentor-dashboard-sidebar-card">

              <span className="section-label">
                Workspace
              </span>

              <h3>Quick actions</h3>

              <div className="mentor-quick-actions">

                <a href="/mentor/chat">
                  <span>💬</span>
                  <div>
                    <strong>Student Chat</strong>
                    <small>Open conversations</small>
                  </div>
                  <b>→</b>
                </a>

                <a href="/mentor/profile">
                  <span>👤</span>
                  <div>
                    <strong>Edit Profile</strong>
                    <small>Update mentor details</small>
                  </div>
                  <b>→</b>
                </a>

                <a href="/events">
                  <span>📅</span>
                  <div>
                    <strong>College Events</strong>
                    <small>View upcoming events</small>
                  </div>
                  <b>→</b>
                </a>

                <a href="/resources">
                  <span>📚</span>
                  <div>
                    <strong>Resources</strong>
                    <small>Explore learning content</small>
                  </div>
                  <b>→</b>
                </a>

              </div>

            </div>

          </aside>

        </section>

        {/* ANNOUNCEMENTS */}
        <section className="mentor-dashboard-card announcement-card">

          <div className="mentor-dashboard-card-header">

            <div>
              <span className="section-label">
                Updates
              </span>

              <h2>Latest announcements 📢</h2>

              <p>
                Important updates from your college.
              </p>
            </div>

          </div>

          {recentAnnouncements.length === 0 ? (
            <div className="mentor-empty-state compact">
              <div className="empty-icon">📢</div>
              <p>No announcements available.</p>
            </div>
          ) : (
            <div className="announcement-list">

              {recentAnnouncements.map((announcement) => (

                <div
                  className="announcement-item"
                  key={announcement.id}
                >

                  <div className="announcement-icon">
                    📢
                  </div>

                  <div>
                    <strong>
                      {announcement.title ||
                        "College Announcement"}
                    </strong>

                    <p>
                      {announcement.content ||
                        announcement.description ||
                        "No announcement details."}
                    </p>

                    {announcement.createdAt && (
                      <small>
                        {formatDate(announcement.createdAt)}
                      </small>
                    )}
                  </div>

                </div>

              ))}

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default MentorDashboard;