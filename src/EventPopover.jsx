import {useEffect, useRef, useState} from "react";
import {Button} from "@/components/ui/button.jsx";
import {HiOutlineMenuAlt2, HiOutlineMenuAlt4, HiOutlineUsers} from "react-icons/hi";
import {IoCloseSharp} from "react-icons/io5";
import {FiClock, FiRepeat} from "react-icons/fi";
import {Input} from "@/components/ui/input.jsx";
import dayjs from "dayjs";
import AddTime from "@/AddTime.jsx";
import {cn} from "@/lib/utils.js";
import {IoMdCalendar} from "react-icons/io";
import {useEventStore} from "@/store.js";
import SelectDropdown from "@/components/SelectDropdown.jsx";


export default function EventPopover({isOpen, onClose, date, initialEvent}) {

    const popoverRef = useRef(null);
    const { createEvent, updateEvent, users, selectedRoom } = useEventStore();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if(
                popoverRef.current &&
                !popoverRef.current.contains(event.target)
            ){
                onClose();
            }
        }
        if(isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen, onClose]);

    const handleClose = (e) => {
        e.stopPropagation();
        onClose();
    }

    const handlePopoverClick = (e) => {
        e.stopPropagation();
    }

    const [guestQuery, setGuestQuery] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filteredLabels, setFilteredLabels] = useState([]);
    const [selectedGuests, setSelectedGuests] = useState([]);
    const [showAllAlias, setShowAllAlias] = useState(false);

    const [organizerQuery, setOrganizerQuery] = useState("");
    const [filteredOrganizers, setFilteredOrganizers] = useState([]);

    const [title, setTitle] = useState("");
    const [organizer, setOrganizer] = useState("");
    const [description, setDescription] = useState("");
    const [room, setRoom] = useState(selectedRoom || "Mała sala");
    const [startTime, setStartTime] = useState("09:00");
    const [durationMinutes, setDurationMinutes] = useState(60);
    const [isAllDay, setIsAllDay] = useState(false);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceIntervalWeeks, setRecurrenceIntervalWeeks] = useState(1);
    const [weeksAhead, setWeeksAhead] = useState(4);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const durationOptions = [30, 60, 90, 120, 150, 180, 210, 240].map((value) => ({
        value,
        label: `${value} min`
    }));

    const startTimeToMinutes = (timeValue) => {
        const [hours, minutes] = timeValue.split(":").map(Number);
        return hours * 60 + minutes;
    };

    const availableDurationOptions = durationOptions.filter(
        ({ value }) => value <= 18 * 60 - startTimeToMinutes(startTime)
    );

    const roomOptions = [
        { value: "Mała sala", label: "Mała sala" },
        { value: "Duża sala", label: "Duża sala" },
    ];

    useEffect(() => {
        if (!initialEvent) {
            setTitle("");
            setOrganizer("");
            setDescription("");
            setRoom(selectedRoom || "Mała sala");
            setSelectedGuests([]);
            setStartTime("09:00");
            setDurationMinutes(60);
            setIsAllDay(false);
            setIsRecurring(false);
            setRecurrenceIntervalWeeks(1);
            setWeeksAhead(4);
            return;
        }

        setTitle(initialEvent.title || "");
        setOrganizer(initialEvent.organizer || "");
        setDescription(initialEvent.description || "");
        setRoom(initialEvent.room || "Mała sala");
        if (initialEvent.start_time) {
            setStartTime(dayjs(initialEvent.start_time).format("HH:mm"));
        }
        if (initialEvent.start_time && initialEvent.end_time) {
            const start = dayjs(initialEvent.start_time);
            const end = dayjs(initialEvent.end_time);
            const diff = Math.max(30, end.diff(start, "minute"));
            const normalized = Math.round(diff / 30) * 30;
            const allDayReservation =
                start.hour() === 6 &&
                start.minute() === 0 &&
                end.hour() === 18 &&
                end.minute() === 0;
            setDurationMinutes(allDayReservation ? 720 : normalized);
            setIsAllDay(allDayReservation);
        } else {
            setDurationMinutes(60);
            setIsAllDay(false);
        }
        setIsRecurring(false);
        setRecurrenceIntervalWeeks(1);
        setWeeksAhead(4);
        const participantNames = initialEvent.participants || [];
        const resolved = participantNames.map((name) => {
            const match = users.find((user) => user.name === name);
            return match || { id: name, name };
        });
        setSelectedGuests(resolved);
    }, [initialEvent, users, selectedRoom]);

    const handleGuestChange = (e) => {
        const value = e.target.value;
        setGuestQuery(value);

        if(!value.trim()){
            setFilteredUsers([]);
            setFilteredLabels([]);
            setShowAllAlias(false);
            return;
        }
        const query = value.toLowerCase();
        const allAlias = ["wszyscy", "wszystkich"].some((alias) => alias.startsWith(query));
        const filtered = users.filter(user =>
        user.name.toLowerCase().includes(query) &&
        !selectedGuests.some(g => g.id === user.id));
        const labels = Array.from(
            new Set(
                users
                    .filter((user) => user.label && user.label.toLowerCase().includes(query))
                    .map((user) => user.label)
            )
        );
        setFilteredUsers(filtered);
        setFilteredLabels(labels);
        setShowAllAlias(allAlias);
    }

    const handleOrganizerChange = (e) => {
        const value = e.target.value;
        setOrganizer(value);
        setOrganizerQuery(value);

        if(!value.trim()){
            setFilteredOrganizers([]);
            return;
        }
        const filtered = users.filter(user =>
            user.name.toLowerCase().includes(value.toLowerCase()));
        setFilteredOrganizers(filtered);
    }

    const handleSelectOrganizer = (user) => {
        setOrganizer(user.name);
        setOrganizerQuery("");
        setFilteredOrganizers([]);
    }

    const handleSelectUser = (user) => {
        setSelectedGuests(prev => [...prev, user]);
        setGuestQuery("");
        setFilteredUsers([]);
    }

    const handleRemoveGuest = (id) => {
        setSelectedGuests(prev => prev.filter(g => g.id !== id));
    }

    const handleSelectLabelGroup = (label) => {
        const matching = users.filter(
            (user) =>
                user.label === label &&
                !selectedGuests.some((guest) => guest.id === user.id)
        );
        if (matching.length === 0) {
            return;
        }
        setSelectedGuests(prev => [...prev, ...matching]);
        setGuestQuery("");
        setFilteredUsers([]);
        setFilteredLabels([]);
        setShowAllAlias(false);
    }

    const handleSelectAllUsers = () => {
        const allUsers = users.filter(
            (user) => !selectedGuests.some((guest) => guest.id === user.id)
        );
        if (allUsers.length === 0) {
            return;
        }
        setSelectedGuests(prev => [...prev, ...allUsers]);
        setGuestQuery("");
        setFilteredUsers([]);
        setFilteredLabels([]);
        setShowAllAlias(false);
    }

    const buildDateTime = (baseDate, timeValue) => {
        const [hours, minutes] = timeValue.split(":").map((value) => Number(value));
        return dayjs(baseDate)
            .hour(hours || 0)
            .minute(minutes || 0)
            .second(0)
            .millisecond(0);
    }

    const handleStartTimeSelect = (timeValue) => {
        const maxDuration = 18 * 60 - startTimeToMinutes(timeValue);
        setStartTime(timeValue);
        setIsAllDay(false);
        setDurationMinutes((currentDuration) => Math.min(currentDuration, maxDuration));
    };

    const handleAllDayToggle = () => {
        setIsAllDay((currentValue) => {
            const nextValue = !currentValue;
            if (nextValue) {
                setStartTime("06:00");
                setDurationMinutes(720);
            } else {
                setDurationMinutes(60);
            }
            return nextValue;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title.trim()) {
            setError("Tytuł jest wymagany");
            return;
        }
        if (!organizer.trim()) {
            setError("Organizator jest wymagany");
            return;
        }
        if (!initialEvent && isRecurring && (!Number.isInteger(weeksAhead) || weeksAhead < 1 || weeksAhead > 52)) {
            setError("Liczba tygodni musi być od 1 do 52");
            return;
        }

        const startDate = buildDateTime(date, startTime);
        const endDate = startDate.add(durationMinutes, "minute");

        setIsSubmitting(true);
        try {
            const payload = {
                title: title.trim(),
                description: description.trim() || null,
                organizerName: organizer.trim(),
                participants: selectedGuests.map((guest) => guest.name),
                startTime: startDate.toISOString(),
                endTime: endDate.toISOString(),
                room: room,
                visibility: "default",
                status: "busy",
                recurrence: !initialEvent && isRecurring ? {
                    enabled: true,
                    intervalWeeks: recurrenceIntervalWeeks,
                    weeksAhead,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Warsaw"
                } : { enabled: false }
            };

            if (initialEvent?.id) {
                await updateEvent(initialEvent.id, payload);
            } else {
                await createEvent(payload);
            }

            setTitle("");
            setOrganizer("");
            setDescription("");
            setRoom(selectedRoom || "Mała sala");
            setSelectedGuests([]);
            onClose();
        } catch (submitError) {
            setError(submitError.message || "Nie udało się zapisać spotkania");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={handleClose}
        >
            <div
                ref={popoverRef}
                className="w-full max-w-md rounded-lg border border-border/60 bg-card text-foreground shadow-lg"
                onClick={handlePopoverClick}
            >
                <div className="mb-2 flex items-center justify-between rounded-md bg-muted/60 p-2 text-muted-foreground">
                    <HiOutlineMenuAlt4 />
                    <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={handleClose}
                    >
                        <IoCloseSharp className="h-4 w-4" />
                    </Button>
                </div>
                <form className="space-y-4 p-6" onSubmit={handleSubmit}>
                    <div>
                        <Input
                            type="text"
                            name="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Tytuł spotkania"
                            className="my-4 rounded-none border-0 border-b border-border/60 bg-transparent text-2xl focus-visible:border-b-2 focus-visible:border-b-primary focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </div>

                    <div className="flex items-center space-x-3">
                        <FiClock className="size-5 text-muted-foreground" />
                        <div className="flex flex-wrap items-center gap-3 text-sm text-foreground">
                            <p>{dayjs(date).locale("pl").format("D.MM (dddd)")}</p>
                            {isAllDay ? (
                                <span className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
                                    06:00-18:00
                                </span>
                            ) : (
                                <>
                                    <AddTime value={startTime} onTimeSelect={handleStartTimeSelect} />
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">Czas</span>
                                        <SelectDropdown
                                            value={durationMinutes}
                                            options={availableDurationOptions}
                                            onChange={(value) => setDurationMinutes(Number(value))}
                                            buttonClassName="w-28 justify-between"
                                            menuClassName="w-28"
                                        />
                                    </div>
                                </>
                            )}
                            <Button
                                type="button"
                                variant={isAllDay ? "default" : "outline"}
                                size="sm"
                                onClick={handleAllDayToggle}
                            >
                                Cały dzień
                            </Button>
                        </div>
                    </div>

                    {!initialEvent ? (
                        <div className="flex items-start space-x-3">
                            <FiRepeat className="mt-2 size-5 text-muted-foreground" />
                            <div className="w-full space-y-2">
                                <Button
                                    type="button"
                                    variant={isRecurring ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setIsRecurring((currentValue) => !currentValue)}
                                >
                                    Spotkanie cykliczne
                                </Button>
                                {isRecurring && (
                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                        <SelectDropdown
                                            value={recurrenceIntervalWeeks}
                                            options={[
                                                { value: 1, label: "Co tydzień" },
                                                { value: 2, label: "Co 2 tygodnie" }
                                            ]}
                                            onChange={(value) => setRecurrenceIntervalWeeks(Number(value))}
                                            buttonClassName="w-32 justify-between"
                                            menuClassName="w-32"
                                        />
                                        <Input
                                            type="number"
                                            min="1"
                                            max="52"
                                            value={weeksAhead}
                                            onChange={(e) => setWeeksAhead(Number(e.target.value))}
                                            className="h-9 w-20"
                                            aria-label="Liczba tygodni do przodu"
                                        />
                                        <span className="text-muted-foreground">tygodni do przodu</span>
                                        <p className="w-full text-xs text-muted-foreground">
                                            Utworzy się {Math.floor(weeksAhead / recurrenceIntervalWeeks) + 1} spotkań, wliczając pierwszy termin.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : initialEvent.series_id ? (
                        <p className="text-xs text-muted-foreground">
                            To spotkanie jest częścią serii. Zmiany dotyczą tylko tego terminu.
                        </p>
                    ) : null}

                    <div className="flex items-center space-x-3">
                        <HiOutlineMenuAlt2 className="size-5 text-muted-foreground" />
                        <div className="relative w-full">
                            <Input
                                type="text"
                                name="organizer"
                                value={organizer}
                                onChange={handleOrganizerChange}
                                placeholder="Organizator"
                                className={cn(
                                    "w-full rounded-lg border border-border/60 bg-muted/60 pl-7 text-foreground placeholder:text-muted-foreground",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0",
                                )}
                            />
                            {filteredOrganizers.length > 0 && organizerQuery && (
                                <div className="absolute z-10 mt-1 w-full rounded-lg border border-border/60 bg-popover text-foreground shadow-md">
                                    {filteredOrganizers.map((user) => (
                                        <div
                                            key={user.id}
                                            onClick={() => handleSelectOrganizer(user)}
                                            className="cursor-pointer px-3 py-2 hover:bg-accent/40"
                                        >
                                            {user.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="relative flex items-start space-x-3">
                        <HiOutlineUsers className="mt-2 size-5 text-muted-foreground" />

                        <div className="relative w-full">

                            <div className="mb-2 flex flex-wrap gap-2">
                                {selectedGuests.map((guest) => (
                                    <div
                                        key={guest.id}
                                        className="flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-sm text-primary"
                                    >
                                        {guest.name}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveGuest(guest.id)}
                                            className="text-primary/80 hover:text-destructive"
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <Input
                                type="text"
                                value={guestQuery}
                                onChange={handleGuestChange}
                                placeholder="Dodaj uczestników"
                                className="w-full rounded-lg border border-border/60 bg-muted/60 text-foreground placeholder:text-muted-foreground"
                            />

                            {(showAllAlias || filteredLabels.length > 0 || filteredUsers.length > 0) && (
                                <div className="absolute z-10 mt-1 w-full rounded-lg border border-border/60 bg-popover text-foreground shadow-md">
                                    {showAllAlias && (
                                        <div
                                            onClick={handleSelectAllUsers}
                                            className="cursor-pointer px-3 py-2 font-semibold text-primary hover:bg-accent/40"
                                        >
                                            Dodaj wszystkich
                                        </div>
                                    )}
                                    {filteredLabels.map((label) => (
                                        <div
                                            key={`label-${label}`}
                                            onClick={() => handleSelectLabelGroup(label)}
                                            className="cursor-pointer px-3 py-2 font-medium text-primary hover:bg-accent/40"
                                        >
                                            Dodaj: {label}
                                        </div>
                                    ))}
                                    {filteredUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            onClick={() => handleSelectUser(user)}
                                            className="cursor-pointer px-3 py-2 hover:bg-accent/40"
                                        >
                                            {user.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <HiOutlineMenuAlt2 className="size-5 text-muted-foreground" />
                        <Input
                            type="text"
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Opis spotkania"
                            className={cn(
                                "w-full rounded-lg border border-border/60 bg-muted/60 pl-7 text-foreground placeholder:text-muted-foreground",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0",
                            )}
                        />
                    </div>

                    <div className="flex items-center space-x-3">
                        <IoMdCalendar className="size-5 text-muted-foreground" />
                        <div className="w-full">
                            <SelectDropdown
                                value={room}
                                options={roomOptions}
                                onChange={setRoom}
                                buttonClassName="w-36 justify-between"
                                menuClassName="w-36"
                                scrollClassName="h-20"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end space-x-2">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Zapisywanie..." : initialEvent ? "Zapisz zmiany" : "Utwórz spotkanie"}
                        </Button>
                    </div>


                </form>
            </div>
        </div>
    );
}
