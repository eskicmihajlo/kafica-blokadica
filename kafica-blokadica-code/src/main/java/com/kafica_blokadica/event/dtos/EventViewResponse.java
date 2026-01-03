package com.kafica_blokadica.event.dtos;

public record EventViewResponse(
        EventResponse eventResponse,
        ParticipantStatusResponse participants,

        VoteStateResponse voteState,

        Viewer viewer


) {

    public record Viewer(Long userID, String displayName, boolean isCreator, String inviteToken){}
}
