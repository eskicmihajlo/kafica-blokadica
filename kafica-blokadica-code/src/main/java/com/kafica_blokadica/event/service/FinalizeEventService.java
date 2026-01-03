package com.kafica_blokadica.event.service;

import com.kafica_blokadica.config.SecurityUtils;
import com.kafica_blokadica.event.dtos.FinalizeEventResponse;
import com.kafica_blokadica.event.dtos.VotesUpdatedMessage;
import com.kafica_blokadica.event.models.*;
import com.kafica_blokadica.event.repository.*;
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


    @Transactional
    public FinalizeEventResponse finalizeEvent(Long eventId)
    {

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


        List<TimeOption> timeOptions = timeOptionRepository.findAllByEvent_IdOrderByStartsAtAsc(eventId);
        List<PlaceOption> placeOptions = placeOptionRepository.findAllByEvent_IdOrderByIdAsc(eventId);

        Long bestTimeId = pickBestTimeOption(eventId,timeOptions);
        Long bestPlaceId = pickBestPlaceOption(eventId, placeOptions);


        event.setFinalizedAt(OffsetDateTime.now());
        event.setStatus(EventStatus.FINALIZED);
        event.setFinalTimeOptionId(bestTimeId);
        event.setFinalPlaceOptionId(bestPlaceId);

        eventRepository.save(event);

        messagingTemplate.convertAndSend("/topic/events/"+event,
                new VotesUpdatedMessage("EVENT_FINALIZED", eventId, userId, OffsetDateTime.now()));

        return new FinalizeEventResponse(eventId,  bestTimeId, bestPlaceId, event.getFinalizedAt());
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


        return placeOptions.stream()
                .min(Comparator
                        .comparingLong((PlaceOption p) -> -counts.getOrDefault(p.getId(), new int[]{0,0})[0]) // likes desc
                        .thenComparingInt(p -> counts.getOrDefault(p.getId(), new int[]{0,0})[1])           // dislikes asc
                        .thenComparingLong(PlaceOption::getId)                                                // stable
                )
                .map(PlaceOption::getId)
                .orElse(null);
    }

    private Long pickBestTimeOption(Long eventId, List<TimeOption> timeOptions) {

        if(timeOptions.isEmpty()) return null;

        Map<Long,int[]> counts = new HashMap<>();
        for(TimeOption to: timeOptions) counts.put(to.getId() , new int[]{0,0,0});

        for(TimeVote tv : timeVoteRepository.findAllByEventId(eventId))
        {
            int[] c = counts.get(tv.getTimeOptionId());
            if(c==null) continue;

            if(tv.getVote() == TimeVoteValue.YES) c[0]++;
            else if (tv.getVote()== TimeVoteValue.NO) c[1]++;
            else if (tv.getVote()== TimeVoteValue.MAYBE) c[2]++;

        }


        return timeOptions.stream()
                .min(Comparator
                        .comparingLong((TimeOption t) -> -counts.getOrDefault(t.getId(), new int[]{0,0,0})[0])
                        .thenComparingLong((TimeOption t) -> counts.getOrDefault(t.getId(), new int[]{0,0,0})[1])
                        .thenComparingLong((TimeOption t) -> -counts.getOrDefault(t.getId(), new int[]{0,0,0})[2])
                        .thenComparingLong(TimeOption::getId))
                .map(TimeOption::getId)
                .orElse(null);



    }


}
