package com.kafica_blokadica.auth.entity;

public record RegisterRequest(
        String email,
        String password,

        String displayName

) {
}
