package com.kafica_blokadica.event.dtos;

import com.kafica_blokadica.event.models.EventStatus;

import java.time.OffsetDateTime;
import java.util.List;

public record EventResponse (
        Long id,
        String title,
        String description,
        OffsetDateTime deadline,
        EventStatus status,
        String inviteToken,
        List<TimeOpt> timeOptions,
        List<PlaceOpt> placeOptions
) {

    public record TimeOpt(Long id, OffsetDateTime startsAt, OffsetDateTime endsAt){}
    public record PlaceOpt(Long id, String name, String address, Double lat, Double lng){}


}
