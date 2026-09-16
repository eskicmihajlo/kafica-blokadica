package com.kafica_blokadica.event.service;


import com.kafica_blokadica.auth.entity.User;
import com.kafica_blokadica.auth.repository.UserRepository;
import com.kafica_blokadica.config.SecurityUtils;
import com.kafica_blokadica.event.dtos.InvitePreviewResponse;
import com.kafica_blokadica.event.dtos.VotesUpdatedMessage;
import com.kafica_blokadica.event.models.Event;
import com.kafica_blokadica.event.models.EventParticipant;
import com.kafica_blokadica.event.models.EventStatus;
import com.kafica_blokadica.event.repository.EventParticipantRepository;
import com.kafica_blokadica.event.repository.EventRepository;
import com.kafica_blokadica.exception.ConflictException;
import com.kafica_blokadica.exception.EventNotFoundException;
import com.kafica_blokadica.exception.EventStatusException;
import com.kafica_blokadica.exception.UserNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.time.OffsetDateTime;
import java.util.Objects;

import static com.kafica_blokadica.config.SecurityUtils.getCurrentUserIdOrThrow;

@Service
@AllArgsConstructor
public class InviteService {


    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventParticipantRepository eventParticipantRepository;

    private final SimpMessagingTemplate messagingTemplate;


    @Transactional(readOnly = true)
    public InvitePreviewResponse preview(String token) {

        Long currentUserId = SecurityUtils.getCurrentUserIdOrThrow();


        Event event = eventRepository.findByInviteToken(token)
                .orElseThrow(() -> new EventNotFoundException("Event do not exist"));


        if(event.getStatus() != EventStatus.OPEN)
        {
           throw new EventStatusException("Event is not in open status");
        }

        User creator = userRepository.findById(event.getCreatorUserId())
                .orElseThrow(() -> new UserNotFoundException("Event do not have creator"));

        if(Objects.equals(currentUserId, creator.getId()))
        {
            throw new ConflictException("You are the creator of this event and cannot proceed");
        }

        return new InvitePreviewResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getDeadline(),
                event.getStatus(),
                new InvitePreviewResponse.Creator(creator.getId(), creator.getDisplayName())
        );
    }

    @Transactional
    public void  joinByToken(String token)
    {

        Long userId = getCurrentUserIdOrThrow();

        Event event = eventRepository.findByInviteToken(token)
                .orElseThrow(()-> new IllegalArgumentException("Invite token do not exist"));

        if(event.getStatus() != EventStatus.OPEN)
        {
            throw new IllegalArgumentException("Event is not open for joining");
        }

        messagingTemplate.convertAndSend("/topic/events/" + event.getId(),
                new VotesUpdatedMessage("EVENT_JOIN", event.getId(), userId, OffsetDateTime.now()));



        eventParticipantRepository.findByEventIdAndUserId(event.getId(), userId)
                .orElseGet(()-> eventParticipantRepository.save(
                        EventParticipant.builder()
                                .joinedAt(OffsetDateTime.now())
                                .eventId(event.getId())
                                .userId(userId)
                                .build()
                ));




    }





}
