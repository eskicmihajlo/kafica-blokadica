package com.kafica_blokadica.event.service;


import com.kafica_blokadica.config.SecurityUtils;
import com.kafica_blokadica.event.models.PushToken;
import com.kafica_blokadica.event.repository.PushTokenRepository;
import com.kafica_blokadica.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PushTokenService {

    private final PushTokenRepository pushTokenRepository;

    public void registerToken(String token)
    {
        PushToken existing = pushTokenRepository.findByToken(token).orElse(null);

        if(existing != null)
        {
            existing.setUser(SecurityUtils.getCurrentUser().orElseThrow(()-> new UserNotFoundException("User not authenticated")));
            pushTokenRepository.save(existing);
        }
        else
        {
            PushToken pushToken = new PushToken();
            pushToken.setUser(SecurityUtils.getCurrentUser().orElseThrow(()-> new UserNotFoundException("User not authenticated")));
            pushToken.setToken(token);
            pushTokenRepository.save(pushToken);

        }


    }






}
