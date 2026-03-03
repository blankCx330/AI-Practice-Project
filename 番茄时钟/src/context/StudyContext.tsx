/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react';
import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import type { StudyRecord, TimerStatus, ViewType, AppSettings } from '../types';
import { format } from 'date-fns';
import { useRecentNames } from '../hooks/useRecentNames';

// 默认设置
const DEFAULT_SETTINGS: AppSettings = {
  defaultMinutes: 25,
  enableSound: true,
  enableNotifications: false,
};

// 状态类型
interface AppState {
  records: StudyRecord[];
  timerMinutes: number;
  timerStatus: TimerStatus;
  remainingSeconds: number;
  timerStartTime: number | null;
  currentView: ViewType;
  selectedYear: number;
  selectedMonth: number;
  settings: AppSettings;
}

// Action类型
type Action =
  | { type: 'SET_RECORDS'; payload: StudyRecord[] }
  | { type: 'ADD_RECORD'; payload: StudyRecord }
  | { type: 'DELETE_RECORD'; payload: string }
  | { type: 'UPDATE_RECORD'; payload: { id: string; name: string } }
  | { type: 'SET_TIMER_MINUTES'; payload: number }
  | { type: 'SET_TIMER_STATUS'; payload: TimerStatus }
  | { type: 'SET_REMAINING_SECONDS'; payload: number }
  | { type: 'SET_TIMER_START_TIME'; payload: number | null }
  | { type: 'SET_CURRENT_VIEW'; payload: ViewType }
  | { type: 'SET_SELECTED_YEAR'; payload: number }
  | { type: 'SET_SELECTED_MONTH'; payload: number }
  | { type: 'TICK' }
  | { type: 'SET_SETTINGS'; payload: AppSettings };

// 初始状态
const initialState: AppState = {
  records: [],
  timerMinutes: 25,
  timerStatus: 'idle',
  remainingSeconds: 25 * 60,
  timerStartTime: null,
  currentView: 'timer',
  selectedYear: new Date().getFullYear(),
  selectedMonth: new Date().getMonth() + 1,
  settings: DEFAULT_SETTINGS,
};

// Reducer
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_RECORDS':
      return { ...state, records: action.payload };
    case 'ADD_RECORD':
      return { ...state, records: [...state.records, action.payload] };
    case 'DELETE_RECORD':
      return { ...state, records: state.records.filter(r => r.id !== action.payload) };
    case 'UPDATE_RECORD':
      return { ...state, records: state.records.map(r => r.id === action.payload.id ? { ...r, name: action.payload.name } : r) };
    case 'SET_TIMER_MINUTES':
      return { 
        ...state, 
        timerMinutes: action.payload,
        remainingSeconds: action.payload * 60,
        timerStatus: 'idle',
        timerStartTime: null
      };
    case 'SET_TIMER_STATUS':
      return { ...state, timerStatus: action.payload };
    case 'SET_REMAINING_SECONDS':
      return { ...state, remainingSeconds: action.payload };
    case 'SET_TIMER_START_TIME':
      return { ...state, timerStartTime: action.payload };
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_SELECTED_YEAR':
      return { ...state, selectedYear: action.payload };
    case 'SET_SELECTED_MONTH':
      return { ...state, selectedMonth: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'TICK':
      if (state.remainingSeconds <= 0) {
        return state;
      }
      return { ...state, remainingSeconds: state.remainingSeconds - 1 };
    default:
      return state;
  }
}

