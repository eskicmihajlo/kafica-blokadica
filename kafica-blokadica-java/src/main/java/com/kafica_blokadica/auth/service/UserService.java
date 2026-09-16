package com.kafica_blokadica.auth.service;

import com.kafica_blokadica.auth.entity.User;
import com.kafica_blokadica.auth.repository.UserRepository;
import com.kafica_blokadica.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {


    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
       User user = userRepository.findByEmail(email)
               .orElseThrow(()-> new UserNotFoundException("User do not exist"));

       return new CustomUserDetails(user);
    }
}
