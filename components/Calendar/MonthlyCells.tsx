import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isSameDay,
  addDays,
  isToday,
  isAfter,
  isBefore,
  parseISO
} from 'date-fns'
import { watchFile } from 'fs';
import { useEffect, useState } from 'react';
import { sortAscending } from '../../helpers/sorter'

export default function renderCells(props) {
  const [monthStart, setMonthStart] = useState(startOfMonth(props.currentMonth))
  const [monthEnd, setMonthEnd] = useState(endOfMonth(props.currentMonth))
  const [startDate, setStartDate] = useState(startOfWeek(monthStart))
  const [endDate, setEndDate] = useState(endOfWeek(monthEnd))
  const [scheduleList, setScheduleList] = useState([])

  useEffect(() => {
    let newArr = props.scheduleList.filter(schedule => isAfter(parseISO(schedule.startTime), startDate) && isBefore(parseISO(schedule.startTime), endDate))
    sortAscending(newArr, 'startTime')
    setScheduleList(newArr)
  }, [props.scheduleList])

  useEffect(() => {
    setMonthStart(startOfMonth(props.currentMonth))
    setMonthEnd(endOfMonth(props.currentMonth))
  }, [props.currentMonth])

  useEffect(() => {
    setStartDate(startOfWeek(monthStart))
    setEndDate(endOfWeek(monthEnd))
    day = startDate
  }, [monthEnd])


  const renderSchedule = (paramDay) => {
    let dailySchedule = scheduleList.filter(sch => isSameDay(paramDay, parseISO(sch.startTime)))
    if (dailySchedule) {
      return (<ul className="w-full flex-row">
        {dailySchedule.map((e, i) => {
          return (

            <li className="w-full overflow-y-hidden overflow-x-hidden text-xs sm:text-base md:text-xs lg:text-base" key={i}>
              <p className="hidden sm:inline">
                {e.type[0]}
                {" "}
              </p>
              {format(parseISO(e.startTime), "kk:mm")}
              <p className="hidden md:inline">
                {"-"}
                {format(parseISO(e.endTime), "kk:mm")}
              </p>
            </li>
          )
        })}
      </ul>)
    }

  }


  let dateNum = "";
  const dateFormat = "d";
  let rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      let dayv2 = day
      dateNum = format(day, dateFormat);
      days.push(
        <div
          className={`h-20 flex flex-col  sm:flex-row border border-indigo-400 border-solid md:border-none
          ${!isSameMonth(day, monthStart)
              ?
              isSameDay(day, props.currentDate) ? "bg-gray-400 hover:bg-gray-500" : "bg-gray-100 hover:bg-gray-200"
              : isSameDay(day, props.currentDate) ? "bg-blue-400 hover:bg-blue-500" : "bg-blue-100 hover:bg-blue-200"
            }`}
          key={dateNum + rows.length + i}
          onClick={() => props.setCurrentDate(dayv2)}
        >

          <span className={`text-sm sm:text-base w-6 h-6 sm:h-8 5xl:w-8 ${isToday(day) && "text-blue-800 bg-green-200"}`}>{dateNum}</span>
          <div className="w-full overflow-y-auto overflow-x-hidden">
            {renderSchedule(dayv2)}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7 justify-center  md:gap-x-2 " key={dateNum + "7" + rows.length}>
        {days}
      </div>
    );
    days = [];
  }
  if (!rows) {
    return <div></div>
  }
  return <div className="border border-indigo-400 border-solid md:border-none">
    <div className="flex flex-col md:gap-y-2 ">{rows}</div>
  </div>
}