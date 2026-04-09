'use client'
import { Button } from "@/components/ui/button";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { useDateStore, useEventStore, useViewStore } from "@/store.js";
import dayjs from "dayjs";
import 'dayjs/locale/pl'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

dayjs.locale("pl");

export default function LeftsideHeader() {
    const todaysDate = dayjs();
    const { userSelectedDate, setDate, setMonth, selectedMonthIndex } = useDateStore();
    const { selectedView, setView } = useViewStore();
    const { selectedRoom, setRoom } = useEventStore();

    const rooms = ["Mała sala", "Duża sala"];
    const viewOptions = [
        { value: "day", label: "Dzień" },
        { value: "week", label: "Tydzień" },
        { value: "month", label: "Miesiąc" },
    ];

    const optionClass = (isActive) => (
        `flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
            isActive
                ? "border-primary/70 bg-primary/15 text-foreground ring-2 ring-primary/30"
                : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
        }`
    );

    const handleTodayClick = () => {
        switch (selectedView) {
            case "month":
                setMonth(dayjs().month());
                break;

            case "week":
                setDate(todaysDate);
                break;

            case "day":
                setDate(todaysDate);
                setMonth(dayjs().month());
                break;

            default:
                break;
        }
    };

    const handlePrevClick = () => {
        switch (selectedView) {
            case "month":
                setMonth(selectedMonthIndex - 1);
                break;
            case "week":
                setDate(userSelectedDate.subtract(1, "week"));
                break;
            case "day":
                setDate(userSelectedDate.subtract(1, "day"));
                break;
            default:
                break;
        }
    };

    const handleNextClick = () => {
        switch (selectedView) {
            case "month":
                setMonth(selectedMonthIndex + 1);
                break;
            case "week":
                setDate(userSelectedDate.add(1, "week"));
                break;
            case "day":
                setDate(userSelectedDate.add(1, "day"));
                break;
            default:
                break;
        }
    };

    return (
        <div className="grid w-full items-center gap-4 border-b border-border/40 pb-3 lg:grid-cols-[1fr_auto_1fr]">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={handleTodayClick}>Dzisiaj</Button>
                    <div className="flex items-center gap-2">
                        <MdKeyboardArrowLeft className="size-6 cursor-pointer font-bold text-muted-foreground hover:text-foreground" onClick={handlePrevClick} />
                        <MdKeyboardArrowRight className="size-6 cursor-pointer font-bold text-muted-foreground hover:text-foreground" onClick={handleNextClick} />
                    </div>
                </div>
                <div className="h-6 w-px bg-border/60" />
                <RadioGroup
                    value={selectedRoom}
                    onValueChange={setRoom}
                    className="grid grid-cols-2 gap-2"
                >
                    {rooms.map((room) => (
                        <label key={room} className={optionClass(selectedRoom === room)}>
                            <RadioGroupItem value={room} className="sr-only" />
                            {room}
                        </label>
                    ))}
                </RadioGroup>
            </div>

            <h1 className="hidden min-w-[10rem] text-center text-lg font-semibold text-foreground/90 lg:block">
                {dayjs(new Date(dayjs().year(), selectedMonthIndex)).format("MMMM YYYY")}
            </h1>

            <div className="flex w-full justify-start lg:justify-end">
                <RadioGroup
                    value={selectedView}
                    onValueChange={setView}
                    className="grid grid-cols-3 gap-2"
                >
                    {viewOptions.map((view) => (
                        <label key={view.value} className={optionClass(selectedView === view.value)}>
                            <RadioGroupItem value={view.value} className="sr-only" />
                            {view.label}
                        </label>
                    ))}
                </RadioGroup>
            </div>
        </div>
    )
}
