package com.kafica_blokadica.controller;


import com.kafica_blokadica.event.dtos.*;
import com.kafica_blokadica.event.service.EventResultService;
import com.kafica_blokadica.event.service.EventService;
import com.kafica_blokadica.event.service.EventViewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {


    private final EventService service;
    private final EventViewService eventViewService;
    private final EventResultService eventResultService;


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

    @GetMapping("/{eventId}/result")
    public EventResultResponse result(@PathVariable Long eventId)
    {
        return eventResultService.getResult(eventId);
    }


    @PatchMapping("/{id}")
    public EventResponse update(@PathVariable Long id, @Valid  @RequestBody UpdateEventRequest request)
    {
        return service.update(id, request);
    }

    @PostMapping("/cancel/{eventId}")
    public Boolean cancel(@PathVariable Long eventId)
    {
        return service.cancel(eventId);
    }
}
