package com.kafica_blokadica.event.service;


import com.kafica_blokadica.event.dtos.EventViewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/events")
@RequiredArgsConstructor
public class EventViewController {


    private final EventViewService eventViewService;

    @GetMapping("/{id}/view")
    public EventViewResponse view(@PathVariable Long id)
    {
        return eventViewService.getView(id);
    }

}
