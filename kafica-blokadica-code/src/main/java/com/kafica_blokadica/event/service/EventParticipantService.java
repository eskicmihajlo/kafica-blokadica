package com.kafica_blokadica.event.service;

import com.kafica_blokadica.auth.entity.User;
import com.kafica_blokadica.auth.repository.UserRepository;
import com.kafica_blokadica.config.SecurityUtils;
import com.kafica_blokadica.event.models.Event;
import com.kafica_blokadica.event.models.EventParticipant;
import com.kafica_blokadica.event.dtos.ParticipantStatusResponse;
import com.kafica_blokadica.event.repository.EventParticipantRepository;
import com.kafica_blokadica.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static com.kafica_blokadica.config.SecurityUtils.getCurrentUserIdOrThrow;

@Service
@RequiredArgsConstructor
public class EventParticipantService {

    private final EventParticipantRepository eventParticipantRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;



    @Transactional(readOnly = true)
    public ParticipantStatusResponse getStatus(Long eventId)
    {

        Long userId = SecurityUtils.getCurrentUserIdOrThrow();

        if(!eventParticipantRepository.existsByEventIdAndUserId(eventId, userId))
        {
            throw new IllegalArgumentException("User is not a participant of this event");
        }


        List<EventParticipant> participants = eventParticipantRepository.findAllByEventId(eventId);



        long total = participants.size();
        long responded = participants.stream().filter(p-> p.getRespondedAt() != null).count();


        List<EventParticipant> waiting = participants.stream()
                .filter(p-> p.getRespondedAt() == null).toList();

        Set<Long> waitingUserIds = waiting.stream().map(
                EventParticipant::getUserId
        ).collect(Collectors.toSet());

        Map<Long, User> usersById = new HashMap<>();
        if(!waitingUserIds.isEmpty())
        {
            for(User user : userRepository.findAllById(waitingUserIds))
            {
                usersById.put(user.getId(), user);
            }
        }

        List<ParticipantStatusResponse.UserRow> waitingRows = waiting.stream()
                .map(p -> {
                    User u = usersById.get(p.getUserId());
                    String dn = (u != null) ? u.getDisplayName() : ("user#" + p.getUserId());
                    return new ParticipantStatusResponse.UserRow(p.getUserId(), dn);
                })
                .sorted(Comparator.comparing(ParticipantStatusResponse.UserRow::displayName, String.CASE_INSENSITIVE_ORDER))
                .toList();

        return new ParticipantStatusResponse(eventId, total, responded, waitingRows);

    }


    @Transactional
    public boolean markFirst(Long eventId, Long userId )
    {
        EventParticipant  eventParticipant = eventParticipantRepository.findByEventIdAndUserId(eventId,userId)
                .orElseThrow(() -> new IllegalArgumentException("User is not a participant of this event"));


        if(eventParticipant.getRespondedAt() != null)
        {
            return false;
        }

        eventParticipant.setRespondedAt(OffsetDateTime.now());
        eventParticipantRepository.save(eventParticipant);
        return true;

    }







}
