package com.kafica_blokadica.config;

import com.kafica_blokadica.auth.entity.User;
import com.kafica_blokadica.auth.service.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public class SecurityUtils {


    public static    Optional<User> getCurrentUser()
    {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if(authentication != null && authentication.getPrincipal() instanceof CustomUserDetails user)
        {
            return Optional.of(user.getUser());
        }
        return Optional.empty();
    }



    public static Long getCurrentUserIdOrThrow() {
        return getCurrentUser()
                .map(User::getId)
                .orElseThrow(() -> new IllegalStateException("Not authenticated"));
    }


}
