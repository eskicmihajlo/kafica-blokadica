package com.kafica_blokadica.event.models;

public record LoginRequest(
        String email,
        String password
) {
}
