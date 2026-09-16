package com.kafica_blokadica.event.dtos;

import java.util.Map;

public record ExpoPushMessage(
        String to,
        String title,
        String body,
        Map<String, Object> data

) {
}
