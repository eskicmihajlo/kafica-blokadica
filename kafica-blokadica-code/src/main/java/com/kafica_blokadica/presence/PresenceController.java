package com.kafica_blokadica.presence;


import com.kafica_blokadica.ws.StompAuthChannelInterceptor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.security.Security;
import java.time.OffsetDateTime;
import java.util.Set;

@Controller
@RequiredArgsConstructor
@Slf4j
public class PresenceController {


    private final PresenceService presenceService;
    private final SimpMessagingTemplate simpMessagingTemplate;


    @MessageMapping("/events/{eventId}/presence/join")
    public void join(@DestinationVariable Long eventId, Principal principal) {
        Long userId = requireUserId(principal);
        log.info("WS JOIN: User {} is joining event {}", userId, eventId);

        Set<Long> online = presenceService.join(eventId, userId);
        log.info("Current online users for event {}: {}", eventId, online);

        PresenceMessage message = new PresenceMessage(
                "PRESENCE",
                eventId,
                online,
                OffsetDateTime.now()
        );

        log.info("Publishing presence update to /topic/events/{}/presence", eventId);

        simpMessagingTemplate.convertAndSend(
                "/topic/events/" + eventId + "/presence",
                message
        );
    }

    @MessageMapping("/events/{eventId}/presence/leave")
    public void leave(@DestinationVariable Long eventId, Principal principal) {
        Long userId = requireUserId(principal);
        log.info("WS LEAVE: User {} is leaving event {}", userId, eventId);

        Set<Long> online = presenceService.leave(eventId, userId);
        log.info("Current online users for event {} after leave: {}", eventId, online);

        PresenceMessage message = new PresenceMessage(
                "PRESENCE",
                eventId,
                online,
                OffsetDateTime.now()
        );

        log.info("Publishing presence update to /topic/events/{}/presence", eventId);

        simpMessagingTemplate.convertAndSend(
                "/topic/events/" + eventId + "/presence",
                message
        );
    }

    private Long requireUserId(Principal principal)
    {
        if(principal instanceof StompAuthChannelInterceptor.WsPrincipal p) return p.getId();

        throw new MessagingException("WS principal missing/invalid");
    }
    }




