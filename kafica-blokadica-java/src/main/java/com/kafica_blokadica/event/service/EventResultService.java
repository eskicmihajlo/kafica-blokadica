package com.kafica_blokadica.event.service;


import com.kafica_blokadica.auth.entity.User;
import com.kafica_blokadica.auth.repository.UserRepository;
import com.kafica_blokadica.config.SecurityUtils;
import com.kafica_blokadica.event.dtos.EventResponse;
import com.kafica_blokadica.event.dtos.EventResultResponse;
import com.kafica_blokadica.event.models.Event;
import com.kafica_blokadica.event.models.EventStatus;
import com.kafica_blokadica.event.models.PlaceOption;
import com.kafica_blokadica.event.models.TimeOption;
import com.kafica_blokadica.event.repository.EventParticipantRepository;
import com.kafica_blokadica.event.repository.EventRepository;
import com.kafica_blokadica.event.repository.PlaceOptionRepository;
import com.kafica_blokadica.event.repository.TimeOptionRepository;
import com.kafica_blokadica.exception.EventNotFoundException;
import com.kafica_blokadica.exception.NotParticipantException;
import com.kafica_blokadica.exception.UserNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@AllArgsConstructor
@Service
public class EventResultService {



    private final EventRepository eventRepository;
    private final EventParticipantRepository eventParticipantRepository;
    private final TimeOptionRepository timeOptionRepository;
    private final PlaceOptionRepository placeOptionRepository;
    private final UserRepository userRepository;


    @Transactional(readOnly = true)
    public EventResultResponse getResult(Long eventId)
    {


        Long userId = SecurityUtils.getCurrentUserIdOrThrow();




        Event event = eventRepository.findById(eventId)
                .orElseThrow(()-> new EventNotFoundException("Event with ID: "+ eventId+ " not found" ));

        if(!eventParticipantRepository.existsByEventIdAndUserId(eventId, userId))
        {
            throw new NotParticipantException("User is not a participant of this event");
        }

        if(event.getStatus() != EventStatus.FINALIZED)
        {
            throw new IllegalArgumentException("Event is not finalized");
        }


        Long timeId = event.getFinalTimeOptionId();
        Long placeId = event.getFinalPlaceOptionId();


        if(timeId == null || placeId == null)
        {
            throw new IllegalStateException("Final time or place missing");
        }


        TimeOption timeOption = timeOptionRepository.findById(timeId)
                .orElseThrow(()-> new IllegalStateException("Time Option with ID: "+ timeId +" not found"));


        PlaceOption placeOption = placeOptionRepository.findById(placeId)
                .orElseThrow(()-> new IllegalStateException("Place Option with ID: "+ timeId +" not found"));


        User user  = userRepository.findById(event.getCreatorUserId())
                .orElseThrow(()-> new UserNotFoundException("Creator not found" ));


        return new EventResultResponse(
                eventId,
                event.getTitle(),
                event.getDescription(),
                event.getStatus().toString(),
                user.getDisplayName(),
                event.getFinalizedAt(),
                event.getMethod().toString(),
                new EventResultResponse.SelectedPlace(
                        placeOption.getId(),
                        placeOption.getName(),
                        placeOption.getAddress(),
                        placeOption.getLng(),
                        placeOption.getLat()
                ),
                new EventResultResponse.SelectedTime(
                        timeOption.getId(),
                        timeOption.getStartsAt(),
                        timeOption.getEndsAt()
                )
        );

    }




}
