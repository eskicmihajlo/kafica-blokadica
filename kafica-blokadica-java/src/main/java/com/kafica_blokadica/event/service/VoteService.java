package com.kafica_blokadica.event.service;

import com.kafica_blokadica.event.dtos.SubmitVotesRequest;
import com.kafica_blokadica.event.dtos.VotesUpdatedMessage;
import com.kafica_blokadica.event.models.*;
import com.kafica_blokadica.event.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.kafica_blokadica.config.SecurityUtils.getCurrentUserIdOrThrow;

@Service
@RequiredArgsConstructor
public class VoteService {


    private final TimeVoteRepository timeVoteRepository;
    private final PlaceVoteRepository placeVoteRepository;
    private final TimeOptionRepository timeOptionRepository;
    private final PlaceOptionRepository placeOptionRepository;
    private final EventRepository eventRepository;
    private final EventParticipantService eventParticipantService;
    private final SimpMessagingTemplate messagingTemplate;

    public void submit(Long eventId, SubmitVotesRequest request) {


        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        if (event.getStatus() != EventStatus.OPEN) {
            throw new IllegalStateException("Event is not OPEN");
        }


        Long userId = getCurrentUserIdOrThrow();




        Objects.requireNonNull(eventId, "eventId must not be null");
        Objects.requireNonNull(request, "request must not be null");


        List<SubmitVotesRequest.TimeVoteReq> timeVotes = defaultList(request.timeVotes());
        List<SubmitVotesRequest.PlaceVoteReq> placeVotes = defaultList(request.placeVotes());




        /// Validiramo da bude sve 1-1
        validateBelongsToEvent(eventId, timeVotes, placeVotes);

        boolean firstTime = eventParticipantService.markFirst(eventId, userId);

        upsertTimeVotes(eventId, timeVotes,userId);
        upsertPlaceVotes(eventId,placeVotes,userId);




        messagingTemplate.convertAndSend("/topic/events/"+ eventId ,
                new VotesUpdatedMessage("VOTES_UPDATED", eventId, userId, OffsetDateTime.now()));

    }

    private void upsertPlaceVotes(Long eventId, List<SubmitVotesRequest.PlaceVoteReq> requset, Long userId) {

        if(!requset.isEmpty())
        {

            Set<Long> optionIds  = requset.stream().map(
                    SubmitVotesRequest.PlaceVoteReq::placeOptionId
            ).collect(Collectors.toSet());

            List<PlaceVote> existing = placeVoteRepository.findAllByUserIdAndPlaceOptionIdIn(userId, optionIds);

            ///500 : [id=10, userId=1, placeOptionId=500, score=5]
            //501 :	[id=11, userId=1, placeOptionId=501, score=3]
            Map<Long, PlaceVote> byOptionId = existing.stream().
                    collect(Collectors.toMap(PlaceVote::getPlaceOptionId, Function.identity()));

            List<PlaceVote> toSave = new ArrayList<>(requset.size());

            for(SubmitVotesRequest.PlaceVoteReq req : requset)
            {
                PlaceVote vote = byOptionId.get(req.placeOptionId());


                // Ako ne postoji napravi novi vote
                if(vote == null)
                {
                    vote = PlaceVote.builder()
                            .eventId(eventId)
                            .userId(userId)
                            .vote(req.vote())
                            .placeOptionId(req.placeOptionId())
                            .build();



                }
                /// Ako postoji azuriraj
                else
                {
                    vote.setVote(req.vote());
                }

                toSave.add(vote);
            }


            placeVoteRepository.saveAll(toSave);
        }




    }

    private void upsertTimeVotes(Long eventId, List<SubmitVotesRequest.TimeVoteReq> requset, Long userId) {

        if(!requset.isEmpty())
        {
            Set<Long> optionIds = requset.stream().map(SubmitVotesRequest.TimeVoteReq::timeOptionId)
                    .collect(Collectors.toSet());

            List<TimeVote> exisitng = timeVoteRepository.findAllByUserIdAndTimeOptionIdIn(userId,optionIds );

            Map<Long, TimeVote> byOptionId = exisitng.stream().collect(Collectors.toMap(
                TimeVote::getTimeOptionId, Function.identity()
            ));

            List<TimeVote> toSave = new ArrayList<>(requset.size());

            for(SubmitVotesRequest.TimeVoteReq req : requset)
            {
                TimeVote vote = byOptionId.get(req.timeOptionId());

                if(vote == null)
                {
                    vote = TimeVote.builder()
                            .eventId(eventId)
                            .vote(req.vote())
                            .userId(userId)
                            .timeOptionId(req.timeOptionId())
                            .build();

                }
                else
                {
                    vote.setVote(req.vote());
                }

                toSave.add(vote);
            }


            timeVoteRepository.saveAll(toSave);

        }









    }


    private void validateBelongsToEvent(Long eventId,
                                        List<SubmitVotesRequest.TimeVoteReq> timeVotes,
                                        List<SubmitVotesRequest.PlaceVoteReq> placeVotes) {

        Set<Long> timeOptionIds = timeVotes.stream()
                .map(SubmitVotesRequest.TimeVoteReq::timeOptionId)
                .collect(Collectors.toSet());

        Set<Long> placeOptionsIds = placeVotes.stream()
                .map(SubmitVotesRequest.PlaceVoteReq::placeOptionId)
                .collect(Collectors.toSet());

        if(!timeOptionIds.isEmpty())
        {
            List<TimeOption> found = timeOptionRepository.findAllByEvent_IdAndIdInAndActiveTrue(eventId, timeOptionIds);
            Set<Long> foundIds = found.stream().map(TimeOption::getId).collect(Collectors.toSet());

            if(foundIds.size() != timeOptionIds.size())
            {
                Set<Long> missing = new HashSet<>(timeOptionIds);
                missing.removeAll(foundIds);
                throw new IllegalArgumentException("Invalid timeOptionIds for this event: " + missing);
            }


        }


        if(!placeOptionsIds.isEmpty())
        {

            List<PlaceOption> found = placeOptionRepository.findAllByEvent_IdAndIdInAndActiveTrue(eventId, placeOptionsIds);
            Set<Long> foundIds = found.stream().map(PlaceOption::getId).collect(Collectors.toSet());

            if(foundIds.size() != placeOptionsIds.size())
            {
                Set<Long> missing = new HashSet<>(placeOptionsIds);
                missing.removeAll(foundIds);
                throw new IllegalArgumentException("Invalid placeOptionIds for this event: " + missing);
            }

        }





    }

    private static <T> List<T> defaultList(List<T> list) {
        return list == null ? List.of() : list;
    }
}
