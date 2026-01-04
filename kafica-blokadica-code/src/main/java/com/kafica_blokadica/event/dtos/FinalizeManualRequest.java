package com.kafica_blokadica.event.dtos;

import jakarta.validation.constraints.NotNull;

public record FinalizeManualRequest(

        @NotNull Long timeOptionId,
        @NotNull Long placeOptionId

) {
}
