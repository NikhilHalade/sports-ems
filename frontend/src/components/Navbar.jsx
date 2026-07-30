import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn, getRole, getUserName, clearAuth } from "../utils/auth";

const linkStyle = {
  color: "var(--color-text)",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "0.92rem",
};

// A little warmth for the returning visitor, based on time of day.
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Navbar() {
  const navigate  = useNavigate();
  const loggedIn  = isLoggedIn();
  const role      = getRole();
  const userName  = getUserName();

  // Bug fix: a logged-in user clicking "Events" must land on their own
  // /user/events page, not the public /events page.
  let eventsPath = "/events";
  if (loggedIn) {
    if      (role === "USER")      eventsPath = "/user/events";
    else if (role === "ORGANIZER") eventsPath = "/events/manage";
    // ADMIN falls back to the public /events page
  }

  // Dashboard destination differs per role — every logged-in role gets one.
  let dashboardPath = "/user/dashboard";
  if      (role === "ORGANIZER") dashboardPath = "/events/manage";
  else if (role === "ADMIN")     dashboardPath = "/admin/users";

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  const initial = userName ? userName.trim().charAt(0).toUpperCase() : "?";

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1.5rem",
        padding: "0.85rem 1.5rem",
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/about" style={linkStyle}>About Us</Link>
        <Link to={eventsPath} style={linkStyle}>Events</Link>
        {loggedIn && (
          <Link to={dashboardPath} style={linkStyle}>Dashboard</Link>
        )}
      </div>

      {loggedIn ? (
        <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
          <span style={{ color: "var(--color-muted)", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
            {greeting()}{userName ? `, ${userName.split(" ")[0]}` : ""} 👋
          </span>
          <div
            title={userName || "Your account"}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "var(--color-primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.9rem",
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <button onClick={handleLogout} className="btn btn--secondary btn--sm">
            Log out
          </button>
        </div>
      ) : (
        <Link to="/login" className="btn btn--primary btn--sm">
          Log in / Sign up
        </Link>
      )}
    </nav>
  );
}

export default Navbar;
