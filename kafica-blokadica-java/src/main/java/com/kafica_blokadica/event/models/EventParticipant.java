package com.kafica_blokadica.event.models;



import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "event_participants",
        uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "user_id"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EventParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="event_id", nullable=false)
    private Long eventId;

    @Column(name="user_id", nullable=false)
    private Long userId;

    @Column(name="joined_at", nullable=false)
    private OffsetDateTime joinedAt;

    @Column(name="responded_at")
    private OffsetDateTime respondedAt;

}
