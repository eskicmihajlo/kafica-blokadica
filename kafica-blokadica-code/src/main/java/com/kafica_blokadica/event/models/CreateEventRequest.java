package com.kafica_blokadica.event.models;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.List;

public record CreateEventRequest(
        @NotBlank @Size(max = 50) String title,
        @Size(max = 200) String description,
        @NotNull OffsetDateTime deadline,
        @NotNull @Size(min = 1, max = 6) List<TimeOptionReq> timeOptions,
        @NotNull @Size(min = 1, max = 5) List<PlaceOptionReq> placeOptions
) {

    public record TimeOptionReq(@NotNull OffsetDateTime startsAt,OffsetDateTime endsAt ){}
    public record PlaceOptionReq(@NotBlank @Size(max = 100) String name , @Size(max = 255) String address , Double lat, Double lng ){}


}
