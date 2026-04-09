import {useEventStore} from "@/store.js";

export default function EventsRenderer({date, view, events}) {
    const { openEventSummary } = useEventStore();

    const filteredEvents = events.filter((event) => {
        if (view === "month"){
            return event.date.format("DD-MM-YYYY") === date.format("DD-MM-YYYY");
        }
        else if (view === "week" || view === "day"){
            return event.date.format("DD-MM-YYYY HH") === date.format("DD-MM-YYYY HH");
        }
    });

    return (
        <>
            {filteredEvents.map((event) => (
                <div
                key={event.id}
                onClick={(e) => {
                    e.stopPropagation();
                    openEventSummary(event);
                }}
                className="line-clamp-1 w-[90%] cursor-pointer rounded-sm border border-primary/40 bg-primary/70 p-1 text-xs text-primary-foreground shadow-sm">
                    {event.title}
                </div>
            ))
            }


        </>
    )



}
