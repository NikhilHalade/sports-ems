package com.sportsems.service;

import com.sportsems.dto.BookingResponseDTO;
import com.sportsems.entity.Booking;
import com.sportsems.entity.Event;
import com.sportsems.repository.BookingRepository;
import com.sportsems.repository.EventRepository;
import com.sportsems.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepo;
    private final EventRepository   eventRepo;
    private final UserRepository    userRepo;
    private final EmailService      emailService;

    public BookingService(BookingRepository bookingRepo, EventRepository eventRepo,
                          UserRepository userRepo, EmailService emailService) {
        this.bookingRepo  = bookingRepo;
        this.eventRepo    = eventRepo;
        this.userRepo     = userRepo;
        this.emailService = emailService;
    }

    public BookingResponseDTO bookSeat(Long eventId, String userEmail) {
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("EVENT_NOT_FOUND"));

        if (event.getStatus() != Event.EventStatus.OPEN)
            throw new RuntimeException("EVENT_NOT_OPEN");

        bookingRepo.findByEvent_EventIdAndUserEmail(eventId, userEmail)
                .ifPresent(b -> {
                    if (b.getStatus() == Booking.BookingStatus.CONFIRMED)
                        throw new RuntimeException("ALREADY_BOOKED");
                });

        if (event.getAvailableSeats() != null && event.getAvailableSeats() <= 0)
            throw new RuntimeException("NO_SEATS_AVAILABLE");

        if (event.getAvailableSeats() != null) {
            event.setAvailableSeats(event.getAvailableSeats() - 1);
            eventRepo.save(event);
        }

        Booking booking = bookingRepo
                .findByEvent_EventIdAndUserEmail(eventId, userEmail)
                .orElse(new Booking());
        booking.setEvent(event);
        booking.setUserEmail(userEmail);
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking.setCancelledAt(null);
        if (booking.getBookedAt() == null) booking.setBookedAt(LocalDateTime.now());

        Booking saved = bookingRepo.save(booking);

        // Feature 1: send confirmation email
        String userName = userRepo.findByEmail(userEmail)
                .map(u -> u.getFullName()).orElse(userEmail);
        emailService.sendBookingConfirmationEmail(
                userEmail, userName, event.getEventName(), event.getVenue(),
                event.getEventDate() != null ? event.getEventDate().toString() : "TBA",
                saved.getId()
        );

        return mapToDTO(saved);
    }

    public BookingResponseDTO cancelBooking(Long eventId, String userEmail) {
        Booking booking = bookingRepo
                .findByEvent_EventIdAndUserEmail(eventId, userEmail)
                .orElseThrow(() -> new RuntimeException("BOOKING_NOT_FOUND"));

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED)
            throw new RuntimeException("ALREADY_CANCELLED");

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());

        Event event = booking.getEvent();
        if (event.getAvailableSeats() != null && event.getMaxParticipants() != null) {
            event.setAvailableSeats(Math.min(event.getAvailableSeats() + 1, event.getMaxParticipants()));
            eventRepo.save(event);
        }

        Booking saved = bookingRepo.save(booking);

        // Feature 1: send cancellation email
        String userName = userRepo.findByEmail(userEmail)
                .map(u -> u.getFullName()).orElse(userEmail);
        emailService.sendBookingCancellationEmail(
                userEmail, userName, event.getEventName(), saved.getId()
        );

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getMyBookings(String userEmail) {
        return bookingRepo.findByUserEmail(userEmail)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getBookingsForEvent(Long eventId) {
        return bookingRepo.findByEvent_EventId(eventId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private BookingResponseDTO mapToDTO(Booking b) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setBookingId(b.getId());
        dto.setEventId(b.getEvent().getEventId());
        dto.setEventName(b.getEvent().getEventName());
        dto.setVenue(b.getEvent().getVenue());
        dto.setEventDate(b.getEvent().getEventDate() != null
                ? b.getEvent().getEventDate().toString() : null);
        dto.setUserEmail(b.getUserEmail());
        dto.setStatus(b.getStatus());
        dto.setBookedAt(b.getBookedAt());
        dto.setCancelledAt(b.getCancelledAt());
        return dto;
    }
}
