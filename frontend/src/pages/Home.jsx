import { Link } from "react-router-dom";
import { isLoggedIn, getRole } from "../utils/auth";

function Home() {
  const loggedIn = isLoggedIn();
  const role = (getRole() || "").trim().toUpperCase();
  let eventsPath = "/events";
  if (loggedIn) {
    if (role === "USER" || role === "ORGANIZER") eventsPath = "/user/events";
  }

  return (
    <div className="bg-white">

      {/* HERO SECTION */}
      <section className="py-5 border-bottom">
        <div className="container py-5">
          <div className="row align-items-center g-5">

            <div className="col-lg-6">
              <p className="text-uppercase small fw-semibold text-secondary mb-3" style={{ letterSpacing: "0.08em" }}>
                EventSphere
              </p>

              <h1 className="display-4 fw-bold lh-sm mb-4">
                Discover amazing events around you
              </h1>

              <p className="fs-5 text-secondary mb-4">
                Find concerts, workshops, conferences, hackathons and
                unforgettable experiences.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <Link to={eventsPath} className="btn btn-dark btn-lg px-4">
                  Explore Events
                </Link>
                <Link to="/login" className="btn btn-outline-secondary btn-lg px-4">
                  Login
                </Link>
              </div>
            </div>

            <div className="col-lg-6">
              <img
                src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200"
                alt="event"
                className="img-fluid rounded-4 shadow-sm w-100"
                style={{ objectFit: "cover", maxHeight: "480px" }}
              />
            </div>

          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="py-5">
        <div className="container py-4">

          <h2 className="fw-bold text-center mb-5">Upcoming Events</h2>

          <div className="row g-4">

            <div className="col-md-4">
              <div className="card border shadow-sm h-100">
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200"
                  alt="Tech Summit"
                  className="card-img-top"
                  style={{ height: "13rem", objectFit: "cover" }}
                />
                <div className="card-body p-4">
                  <h5 className="card-title fw-bold mb-1">Tech Summit 2026</h5>
                  <p className="card-text text-secondary small mb-0">Bangalore • Aug 25</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border shadow-sm h-100">
                <img
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200"
                  alt="Music Festival"
                  className="card-img-top"
                  style={{ height: "13rem", objectFit: "cover" }}
                />
                <div className="card-body p-4">
                  <h5 className="card-title fw-bold mb-1">Music Festival</h5>
                  <p className="card-text text-secondary small mb-0">Mumbai • Sept 10</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border shadow-sm h-100">
                <img
                  src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200"
                  alt="Startup Meetup"
                  className="card-img-top"
                  style={{ height: "13rem", objectFit: "cover" }}
                />
                <div className="card-body p-4">
                  <h5 className="card-title fw-bold mb-1">Startup Meetup</h5>
                  <p className="card-text text-secondary small mb-0">Delhi • Sept 15</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* EVENT MOMENTS */}
      <section className="py-5 bg-light border-top border-bottom">
        <div className="container py-4">

          <h2 className="fw-bold text-center mb-5">Event Moments</h2>

          <div className="row g-4">
            <div className="col-md-6">
              <img
                src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200"
                className="img-fluid rounded-4 shadow-sm w-100"
                style={{ height: "20rem", objectFit: "cover" }}
                alt=""
              />
            </div>
            <div className="col-md-6">
              <img
                src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200"
                className="img-fluid rounded-4 shadow-sm w-100"
                style={{ height: "20rem", objectFit: "cover" }}
                alt=""
              />
            </div>
          </div>

        </div>
      </section>

      {/* ABOUT */}
      <section className="py-5">
        <div className="container py-4">
          <div className="row align-items-center g-5">

            <div className="col-lg-6">
              <h2 className="fw-bold mb-4">About EventSphere</h2>
              <p className="fs-5 text-secondary mb-4">
                We help people discover and experience extraordinary events.
                From concerts and workshops to conferences and festivals,
                everything is available in one place.
              </p>
              <Link to="/about" className="btn btn-dark px-4">
                Learn More
              </Link>
            </div>

            <div className="col-lg-6">
              <img
                src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200"
                className="img-fluid rounded-4 shadow-sm w-100"
                alt=""
              />
            </div>

          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-5 border-top bg-light">
        <div className="container">
          <div className="row text-center g-4">

            <div className="col-6 col-md-3">
              <h2 className="fw-bold mb-1">5000+</h2>
              <p className="text-secondary small mb-0">Users</p>
            </div>

            <div className="col-6 col-md-3">
              <h2 className="fw-bold mb-1">1200+</h2>
              <p className="text-secondary small mb-0">Events</p>
            </div>

            <div className="col-6 col-md-3">
              <h2 className="fw-bold mb-1">300+</h2>
              <p className="text-secondary small mb-0">Organizers</p>
            </div>

            <div className="col-6 col-md-3">
              <h2 className="fw-bold mb-1">4.9</h2>
              <p className="text-secondary small mb-0">Rating</p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
