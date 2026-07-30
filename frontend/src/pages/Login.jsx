import { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { setAuth } from "../utils/auth";
import GoogleLoginButton from "../components/GoogleLoginButton";

function decodeToken(token) {
  try { return JSON.parse(atob(token.split(".")[1])); }
  catch { return null; }
}

function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const infoMsg   = location.state?.infoMessage || "";

  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  function finalizeLogin(token) {
    const decoded   = decodeToken(token);
    const role      = decoded?.role || "USER";
    const email     = decoded?.sub  || "";
    const userName  = email.split("@")[0];

    // Fix 2: store in both localStorage AND cookie
    setAuth(token, role, userName, email);

    if      (role === "ADMIN")     navigate("/admin/users");
    else if (role === "ORGANIZER") navigate("/events/manage");
    else                           navigate("/user/dashboard");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("All fields are required"); return; }
    try {
      setLoading(true); setError("");
      const res = await axios.post("http://localhost:8080/api/auth/login",
        { email: form.email, password: form.password });
      finalizeLogin(res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || "Server Error");
      setLoading(false);
    }
  };

  // Called by GoogleLoginButton with the Google ID token (JWT credential).
  // The backend verifies it with Google, fetches the name/email it needs,
  // and auto-registers/logs the person in as a USER.
  const handleGoogleCredential = async (idToken) => {
    try {
      setGoogleError(""); setError("");
      const res = await axios.post("http://localhost:8080/api/auth/google-login", { idToken });
      finalizeLogin(res.data.token);
    } catch (err) {
      setGoogleError(err.response?.data?.error || "Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-[400px]">
        <h2 className="text-2xl font-bold text-center mb-6 text-green-600">Welcome Back</h2>

        {infoMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm">
            {infoMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="email" placeholder="Email Address"
            className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-400"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Password"
            className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-400"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-green-600 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <button disabled={loading}
            className={`py-2 rounded-lg text-white font-semibold transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 uppercase tracking-wide">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <GoogleLoginButton onCredential={handleGoogleCredential} onError={setGoogleError} />
        {googleError && <p className="text-red-500 text-sm text-center mt-2">{googleError}</p>}
        <p className="text-center text-xs text-gray-400 mt-2">
          Google Sign-In always logs you in as a regular user.
        </p>

        <p className="text-center text-sm mt-4 text-gray-600">
          New user?{" "}
          <Link to="/register" className="text-green-600 font-semibold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
