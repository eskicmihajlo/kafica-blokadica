package com.kafica_blokadica.auth.repository;

import com.kafica_blokadica.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

}
