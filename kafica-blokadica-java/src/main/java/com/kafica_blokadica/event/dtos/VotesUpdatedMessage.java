package com.kafica_blokadica.event.dtos;

import java.time.OffsetDateTime;

public record VotesUpdatedMessage(
        String type,
        Long eventId,
        Long userId,
        OffsetDateTime at
) {


}
