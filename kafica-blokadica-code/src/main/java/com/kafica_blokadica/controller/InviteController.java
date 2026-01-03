package com.kafica_blokadica.controller;


import com.kafica_blokadica.event.dtos.InvitePreviewResponse;
import com.kafica_blokadica.event.service.InviteService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/invites")
public class InviteController {

    private final InviteService inviteService;



    @PostMapping("/{token}/join")
    public void join(@PathVariable String token)
    {

         inviteService.joinByToken(token);
    }

    @GetMapping("/{token}")
    public InvitePreviewResponse preview(@PathVariable String token)
    {

        return inviteService.preview(token);
    }




}
