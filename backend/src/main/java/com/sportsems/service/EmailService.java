package com.sportsems.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Handles all outgoing email notifications.
 * Set app.email.enabled=false in application.properties to disable.
 * NOTE: @Async is on each public method (not on private sendEmail)
 *       to avoid Spring self-invocation proxy bypass issue.
 */
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    @Value("${app.email.from:noreply@sportsems.com}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private void send(String to, String subject, String body) {
        if (!emailEnabled) {
            System.out.println("[EMAIL DISABLED] To: " + to + " | Subject: " + subject);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("[EMAIL SENT] To: " + to);
        } catch (Exception e) {
            // Never crash the main flow due to email failure
            System.err.println("[EMAIL ERROR] Failed to send to " + to + ": " + e.getMessage());
        }
    }

    @Async
    public void sendWelcomeEmail(String to, String name) {
        send(to, "Welcome to Sports EMS!",
                "Hi " + name + ",\n\nWelcome to Sports EMS! Your account is ready.\n\n"
                + "Login at: http://localhost:5173/login\n\nSports EMS Team");
    }

    @Async
    public void sendPendingApprovalEmail(String to, String name, String role) {
        send(to, "Account Pending Approval — Sports EMS",
                "Hi " + name + ",\n\nYour " + role + " account is PENDING APPROVAL.\n"
                + "An admin will review your request and notify you by email.\n\nSports EMS Team");
    }

    @Async
    public void sendAccountApprovedEmail(String to, String name) {
        send(to, "Account Approved — Sports EMS",
                "Hi " + name + ",\n\nYour account has been approved!\n"
                + "Login at: http://localhost:5173/login\n\nSports EMS Team");
    }

    @Async
    public void sendAccountDeactivatedEmail(String to, String name) {
        send(to, "Account Deactivated — Sports EMS",
                "Hi " + name + ",\n\nYour account has been deactivated by an administrator.\n"
                + "Contact support if you believe this is a mistake.\n\nSports EMS Team");
    }

    @Async
    public void sendBookingConfirmationEmail(String to, String userName, String eventName,
                                              String venue, String eventDate, Long bookingId) {
        send(to, "Booking Confirmed — " + eventName,
                "Hi " + userName + ",\n\nYour seat is confirmed!\n\n"
                + "Booking ID : #" + bookingId + "\n"
                + "Event      : " + eventName + "\n"
                + "Venue      : " + venue + "\n"
                + "Date       : " + eventDate + "\n\n"
                + "Please arrive 15 minutes early.\n\nSports EMS Team");
    }

    @Async
    public void sendBookingCancellationEmail(String to, String userName,
                                              String eventName, Long bookingId) {
        send(to, "Booking Cancelled — " + eventName,
                "Hi " + userName + ",\n\nYour booking #" + bookingId
                + " for \"" + eventName + "\" has been cancelled.\n"
                + "The seat has been released.\n\nSports EMS Team");
    }

    @Async
    public void sendOtpEmail(String to, String name, String otp) {
        send(to, "Password Reset OTP — Sports EMS",
                "Hi " + name + ",\n\nYour OTP is: " + otp
                + "\n\nValid for 10 minutes. Do not share this.\n\nSports EMS Team");
    }

    @Async
    public void sendRoleChangedEmail(String to, String name, String newRole) {
        send(to, "Role Updated — Sports EMS",
                "Hi " + name + ",\n\nYour role has been updated to: " + newRole
                + "\nThis takes effect on your next login.\n\nSports EMS Team");
    }
}
