package com.kafica_blokadica.event.service;

import com.kafica_blokadica.config.SecurityUtils;
import com.kafica_blokadica.event.dtos.MyEventRow;
import com.kafica_blokadica.event.dtos.MyEventsResponse;
import com.kafica_blokadica.event.models.Event;
import com.kafica_blokadica.event.models.EventParticipant;
import com.kafica_blokadica.event.repository.EventParticipantRepository;
import com.kafica_blokadica.event.repository.EventRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class MyEventsService {


    private final EventParticipantRepository eventParticipantRepository;
    private final EventRepository eventRepository;


    @Transactional(readOnly = true)
    public MyEventsResponse listMine()
    {

        Long userId = SecurityUtils.getCurrentUserIdOrThrow();

        List<EventParticipant> parts = eventParticipantRepository.findAllByUserIdOrderByJoinedAtDesc(userId);

        if(parts.isEmpty()) return new MyEventsResponse(List.of());

        List<Long> eventIds = parts.stream().map(EventParticipant::getEventId).toList();

        Map<Long, Event> eventsById = new HashMap<>();

        for(Event e : eventRepository.findAllByIdIn(eventIds))
        {
            eventsById.put(e.getId(), e);
        }

        Map<Long, EventParticipant> partByEventID = parts.stream().collect(Collectors.toMap(
                EventParticipant::getEventId , Function.identity(), (a,b) -> a
        ));

        List<MyEventRow> rows = eventIds.stream()
                .map(eventsById::get)
                .filter(Objects::nonNull)
                .map(e -> {
                    EventParticipant p = partByEventID.get(e.getId());
                    boolean isCreator = userId.equals(e.getCreatorUserId());
                    String token = isCreator ? e.getInviteToken() : null;

                    return new MyEventRow(
                            e.getId(),
                            e.getTitle(),
                            e.getDeadline(),
                            e.getStatus(),
                            isCreator,
                            (p != null) ? p.getRespondedAt() : null,
                            token
                    );
                })
                .sorted(Comparator.comparing(MyEventRow::deadline))
                .toList();


        return new MyEventsResponse(rows);





    }


}
