package com.kafica_blokadica.event.service;


import com.kafica_blokadica.config.SecurityUtils;
import com.kafica_blokadica.event.models.*;
import com.kafica_blokadica.event.repository.EventRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class EventService {


    private final EventRepository repo;
    private final SecureRandom random = new SecureRandom();


    @Transactional
    public EventResponse create(CreateEventRequest request)
    {
        String token = generateToken(24);

        Event event =  Event.builder()
                .title(request.title())
                .description(request.description())
                .deadline(request.deadline())
                .status(EventStatus.OPEN)
                .creatorUserId(SecurityUtils.getCurrentUserIdOrThrow())
                .inviteToken(token)
                .build();

        request.timeOptions().forEach(t ->
                event.getTimeOptions().add(TimeOption.builder()
                        .event(event)
                        .startsAt(t.startsAt())
                        .endsAt(t.endsAt())
                        .build())
        );

        request.placeOptions().forEach(p ->
                event.getPlaceOptions().add(PlaceOption.builder()
                        .event(event)
                        .name(p.name())
                        .address(p.address())
                        .lat(p.lat())
                        .lng(p.lng())
                        .build())
        );


        Event saved = repo.save(event);

        return toResponse(saved);


    }


    @Transactional(readOnly = true)
    public EventResponse getByInviteToken(String inviteToken)
    {

        return repo.findByInviteToken(inviteToken).map(this::toResponse).orElseThrow(
                ()-> new IllegalArgumentException("Invite " + inviteToken + " token do not exsit")
        );


    }








    private EventResponse toResponse(Event e) {

        return new EventResponse(
                e.getId(),
                e.getTitle(),
                e.getDescription(),
                e.getDeadline(),
                e.getStatus(),
                e.getInviteToken(),
                e.getTimeOptions().stream().map(t -> new EventResponse.TimeOpt(t.getId(), t.getStartsAt(), t.getEndsAt()))
                        .collect(Collectors.toList()),
                e.getPlaceOptions().stream().map(p -> new EventResponse.PlaceOpt(p.getId(), p.getName(), p.getAddress(), p.getLat(), p.getLng()))
                        .collect(Collectors.toList())

        );


    }


    private String generateToken(int bytes)
    {
        byte [] buf = new byte[bytes];
        random.nextBytes(buf);
        return HexFormat.of().formatHex(buf);

    }


    @Transactional(readOnly = true)
    public EventResponse getById(Long id) {
        return repo.findById(id).map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Event with ID: "+ id +" not found"));
    }
}
