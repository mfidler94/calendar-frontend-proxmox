import {cn} from "@/lib/utils.js";
import dayjs from "dayjs";
import {useDateStore, useEventStore} from "@/store.js";
import EventsRenderer from "@/components/EventsRenderer.jsx";

export default function MonthViewBox({day,rowIndex}){


    const {openPopover, events, selectedRoom} = useEventStore();
    const {setDate} = useDateStore();

    if(!day){
        return <div className="h-12 w-full border border-border/50 md:h-28 md:w-full lg:h-full"></div>
    }
    const isFirstDayOfMonth = day.date() === 1;
    const isToday = day.isSame(dayjs(), "day");
    const isWeekend = day.day() === 0 || day.day() === 6;
    const roomEvents = events.filter((event) => event.room === selectedRoom);

    const handleClick = (e)=>{
        e.preventDefault()
        setDate(day)
        openPopover()
    }
    return(
        <div
            className={cn(
                "group relative flex flex-col items-center gap-y-2 border border-border/60 transition-all",
                isWeekend ? "bg-muted/40 hover:bg-accent/40" : "bg-card/40 hover:bg-accent/30",
            )}
            onClick={handleClick}
        >
            <div className="flex flex-col items-center">

                {
                    rowIndex === 0 && (
                    <h4 className={cn("text-xs text-muted-foreground", isWeekend && "text-primary/80")}>
                        {day.locale("pl").format("ddd").toUpperCase()}
                    </h4>
                    )
                }
                <h4 className={cn(
                    "text-center text-sm text-foreground",
                    isToday && "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground")}
                >
                    {isFirstDayOfMonth ? day.locale("pl").format("MMM D") : day.format("D")}
                </h4>


            </div>
            <EventsRenderer date={day} view="month" events={roomEvents}/>
        </div>
    );
}
