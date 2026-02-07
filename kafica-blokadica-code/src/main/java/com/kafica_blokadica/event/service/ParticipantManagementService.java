package com.kafica_blokadica.event.service;

import com.kafica_blokadica.config.SecurityUtils;
import com.kafica_blokadica.event.dtos.ParticipantUpdateMessage;
import com.kafica_blokadica.event.models.Event;
import com.kafica_blokadica.event.models.EventStatus;
import com.kafica_blokadica.event.repository.EventParticipantRepository;
import com.kafica_blokadica.event.repository.EventRepository;
import com.kafica_blokadica.event.repository.PlaceVoteRepository;
import com.kafica_blokadica.event.repository.TimeVoteRepository;
import com.kafica_blokadica.exception.ConflictException;
import com.kafica_blokadica.exception.EventNotFoundException;
import com.kafica_blokadica.exception.EventStatusException;
import com.kafica_blokadica.exception.NotParticipantException;
import lombok.AllArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@AllArgsConstructor
public class ParticipantManagementService {



    private final EventParticipantRepository eventParticipantRepository;
    private final PlaceVoteRepository placeVoteRepository;
    private final TimeVoteRepository timeVoteRepository;
    private final EventRepository eventRepository;
    private final SimpMessagingTemplate template;


    @Transactional
    public void leave(Long eventId)
    {


        Long userId = SecurityUtils.getCurrentUserIdOrThrow();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(()->new EventNotFoundException("Event with ID: "+ eventId +" not found"));


        if(event.getStatus()!= EventStatus.OPEN)
        {
            throw new EventStatusException("Event is not in OPEN state");
        }

        if(event.getCreatorUserId().equals(userId))
        {
            throw new ConflictException("User with ID: "+userId+" is not creator of the event: "+ eventId);
        }

        if(!eventParticipantRepository.existsByEventIdAndUserId(eventId,userId))
        {
            throw new NotParticipantException("User with ID: "+userId+" is not creator of the event: "+eventId);
        }


        //Cleaup
        timeVoteRepository.deleteAllByEventIdAndUserId(eventId,userId);
        placeVoteRepository.deleteAllByEventIdAndUserId(eventId, userId);
        eventParticipantRepository.deleteByEventIdAndUserId(eventId,userId);

        template.convertAndSend("/topic/events/"+ eventId,
               new ParticipantUpdateMessage("PARTICIPANT_LEFT", eventId, userId, OffsetDateTime.now()));



    }


    @Transactional
    public void kick(Long eventId, Long targetUserId)
    {

        Long actorId = SecurityUtils.getCurrentUserIdOrThrow();
        Event event = eventRepository.findById(eventId)
                .orElseThrow(()->new EventNotFoundException("Event with ID: "+ eventId +" not found"));

        if(!actorId.equals(event.getCreatorUserId()))
        {
            throw new ConflictException("Only creator can kick  participants");
        }

        if(event.getStatus()!= EventStatus.OPEN)
        {
            throw new EventStatusException("Event is not in OPEN state");
        }

        if(actorId.equals(targetUserId))
        {
            throw new ConflictException("Creator cant kick themselves");
        }

        if(!eventParticipantRepository.existsByEventIdAndUserId(eventId,targetUserId))
        {
            throw new NotParticipantException("Target user is not participant of the event: " +eventId);
        }

        //Cleaup
        timeVoteRepository.deleteAllByEventIdAndUserId(eventId,targetUserId);
        placeVoteRepository.deleteAllByEventIdAndUserId(eventId, targetUserId);
        eventParticipantRepository.deleteByEventIdAndUserId(eventId,targetUserId);

        template.convertAndSend("/topic/events/"+ eventId,
                new ParticipantUpdateMessage("PARTICIPANT_KICKED", eventId, targetUserId, OffsetDateTime.now()));


    }





}
