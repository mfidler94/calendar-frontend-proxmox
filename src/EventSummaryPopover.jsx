import {IoCloseSharp} from "react-icons/io5";
import {useEffect, useRef} from "react";
import {Button} from "@/components/ui/button.jsx";
import dayjs from "dayjs";
import {useEventStore} from "@/store.js";


export default function EventSummaryPopover({ isOpen, onClose, event }) {

    const popoverRef = useRef(null)
    const { deleteEvent, openPopoverWithEvent } = useEventStore();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onClose])

    if (!isOpen || !event) return null

    const startValue = event.start_time || event.date;
    const endValue = event.end_time;

    const handleEdit = () => {
        openPopoverWithEvent(event);
    };

    const handleDelete = async () => {
        const shouldDelete = window.confirm("Usunąć to spotkanie?");
        if (!shouldDelete) return;
        await deleteEvent(event.id);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                ref={popoverRef}
                className="w-full max-w-md rounded-lg border border-border/60 bg-card p-6 text-foreground shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Szczegóły spotkania</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <IoCloseSharp className="h-4 w-4" />
                    </Button>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">Tytuł:</strong> {event.title}</p>
                    <p><strong className="text-foreground">Organizator:</strong> {event.organizer || "-"}</p>
                    <p><strong className="text-foreground">Czas:</strong> {dayjs(startValue).locale("pl").format("dddd, D MMMM, HH:mm")}</p>
                    {endValue && (
                        <p><strong className="text-foreground">Koniec:</strong> {dayjs(endValue).format("HH:mm")}</p>
                    )}
                    <p><strong className="text-foreground">Sala:</strong> {event.room || "-"}</p>
                    <p><strong className="text-foreground">Uczestnicy:</strong> {(event.participants || []).join(", ") || "-"}</p>
                    <p><strong className="text-foreground">Opis:</strong> {event.description || "-"}</p>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={handleEdit}>Edytuj</Button>
                    <Button variant="destructive" type="button" onClick={handleDelete}>Usuń</Button>
                </div>
            </div>
        </div>
    )
}
