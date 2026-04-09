'use client'
import React, {Fragment} from 'react';
import MonthViewBox from "@/MonthViewBox.jsx";
import {useDateStore} from "@/store.js";

export default function MonthView() {

    const {twoDMonthArray} = useDateStore();

    return (
        <section className="grid grid-cols-7 grid-rows-5 lg:h-[90vh]">
            {
                twoDMonthArray.map((row,i) => (
                    <Fragment key={i}>
                        {
                            row.map((day,index) => (
                                <MonthViewBox key={index} day={day} rowIndex={i}/>
                            ))
                        }
                    </Fragment>
                ))
            }

        </section>
    );
}