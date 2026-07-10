import {getHours, getWeekDays} from "@/lib/getTime.js";
import {useDateStore, useEventStore} from "@/store.js";
import {cn} from "@/lib/utils.js";
import {useEffect, useRef, useState} from "react";
import dayjs from "dayjs";
import {ScrollArea} from "@/components/ui/scroll-area";


export default function WeekView() {

    const [currentTime, setCurrentTime] = useState(dayjs());
    const { userSelectedDate, setDate} = useDateStore()
    const { openPopover, openEventSummary, events, selectedRoom } = useEventStore();
    const viewportRef = useRef(null);
    const previousTimeRef = useRef(dayjs());
    const hourHeight = 64;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(dayjs());
        }, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!viewportRef.current) return;

        if (!userSelectedDate.isSame(currentTime, "isoWeek")) return;

        const minutesFromStart = currentTime.hour() * 60 + currentTime.minute();
        const target = Math.max(0, ((minutesFromStart - 60) / 60) * hourHeight);
        viewportRef.current.scrollTop = target;
    }, [currentTime, userSelectedDate]);

    useEffect(() => {
        const previousTime = previousTimeRef.current;
        const crossedIntoNewWeek = !previousTime.isSame(currentTime, "isoWeek");

        if (crossedIntoNewWeek && userSelectedDate.isSame(previousTime, "isoWeek")) {
            setDate(currentTime);
        }

        previousTimeRef.current = currentTime;
    }, [currentTime, setDate, userSelectedDate]);

    const minutesFromStart = currentTime.hour() * 60 + currentTime.minute();
    const currentTop = `${(minutesFromStart / (24 * 60)) * 100}%`;
    const roomEvents = events.filter((event) => event.room === selectedRoom);
    const localizedWeek = getWeekDays(userSelectedDate).map((entry) => ({
        ...entry,
        currentDate: entry.currentDate.locale("pl"),
    }));

    const renderEventBlocks = (dayDate) => {
        const dayStart = dayDate.startOf("day");
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
                    className="absolute left-2 right-2 rounded-md border border-primary/40 bg-primary/70 px-2 py-1 text-xs text-primary-foreground shadow-sm"
                    style={{ top: `${top}px`, height: `${height}px` }}
                    title={event.title}
                >
                    <div className="flex items-start justify-between gap-2">
                        <div className="line-clamp-2 font-medium">{event.title}</div>
                        {initials && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/20 text-[9px] font-semibold text-primary-foreground">
                                {initials}
                            </div>
                        )}
                    </div>
                    {event.start_time && event.end_time && (
                        <div className="mt-1 text-[10px] text-primary-foreground/80">
                            {start.format("HH:mm")} - {end.format("HH:mm")}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <>
            <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr] place-items-center px-4 py-2">
                <div className="w-16 border-r border-border/60">
                    <div className="relative h-16">
                        <div className="absolute top-2 text-xs text-muted-foreground">GMT+2</div>
                    </div>
                </div>
                {localizedWeek.map(({currentDate,today}, index) => {
                    const isWeekend = currentDate.day() === 0 || currentDate.day() === 6;
                    return (
                        <div
                            key={index}
                            className={cn("flex h-full flex-col items-center justify-center", isWeekend && "rounded-lg bg-muted/40 px-2")}
                        >
                            <div className={cn("text-xs text-muted-foreground", today && "text-primary", isWeekend && "text-primary/80")}>
                                {currentDate.format("ddd")}
                            </div>

                            <div className={cn("h-12 w-12 rounded-full p-2 text-2xl text-foreground", today && "bg-primary text-primary-foreground")}>
                                {currentDate.format("DD")} {" "}
                            </div>
                        </div>
                    )
                })}
            </div>

            <ScrollArea className="h-[70vh]" viewportRef={viewportRef}>
                <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr] px-4 py-2">
                    <div className="w-16 border-r border-border/60">
                        {getHours.map((hour,index) => (
                            <div key={index} className="relative h-16 flex items-center">
                               <div className="absolute -top-2 text-xs text-muted-foreground">
                                   {hour.format("HH:mm")}
                               </div>
                                <div className="text-xs text-primary">
                                    {currentTime.hour() === index ? currentTime.format("HH:mm") : ""}
                                </div>
                            </div>
                        ))}
                    </div>

                    {localizedWeek.map(({ currentDate, today }, index) => {
                        const dayDate = currentDate;
                        const isWeekend = currentDate.day() === 0 || currentDate.day() === 6;
                        return (
                            <div
                                key={index}
                                className={cn("relative border-r border-border/60", isWeekend && "bg-muted/25")}
                                style={{ height: `${hourHeight * 24}px` }}                            >
                                {getHours.map((hour,i) => (
                                    <div
                                        key={i}
                                        className="relative h-16 cursor-pointer border-b border-border/60 hover:bg-accent/30" onClick={() => { setDate(dayDate.hour(hour.hour())); openPopover(); }}
                                    />
                                ))}

                                {renderEventBlocks(dayDate)}

                                {today && (
                                    <div
                                        className="absolute h-0.5 w-full bg-primary"
                                        style={{
                                            top: currentTop,
                                        }}
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>
        </>
    );
}

