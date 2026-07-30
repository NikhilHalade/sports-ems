import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

// Validates a single field and returns an error string, or "" if valid.
function validateField(field, value) {
  switch (field) {
    case "name":
      if (!value.trim()) return "Full name is required";
      return "";
    case "email":
      if (!value.trim()) return "Email is required";
      if (!/\S+@\S+\.\S+/.test(value)) return "Enter a valid email";
      return "";
    case "password":
      if (!value) return "Password is required";
      if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(value))
        return "Password must be 8+ chars, 1 uppercase, 1 number";
      return "";
    case "mobile":
      if (!value.trim()) return "Mobile number is required";
      if (!/^\d{10}$/.test(value)) return "Enter a valid 10-digit mobile number";
      return "";
    default:
      return "";
  }
}

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", mobile: "", role: "USER" });
  const [fieldErrors, setFieldErrors] = useState({ name: "", email: "", password: "", mobile: "" });
  const [touched, setTouched] = useState({ name: false, email: false, password: false, mobile: false });
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    setServerError("");

    // Live validation: once a field has been touched, re-validate on every keystroke.
    if (touched[field] || value.length > 0) {
      setFieldErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setFieldErrors(prev => ({ ...prev, [field]: validateField(field, form[field]) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate every field before submitting.
    const nextErrors = {
      name: validateField("name", form.name),
      email: validateField("email", form.email),
      password: validateField("password", form.password),
      mobile: validateField("mobile", form.mobile),
    };
    setFieldErrors(nextErrors);
    setTouched({ name: true, email: true, password: true, mobile: true });

    if (Object.values(nextErrors).some(Boolean)) return;

    try {
      setLoading(true); setServerError("");
      const res = await axios.post("http://localhost:8080/api/auth/register", {
        name: form.name, email: form.email,
        password: form.password, phone: form.mobile, role: form.role,
      });

      const status = res.data.status;

      if (status === "PENDING_APPROVAL") {
        // Feature 3: organizer/admin pending
        navigate("/login", {
          state: {
            infoMessage: "Registration submitted! Your account is pending admin approval. You'll receive an email once approved."
          }
        });
      } else {
        // Feature 4: USER registered → redirect to login
        navigate("/login", {
          state: { infoMessage: "Registration successful! You can now login." }
        });
      }
    } catch (err) {
      const data = err.response?.data;
      // Backend tells us which field a conflict/validation error belongs to
      // (e.g. duplicate email/mobile) — show it live under that row too.
      if (data?.field && Object.prototype.hasOwnProperty.call(form, data.field)) {
        setFieldErrors(prev => ({ ...prev, [data.field]: data.error }));
      } else {
        setServerError(data?.error || "Server Error");
      }
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `border p-2 rounded-lg outline-none focus:ring-2 ${
      fieldErrors[field] ? "border-red-400 focus:ring-red-300" : "focus:ring-green-400"
    }`;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-[420px]">
        <h2 className="text-2xl font-bold text-center text-green-600">Let's get you set up 👋</h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Just a few details and you're in.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1">
            <input type="text" placeholder="Full Name"
              className={inputClass("name")}
              value={form.name}
              onChange={e => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")} />
            {fieldErrors.name && <p className="text-red-500 text-xs">{fieldErrors.name}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <input type="email" placeholder="Email Address"
              className={inputClass("email")}
              value={form.email}
              onChange={e => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")} />
            {fieldErrors.email && <p className="text-red-500 text-xs">{fieldErrors.email}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <input type="password" placeholder="Password (8+ chars, 1 uppercase, 1 number)"
              className={inputClass("password")}
              value={form.password}
              onChange={e => handleChange("password", e.target.value)}
              onBlur={() => handleBlur("password")} />
            {fieldErrors.password && <p className="text-red-500 text-xs">{fieldErrors.password}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <input type="tel" placeholder="Mobile Number (10 digits)"
              className={inputClass("mobile")}
              value={form.mobile}
              onChange={e => handleChange("mobile", e.target.value)}
              onBlur={() => handleBlur("mobile")} />
            {fieldErrors.mobile && <p className="text-red-500 text-xs">{fieldErrors.mobile}</p>}
          </div>

          <select
            className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-400 bg-white"
            value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="USER">User</option>
            <option value="ORGANIZER">Organizer</option>
            <option value="ADMIN">Admin</option>
          </select>

          {/* Feature 3: show note for organizer/admin */}
          {(form.role === "ORGANIZER" || form.role === "ADMIN") && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
              ⚠️ <strong>{form.role}</strong> accounts require admin approval before you can login.
            </div>
          )}

          {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
          <button disabled={loading}
            className={`py-2 rounded-lg text-white font-semibold transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>
            {loading ? "Setting up your account..." : "Create my account"}
          </button>
        </form>
        <p className="text-center text-sm mt-4 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 font-semibold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
