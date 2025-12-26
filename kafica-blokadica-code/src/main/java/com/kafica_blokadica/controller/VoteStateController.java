package com.kafica_blokadica.controller;


import com.kafica_blokadica.event.models.VoteStateResponse;
import com.kafica_blokadica.event.service.VoteStateService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class VoteStateController {

    private final VoteStateService voteStateService;


    @GetMapping("/{eventId}/votes/state")
    public VoteStateResponse stateResponse(@PathVariable Long eventId)
    {
        return voteStateService.getState(eventId);
    }


}
