package com.kafica_blokadica.controller;

import com.kafica_blokadica.event.dtos.MyEventsResponse;
import com.kafica_blokadica.event.service.MyEventsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {

    private final MyEventsService myEventsService;

    @GetMapping("/events")
    public MyEventsResponse myEvents() {
        return myEventsService.listMine();
    }
}