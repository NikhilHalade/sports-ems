import axios from "axios";
import { getToken } from "../utils/auth";
import { API_BASE_URL } from "../config/api";

const BASE_URL = `${API_BASE_URL}/api`;

function getHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeError(error) {
  if (error.response?.data)
    return { status: error.response.status,
             message: error.response.data.message || error.response.data.error || "Something went wrong." };
  if (error.request)
    return { status: null, message: "Unable to reach the server. Please try again in a moment." };
  return { status: null, message: error.message || "An unexpected error occurred." };
}

const eventService = {
  async getAllEvents() {
    try { return (await axios.get(`${BASE_URL}/events`, { headers: getHeaders() })).data; }
    catch (e) { throw normalizeError(e); }
  },
  async getMyEvents() {
    try { return (await axios.get(`${BASE_URL}/events/my`, { headers: getHeaders() })).data; }
    catch (e) { throw normalizeError(e); }
  },
  async getEventById(id) {
    try { return (await axios.get(`${BASE_URL}/events/${id}`, { headers: getHeaders() })).data; }
    catch (e) { throw normalizeError(e); }
  },
  async createEvent(data) {
    try { return (await axios.post(`${BASE_URL}/events`, data, { headers: getHeaders() })).data; }
    catch (e) { throw normalizeError(e); }
  },
  async updateEvent(id, data) {
    try { return (await axios.put(`${BASE_URL}/events/${id}`, data, { headers: getHeaders() })).data; }
    catch (e) { throw normalizeError(e); }
  },
  async deleteEvent(id) {
    try { await axios.delete(`${BASE_URL}/events/${id}`, { headers: getHeaders() }); }
    catch (e) { throw normalizeError(e); }
  },
  async bookSeat(eventId) {
    try { return (await axios.post(`${BASE_URL}/bookings/events/${eventId}/book`, {}, { headers: getHeaders() })).data; }
    catch (e) { throw normalizeError(e); }
  },
  async cancelBooking(eventId) {
    try { return (await axios.delete(`${BASE_URL}/bookings/events/${eventId}/cancel`, { headers: getHeaders() })).data; }
    catch (e) { throw normalizeError(e); }
  },
  async getMyBookings() {
    try { return (await axios.get(`${BASE_URL}/bookings/my`, { headers: getHeaders() })).data; }
    catch (e) { throw normalizeError(e); }
  },
  async getAllUsers() {
    try { return (await axios.get(`${BASE_URL}/admin/users`, { headers: getHeaders() })).data; }
    catch (e) { throw normalizeError(e); }
  },
  async getPendingUsers() {
    try { return (await axios.get(`${BASE_URL}/admin/users/pending`, { headers: getHeaders() })).data; }
    catch (e) { throw normalizeError(e); }
  },
  async approveUser(id) {
    try { return (await axios.patch(`${BASE_URL}/admin/users/${id}/approve`, {}, { headers: getHeaders() })).data; }
    catch (e) { throw normalizeError(e); }
  },
  async rejectUser(id) {
    try { await axios.delete(`${BASE_URL}/admin/users/${id}/reject`, { headers: getHeaders() }); }
    catch (e) { throw normalizeError(e); }
  },
  async updateUserStatus(id, status) {
    try { return (await axios.patch(`${BASE_URL}/admin/users/${id}/status`, { status }, { headers: getHeaders() })).data; }
    catch (e) { throw normalizeError(e); }
  },
  async updateUserRole(id, role) {
    try { return (await axios.patch(`${BASE_URL}/admin/users/${id}/role`, { role }, { headers: getHeaders() })).data; }
    catch (e) { throw normalizeError(e); }
  },
  async deleteUser(id) {
    try { await axios.delete(`${BASE_URL}/admin/users/${id}`, { headers: getHeaders() }); }
    catch (e) { throw normalizeError(e); }
  },
  async getAdminReport() {
    try { return (await axios.get(`${BASE_URL}/admin/reports`, { headers: getHeaders() })).data; }
    catch (e) { throw normalizeError(e); }
  },
};

export default eventService;
