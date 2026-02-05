package com.kafica_blokadica.event.repository;


import com.kafica_blokadica.event.models.TimeOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimeOptionRepository extends JpaRepository<TimeOption, Long> {
    List<TimeOption> findAllByEvent_IdAndIdInAndActiveTrue(Long eventId, Collection<Long> ids);
    Optional<TimeOption> findByEvent_IdAndIdAndActiveTrue(Long eventId, Long id);
    List<TimeOption> findAllByEvent_IdAndActiveTrueOrderByStartsAtAsc(Long eventId);
    boolean existsByIdAndEvent_IdAndActiveTrue(Long id, Long eventId);

}
