package com.kafica_blokadica.ws;

import com.kafica_blokadica.auth.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.security.Principal;

@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {



    private final JwtService jwtService;


    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }



        if (StompCommand.CONNECT.equals(accessor.getCommand())) {

            String authHeader = accessor.getFirstNativeHeader("Authorization");


            if (authHeader == null) {
                authHeader = accessor.getFirstNativeHeader("authorization");
            }

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("DEBUG WS: Missing Authorization header. NativeHeaders=" + accessor.toNativeHeaderMap());
                throw new MessagingException("Missing Authorization header");
            }

            String token = authHeader.substring(7);

            Long userId = jwtService.extractUserId(token);
            String email = jwtService.extractUsername(token);

            accessor.setUser(new WsPrincipal(userId, email));

            System.out.println("DEBUG WS: Auth OK userId=" + userId + " email=" + email);
        }

        return message;
    }



    public record WsPrincipal(Long userId, String name) implements Principal
    {
        @Override
        public String getName() {
            return name;
        }

        public Long getId()
        {
            return userId;
        }

    }

}
