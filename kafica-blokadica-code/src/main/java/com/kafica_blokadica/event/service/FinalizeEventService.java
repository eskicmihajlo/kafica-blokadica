package com.kafica_blokadica.event.service;

import com.kafica_blokadica.config.SecurityUtils;
import com.kafica_blokadica.event.dtos.FinalizeEventResponse;
import com.kafica_blokadica.event.dtos.FinalizeManualRequest;
import com.kafica_blokadica.event.dtos.VotesUpdatedMessage;
import com.kafica_blokadica.event.models.*;
import com.kafica_blokadica.event.repository.*;
import com.kafica_blokadica.exception.ConflictException;
import com.kafica_blokadica.exception.EventNotFoundException;
import com.kafica_blokadica.exception.EventStatusException;
import lombok.AllArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

@Service
@AllArgsConstructor
public class FinalizeEventService {

    private final EventRepository eventRepository;
    private final TimeOptionRepository timeOptionRepository;
    private final PlaceOptionRepository placeOptionRepository;
    private final PlaceVoteRepository placeVoteRepository;
    private final TimeVoteRepository timeVoteRepository;
    private final SimpMessagingTemplate messagingTemplate;






    private Long pickBestTimeOption(Long eventId, List<TimeOption> timeOptions) {
        if(timeOptions.isEmpty()) return null;

        Map<Long,int[]> counts = new HashMap<>();
        for(TimeOption to: timeOptions) counts.put(to.getId() , new int[]{0,0,0});

        for(TimeVote tv : timeVoteRepository.findAllByEventId(eventId)) {
            int[] c = counts.get(tv.getTimeOptionId());
            if(c==null) continue;
            if(tv.getVote() == TimeVoteValue.YES) c[0]++;
            else if (tv.getVote()== TimeVoteValue.NO) c[1]++;
            else if (tv.getVote()== TimeVoteValue.MAYBE) c[2]++;
        }

        TimeOption bestOption = timeOptions.stream()
                .min(Comparator.comparingLong((TimeOption t) -> {
                            int[] c = counts.get(t.getId());
                            long score = (c[0] * 2L) + (c[2] * 1L) - (c[1] * 1L);
                            return -score;
                        })
                        .thenComparingLong(TimeOption::getId))
                .orElse(null);

        if(bestOption == null) return null;

        int[] bc = counts.get(bestOption.getId());
        long bestScore = (bc[0] * 2L) + (bc[2] * 1L) - (bc[1] * 1L);


        if (bestScore < 2) return null;

        return bestOption.getId();
    }

    private Long pickBestPlaceOption(Long eventId, List<PlaceOption> placeOptions) {

        if (placeOptions.isEmpty()) return null;


        //counts: optionId -> [likeCount, dislikeCount]
        Map<Long, int[]> counts = new HashMap<>();
        /// 1 : [0,0]
        for(PlaceOption pl : placeOptions) counts.put(pl.getId(), new int[]{0,0});

        for(PlaceVote pv : placeVoteRepository.findAllByEventId(eventId))
        {
            int[] c = counts.get(pv.getPlaceOptionId());
            if(c==null) continue;

            /// 2 : [2,3] , 3:[3:2]
            if(pv.getVote() == PlaceVoteValue.LIKE) c[0]++;
            else if(pv.getVote() == PlaceVoteValue.DISLIKE) c[1]++;


        }

        PlaceOption bestOption = placeOptions.stream()
                .min(Comparator
                        .comparingLong((PlaceOption p)-> {
                            int[] c = counts.getOrDefault(p.getId(), new int[]{0,0});
                            long score  = (long)c[0] - c[1];
                            return -score;

                        })
                        .thenComparingLong(PlaceOption::getId))
                .orElse(null);

        if(bestOption == null) return null;


        int[] bc = counts.get(bestOption.getId());
        if (bc[0] == 0) {
            return null;
        }

        return bestOption.getId();


    }



    public FinalizeEventResponse finalizeEventManual(Long eventId, FinalizeManualRequest request) {

        Long userId = SecurityUtils.getCurrentUserIdOrThrow();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(()-> new IllegalArgumentException("Evenet with ID: " + eventId +" do not exist"));

        if(event.getStatus() != EventStatus.OPEN)
        {
            throw new IllegalStateException("Event is not open");
        }

        if(!Objects.equals(event.getCreatorUserId(), userId))
        {
            throw  new SecurityException("Only creator can finalize event");
        }


        if (!placeOptionRepository.existsByIdAndEvent_IdAndActiveTrue(request.placeOptionId(), eventId)) {
            throw new EventNotFoundException("Place option does not exist for this event");
        }
        if (!timeOptionRepository.existsByIdAndEvent_IdAndActiveTrue(request.timeOptionId(), eventId)) {
            throw new EventNotFoundException("Time option does not exist for this event");
        }


        event.setFinalizedAt(OffsetDateTime.now());
        event.setStatus(EventStatus.FINALIZED);
        event.setFinalTimeOptionId(request.timeOptionId());
        event.setFinalPlaceOptionId(request.placeOptionId());
        event.setMethod(FinalizionMethod.MANUAL);

        eventRepository.save(event);

        messagingTemplate.convertAndSend("/topic/events/"+eventId,
                new VotesUpdatedMessage("EVENT_FINALIZED", eventId, userId, OffsetDateTime.now()));

        return new FinalizeEventResponse(eventId,  request.timeOptionId(),
                request.placeOptionId(), event.getFinalizedAt());

    }


    @Transactional
    public FinalizeEventResponse processFinalization(Long eventId, FinalizionMethod method) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event with ID: " + eventId + " does not exist"));

        if (event.getStatus() != EventStatus.OPEN) {
            throw new EventStatusException("Event is not open");
        }

        if (method.equals(FinalizionMethod.CLICK)) {
            Long userId = SecurityUtils.getCurrentUserIdOrThrow();
            if (!Objects.equals(event.getCreatorUserId(), userId)) {
                throw new SecurityException("Only creator can finalize event");
            }
        }

        List<TimeOption> timeOptions = timeOptionRepository.findAllByEvent_IdAndActiveTrueOrderByStartsAtAsc(event.getId());
        List<PlaceOption> placeOptions = placeOptionRepository.findAllByEvent_IdAndActiveTrueOrderByIdAsc(event.getId());

        Long bestTimeId = pickBestTimeOption(event.getId(), timeOptions);
        Long bestPlaceId = pickBestPlaceOption(event.getId(), placeOptions);

        if (bestPlaceId == null || bestTimeId == null) {
            if (method.equals(FinalizionMethod.CLICK)) {
                throw new ConflictException("Cannot finalize: no valid time or place options based on votes.");
            }
            event.setStatus(EventStatus.CANCELLED);
        } else {
            event.setStatus(EventStatus.FINALIZED);
            event.setFinalTimeOptionId(bestTimeId);
            event.setFinalPlaceOptionId(bestPlaceId);
        }

        event.setFinalizedAt(OffsetDateTime.now());
        event.setMethod(method);
        eventRepository.save(event);

        String action = (event.getStatus() == EventStatus.CANCELLED) ? "EVENT_CANCELLED" : "EVENT_FINALIZED";

        messagingTemplate.convertAndSend("/topic/events/" + eventId,
                new VotesUpdatedMessage(action, eventId, event.getCreatorUserId(), event.getFinalizedAt()));

        return new FinalizeEventResponse(
                eventId,
                event.getFinalTimeOptionId(),
                event.getFinalPlaceOptionId(),
                event.getFinalizedAt()
        );
    }
}
