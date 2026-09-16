package com.kafica_blokadica.event.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddPlaceOptionRequest(

        @NotBlank String name,
        @NotBlank String address,
        @NotNull Double lng,
        @NotNull Double lat


) {
}
