package com.kafica_blokadica.event.repository;


import com.kafica_blokadica.event.models.EventParticipant;
import lombok.extern.java.Log;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface EventParticipantRepository extends JpaRepository<EventParticipant, Long> {

    Optional<EventParticipant> findByEventIdAndUserId(Long eventId, Long userId);
    List<EventParticipant> findAllByEventId(Long eventId);

    long countByEventId(Long eventId);
    long countByEventIdAndRespondedAtNotNull(Long eventId);
    boolean  existsByEventIdAndUserId(Long eventId, Long userID);
}
