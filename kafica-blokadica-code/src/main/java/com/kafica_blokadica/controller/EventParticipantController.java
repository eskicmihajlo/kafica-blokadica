package com.kafica_blokadica.controller;
import com.kafica_blokadica.event.models.ParticipantStatusResponse;
import com.kafica_blokadica.event.service.EventParticipantService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventParticipantController {


    private final EventParticipantService eventParticipantService;



    @PostMapping("/invite/{token}/join")
    public void join(@PathVariable String token)
    {
        Long userId = 2L;

        eventParticipantService.joinByToken(token, userId);
    }

    @GetMapping("/{eventId}/participants/status")
    public ParticipantStatusResponse status(@PathVariable Long eventId) {
        return eventParticipantService.getStatus(eventId);
    }
}
