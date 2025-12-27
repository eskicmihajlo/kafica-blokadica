package com.kafica_blokadica.auth.controller;


import com.kafica_blokadica.auth.entity.RegisterRequest;
import com.kafica_blokadica.auth.service.AuthService;
import com.kafica_blokadica.event.models.LoginRequest;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {


    private final AuthService authService;


    @PostMapping("/register")
    public Boolean register(@RequestBody RegisterRequest request)
    {
        return authService.register(request);
    }

    @PostMapping("/login")
    public String register(@RequestBody LoginRequest request)
    {
        return authService.login(request);
    }





}
