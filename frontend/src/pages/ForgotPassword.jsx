import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const API = "http://localhost:8080/api/auth";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep]         = useState(1);
  const [email, setEmail]       = useState("");
  const [otp, setOtp]           = useState("");
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState("");

  // Step 1 — send OTP to email
  async function handleSendOtp(e) {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email"); return; }
    setLoading(true); setError("");
    try {
      await axios.post(`${API}/forgot-password`, { email });
      setSuccess(`OTP sent to ${email}. Check your inbox (and spam folder).`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Email not found");
    } finally { setLoading(false); }
  }

  // Step 2 — verify OTP
  async function handleVerifyOtp(e) {
    e.preventDefault();
    if (otp.length !== 6) { setError("Enter a valid 6-digit OTP"); return; }
    setLoading(true); setError("");
    try {
      await axios.post(`${API}/verify-otp`, { email, otp });
      setSuccess("OTP verified! Set your new password.");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid or expired OTP");
    } finally { setLoading(false); }
  }

  // Step 3 — reset password
  async function handleResetPassword(e) {
    e.preventDefault();
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(passwords.new)) {
      setError("Password must be 8+ chars, 1 uppercase, 1 number"); return;
    }
    if (passwords.new !== passwords.confirm) {
      setError("Passwords do not match"); return;
    }
    setLoading(true); setError("");
    try {
      await axios.post(`${API}/reset-password`, {
        email, otp, newPassword: passwords.new
      });
      navigate("/login", {
        state: { infoMessage: "Password reset successful! You can now login with your new password." }
      });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-[400px]">

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= s ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"}`}>
              {s}
            </div>
          ))}
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm">
            {success}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold text-center mb-2 text-green-600">Forgot Password</h2>
            <p className="text-center text-sm text-gray-500 mb-6">Enter your email to receive an OTP</p>
            <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
              <input type="email" placeholder="Email Address"
                className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-400"
                value={email} onChange={e => setEmail(e.target.value)} />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button disabled={loading}
                className={`py-2 rounded-lg text-white font-semibold transition ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold text-center mb-2 text-green-600">Enter OTP</h2>
            <p className="text-center text-sm text-gray-500 mb-6">
              OTP sent to <span className="font-semibold">{email}</span>
            </p>
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3">
              <input type="text" placeholder="6-digit OTP" maxLength={6}
                className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-400 text-center tracking-widest text-lg"
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button disabled={loading}
                className={`py-2 rounded-lg text-white font-semibold transition ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button type="button" onClick={() => { setStep(1); setError(""); setSuccess(""); }}
                className="text-sm text-gray-500 hover:underline">
                ← Change Email
              </button>
              <button type="button" disabled={loading} onClick={handleSendOtp}
                className="text-sm text-green-600 hover:underline">
                Resend OTP
              </button>
            </form>
          </>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <>
            <h2 className="text-2xl font-bold text-center mb-2 text-green-600">New Password</h2>
            <p className="text-center text-sm text-gray-500 mb-6">Set your new password</p>
            <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
              <input type="password" placeholder="New Password"
                className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-400"
                value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} />
              <input type="password" placeholder="Confirm Password"
                className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-400"
                value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button disabled={loading}
                className={`py-2 rounded-lg text-white font-semibold transition ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}

        <p className="text-center text-sm mt-4 text-gray-600">
          Remember password?{" "}
          <Link to="/login" className="text-green-600 font-semibold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
