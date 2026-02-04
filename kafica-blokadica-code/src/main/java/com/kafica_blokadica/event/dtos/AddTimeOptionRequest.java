package com.kafica_blokadica.event.dtos;

import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record AddTimeOptionRequest(
        @NotNull OffsetDateTime statsAt,
        @NotNull OffsetDateTime endsAt

        ) {
}
