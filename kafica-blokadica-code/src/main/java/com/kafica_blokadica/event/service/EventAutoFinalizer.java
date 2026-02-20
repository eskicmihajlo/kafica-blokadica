package com.kafica_blokadica.event.service;


import com.kafica_blokadica.event.models.Event;
import com.kafica_blokadica.event.models.EventStatus;
import com.kafica_blokadica.event.models.FinalizionMethod;
import com.kafica_blokadica.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class EventAutoFinalizer {


    private final EventRepository eventRepository;
    private final FinalizeEventService finalizeEventService;




    @Scheduled(cron = "${app.scheduling.deadline-check}")
    public void checkDeadlines()
    {
        OffsetDateTime now = OffsetDateTime.now();

        List<Event> expiredEvents = eventRepository.findAllByStatusAndDeadlineBefore(
                EventStatus.OPEN, now);

        for(Event event : expiredEvents)
        {
            finalizeEventService.processFinalization(event.getId(), FinalizionMethod.AUTO);
        }

    }










}
