import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">

        <div className="footer-grid">

          {/* About */}
          <div className="footer-about">
            <div className="brand footer-brand">
              <div className="brand-logo">IC</div>

              <div className="brand-text">
                <span className="brand-title">IET Connect</span>
                <span className="brand-subtitle">For Engineering Students</span>
              </div>
            </div>

            <p>
              One platform for students, mentors, events, resources
              and college community.
            </p>
          </div>

          {/* Explore */}
          <div className="footer-column">
            <h3>Explore</h3>

            <Link to="/events">Events</Link>
            <Link to="/mentors">Mentors</Link>
            <Link to="/community">Community</Link>
            <Link to="/resources">Resources</Link>
            <Link to="/announcements">Announcements</Link>
            <Link to="/complaints">Complaints</Link>
          </div>

          {/* Account */}
          <div className="footer-column">
            <h3>Account</h3>

            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>

        </div>

        <div className="footer-bottom">
          <span>
            © 2026 IET Connect
          </span>

          <span>
            Built for the IET community.
          </span>
        </div>

      </div>
    </footer>
  );
}

export default Footer;