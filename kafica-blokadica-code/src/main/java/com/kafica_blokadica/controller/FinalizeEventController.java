package com.kafica_blokadica.controller;


import com.kafica_blokadica.event.dtos.FinalizeEventResponse;
import com.kafica_blokadica.event.dtos.FinalizeManualRequest;
import com.kafica_blokadica.event.service.FinalizeEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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


    @PostMapping("/{eventID}/finalize/manual")
    public FinalizeEventResponse finalizeManual(@PathVariable Long eventID,
                                                @Valid @RequestBody FinalizeManualRequest request)
    {
        return finalizeEventService.finalizeEventManual(eventID,request);
    }

}
