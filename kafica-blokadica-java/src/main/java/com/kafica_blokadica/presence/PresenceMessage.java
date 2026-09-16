package com.kafica_blokadica.presence;

import java.time.OffsetDateTime;
import java.util.Set;

public record PresenceMessage(
        String type, //PRESENCE
        Long eventId,
        Set<Long> onlineUsersIds,
        OffsetDateTime at
) {
}
