import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { ScrollArea } from "@/components/ui/scroll-area.jsx";
import { ChevronDown } from "lucide-react";

export default function SelectDropdown({
    value,
    options,
    onChange,
    placeholder = "",
    buttonClassName = "w-24 justify-between",
    menuClassName = "w-32",
    scrollClassName = "h-60",
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const selectedOption = options.find((option) => option.value === value);
    const label = selectedOption ? selectedOption.label : placeholder;

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="outline"
                className={buttonClassName}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                {label}
                <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
            {isOpen && (
                <div className={`absolute z-50 mt-2 rounded-md border bg-popover text-popover-foreground shadow-md ${menuClassName}`}>
                    <ScrollArea className={scrollClassName}>
                        <div className="p-1">
                            {options.map((option) => (
                                <Button
                                    key={String(option.value)}
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    type="button"
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
