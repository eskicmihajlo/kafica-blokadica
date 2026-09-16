package com.kafica_blokadica.event.repository;

import com.kafica_blokadica.event.models.TimeOption;
import com.kafica_blokadica.event.models.TimeVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;


@Repository
public interface TimeVoteRepository extends JpaRepository<TimeVote, Long> {

    List<TimeVote> findAllByUserIdAndTimeOptionIdIn(Long userId, Collection<Long> timeOptionIds);
    List<TimeVote> findAllByEventId(Long eventId);
    void deleteAllByEventIdAndUserId(Long eventId, Long userId);

    @Query("""
    select count(tv) > 0
    from TimeVote tv
    join TimeOption topt on topt.id = tv.timeOptionId
    where tv.eventId = :eventId
      and tv.userId = :userId
      and topt.active = true
""")
    boolean existsActiveTimeVote(Long eventId, Long userId);
}
