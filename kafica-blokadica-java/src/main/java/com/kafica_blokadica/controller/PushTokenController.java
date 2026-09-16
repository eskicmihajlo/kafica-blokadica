package com.kafica_blokadica.controller;


import com.kafica_blokadica.event.dtos.RegisterPushTokenRequest;
import com.kafica_blokadica.event.service.PushTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/push")
@RequiredArgsConstructor
public class PushTokenController {

    private final PushTokenService pushTokenService;

    @PostMapping("/register")
    public ResponseEntity<Void> registerToken(
            @RequestBody RegisterPushTokenRequest request
            )
    {
        pushTokenService.registerToken(request.token());
        return ResponseEntity.ok().build();
    }

}
