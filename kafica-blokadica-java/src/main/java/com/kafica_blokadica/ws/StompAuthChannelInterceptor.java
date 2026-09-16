package com.kafica_blokadica.ws;

import com.kafica_blokadica.auth.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        System.out.println("DEBUG WS: preSend called");

        if (accessor == null) {
            System.out.println("DEBUG WS: accessor is null");
            return message;
        }

        System.out.println("DEBUG WS: Stigla komanda u kanal -> " + accessor.getCommand());

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader == null) {
                authHeader = accessor.getFirstNativeHeader("authorization");
            }

            String token = null;

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }

            System.out.println("DEBUG WS: authHeader=" + authHeader + " | Token pronadjen=" + (token != null));

            if (token == null) {
                System.out.println("DEBUG WS: Missing Authorization token.");
                throw new MessagingException("Missing Authorization header");
            }

            try {
                Long userId = jwtService.extractUserId(token);
                String email = jwtService.extractUsername(token);

                accessor.setUser(new WsPrincipal(userId, email));

                System.out.println("DEBUG WS: Auth OK userId=" + userId + " email=" + email);
            } catch (Exception e) {
                System.out.println("DEBUG WS: Token error: " + e.getMessage());
                e.printStackTrace();
                throw e;
            }
        }

        return message;
    }

    public record WsPrincipal(Long userId, String name) implements Principal {
        @Override
        public String getName() {
            return name;
        }

        public Long getId() {
            return userId;
        }
    }
}