"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.jsx"
import {useViewStore} from "@/store.js";


export default function RightsideHeader() {

    const {setView} = useViewStore();

    return (
        <div className="flex items-center space-x-4">
            <Select onValueChange={(value) => setView(value)}>
                <SelectTrigger className="cursor-pointer w-24 focus-visible:outline-none">
                    <SelectValue placeholder="Miesiąc"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="day">Dzień</SelectItem>
                    <SelectItem value="week">Tydzień</SelectItem>
                    <SelectItem value="month">Miesiąc</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
