package com.kafica_blokadica.controller;


import com.kafica_blokadica.event.dtos.AddPlaceOptionRequest;
import com.kafica_blokadica.event.dtos.AddTimeOptionRequest;
import com.kafica_blokadica.event.service.EventOptionsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/events/{eventId}")
public class EventOptionsController {

    private final EventOptionsService eventOptionsService;


    @PostMapping("/time-options")
    public boolean addTimeOption(@PathVariable Long eventId, @Valid @RequestBody AddTimeOptionRequest request)
    {
        return eventOptionsService.addTimeOption(eventId,request);
    }

    @DeleteMapping("/time-options/{timeOptionId}")
    public boolean removeTimeOption(@PathVariable Long eventId, @PathVariable Long timeOptionId)
    {
        return eventOptionsService.removeTimeOption(eventId,timeOptionId);
    }

    @PostMapping("/place-options")
    public boolean addPlaceOption(@PathVariable Long eventId, @RequestBody @Valid AddPlaceOptionRequest request)
    {
        return eventOptionsService.addPlaceOption(eventId,request);
    }

    @DeleteMapping("/place-options/{placeOptionId}")
    public boolean removePlaceOption(@PathVariable Long placeOptionId, @PathVariable Long eventId)
    {
        return eventOptionsService.removePlaceOption(eventId,placeOptionId);

    }




}
