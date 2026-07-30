package com.sportsems.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings",
       uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "user_email"}))
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(name = "booked_at")
    private LocalDateTime bookedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @PrePersist
    protected void onCreate() {
        this.bookedAt = LocalDateTime.now();
        if (this.status == null) this.status = BookingStatus.CONFIRMED;
    }

    public enum BookingStatus { CONFIRMED, CANCELLED }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public LocalDateTime getBookedAt() { return bookedAt; }
    public void setBookedAt(LocalDateTime bookedAt) { this.bookedAt = bookedAt; }
    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
}
