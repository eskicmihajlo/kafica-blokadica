package com.kafica_blokadica.event.models;


import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "place_votes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceVote {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "place_option_id", nullable = false)
    private Long placeOptionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private PlaceVoteValue vote;




}
