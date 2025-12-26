package com.kafica_blokadica.event.models;


import java.util.List;

public record ParticipantStatusResponse (
        Long eventId,
        long totalParticipants,
        long respondedParticipant,
        List<UserRow> watingFor

){
    public record UserRow(Long userId, String displayName){}
}
