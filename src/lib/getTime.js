import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

export const isCurrentDay = (day) => {
    return day.isSame(dayjs(), 'day');
};

export const getMonth = (month = dayjs().month()) => {
    const year = dayjs().year();
    const firstDayofMonth = dayjs().set("month", month).startOf("month").isoWeekday();
    let dayCounter = 1 - firstDayofMonth;
    return Array.from({length: 5}, () => Array.from({length: 7}, () =>
        dayjs(new Date(year, month, ++dayCounter))));
}

export const getWeekDays = (date) => {
    const startOfWeek = date.startOf("isoWeek")
    const weekDates =[]

    for(let i = 0; i<7;i++){
        const currentDate = startOfWeek.add(i, "day");
        weekDates.push({
            currentDate,
            today:
                currentDate.toDate().toDateString() === dayjs().toDate().toDateString(),
            isCurrentDay,
        });
    }
    return weekDates;
}

export const getHours = Array.from({length: 24}, (_, i) =>
    dayjs().startOf("day").add(i, "hour")
);
