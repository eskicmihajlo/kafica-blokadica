package com.kafica_blokadica.event.repository;


import com.kafica_blokadica.event.models.PlaceOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface PlaceOptionRepository extends JpaRepository<PlaceOption, Long> {
    List<PlaceOption> findAllByEvent_IdAndIdIn(Long eventId, Collection<Long> ids);
    List<PlaceOption> findAllByEvent_IdOrderByIdAsc(Long eventId);
    boolean existsByIdAndEvent_Id(Long id, Long eventId);

}
