package com.kafica_blokadica.event.repository;

import com.kafica_blokadica.event.models.PlaceVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;


@Repository
public interface PlaceVoteRepository extends JpaRepository<PlaceVote, Long> {

    List<PlaceVote> findAllByUserIdAndPlaceOptionIdIn(Long userId, Collection<Long> placeOptionIds);
}
