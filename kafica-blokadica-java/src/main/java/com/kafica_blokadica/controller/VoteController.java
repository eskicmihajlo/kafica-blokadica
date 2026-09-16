package com.kafica_blokadica.controller;


import com.kafica_blokadica.event.dtos.SubmitVotesRequest;
import com.kafica_blokadica.event.service.VoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class VoteController {


    private final VoteService service;


    @PostMapping("/{eventId}/votes")
    public void submitVotes(@PathVariable Long eventId, @Valid @RequestBody SubmitVotesRequest request)
    {
        service.submit(eventId, request);
    }

}
