package com.kafica_blokadica.auth.service;


import com.kafica_blokadica.auth.entity.RegisterRequest;
import com.kafica_blokadica.auth.entity.User;
import com.kafica_blokadica.auth.repository.UserRepository;
import com.kafica_blokadica.event.models.LoginRequest;
import com.kafica_blokadica.exception.UserAlreadyExistsException;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    public boolean register(RegisterRequest request)
    {

        Optional<User> existingUser = userRepository.findByEmail(request.email());

        if(existingUser.isPresent())
        {
            throw new UserAlreadyExistsException("User already exist");
        }


        var user = User.builder()
                .displayName(request.displayName())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();



        userRepository.save(user);

        return true;


    }


    public String  login(LoginRequest request)
    {
        Authentication authentication = authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                ));

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();


        return jwtService.generateToken(userDetails);




    }








}
