package com.kafica_blokadica.event.service;

import com.kafica_blokadica.auth.entity.User;
import com.kafica_blokadica.auth.repository.UserRepository;
import com.kafica_blokadica.config.SecurityUtils;
import com.kafica_blokadica.event.models.*;
import com.kafica_blokadica.event.repository.*;
import com.kafica_blokadica.exception.NotParticipantException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VoteStateService {

    private final TimeOptionRepository timeOptionRepository;
    private final PlaceOptionRepository placeOptionRepository;
    private final TimeVoteRepository timeVoteRepository;
    private final PlaceVoteRepository placeVoteRepository;
    private final UserRepository userRepository;
    private final EventParticipantRepository eventParticipantRepository;

    @Transactional(readOnly = true)
    public VoteStateResponse getState(Long eventId) {

        Long userId = SecurityUtils.getCurrentUserIdOrThrow();

        if(!eventParticipantRepository.existsByEventIdAndUserId(eventId, userId))
        {
            throw new NotParticipantException("User is not a participant of this event");
        }

        List<EventParticipant> participants = eventParticipantRepository.findAllByEventId(eventId);



        Set<Long> userIds = participants.stream()
                .map(EventParticipant::getUserId)
                .collect(Collectors.toSet());


        Map<Long, User> usersById = new HashMap<>();
        if (!userIds.isEmpty()) {
            for (User u : userRepository.findAllById(userIds)) {
                usersById.put(u.getId(), u);
            }
        }

        List<TimeOption> timeOptions = timeOptionRepository.findAllByEvent_IdOrderByStartsAtAsc(eventId);
        List<PlaceOption> placeOptions = placeOptionRepository.findAllByEvent_IdOrderByIdAsc(eventId);

        List<TimeVote> timeVotes = timeVoteRepository.findAllByEventId(eventId);
        List<PlaceVote> placeVotes = placeVoteRepository.findAllByEventId(eventId);



        List<VoteStateResponse.UserVote<Void>> orderedUsers = participants.stream()
                .map(p -> {
                    User u = usersById.get(p.getUserId());
                    String dn = (u != null) ? u.getDisplayName() : ("user#" + p.getUserId());
                    return new VoteStateResponse.UserVote<Void>(p.getUserId(), dn, null);
                })
                .sorted(Comparator.comparing(VoteStateResponse.UserVote::displayName, String.CASE_INSENSITIVE_ORDER))
                .toList();


        Map<Long, Map<Long, TimeVoteValue>> timeIndex = new HashMap<>();
        for (TimeVote tv : timeVotes) {
            timeIndex.computeIfAbsent(tv.getTimeOptionId(), k -> new HashMap<>())
                    .put(tv.getUserId(), tv.getVote());
        }

        Map<Long, Map<Long, PlaceVoteValue>> placeIndex = new HashMap<>();
        for (PlaceVote pv : placeVotes) {
            placeIndex.computeIfAbsent(pv.getPlaceOptionId(), k -> new HashMap<>())
                    .put(pv.getUserId(), pv.getVote());
        }


        List<VoteStateResponse.TimeOptionState> timeStates = new ArrayList<>();
        for (TimeOption t : timeOptions) {

            Map<Long, TimeVoteValue> perUser = timeIndex.getOrDefault(t.getId(), Map.of());

            List<VoteStateResponse.UserVote<TimeVoteValue>> uv = new ArrayList<>();
            for (VoteStateResponse.UserVote<Void> u : orderedUsers) {
                TimeVoteValue v = perUser.get(u.userId()); // moze biti null
                uv.add(new VoteStateResponse.UserVote<>(u.userId(), u.displayName(), v));
            }

            timeStates.add(new VoteStateResponse.TimeOptionState(
                    t.getId(),
                    t.getStartsAt(),
                    t.getEndsAt(),
                    uv
            ));
        }


        List<VoteStateResponse.PlaceOptionState> placeStates = new ArrayList<>();
        for (PlaceOption p : placeOptions) {

            Map<Long, PlaceVoteValue> perUser = placeIndex.getOrDefault(p.getId(), Map.of());

            List<VoteStateResponse.UserVote<PlaceVoteValue>> uv = new ArrayList<>();
            for (VoteStateResponse.UserVote<Void> u : orderedUsers) {
                PlaceVoteValue v = perUser.get(u.userId()); // moze i null
                uv.add(new VoteStateResponse.UserVote<>(u.userId(), u.displayName(), v));
            }

            placeStates.add(new VoteStateResponse.PlaceOptionState(
                    p.getId(),
                    p.getName(),
                    p.getAddress(),
                    p.getLat(),
                    p.getLng(),
                    uv
            ));
        }

        return new VoteStateResponse(eventId, timeStates, placeStates);
    }
}
