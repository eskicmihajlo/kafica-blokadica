package com.kafica_blokadica.controller;


import com.kafica_blokadica.event.models.CreateEventRequest;
import com.kafica_blokadica.event.models.EventResponse;
import com.kafica_blokadica.event.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {


    private final EventService service;


    @PostMapping
    public EventResponse  create(@Valid @RequestBody CreateEventRequest request)
    {
        return service.create(request);
    }


    @GetMapping("/{id}")
    public EventResponse get(@PathVariable Long id)
    {
        return service.getById(id);
    }


    @GetMapping("/invite/{token}")
    public EventResponse get(@PathVariable String token)
    {
        return service.getByInviteToken(token);
    }

}
