package com.kafica_blokadica.exception;

public class NotFoundException extends RuntimeException {
    public NotFoundException(String timeOptionNotFound) {
        super(timeOptionNotFound);
    }
}
