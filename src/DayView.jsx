import {useEffect, useRef, useState} from "react";
import dayjs from "dayjs";
import {useDateStore, useEventStore} from "@/store.js";
import {cn} from "@/lib/utils.js";
import {ScrollArea} from "@/components/ui/scroll-area";
import {getHours, isCurrentDay} from "@/lib/getTime.js";

export default function DayView() {

    const [currentTime, setCurrentTime] = useState(dayjs());
    const { userSelectedDate, setDate} = useDateStore()
    const { openPopover, openEventSummary, events, selectedRoom } = useEventStore();
    const viewportRef = useRef(null);
    const hourHeight = 64;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(dayjs());
        }, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!viewportRef.current) return;
        const target = Math.max(0, (dayjs().hour() - 1) * hourHeight);
        viewportRef.current.scrollTop = target;
    }, [userSelectedDate]);

    const minutesFromStart = currentTime.hour() * 60 + currentTime.minute();
    const currentTop = `${(minutesFromStart / (24 * 60)) * 100}%`;
    const isToday = userSelectedDate.isSame(dayjs(), "day");
    const isWeekend = userSelectedDate.day() === 0 || userSelectedDate.day() === 6;
    const roomEvents = events.filter((event) => event.room === selectedRoom);

    const renderEventBlocks = () => {
        const dayStart = userSelectedDate.startOf("day");
        const dayEnd = dayStart.add(1, "day");

        const dayEvents = roomEvents.filter((event) => {
            const start = dayjs(event.start_time || event.date);
            return start.isSame(dayStart, "day");
        });

        return dayEvents.map((event) => {
            const start = dayjs(event.start_time || event.date);
            const end = event.end_time ? dayjs(event.end_time) : start.add(60, "minute");
            const clampedEnd = end.isAfter(dayEnd) ? dayEnd : end;
            const durationMinutes = Math.max(15, clampedEnd.diff(start, "minute"));
            const top = (start.diff(dayStart, "minute") / 60) * hourHeight;
            const height = (durationMinutes / 60) * hourHeight;
            const initials = (event.organizer || "")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join("");

            return (
                <div
                    key={event.id}
                    onClick={(e) => {
                        e.stopPropagation();
                        openEventSummary(event);
                    }}
                    className="absolute left-4 right-4 rounded-md border border-primary/40 bg-primary/70 px-3 py-2 text-sm text-primary-foreground shadow-sm"
                    style={{ top: `${top}px`, height: `${height}px` }}
                    title={event.title}
                >
                    <div className="flex items-start justify-between gap-2">
                        <div className="line-clamp-2 font-medium">{event.title}</div>
                        {initials && (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/20 text-[10px] font-semibold text-primary-foreground">
                                {initials}
                            </div>
                        )}
                    </div>
                    {event.start_time && event.end_time && (
                        <div className="mt-1 text-xs text-primary-foreground/80">
                            {start.format("HH:mm")} - {end.format("HH:mm")}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <>
        <div className="grid grid-cols-[auto_auto_1fr] px-4">
            <div className="w-16 border-r text-xs border-border/60 text-muted-foreground"> GMT+2</div>
            <div className={cn("flex w-16 flex-col items-center", isWeekend && "rounded-lg bg-muted/40 py-2")}>
                <div className={cn("text-xs text-muted-foreground", isToday && "text-primary", isWeekend && "text-primary/80")}>
                    {userSelectedDate.format("ddd")} {" "}
                </div> {" "}
                <div className={cn("h-12 w-12 text-2xl p-2 rounded-full text-foreground", isToday && "bg-primary text-primary-foreground")}>
                    {userSelectedDate.format("DD")} {" "}
                </div>
            </div>
            <div></div>
        </div>

        <ScrollArea className={"h-[70vh]"} viewportRef={viewportRef}>
            <div className="grid grid-cols-[auto_1fr] p-4">
                <div className="w-16 border-r border-border/60">
                    {getHours.map((hour,index) => (
                        <div key={index} className="relative h-16 flex items-center">
                            <div className="absolute -top-2 text-xs text-muted-foreground">
                                {hour.format("HH:mm")}
                            </div>
                            <div className=" text-xs text-primary">
                                {currentTime.hour() === index && isToday ? currentTime.format("HH:mm") : ""}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Day/Boxes Column */}
                <div
                    className={cn("relative border-r border-border/60", isWeekend && "bg-muted/25")}
                    style={{ height: `${hourHeight * 24}px` }}                >
                    {getHours.map((hour, i) => (
                        <div
                            key={i}
                            className="relative h-16 cursor-pointer border-b border-border/60 hover:bg-accent/30" onClick={() => { setDate(userSelectedDate.hour(hour.hour())); openPopover(); }}
                        />
                    ))}

                    {renderEventBlocks()}

                    {
                        isCurrentDay(userSelectedDate) && (
                            <div
                                className={cn("absolute h-0.5 w-full bg-primary")}
                                style={{
                                    top: currentTop,
                                }}
                            />
                        )
                    }
                </div>

            </div>
        </ScrollArea>

        </>

    )
}

