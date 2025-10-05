"use client"

import { useEffect, useMemo } from "react";
import { CalendarBody, CalendarDate, CalendarDatePagination, CalendarDatePicker, CalendarHeader, CalendarItem, CalendarMonthPicker, CalendarProvider, CalendarState, CalendarYearPicker, Feature, useCalendarMonth, useCalendarYear } from "./ui/kibo-ui/calendar";
import { isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Custom Birthday Calendar Component
type BirthdayCalendarProps = {
  selectedDate?: string;
  onDateSelect: (date: string) => void;
};

const BirthdayCalendar = ({ selectedDate, onDateSelect }: BirthdayCalendarProps) => {
  const [month, setMonth] = useCalendarMonth();
  const [year, setYear] = useCalendarYear();
  
  useEffect(() => {
  if (selectedDate) {
    const currentDate = new Date(selectedDate);
    const parsedMonth = currentDate.getMonth();
    if (parsedMonth >= 0 && parsedMonth <= 11) {
      setMonth(parsedMonth as CalendarState['month']);
    }
    setYear(currentDate.getFullYear());
  }
}, []);


  // Create a fake feature for the selected birthday
  const birthdayFeature: Feature | null = useMemo(() => {
    if (!selectedDate) return null;
    
    return {
      id: 'birthday',
      name: '🎂',
      startAt: new Date(selectedDate),
      endAt: new Date(selectedDate),
      status: {
        id: 'birthday-status',
        name: 'Birthday',
        color: '#FF6B6B'
      }
    };
  }, [selectedDate]);

  const features = birthdayFeature ? [birthdayFeature] : [];

  // Handle day click
  const handleDayClick = (day: number) => {
    const selectedDateObj = new Date(year, month, day);
    const today = new Date();
    
    // Não permitir datas futuras
    if (selectedDateObj > today) {
      toast.error("Não é possível selecionar uma data futura");
      return;
    }

    // Não permitir datas muito antigas (antes de 1900)
    if (selectedDateObj < new Date(1900, 0, 1)) {
      toast.error("Por favor, selecione uma data válida");
      return;
    }

    onDateSelect(selectedDateObj.toISOString());
  };

  return (
    <CalendarProvider>
      <CalendarDate>
        <CalendarDatePicker>
          <CalendarMonthPicker />
          <CalendarYearPicker start={1900} end={new Date().getFullYear()} />
        </CalendarDatePicker>
      </CalendarDate>
      <CalendarHeader />
      <CalendarBody features={features}>
        {({ feature }) => (
          <CalendarItem
            feature={feature} 
            key={feature.id}
            onClick={() => handleDayClick(feature.startAt.getDate())}
          />
        )}
      </CalendarBody>
      
      
      {/* Interceptar cliques nos dias */}
      <div 
        className="absolute inset-0 grid grid-cols-7 pointer-events-none"
        style={{ 
          top: '100px', // Ajustar baseado na altura do header
          gridTemplateRows: 'repeat(5, 1fr)'
        }}
      >
        {Array.from({ length: 42 }, (_, index) => {
          const day = index - new Date(year, month, 1).getDay() + 1;
          const isValidDay = day > 0 && day <= new Date(year, month + 1, 0).getDate();
          const dayDate = new Date(year, month, day);
          const isSelected = selectedDate && isSameDay(dayDate, new Date(selectedDate));
          const isFutureDate = dayDate > new Date();

          if (!isValidDay) return <div key={index} />;
          
          return (
            <div
              key={index}
              className={cn(
                "calendar-day-clickable pointer-events-auto flex items-start justify-center p-2",
                isSelected && "calendar-day-selected",
                isFutureDate && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !isFutureDate && handleDayClick(day)}
            />
          );
        })}
      </div>
    </CalendarProvider>
  );
};

export default BirthdayCalendar