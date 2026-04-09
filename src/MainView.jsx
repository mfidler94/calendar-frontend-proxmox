"use client"
import MonthView from "@/MonthView.jsx";
import SideBar from "@/sidebar/SideBar.jsx";

import {useDateStore, useEventStore, useViewStore} from "@/store.js";
import WeekView from "@/WeekView.jsx";
import DayView from "@/DayView.jsx";
import EventPopover from "@/EventPopover.jsx";
import {useEffect} from "react";
import EventSummaryPopover from "@/EventSummaryPopover.jsx";


function MainView() {
    const {selectedView} = useViewStore()

    const {userSelectedDate} = useDateStore();
    const {
        isPopoverOpen,
        closePopover,
        isEventSummaryOpen,
        closeEventSummary,
        selectedEvent,
        fetchEvents,
        fetchUsers,
        editingEvent,
        selectedRoom,
    } = useEventStore();

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        const from = userSelectedDate.startOf("month").toISOString();
        const to = userSelectedDate.endOf("month").toISOString();
        fetchEvents({ from, to });
    }, [fetchEvents, userSelectedDate, selectedRoom]);


    return (
        <div className="flex">

            <div className="w-full flex-1">
                {selectedView === "month" && <MonthView/>}
                {selectedView === "week" && <WeekView/>}
                {selectedView === "day" && <DayView/>}
            </div>
            {isPopoverOpen &&
                (<EventPopover
                    isOpen={isPopoverOpen}
                    onClose={closePopover}
                    date={userSelectedDate}
                    initialEvent={editingEvent}
                />
                )}
            {isEventSummaryOpen && selectedEvent && (
                <EventSummaryPopover
                    isOpen={isEventSummaryOpen}
                    onClose={closeEventSummary}
                    event={selectedEvent}
                />

            ) }
        </div>
    );
}

export default MainView;
