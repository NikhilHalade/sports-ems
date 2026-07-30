package com.sportsems.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Handles all outgoing email notifications via the Resend HTTP API
 * (https://resend.com). Render's free tier blocks outbound SMTP ports
 * (25/465/587), so we send over HTTPS instead — this is not blocked.
 *
 * Set app.email.enabled=false in application.properties to disable.
 * NOTE: @Async is on each public method (not on private sendEmail)
 *       to avoid Spring self-invocation proxy bypass issue.
 */
@Service
public class EmailService {

    private static final String RESEND_ENDPOINT = "https://api.resend.com/emails";

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    // Sandbox default until you verify your own domain on Resend.
    // Once verified, set app.email.from to e.g. noreply@yourdomain.com
    @Value("${app.email.from:onboarding@resend.dev}")
    private String fromEmail;

    @Value("${resend.api-key:}")
    private String resendApiKey;

    private void send(String to, String subject, String body) {
        if (!emailEnabled) {
            System.out.println("[EMAIL DISABLED] To: " + to + " | Subject: " + subject);
            return;
        }
        if (resendApiKey == null || resendApiKey.isBlank()) {
            System.err.println("[EMAIL ERROR] RESEND_API_KEY is not set — skipping send to " + to);
            return;
        }
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("from", fromEmail);
            payload.put("to", new String[] { to });
            payload.put("subject", subject);
            payload.put("text", body);

            String json = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(RESEND_ENDPOINT))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                System.out.println("[EMAIL SENT] To: " + to);
            } else {
                // Never crash the main flow due to email failure — just log it.
                System.err.println("[EMAIL ERROR] Resend returned " + response.statusCode()
                        + " for " + to + ": " + response.body());
            }
        } catch (Exception e) {
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
