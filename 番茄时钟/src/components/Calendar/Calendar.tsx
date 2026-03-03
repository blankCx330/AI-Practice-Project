import { useState, useMemo } from 'react';
import { useApp } from '../../context/StudyContext';
import { 
  format, 
  startOfYear, 
  endOfYear, 
  eachMonthOfInterval, 
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import './Calendar.css';

type CalendarView = 'year' | 'month';

const MONTHS = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
];

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function getColorByMinutes(minutes: number): string {
  if (minutes === 0) return '#f5f5f5';
  if (minutes <= 30) return '#ffe0b2';
  if (minutes <= 60) return '#ffb74d';
  if (minutes <= 120) return '#ff9800';
  return '#f57c00';
}

export default function Calendar() {
  const app = useApp();
  const { state, getRecordsByDate, dispatch } = app;
  const { selectedYear, selectedMonth } = state;
  const [view, setView] = useState<CalendarView>('year');

  const yearData = useMemo(() => {
    const yearStart = startOfYear(new Date(selectedYear, selectedYear > new Date().getFullYear() ? 0 : new Date().getMonth()));
    const yearEnd = endOfYear(new Date(selectedYear, selectedYear < new Date().getFullYear() ? 11 : new Date().getMonth()));
    
    return eachMonthOfInterval({ start: yearStart, end: yearEnd }).map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      const dayData = days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const records = getRecordsByDate(dateStr);
        const totalMinutes = records.reduce((sum, r) => sum + r.duration, 0);
        return { date: dateStr, minutes: totalMinutes };
      });
      
      const totalMinutes = dayData.reduce((sum, d) => sum + d.minutes, 0);
      const monthIndex = month.getMonth();
      
      return {
        month: monthIndex,
        monthName: MONTHS[monthIndex],
        days: dayData,
        totalMinutes
      };
    });
  }, [selectedYear, getRecordsByDate]);

  const monthData = useMemo(() => {
    const monthDate = new Date(selectedYear, selectedMonth - 1);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const records = getRecordsByDate(dateStr);
      const totalMinutes = records.reduce((sum, r) => sum + r.duration, 0);
      return {
        date: dateStr,
        day: day.getDate(),
        minutes: totalMinutes,
        isCurrentMonth: isSameMonth(day, monthDate)
      };
    });
  }, [selectedYear, selectedMonth, getRecordsByDate]);

  const handlePrevYear = () => {
    dispatch({ type: 'SET_SELECTED_YEAR', payload: selectedYear - 1 });
  };
  
  const handleNextYear = () => {
    dispatch({ type: 'SET_SELECTED_YEAR', payload: selectedYear + 1 });
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      dispatch({ type: 'SET_SELECTED_MONTH', payload: 12 });
      dispatch({ type: 'SET_SELECTED_YEAR', payload: selectedYear - 1 });
    } else {
      dispatch({ type: 'SET_SELECTED_MONTH', payload: selectedMonth - 1 });
    }
  };
  
  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      dispatch({ type: 'SET_SELECTED_MONTH', payload: 1 });
      dispatch({ type: 'SET_SELECTED_YEAR', payload: selectedYear + 1 });
    } else {
      dispatch({ type: 'SET_SELECTED_MONTH', payload: selectedMonth + 1 });
    }
  };

  const getTotalMinutes = (): number => {
    if (view === 'year') {
      return yearData.reduce((sum, m) => sum + m.totalMinutes, 0);
    } else {
      const monthData = yearData.find(m => m.month === selectedMonth - 1);
      return monthData?.totalMinutes || 0;
    }
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-title">
          <h2>{selectedYear}年</h2>
          {view === 'month' && <span className="current-month">{MONTHS[selectedMonth - 1]}</span>}
        </div>
        
        <div className="calendar-nav">
          <button className="nav-btn" onClick={view === 'year' ? handlePrevYear : handlePrevMonth}>
            ‹
          </button>
          <button className="nav-btn" onClick={view === 'year' ? handleNextYear : handleNextMonth}>
            ›
          </button>
        </div>
      </div>

      <div className="calendar-view-toggle">
        <button 
          className={`view-btn ${view === 'year' ? 'active' : ''}`}
          onClick={() => setView('year')}
        >
          年视图
        </button>
        <button 
          className={`view-btn ${view === 'month' ? 'active' : ''}`}
          onClick={() => setView('month')}
        >
          月视图
        </button>
      </div>

      <div className="calendar-stats">
        <div className="stat-item">
          <span className="stat-value">{Math.floor(getTotalMinutes() / 60)}</span>
          <span className="stat-label">小时</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{getTotalMinutes() % 60}</span>
          <span className="stat-label">分钟</span>
        </div>
      </div>

      <div className="calendar-legend">
        <span className="legend-label">学习时长:</span>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#f5f5f5' }}></span>
          <span>未学习</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#ffe0b2' }}></span>
          <span>1-30分钟</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#ffb74d' }}></span>
          <span>31-60分钟</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#ff9800' }}></span>
          <span>61-120分钟</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#f57c00' }}></span>
          <span>120+分钟</span>
        </div>
      </div>

      {view === 'year' && (
        <div className="year-view">
          {yearData.map((month, index) => (
            <div key={index} className="month-grid">
              <div className="month-label">{month.monthName}</div>
              <div className="days-grid">
                {month.days.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="day-cell"
                    style={{ background: getColorByMinutes(day.minutes) }}
                    title={`${day.date}: ${day.minutes}分钟`}
                  >
                    {day.minutes > 0 && <span className="day-minutes">{day.minutes}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'month' && (
        <div className="month-view">
          <div className="weekday-header">
            {WEEKDAYS.map((day, index) => (
              <div key={index} className="weekday-cell">{day}</div>
            ))}
          </div>
          <div className="month-days">
            {monthData.map((day, index) => (
              <div
                key={index}
                className={`month-day-cell ${!day.isCurrentMonth ? 'other-month' : ''}`}
                style={{ background: day.isCurrentMonth ? getColorByMinutes(day.minutes) : '#fafafa' }}
                title={`${day.date}: ${day.minutes}分钟`}
              >
                <span className="day-number">{day.day}</span>
                {day.minutes > 0 && <span className="day-duration">{day.minutes}m</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
