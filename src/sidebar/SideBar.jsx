import {cn} from '@/lib/utils'
import CreateButton from "@/sidebar/CreateButton.jsx";
import ChooseRoom from "@/sidebar/ChooseRoom.jsx";
import SideBarCalendar from "@/sidebar/SideBarCalendar.jsx";
import {useToggleSideBarOpen} from "@/store.js";

export default function SideBar() {

    const { isSideBarOpen } = useToggleSideBarOpen();
    return (
        <aside className={cn("w-92 hidden transition-all duration-300 ease-in-out border-t py-3 px-2 lg:block", !isSideBarOpen && "lg:hidden")}>
            <ChooseRoom/>
            <CreateButton/>
            <SideBarCalendar/>
        </aside>
    );
}