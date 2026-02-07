package com.kafica_blokadica.event.dtos;

import java.time.OffsetDateTime;

public record ParticipantUpdateMessage(
        String type,
        Long eventId,
        Long userId,
        OffsetDateTime time
) {
}
