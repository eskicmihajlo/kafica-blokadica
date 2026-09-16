package com.kafica_blokadica.controller;


import com.kafica_blokadica.event.service.PushNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {

    private final PushNotificationService pushNotificationService;

    @PostMapping("/push/{userId}")
    public ResponseEntity<Void> testPush(@PathVariable Long userId)
    {
        pushNotificationService.sendToUser(
                userId,
                "Test",
                "Test poruka",
                Map.of("EventId", 38)
        );
        return ResponseEntity.ok().build();
    }


}
