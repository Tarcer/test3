"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export default function WithdrawalDaysCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [withdrawalDays, setWithdrawalDays] = useState([5, 10, 15, 20, 25, 30])

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isWithdrawalDay = withdrawalDays.includes(day)
      days.push(
        <div
          key={day}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full text-sm",
            isWithdrawalDay ? "bg-primary text-primary-foreground" : "hover:bg-muted",
          )}
        >
          {day}
        </div>,
      )
    }

    return days
  }

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ]

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="text-sm font-medium text-muted-foreground">
          &lt; Précédent
        </button>
        <h3 className="text-sm font-medium">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button onClick={nextMonth} className="text-sm font-medium text-muted-foreground">
          Suivant &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground">
        <div>Dim</div>
        <div>Lun</div>
        <div>Mar</div>
        <div>Mer</div>
        <div>Jeu</div>
        <div>Ven</div>
        <div>Sam</div>
      </div>
      <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
      <div className="mt-2 text-center text-xs text-muted-foreground">
        Les jours en surbrillance sont les jours de retrait autorisés
      </div>
    </div>
  )
}
