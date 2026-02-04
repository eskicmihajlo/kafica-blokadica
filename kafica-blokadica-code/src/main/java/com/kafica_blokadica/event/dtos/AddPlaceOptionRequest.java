package com.kafica_blokadica.event.dtos;

import jakarta.validation.constraints.NotBlank;

public record AddPlaceOptionRequest(

        @NotBlank String name,
        @NotBlank String address,
        @NotBlank Double lng,
        @NotBlank Double lat


) {
}
