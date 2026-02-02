package com.kafica_blokadica.event.dtos;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;

public record UpdateEventRequest(


        @Size(min = 5,message = "Title is to short")
        String title,
        @Future(message = "Date must be in future")
        OffsetDateTime deadline,
        String description

) {
}
