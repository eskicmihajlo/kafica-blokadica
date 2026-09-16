package com.kafica_blokadica.event.service;


import com.kafica_blokadica.event.dtos.ExpoPushMessage;
import com.kafica_blokadica.event.models.PushToken;
import com.kafica_blokadica.event.repository.PushTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.lang.ref.WeakReference;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PushNotificationService {
    private static final String EXPO_PUSH_PATH = "/--/api/v2/push/send";


    private final WebClient webClient;
    private final PushTokenRepository pushTokenRepository;


    public void sendToUser(Long userId, String title, String body, Map<String,Object> data)
    {
        sendToUsers(List.of(userId), title, body, data);
    }

    public void sendToUsers(List<Long> userIds, String title, String body, Map<String,Object> data)
    {
        List<PushToken> tokens = pushTokenRepository.findAllByUser_IdIn(userIds);

        for(PushToken pushToken : tokens)
        {
            ExpoPushMessage message = new ExpoPushMessage(
                    pushToken.getToken(),
                    title,
                    body,
                    data
            );

            webClient.post()
                    .uri(EXPO_PUSH_PATH)
                    .bodyValue(message)
                    .retrieve()
                    .bodyToMono(String.class)
                    .doOnError(e -> System.out.println(
                            "Push notification failed for token " + pushToken.getToken() + ": " + e.getMessage()))
                    .onErrorResume(e -> Mono.empty())
                    .subscribe();


        }



    }


}
