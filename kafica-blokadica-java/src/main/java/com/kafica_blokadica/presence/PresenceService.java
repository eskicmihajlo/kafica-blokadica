package com.kafica_blokadica.presence;


import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PresenceService {



    /// 2 : [2,3,4]
    private final Map<Long, Set<Long>> onlineByEvent = new ConcurrentHashMap<>();

    public Set<Long> join(Long eventId, Long userId)
    {
       onlineByEvent.computeIfAbsent(eventId, k-> ConcurrentHashMap.newKeySet()).add(userId);

       return snapshot(eventId);
    }

    public Set<Long> leave(Long eventId, Long userId)
    {
        Set<Long> set = onlineByEvent.get(eventId);

        if(set != null)
        {
            set.remove(userId);

            if(set.isEmpty()) onlineByEvent.remove(eventId);
        }

        return snapshot(eventId);


    }

    private Set<Long> snapshot(Long eventId) {

       Set<Long> set =  onlineByEvent.getOrDefault(eventId, Set.of());

       return Set.copyOf(set);
    }


}
