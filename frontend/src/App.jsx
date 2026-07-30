import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import AboutUs from "./pages/AboutUs";
import ForgotPassword from "./pages/ForgotPassword";

// USER — event cards + booking (FR-3.1)
import UserEventList from "./pages/UserEventList";
import UserDashboard from "./pages/UserDashboard";

// ORGANIZER — event management (Module 6.2)
import EventList from "./pages/EventList";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";

// ADMIN — user management (FR-6.1) + reports (FR-6.2)
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminReports from "./pages/AdminReports";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"                 element={<Home />} />
        <Route path="/login"            element={<Login />} />
        <Route path="/register"         element={<Register />} />
        <Route path="/events"           element={<Events />} />
        <Route path="/about"            element={<AboutUs />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />

        {/* USER — dashboard (profile + registered events) */}
        <Route path="/user/dashboard" element={
          <ProtectedRoute><UserDashboard /></ProtectedRoute>
        } />

        {/* USER — browse & book events (FR-3.1) */}
        <Route path="/user/events" element={
          <ProtectedRoute><UserEventList /></ProtectedRoute>
        } />

        {/* ORGANIZER — CRUD events (Module 6.2) */}
        <Route path="/events/manage" element={
          <ProtectedRoute><EventList /></ProtectedRoute>
        } />
        <Route path="/events/create" element={
          <ProtectedRoute><CreateEvent /></ProtectedRoute>
        } />
        <Route path="/events/edit/:id" element={
          <ProtectedRoute><EditEvent /></ProtectedRoute>
        } />

        {/* ADMIN — user management (FR-6.1) */}
        <Route path="/admin/users" element={
          <ProtectedRoute><AdminUserManagement /></ProtectedRoute>
        } />

        {/* ADMIN — system reports (FR-6.2) */}
        <Route path="/admin/reports" element={
          <ProtectedRoute><AdminReports /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
