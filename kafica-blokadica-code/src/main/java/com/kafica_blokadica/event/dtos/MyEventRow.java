package com.kafica_blokadica.event.dtos;

import com.kafica_blokadica.event.models.EventStatus;

import java.time.OffsetDateTime;

public record MyEventRow (

        Long eventId,
        String title,
        OffsetDateTime deadline,
        EventStatus status,
        boolean isCreator,
        OffsetDateTime respondedAt,
        String inviteToken // null ako nije creator


){
}
