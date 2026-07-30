package com.sportsems.controller;

import com.sportsems.dto.BookingResponseDTO;
import com.sportsems.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // POST /api/bookings/events/{eventId}/book
    @PostMapping("/events/{eventId}/book")
    public ResponseEntity<?> bookSeat(@PathVariable Long eventId, Authentication auth) {
        try {
            String email = auth.getName();
            BookingResponseDTO booking = bookingService.bookSeat(eventId, email);
            return new ResponseEntity<>(booking, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            String msg = switch (e.getMessage()) {
                case "EVENT_NOT_FOUND"     -> "Event not found.";
                case "EVENT_NOT_OPEN"      -> "This event is not open for registration.";
                case "ALREADY_BOOKED"      -> "You have already registered for this event.";
                case "NO_SEATS_AVAILABLE"  -> "No seats available. This event is full.";
                default -> e.getMessage();
            };
            HttpStatus status = "NO_SEATS_AVAILABLE".equals(e.getMessage())
                    ? HttpStatus.BAD_REQUEST : HttpStatus.CONFLICT;
            return ResponseEntity.status(status).body(Map.of("error", msg));
        }
    }

    // DELETE /api/bookings/events/{eventId}/cancel
    @DeleteMapping("/events/{eventId}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long eventId, Authentication auth) {
        try {
            String email = auth.getName();
            BookingResponseDTO booking = bookingService.cancelBooking(eventId, email);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // GET /api/bookings/my — current user's bookings
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(Authentication auth) {
        return ResponseEntity.ok(bookingService.getMyBookings(auth.getName()));
    }

    // GET /api/bookings/events/{eventId} — organizer/admin only
    @GetMapping("/events/{eventId}")
    public ResponseEntity<List<BookingResponseDTO>> getEventBookings(@PathVariable Long eventId) {
        return ResponseEntity.ok(bookingService.getBookingsForEvent(eventId));
    }
}
