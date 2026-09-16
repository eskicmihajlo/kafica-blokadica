package com.kafica_blokadica.event.models;



import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "time_votes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeVote {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "time_option_id", nullable = false)
    private Long timeOptionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TimeVoteValue vote;



}
