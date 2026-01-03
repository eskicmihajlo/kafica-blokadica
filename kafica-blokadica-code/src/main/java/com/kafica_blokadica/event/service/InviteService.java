package com.kafica_blokadica.event.service;


import com.kafica_blokadica.auth.entity.User;
import com.kafica_blokadica.auth.repository.UserRepository;
import com.kafica_blokadica.event.dtos.InvitePreviewResponse;
import com.kafica_blokadica.event.models.Event;
import com.kafica_blokadica.event.models.EventParticipant;
import com.kafica_blokadica.event.models.EventStatus;
import com.kafica_blokadica.event.repository.EventParticipantRepository;
import com.kafica_blokadica.event.repository.EventRepository;
import com.kafica_blokadica.exception.EventNotFoundException;
import com.kafica_blokadica.exception.UserNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.time.OffsetDateTime;

import static com.kafica_blokadica.config.SecurityUtils.getCurrentUserIdOrThrow;

@Service
@AllArgsConstructor
public class InviteService {


    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventParticipantRepository eventParticipantRepository;


    @Transactional(readOnly = true)
    public InvitePreviewResponse preview(String token) {

        Event event = eventRepository.findByInviteToken(token)
                .orElseThrow(() -> new EventNotFoundException("Event do not exist"));

        User creator = userRepository.findById(event.getCreatorUserId())
                .orElseThrow(() -> new UserNotFoundException("Event do not have creator"));

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

        Event evet = eventRepository.findByInviteToken(token)
                .orElseThrow(()-> new IllegalArgumentException("Invite token do not exist"));

        if(evet.getStatus() != EventStatus.OPEN)
        {
            throw new IllegalArgumentException("Event is not open for joining");
        }



        eventParticipantRepository.findByEventIdAndUserId(evet.getId(), userId)
                .orElseGet(()-> eventParticipantRepository.save(
                        EventParticipant.builder()
                                .joinedAt(OffsetDateTime.now())
                                .eventId(evet.getId())
                                .userId(userId)
                                .build()
                ));




    }





}
