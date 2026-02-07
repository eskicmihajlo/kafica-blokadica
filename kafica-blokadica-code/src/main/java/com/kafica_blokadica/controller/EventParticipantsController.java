package com.kafica_blokadica.controller;

import com.kafica_blokadica.event.service.ParticipantManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events/{eventId}")
@RequiredArgsConstructor
public class EventParticipantsController {


    private final ParticipantManagementService participantManagementService;



    @DeleteMapping("/leave")
    public void leave(@PathVariable Long eventId)
    {
        participantManagementService.leave(eventId);
    }

    @DeleteMapping("/participants/{userId}")
    public void leave(@PathVariable Long eventId, @PathVariable Long userId)
    {
        participantManagementService.kick(eventId,userId);
    }


}
