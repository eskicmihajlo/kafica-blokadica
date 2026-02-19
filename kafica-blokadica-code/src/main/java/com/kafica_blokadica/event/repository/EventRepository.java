package com.kafica_blokadica.event.repository;

import com.kafica_blokadica.event.models.Event;
import com.kafica_blokadica.event.models.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository  extends JpaRepository<Event,Long> {

    Optional<Event> findByInviteToken(String inviteToken);
    List<Event> findAllByIdIn(List<Long> ids);

    List<Event> findAllByStatusAndDeadlineBefore(EventStatus eventStatus, OffsetDateTime time);
}
