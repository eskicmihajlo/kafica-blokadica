package com.kafica_blokadica.exception;


import com.kafica_blokadica.exception.UserAlreadyExistsException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException exception) {
        return buildResponse(HttpStatus.BAD_REQUEST, "Bad Request", exception.getMessage());
    }


    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleUserAlreadyExistsException(UserAlreadyExistsException exception) {
        return buildResponse(HttpStatus.CONFLICT, "User Conflict", exception.getMessage());
    }


    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleAllOtherRuntimeExceptions(RuntimeException exception) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", exception.getMessage());
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFoundException(UserNotFoundException exception) {
        return buildResponse(HttpStatus.NOT_FOUND, "Not Found", exception.getMessage());
    }

    @ExceptionHandler(NotCreatorException.class)
    public ResponseEntity<Map<String , Object>> hanldeNotCreatorException(NotCreatorException exception)
    {
        return buildResponse(HttpStatus.UNAUTHORIZED, "You are not creator of the event", exception.getMessage());
    }

    @ExceptionHandler(DeadLineException.class)
    public ResponseEntity<Map<String , Object>> hanldeDeadlineException(DeadLineException exception)
    {
        return buildResponse(HttpStatus.NOT_ACCEPTABLE, "Deadline exception", exception.getMessage());
    }

    @ExceptionHandler(EventStatusException.class)
    public ResponseEntity<Map<String, Object>> handleEventStatusException(EventStatusException exception)
    {
        return buildResponse(HttpStatus.CONFLICT, "Event Status Exception", exception.getMessage());
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NotFoundException exception)
    {
        return buildResponse(HttpStatus.NOT_FOUND, "Entity not found", exception.getMessage());
    }

    @ExceptionHandler({BadCredentialsException.class, InternalAuthenticationServiceException.class})
    public ResponseEntity<Map<String, Object>> handleBadCredentials(Exception exception) {
        return buildResponse(
                HttpStatus.UNAUTHORIZED,
                "Unauthorized",
                "Bad credentials."
        );
    }

    @ExceptionHandler(NotParticipantException.class)
    public ResponseEntity<Map<String, Object>> handleNotParticipantException(NotParticipantException exception)
    {
        return buildResponse(
                HttpStatus.FORBIDDEN,
                "Not Participant",
                exception.getMessage()
        );
    }

    @ExceptionHandler(EventNotFoundException.class)
    public ResponseEntity<Map<String ,Object>>handleEventNotFoundException(EventNotFoundException exception)
    {
        return buildResponse(
                HttpStatus.NOT_FOUND,
                "Event not found",
                exception.getMessage()
        );
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String error, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", status.value());
        body.put("error", error);
        body.put("message", message);
        body.put("timestamp", LocalDateTime.now());
        return new ResponseEntity<>(body, status);
    }


}
