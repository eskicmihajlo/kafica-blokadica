package com.kafica_blokadica.exception;

public class EventStatusException extends RuntimeException {
    public EventStatusException(String eventIsNotOpen) {
        super(eventIsNotOpen);
    }
}
