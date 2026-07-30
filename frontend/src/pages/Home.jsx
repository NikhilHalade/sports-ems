import { Link } from "react-router-dom";
import { isLoggedIn, getRole } from "../utils/auth";

function Home() {
  const loggedIn = isLoggedIn();
  const role     = getRole();
  let eventsPath = "/events";
  if (loggedIn) {
    if      (role === "USER")      eventsPath = "/user/events";
    else if (role === "ORGANIZER") eventsPath = "/events/manage";
  }

  return (
    <div className="bg-white">

      {/* HERO SECTION */}
      <section className="min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">

          {/* LEFT */}
          <div>
            <p className="text-purple-600 font-semibold mb-4">
              🎉 EventSphere
            </p>

            <h1 className="text-6xl font-bold leading-tight text-gray-900">
              Discover
              <span className="text-purple-600"> Amazing Events</span>
              <br />
              Around You
            </h1>

            <p className="mt-6 text-lg text-gray-600">
              Find concerts, workshops, conferences,
              hackathons and unforgettable experiences.
            </p>

            <div className="mt-8 flex gap-4">
              <Link
                to={eventsPath}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700"
              >
                Explore Events
              </Link>

              <Link
                to="/login"
                className="border px-6 py-3 rounded-xl hover:bg-gray-100"
              >
                Login
              </Link>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div>
            <img
              src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200"
              alt="event"
              className="rounded-3xl shadow-2xl"
            />
          </div>

        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="max-w-7xl mx-auto px-6 py-20">

        <h2 className="text-4xl font-bold text-center mb-12">
          Upcoming Events
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

  <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:scale-105 transition">
    <img
      src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200"
      alt="Tech Summit"
      className="h-52 w-full object-cover"
    />
    <div className="p-6">
      <h3 className="text-xl font-bold">Tech Summit 2026</h3>
      <p className="text-gray-500 mt-2">📍 Bangalore • Aug 25</p>
    </div>
  </div>

  <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:scale-105 transition">
    <img
      src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200"
      alt="Music Festival"
      className="h-52 w-full object-cover"
    />
    <div className="p-6">
      <h3 className="text-xl font-bold">Music Festival</h3>
      <p className="text-gray-500 mt-2">📍 Mumbai • Sept 10</p>
    </div>
  </div>

  <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:scale-105 transition">
    <img
      src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200"
      alt="Startup Meetup"
      className="h-52 w-full object-cover"
    />
    <div className="p-6">
      <h3 className="text-xl font-bold">Startup Meetup</h3>
      <p className="text-gray-500 mt-2">📍 Delhi • Sept 15</p>
    </div>
  </div>

</div>

      </section>

      {/* EVENT MOMENTS */}
      <section className="bg-gray-50 py-20">

        <div className="max-w-7xl mx-auto px-6">

          <h2 className="text-4xl font-bold text-center mb-12">
            Event Moments
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <img
              src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200"
              className="rounded-3xl h-80 w-full object-cover"
              alt=""
            />

            <img
              src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200"
              className="rounded-3xl h-80 w-full object-cover"
              alt=""
            />

          </div>

        </div>

      </section>

      {/* ABOUT */}
      <section className="max-w-7xl mx-auto px-6 py-20">

        <div className="grid md:grid-cols-2 gap-10 items-center">

          <div>
            <h2 className="text-5xl font-bold mb-6">
              About EventSphere
            </h2>

            <p className="text-lg text-gray-600">
              We help people discover and experience
              extraordinary events. From concerts and
              workshops to conferences and festivals,
              everything is available in one place.
            </p>

            <Link
              to="/about"
              className="inline-block mt-6 bg-purple-600 text-white px-5 py-3 rounded-xl"
            >
              Learn More
            </Link>
          </div>

          <img
            src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200"
            className="rounded-3xl shadow-xl"
            alt=""
          />

        </div>

      </section>

      {/* STATS */}
      <section className="bg-purple-600 text-white py-16">

        <div className="max-w-6xl mx-auto grid md:grid-cols-4 text-center gap-8">

          <div>
            <h2 className="text-4xl font-bold">5000+</h2>
            <p>Users</p>
          </div>

          <div>
            <h2 className="text-4xl font-bold">1200+</h2>
            <p>Events</p>
          </div>

          <div>
            <h2 className="text-4xl font-bold">300+</h2>
            <p>Organizers</p>
          </div>

          <div>
            <h2 className="text-4xl font-bold">4.9★</h2>
            <p>Rating</p>
          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="bg-black text-white py-10">

        <div className="max-w-6xl mx-auto text-center">

          <h2 className="text-2xl font-bold">
            EventSphere
          </h2>

          <p className="text-gray-400 mt-2">
            Discover • Connect • Celebrate
          </p>

          <p className="text-gray-500 mt-4">
            © 2026 EventSphere
          </p>

        </div>

      </footer>

    </div>
  );
}

export default Home;