// Context类型
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addRecord: (duration: number, name?: string) => void;
  deleteRecord: (id: string) => void;
  finishEarly: (name?: string) => void;
  updateRecordName: (id: string, name: string) => void;
  getRecordsByDate: (date: string) => StudyRecord[];
  getTodayRecords: () => StudyRecord[];
  getRecordsByYear: (year: number) => StudyRecord[];
  getRecordsByMonth: (year: number, month: number) => StudyRecord[];
  updateSettings: (settings: AppSettings) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { addRecentName } = useRecentNames();
  const isInitialized = useRef(false);

  // 从localStorage加载数据
  useEffect(() => {
    const savedRecords = localStorage.getItem('study-records');
    if (savedRecords) {
      try {
        const records = JSON.parse(savedRecords);
        if (Array.isArray(records) && records.length > 0) {
          dispatch({ type: 'SET_RECORDS', payload: records });
        }
      } catch (e) {
        console.error('Failed to parse records:', e);
      }
    }

    // 加载设置
    const savedSettings = localStorage.getItem('pomodoro-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        dispatch({ type: 'SET_SETTINGS', payload: { ...DEFAULT_SETTINGS, ...settings } });
        if (settings.defaultMinutes) {
          dispatch({ type: 'SET_TIMER_MINUTES', payload: settings.defaultMinutes });
        }
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
    
    // 标记初始化完成
    isInitialized.current = true;
  }, []);

  // 保存记录到localStorage（仅在初始化后保存）
  useEffect(() => {
    if (isInitialized.current && state.records.length > 0) {
      localStorage.setItem('study-records', JSON.stringify(state.records));
    }
  }, [state.records]);

  // 保存设置到localStorage（仅在初始化后保存）
  useEffect(() => {
    if (isInitialized.current) {
      localStorage.setItem('pomodoro-settings', JSON.stringify(state.settings));
    }
  }, [state.settings]);

  // 计时器递减
  useEffect(() => {
    let interval: number | undefined;
    if (state.timerStatus === 'running') {
      interval = window.setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.timerStatus]);

  // 添加记录
  const addRecord = useCallback((duration: number, name?: string) => {
    const now = Date.now();
    const startTime = state.timerStartTime || (now - duration * 60 * 1000);
    const trimmedName = name && name.trim() ? name.trim() : undefined;
    const record: StudyRecord = {
      id: "record-" + now,
      startTime,
      endTime: now,
      duration,
      date: format(now, "yyyy-MM-dd"),
      name: trimmedName,
    };
    dispatch({ type: "ADD_RECORD", payload: record });
    
    // 如果有名称，添加到最近名称列表
    if (trimmedName) {
      addRecentName(trimmedName);
    }
  }, [state.timerStartTime, dispatch, addRecentName]);

  // 计时结束处理
  useEffect(() => {
    if (state.remainingSeconds === 0 && state.timerStatus === 'running') {
      // 播放提示音（检查设置）
      if (state.settings.enableSound) {
        playNotificationSound();
      }
      // 发送浏览器通知（检查设置和权限）
      if (state.settings.enableNotifications && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('番茄时钟', {
          body: `学习完成！共学习${state.timerMinutes}分钟`,
          icon: '/favicon.ico'
        });
      }
      // 保存记录
      const duration = state.timerMinutes;
      addRecord(duration);
      dispatch({ type: 'SET_TIMER_STATUS', payload: 'idle' });
      dispatch({ type: 'SET_REMAINING_SECONDS', payload: state.timerMinutes * 60 });
      dispatch({ type: 'SET_TIMER_START_TIME', payload: null });
    }
  }, [state.remainingSeconds, state.timerStatus, state.timerMinutes, state.settings, addRecord]);

  // 删除记录
  const deleteRecord = (id: string) => {
    dispatch({ type: 'DELETE_RECORD', payload: id });
  };

  // 提前结束
  const finishEarly = (name?: string) => {
    if (state.timerStatus === 'running' || state.timerStatus === 'paused') {
      // 计算已经学习的时间
      const totalSeconds = state.timerMinutes * 60;
      const elapsedSeconds = totalSeconds - state.remainingSeconds;
      const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60)); // 至少记录1分钟
      
      if (elapsedMinutes > 0) {
        addRecord(elapsedMinutes, name);
      }
      
      dispatch({ type: 'SET_TIMER_STATUS', payload: 'idle' });
      dispatch({ type: 'SET_REMAINING_SECONDS', payload: state.timerMinutes * 60 });
      dispatch({ type: 'SET_TIMER_START_TIME', payload: null });
    }
  };

  // 更新记录名称
  const updateRecordName = (id: string, name: string) => {
    dispatch({ type: 'UPDATE_RECORD', payload: { id, name } });
  };

  // 按日期获取记录
  const getRecordsByDate = (date: string): StudyRecord[] => {
    return state.records.filter(r => r.date === date);
  };

  // 获取今日记录
  const getTodayRecords = (): StudyRecord[] => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return state.records.filter(r => r.date === today);
  };

  // 按年份获取记录
  const getRecordsByYear = (year: number): StudyRecord[] => {
    return state.records.filter(r => r.date.startsWith(String(year)));
  };

  // 按年月获取记录
  const getRecordsByMonth = (year: number, month: number): StudyRecord[] => {
    const monthStr = String(month).padStart(2, '0');
    return state.records.filter(r => r.date.startsWith(`${year}-${monthStr}`));
  };

  // 更新设置
  const updateSettings = (settings: AppSettings) => {
    dispatch({ type: 'SET_SETTINGS', payload: settings });
    // 如果默认时长改变，更新计时器
    if (settings.defaultMinutes !== state.timerMinutes && state.timerStatus === 'idle') {
      dispatch({ type: 'SET_TIMER_MINUTES', payload: settings.defaultMinutes });
    }
  };

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      addRecord,
      deleteRecord,
      updateRecordName,
      finishEarly,
      getRecordsByDate,
      getTodayRecords,
      getRecordsByYear,
      getRecordsByMonth,
      updateSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// 使用Context的hook
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// 提示音函数
export function playNotificationSound() {
  const audioContext = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}