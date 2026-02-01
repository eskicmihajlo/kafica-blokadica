package com.kafica_blokadica.event.dtos;

import com.kafica_blokadica.event.models.EventStatus;
import com.kafica_blokadica.event.models.FinalizionMethod;

import java.time.OffsetDateTime;

public record EventResultResponse (

        Long eventId,
        String title,
        String description,
        String status,
        String creatorName,
        OffsetDateTime finalizedAt,
        String finalizionMethod

) {

    public record SelectedTime(Long timeOptionId, OffsetDateTime startsAt, OffsetDateTime endsAt){}
    public record SelectedPlace(Long placeOptionId, String name, String address, Double lng, Double let){}

}
