package com.kafica_blokadica.event.service;


import com.kafica_blokadica.config.SecurityUtils;
import com.kafica_blokadica.event.dtos.AddTimeOptionRequest;
import com.kafica_blokadica.event.models.Event;
import com.kafica_blokadica.event.models.EventStatus;
import com.kafica_blokadica.event.models.TimeOption;
import com.kafica_blokadica.event.repository.EventRepository;
import com.kafica_blokadica.event.repository.TimeOptionRepository;
import com.kafica_blokadica.exception.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@AllArgsConstructor
@Service
public class EventOptionsService {

    private final EventRepository eventRepository;
    private final TimeOptionRepository timeOptionRepository;


    @Transactional
    public boolean addTimeOption(Long eventId, AddTimeOptionRequest request)
    {

        Event event = requireCreatorOpen(eventId);

        if(request.statsAt() != null && request.endsAt() != null && request.endsAt().isBefore(request.statsAt()))
        {
            throw new IllegalArgumentException("endsAt must be before startsAt");
        }

        TimeOption timeOption = TimeOption.builder()
                .event(event)
                .startsAt(request.statsAt())
                .endsAt(request.endsAt())
                .active(true)
                .build();

        timeOptionRepository.save(timeOption);

        return true;


    }

    @Transactional
    public boolean removeTimeOption(Long eventId, Long timeOptionId)
    {

        Event event = requireCreatorOpen(eventId);


        TimeOption timeOption = timeOptionRepository.findByEventIdAndIdAndActiveTrue(eventId, timeOptionId)
                .orElseThrow(()-> new NotFoundException("TimeOption not found "));
        


    }





    public Event requireCreatorOpen(Long eventId)
    {

        Long userId = SecurityUtils.getCurrentUserIdOrThrow();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(()-> new EventNotFoundException("Event not found"));

        if(!event.getCreatorUserId().equals(userId))
        {
            throw new NotCreatorException("Only creator can edit options");
        }

        if(event.getStatus() != EventStatus.OPEN)
        {
            throw new EventStatusException("Event is not open");
        }

        if(event.getDeadline().isBefore(OffsetDateTime.now()))
        {
            throw new DeadLineException("Deadline has passed");
        }

        return event;

    }





}
