import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import dayjs from "dayjs";
import {getMonth} from "@/lib/getTime.js";

const API_BASE = (import.meta.env.VITE_API_BASE || "/api").replace(/\/$/, "");

const mapEvent = (event) => ({
    ...event,
    date: dayjs(event.start_time),
});

const buildEventsUrl = (from, to, room) => {
    const params = new URLSearchParams();
    if (from) {
        params.set("from", from);
    }
    if (to) {
        params.set("to", to);
    }
    if (room) {
        params.set("room", room);
    }
    const query = params.toString();
    return query ? `${API_BASE}/events?${query}` : `${API_BASE}/events`;
};

export const useViewStore = create(
    devtools(
        persist(
            (set) =>({
                selectedView: "week",
                setView: (value) => set({ selectedView: value }),
                }

            ),
            {name: "calendar-view", skipHydration: true}
        ),
    ),
);

export const useDateStore = create(
    devtools(
        persist(
            (set) =>({
                userSelectedDate: dayjs(),
                twoDMonthArray: getMonth(),
                selectedMonthIndex: dayjs().month(),
                setDate: (value) => set({userSelectedDate: value}),
                setMonth: (index) => set({twoDMonthArray: getMonth(index), selectedMonthIndex: index}),
            }),
            {name:"date_data", skipHydration: true},
        ),
    ),
);

export const useEventStore = create(
    (set, get) =>({
        events: [],
        users: [],
        selectedRoom: "Mała sala",
        isPopoverOpen: false,
        isEventSummaryOpen: false,
        selectedEvent: null,
        editingEvent: null,
        isLoading: false,
        error: null,
        setEvents: (events) => set({events}),
        setUsers: (users) => set({ users }),
        setRoom: (room) => set({ selectedRoom: room }),
        openPopover: () => set({isPopoverOpen: true, editingEvent: null}),
        openPopoverWithEvent: (event) => set({isPopoverOpen: true, editingEvent: event, isEventSummaryOpen: false, selectedEvent: null}),
        closePopover: () => set({isPopoverOpen: false, editingEvent: null}),
        openEventSummary: (event) => set({isEventSummaryOpen: true, selectedEvent: event}),
        closeEventSummary: () => set({isEventSummaryOpen: false}),
        fetchUsers: async () => {
            try {
                const response = await fetch(`${API_BASE}/users`);
                if (!response.ok) {
                    throw new Error("Nie udało się pobrać użytkowników");
                }
                const data = await response.json();
                set({ users: data.users || [] });
            } catch (error) {
                set({ error: error.message });
            }
        },
        fetchEvents: async ({ from, to } = {}) => {
            set({ isLoading: true, error: null });
            try {
                const room = get().selectedRoom;
                const response = await fetch(buildEventsUrl(from, to, room));
                if (!response.ok) {
                    throw new Error("Nie udało się pobrać spotkań");
                }
                const data = await response.json();
                const mapped = (data.events || []).map(mapEvent);
                set({ events: mapped, isLoading: false });
            } catch (error) {
                set({ error: error.message, isLoading: false });
            }
        },
        createEvent: async (payload) => {
            const response = await fetch(`${API_BASE}/events`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Nie udało się utworzyć spotkania");
            }

            const data = await response.json();
            const event = mapEvent(data.event);
            set({ events: [...get().events, event] });
            return event;
        },
        updateEvent: async (id, payload) => {
            const response = await fetch(`${API_BASE}/events/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Nie udało się zaktualizować spotkania");
            }

            const data = await response.json();
            const updated = mapEvent(data.event);
            set({ events: get().events.map((event) => (event.id === updated.id ? updated : event)) });
            return updated;
        },
        deleteEvent: async (id) => {
            const response = await fetch(`${API_BASE}/events/${id}`, { method: "DELETE" });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Nie udało się usunąć spotkania");
            }
            set({ events: get().events.filter((event) => event.id !== id) });
        }
    })
)

export const useToggleSideBarOpen = create(
    (set,get) => ({
        isSideBarOpen: true,
        setSideBarOpen: () => {
            set({isSideBarOpen: !get().isSideBarOpen});
        },
    }),
)
