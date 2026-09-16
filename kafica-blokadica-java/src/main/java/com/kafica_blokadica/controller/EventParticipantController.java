package com.kafica_blokadica.controller;
import com.kafica_blokadica.event.dtos.ParticipantStatusResponse;
import com.kafica_blokadica.event.service.EventParticipantService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventParticipantController {


    private final EventParticipantService eventParticipantService;



    @GetMapping("/{eventId}/participants/status")
    public ParticipantStatusResponse status(@PathVariable Long eventId) {
        return eventParticipantService.getStatus(eventId);
    }




}
