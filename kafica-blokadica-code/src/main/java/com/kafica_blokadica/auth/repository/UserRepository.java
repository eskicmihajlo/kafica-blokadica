package com.kafica_blokadica.auth.repository;

import com.kafica_blokadica.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

   Optional<User> findByEmail(String email);
}
