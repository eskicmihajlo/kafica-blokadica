package com.kafica_blokadica.event.models;



import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "place_options")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PlaceOption {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @Column(nullable = false, length = 140)
    private String name;

    @Column(length = 255)
    private String address;

    private Double lat;
    private Double lng;
}
