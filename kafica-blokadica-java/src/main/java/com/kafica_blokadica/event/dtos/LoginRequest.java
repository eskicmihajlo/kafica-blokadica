package com.kafica_blokadica.event.dtos;

public record LoginRequest(
        String email,
        String password
) {
}
