package com.sportsems.service;

import com.sportsems.dto.UserResponseDTO;
import com.sportsems.entity.Booking;
import com.sportsems.entity.Event;
import com.sportsems.entity.User;
import com.sportsems.repository.BookingRepository;
import com.sportsems.repository.EventRepository;
import com.sportsems.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepo;
    private final EventRepository eventRepo;
    private final BookingRepository bookingRepo;
    private final EmailService emailService;

    public AdminService(UserRepository userRepo, EventRepository eventRepo,
                        BookingRepository bookingRepo, EmailService emailService) {
        this.userRepo     = userRepo;
        this.eventRepo    = eventRepo;
        this.bookingRepo  = bookingRepo;
        this.emailService = emailService;
    }

    public List<UserResponseDTO> getAllUsers() {
        return userRepo.findAll().stream().map(this::mapUser).collect(Collectors.toList());
    }

    // Feature 3: get only pending users for approval
    public List<UserResponseDTO> getPendingUsers() {
        return userRepo.findAll().stream()
                .filter(u -> u.getStatus() == User.Status.PENDING_APPROVAL)
                .map(this::mapUser)
                .collect(Collectors.toList());
    }

    // Feature 3: Admin approves a pending user
    @Transactional
    public UserResponseDTO approveUser(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));
        if (user.getStatus() != User.Status.PENDING_APPROVAL)
            throw new RuntimeException("USER_NOT_PENDING");
        user.setStatus(User.Status.ACTIVE);
        userRepo.save(user);
        // Feature 1: email notification
        emailService.sendAccountApprovedEmail(user.getEmail(), user.getFullName());
        return mapUser(user);
    }

    // Feature 3: Admin rejects a pending user
    @Transactional
    public void rejectUser(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));
        userRepo.delete(user);
    }

    @Transactional
    public UserResponseDTO updateUserStatus(Long userId, String status) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));
        user.setStatus(User.Status.valueOf(status.toUpperCase()));
        if (user.getStatus() == User.Status.ACTIVE) {
            user.setFailedAttempts(0);
            user.setLockTime(null);
        } else if (user.getStatus() == User.Status.LOCKED) {
            // Feature 1: notify user of deactivation
            emailService.sendAccountDeactivatedEmail(user.getEmail(), user.getFullName());
        }
        return mapUser(userRepo.save(user));
    }

    @Transactional
    public UserResponseDTO updateUserRole(Long userId, String role) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));
        user.setRole(User.Role.valueOf(role.toUpperCase()));
        userRepo.save(user);
        // Feature 1: notify user of role change
        emailService.sendRoleChangedEmail(user.getEmail(), user.getFullName(), role);
        return mapUser(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        userRepo.findById(userId).ifPresent(userRepo::delete);
    }

    public Map<String, Object> generateReport() {
        Map<String, Object> report = new LinkedHashMap<>();
        List<Event> events = eventRepo.findAll();
        List<User> users = userRepo.findAll();
        List<Booking> bookings = bookingRepo.findAll();

        report.put("totalEvents", events.size());
        report.put("eventsByStatus", events.stream()
                .collect(Collectors.groupingBy(e -> e.getStatus().name(), Collectors.counting())));
        report.put("totalUsers", users.size());
        report.put("usersByRole", users.stream()
                .collect(Collectors.groupingBy(u -> u.getRole().name(), Collectors.counting())));
        report.put("usersByStatus", users.stream()
                .collect(Collectors.groupingBy(u -> u.getStatus().name(), Collectors.counting())));
        report.put("pendingApprovals", users.stream()
                .filter(u -> u.getStatus() == User.Status.PENDING_APPROVAL).count());
        report.put("totalBookings", bookings.size());
        report.put("confirmedBookings", bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED).count());
        report.put("cancelledBookings", bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CANCELLED).count());

        report.put("eventDetails", events.stream().map(e -> {
            Map<String, Object> d = new LinkedHashMap<>();
            d.put("eventId", e.getEventId());
            d.put("eventName", e.getEventName());
            d.put("createdBy", e.getCreatedBy());
            d.put("venue", e.getVenue());
            d.put("eventDate", e.getEventDate() != null ? e.getEventDate().toString() : "");
            d.put("status", e.getStatus().name());
            d.put("maxParticipants", e.getMaxParticipants());
            d.put("availableSeats", e.getAvailableSeats());
            long booked = (e.getMaxParticipants() != null && e.getAvailableSeats() != null)
                    ? (e.getMaxParticipants() - e.getAvailableSeats()) : 0;
            d.put("bookedSeats", booked);
            d.put("registrationFee", e.getRegistrationFee());
            return d;
        }).collect(Collectors.toList()));
        return report;
    }

    private UserResponseDTO mapUser(User u) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(u.getId());
        dto.setFullName(u.getFullName());
        dto.setEmail(u.getEmail());
        dto.setMobileNumber(u.getMobileNumber());
        dto.setRole(u.getRole());
        dto.setStatus(u.getStatus());
        dto.setFailedAttempts(u.getFailedAttempts());
        dto.setLastLogin(u.getLastLogin());
        dto.setCreatedAt(u.getCreatedAt());
        return dto;
    }
}
