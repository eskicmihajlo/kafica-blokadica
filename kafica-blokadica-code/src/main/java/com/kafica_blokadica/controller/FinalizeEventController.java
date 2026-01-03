package com.kafica_blokadica.controller;


import com.kafica_blokadica.event.dtos.FinalizeEventResponse;
import com.kafica_blokadica.event.service.FinalizeEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class FinalizeEventController {


    private final FinalizeEventService finalizeEventService;



    @PostMapping("/{eventID}/finalize")
    public FinalizeEventResponse finalize(@PathVariable Long eventID)
    {
        return finalizeEventService.finalizeEvent(eventID);
    }

}
