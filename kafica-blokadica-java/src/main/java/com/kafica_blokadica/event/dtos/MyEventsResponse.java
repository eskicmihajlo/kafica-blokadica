package com.kafica_blokadica.event.dtos;

import java.util.List;

public record MyEventsResponse(

        List<MyEventRow> events
) {
}
