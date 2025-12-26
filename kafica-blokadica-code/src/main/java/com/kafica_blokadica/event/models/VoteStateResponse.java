package com.kafica_blokadica.event.models;


import java.time.OffsetDateTime;
import java.util.List;


public record VoteStateResponse(
        Long eventId,
        List<TimeOptionState> timeOptions,
        List<PlaceOptionState> placeOptions
) {
    public record TimeOptionState(
            Long timeOptionId,
            OffsetDateTime startsAt,
            OffsetDateTime endsAt,
            List<UserVote<TimeVoteValue>> votes
    ) {}

    public record PlaceOptionState(
            Long placeOptionId,
            String name,
            String address,
            Double lat,
            Double lng,
            List<UserVote<PlaceVoteValue>> votes
    ) {}

    public record UserVote<V>(
            Long userId,
            String displayName,
            V vote
    ) {}
}



//{
//        "eventId": 101,
//        "timeOptions": [
//        {
//        "timeOptionId": 1,
//        "startsAt": "2025-12-24T18:00:00Z",
//        "endsAt": "2025-12-24T20:00:00Z",
//        "votes": [
//        {
//        "userId": 10,
//        "displayName": "Nikola",
//        "vote": "YES"
//        }
//        ]
//        }
//        ],
//        "placeOptions": [
//        {
//        "placeOptionId": 500,
//        "name": "Kafic Blok",
//        "address": "Ulica 1",
//        "lat": 44.8,
//        "lng": 20.4,
//        "votes": [
//        {
//        "userId": 10,
//        "displayName": "Nikola",
//        "vote": LIKE
//        }
//        ]
//        }
//        ]
//        }