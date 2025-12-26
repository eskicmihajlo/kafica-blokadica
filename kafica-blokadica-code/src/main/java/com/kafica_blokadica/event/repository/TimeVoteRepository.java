package com.kafica_blokadica.event.repository;

import com.kafica_blokadica.event.models.TimeOption;
import com.kafica_blokadica.event.models.TimeVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;


@Repository
public interface TimeVoteRepository extends JpaRepository<TimeVote, Long> {

    List<TimeVote> findAllByUserIdAndTimeOptionIdIn(Long userId, Collection<Long> timeOptionIds);
    List<TimeVote> findAllByEventId(Long eventId);
}
