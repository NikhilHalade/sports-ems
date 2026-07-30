package com.sportsems.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String mobileNumber;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private Status status;

    private String verificationToken;
    private String otp;
    private LocalDateTime otpExpiry;
    private int failedAttempts;
    private LocalDateTime lockTime;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        failedAttempts = 0;
    }

    public enum Role { ADMIN, ORGANIZER, USER }

    /**
     * ACTIVE            — can login normally
     * PENDING_APPROVAL  — Feature 3: ORGANIZER/ADMIN waiting for admin to approve
     * LOCKED            — too many failed attempts
     */
    public enum Status { PENDING_APPROVAL, ACTIVE, LOCKED }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mob) { this.mobileNumber = mob; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public String getVerificationToken() { return verificationToken; }
    public void setVerificationToken(String t) { this.verificationToken = t; }
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
    public LocalDateTime getOtpExpiry() { return otpExpiry; }
    public void setOtpExpiry(LocalDateTime otpExpiry) { this.otpExpiry = otpExpiry; }
    public int getFailedAttempts() { return failedAttempts; }
    public void setFailedAttempts(int f) { this.failedAttempts = f; }
    public LocalDateTime getLockTime() { return lockTime; }
    public void setLockTime(LocalDateTime t) { this.lockTime = t; }
    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime t) { this.lastLogin = t; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
