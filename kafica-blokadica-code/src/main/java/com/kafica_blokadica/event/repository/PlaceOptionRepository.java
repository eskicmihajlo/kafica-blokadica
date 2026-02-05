package com.kafica_blokadica.event.repository;


import com.kafica_blokadica.event.models.PlaceOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface PlaceOptionRepository extends JpaRepository<PlaceOption, Long> {
    List<PlaceOption> findAllByEvent_IdAndIdInAndActiveTrue(Long eventId, Collection<Long> ids);
    List<PlaceOption> findAllByEvent_IdAndActiveTrueOrderByIdAsc(Long eventId);
    boolean existsByIdAndEvent_IdAndActiveTrue(Long id, Long eventId);

    Optional<PlaceOption> findByIdAndEvent_IdAndActiveTrue(Long id, Long eventId);

}
