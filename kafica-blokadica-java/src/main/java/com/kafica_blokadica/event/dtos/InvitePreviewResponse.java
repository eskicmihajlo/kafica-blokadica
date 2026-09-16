package com.kafica_blokadica.event.dtos;

import com.kafica_blokadica.event.models.EventStatus;

import java.time.OffsetDateTime;

public record InvitePreviewResponse (
        Long eventID,
        String title,
        String description,
        OffsetDateTime deadLine,
        EventStatus status,

        Creator creator
){

    public record Creator(Long userId, String displayName){}
}
