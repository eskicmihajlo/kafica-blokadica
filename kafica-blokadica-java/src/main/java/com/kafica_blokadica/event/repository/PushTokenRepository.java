package com.kafica_blokadica.event.repository;

import com.kafica_blokadica.event.models.PushToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PushTokenRepository extends JpaRepository<PushToken,Long> {

    Optional<PushToken> findByToken(String token);
    List<PushToken> findAllByUser_Id(Long userId);

    List<PushToken> findAllByUser_IdIn(List<Long> usersIds);





}
