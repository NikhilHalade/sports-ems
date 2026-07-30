package com.sportsems.service;

import com.sportsems.dto.EventRequestDTO;
import com.sportsems.dto.EventResponseDTO;
import com.sportsems.entity.Event;
import com.sportsems.entity.Event.EventStatus;
import com.sportsems.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

    public EventServiceImpl(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Override @Transactional
    public EventResponseDTO createEvent(EventRequestDTO dto, String organizerEmail) {
        validateTimes(dto);
        Event event = mapToEntity(dto, new Event());
        event.setCreatedBy(organizerEmail);  // Feature 2: track owner
        return mapToDTO(eventRepository.save(event));
    }

    @Override @Transactional(readOnly = true)
    public List<EventResponseDTO> getAllEvents() {
        return eventRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public List<EventResponseDTO> getMyEvents(String organizerEmail) {
        // Feature 2: organizer sees only their own events
        return eventRepository.findByCreatedBy(organizerEmail)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override @Transactional(readOnly = true)
    public EventResponseDTO getEventById(Long id) {
        return mapToDTO(findOrThrow(id));
    }

    @Override @Transactional
    public EventResponseDTO updateEvent(Long id, EventRequestDTO dto,
                                         String organizerEmail, boolean isAdmin) {
        validateTimes(dto);
        Event event = findOrThrow(id);
        // Feature 2: only owner or admin can update
        if (!isAdmin && !organizerEmail.equals(event.getCreatedBy())) {
            throw new RuntimeException("FORBIDDEN: You can only edit your own events");
        }
        return mapToDTO(eventRepository.save(mapToEntity(dto, event)));
    }

    @Override @Transactional
    public void deleteEvent(Long id, String organizerEmail, boolean isAdmin) {
        Event event = findOrThrow(id);
        // Feature 2: only owner or admin can delete
        if (!isAdmin && !organizerEmail.equals(event.getCreatedBy())) {
            throw new RuntimeException("FORBIDDEN: You can only delete your own events");
        }
        eventRepository.delete(event);
    }

    private Event findOrThrow(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
    }

    private void validateTimes(EventRequestDTO dto) {
        if (dto.getStartTime() != null && dto.getEndTime() != null
                && !dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }
    }

    private Event mapToEntity(EventRequestDTO dto, Event event) {
        event.setEventName(dto.getEventName());
        event.setDescription(dto.getDescription());
        event.setVenue(dto.getVenue());
        event.setEventDate(dto.getEventDate());
        event.setStartTime(dto.getStartTime());
        event.setEndTime(dto.getEndTime());
        event.setMaxParticipants(dto.getMaxParticipants());
        event.setRegistrationFee(dto.getRegistrationFee());
        event.setStatus(dto.getStatus() != null ? dto.getStatus() : EventStatus.OPEN);
        if (event.getEventId() == null && dto.getMaxParticipants() != null) {
            event.setAvailableSeats(dto.getMaxParticipants());
        }
        return event;
    }

    private EventResponseDTO mapToDTO(Event e) {
        EventResponseDTO dto = new EventResponseDTO();
        dto.setEventId(e.getEventId());
        dto.setCreatedBy(e.getCreatedBy());
        dto.setEventName(e.getEventName());
        dto.setDescription(e.getDescription());
        dto.setVenue(e.getVenue());
        dto.setEventDate(e.getEventDate());
        dto.setStartTime(e.getStartTime());
        dto.setEndTime(e.getEndTime());
        dto.setMaxParticipants(e.getMaxParticipants());
        dto.setAvailableSeats(e.getAvailableSeats());
        dto.setRegistrationFee(e.getRegistrationFee());
        dto.setStatus(e.getStatus());
        dto.setCreatedAt(e.getCreatedAt());
        dto.setUpdatedAt(e.getUpdatedAt());
        return dto;
    }
}
