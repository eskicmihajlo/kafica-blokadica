package com.kafica_blokadica.event.service;


import com.kafica_blokadica.auth.entity.User;
import com.kafica_blokadica.auth.repository.UserRepository;
import com.kafica_blokadica.config.SecurityUtils;
import com.kafica_blokadica.event.dtos.EventResponse;
import com.kafica_blokadica.event.dtos.EventViewResponse;
import com.kafica_blokadica.event.dtos.ParticipantStatusResponse;
import com.kafica_blokadica.event.dtos.VoteStateResponse;
import com.kafica_blokadica.event.models.Event;
import com.kafica_blokadica.event.models.EventParticipant;
import com.kafica_blokadica.event.repository.EventParticipantRepository;
import com.kafica_blokadica.event.repository.EventRepository;
import com.kafica_blokadica.exception.EventNotFoundException;
import com.kafica_blokadica.exception.NotParticipantException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EventViewService {

    private final EventRepository eventRepository;
    private final EventParticipantRepository eventParticipantRepository;
    private final UserRepository userRepository;

    private final EventService eventService;
    private final EventParticipantService eventParticipantService;
    private final VoteStateService voteStateService;


    public  EventViewResponse getView(Long id) {


        Long userId = SecurityUtils.getCurrentUserIdOrThrow();

        Event event = eventRepository.findById(id).orElseThrow(()-> new EventNotFoundException(
                "Event with ID:" + id + " do not exist"
        ));

        if(!eventParticipantRepository.existsByEventIdAndUserId(event.getId(), userId) )
        {
            throw new NotParticipantException("User is not a participant of this event");
        }

        /// Viewer informacije
        User viewUser = userRepository.findById(userId).orElse(null);
        String displyName = (viewUser != null) ? viewUser.getDisplayName() : ("User#" + userId);
        boolean isCreator = userId.equals(event.getCreatorUserId());
        String inviteToken = isCreator ? event.getInviteToken() : null;

        /// Sredjeni Payload
        EventResponse eventDTO = eventService.getById(id);
        ParticipantStatusResponse statusDTO = eventParticipantService.getStatus(id);
        VoteStateResponse voteStateDto = voteStateService.getState(id);

        return new EventViewResponse(eventDTO, statusDTO,voteStateDto,
                new EventViewResponse.Viewer(viewUser.getId(), displyName, isCreator, inviteToken));


    }
}
