// 学习记录类型
export interface StudyRecord {
  id: string;
  startTime: number;
  endTime: number;
  duration: number; // 分钟
  date: string; // YYYY-MM-DD
  name?: string; // 学习名称/主题
}

// 计时器状态
export type TimerStatus = 'idle' | 'running' | 'paused';

// 视图类型
export type ViewType = 'timer' | 'calendar' | 'statistics' | 'today' | 'settings';

// 日历视图类型
export type CalendarView = 'year' | 'month';

// 统计数据类型
export interface DayStats {
  date: string;
  totalMinutes: number;
  sessions: number;
}

export interface WeekStats {
  day: string;
  totalMinutes: number;
}

export interface MonthStats {
  month: string;
  totalMinutes: number;
}


// 应用设置类型
export interface AppSettings {
  defaultMinutes: number;
  enableSound: boolean;
  enableNotifications: boolean;
}