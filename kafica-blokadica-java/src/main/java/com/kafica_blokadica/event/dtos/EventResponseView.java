package com.kafica_blokadica.event.dtos;

import com.kafica_blokadica.event.models.EventStatus;

import java.time.OffsetDateTime;

public record EventResponseView(

        Long id,
        String title,
        String description,
        OffsetDateTime deadline,
        EventStatus status,
        String inviteToken
) {
}
