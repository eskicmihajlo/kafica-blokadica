package com.kafica_blokadica.event.dtos;

import java.time.OffsetDateTime;

public record FinalizeEventResponse(
        Long eventId,
        Long finalTimeOption,
        Long finalPlaceOption,
        OffsetDateTime finalizedAt


) {
}
