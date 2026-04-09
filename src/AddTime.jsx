'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button.jsx"
import { ScrollArea } from "@/components/ui/scroll-area.jsx"
import { ChevronDown } from "lucide-react"

export default function AddTime({onTimeSelect, value}) {
    const isControlled = value !== undefined && value !== null
    const [isOpen, setIsOpen] = useState(false)
    const [internalTime, setInternalTime] = useState('00:00')
    const dropdownRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const generateTimeIntervals = () => {
        const intervals = []
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                intervals.push(
                    `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                )
            }
        }
        return intervals
    }

    const handleTimeSelect = (time) => {
        if (!isControlled) {
            setInternalTime(time)
        }
        if (onTimeSelect) {
            onTimeSelect(time)
        }
        setIsOpen(false)
    }

    const selectedTime = isControlled ? value : internalTime

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="outline"
                className="w-24 justify-between"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedTime}
                <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
            {isOpen && (
                <div className="absolute z-50 mt-2 w-24 rounded-md border bg-popover text-popover-foreground shadow-md ">
                    <ScrollArea className="h-60">
                        <div className="p-1">
                            {generateTimeIntervals().map((time) => (
                                <Button
                                    key={time}
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => handleTimeSelect(time)}
                                >
                                    {time}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    )
}
