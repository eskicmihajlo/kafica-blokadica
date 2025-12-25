package com.kafica_blokadica.event.models;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record SubmitVotesRequest(
        @NotNull List<TimeVoteReq> timeVotes,
        @NotNull List<PlaceVoteReq> placeVotes
) {
    public record TimeVoteReq(@NotNull Long timeOptionId, @NotNull TimeVoteValue vote) {}
    public record PlaceVoteReq(@NotNull Long placeOptionId, @NotNull PlaceVoteValue vote) {}
}