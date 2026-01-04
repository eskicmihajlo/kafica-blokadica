package com.kafica_blokadica.event.repository;


import com.kafica_blokadica.event.models.TimeOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface TimeOptionRepository extends JpaRepository<TimeOption, Long> {
    List<TimeOption> findAllByEvent_IdAndIdIn(Long eventId, Collection<Long> ids);
    List<TimeOption> findAllByEvent_IdOrderByStartsAtAsc(Long eventId);
    boolean existsByIdAndEvent_Id(Long id, Long eventId);

}
