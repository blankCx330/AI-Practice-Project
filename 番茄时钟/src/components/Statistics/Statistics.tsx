import { useState, useMemo } from 'react';
import { useApp } from '../../context/StudyContext';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval as eachDayOfMonth,
  startOfYear,
  endOfYear,
  eachMonthOfInterval
} from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from 'recharts';
import './Statistics.css';
import Icon from '../Icons';

type StatsView = 'week' | 'month' | 'year';

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

// 格式化分钟为小时分钟
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}分钟`;
  return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
};

// 自定义Tooltip类型
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

// 自定义Tooltip组件
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const minutes = payload[0].value;
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-value">{formatDuration(minutes)}</p>
      </div>
    );
  }
  return null;
};


export default function Statistics() {
  const { getRecordsByDate, getRecordsByMonth, state } = useApp();
  const [view, setView] = useState<StatsView>('week');

  // 本周数据
  const weekData = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const records = getRecordsByDate(dateStr);
      const totalMinutes = records.reduce((sum, r) => sum + r.duration, 0);
      return {
        name: WEEKDAYS[day.getDay()],
        minutes: totalMinutes,
        date: dateStr
      };
    });
  }, [getRecordsByDate]);

  // 本月数据
  const monthData = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const days = eachDayOfMonth({ start: monthStart, end: monthEnd });

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const records = getRecordsByDate(dateStr);
      const totalMinutes = records.reduce((sum, r) => sum + r.duration, 0);
      return {
        name: String(day.getDate()),
        minutes: totalMinutes,
        date: dateStr
      };
    });
  }, [getRecordsByDate]);

  // 本年数据
  const yearData = useMemo(() => {
    const now = new Date();
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return months.map(month => {
      const monthIndex = month.getMonth();
      const records = getRecordsByMonth(now.getFullYear(), monthIndex + 1);
      const totalMinutes = records.reduce((sum, r) => sum + r.duration, 0);
      return {
        name: `${monthIndex + 1}月`,
        minutes: totalMinutes,
        month: monthIndex + 1
      };
    });
  }, [getRecordsByMonth]);

  // 当前视图的数据
  const currentData = view === 'week' ? weekData : view === 'month' ? monthData : yearData;

  // 统计数据
  const stats = useMemo(() => {
    const totalMinutes = currentData.reduce((sum, d) => sum + d.minutes, 0);
    const daysWithStudy = currentData.filter(d => d.minutes > 0).length;
    const avgMinutes = daysWithStudy > 0 ? Math.round(totalMinutes / daysWithStudy) : 0;
    const maxMinutes = Math.max(...currentData.map(d => d.minutes), 0);

    return { totalMinutes, daysWithStudy, avgMinutes, maxMinutes };
  }, [currentData]);


  // 柱状图颜色
  const getBarColor = (minutes: number): string => {
    if (minutes === 0) return '#eee';
    if (minutes <= 30) return '#ffe0b2';
    if (minutes <= 60) return '#ffb74d';
    if (minutes <= 120) return '#ff9800';
    return '#f57c00';
  };


  return (
    <div className="statistics-container">
      {/* 视图切换 */}
      <div className="stats-tabs">
        <button 
          className={`tab-btn ${view === 'week' ? 'active' : ''}`}
          onClick={() => setView('week')}
        >
          本周
        </button>
        <button 
          className={`tab-btn ${view === 'month' ? 'active' : ''}`}
          onClick={() => setView('month')}
        >
          本月
        </button>
        <button 
          className={`tab-btn ${view === 'year' ? 'active' : ''}`}
          onClick={() => setView('year')}
        >
          本年
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon"><Icon name="clock" size={24} /></div>
          <div className="stat-info">
            <span className="stat-number">{Math.floor(stats.totalMinutes / 60)}</span>
            <span className="stat-unit">小时</span>
          </div>
          <span className="stat-desc">总学习时长</span>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon"><Icon name="calendar" size={24} /></div>
          <div className="stat-info">
            <span className="stat-number">{stats.daysWithStudy}</span>
            <span className="stat-unit">天</span>
          </div>
          <span className="stat-desc">学习天数</span>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon"><Icon name="chart" size={24} /></div>
          <div className="stat-info">
            <span className="stat-number">{stats.avgMinutes}</span>
            <span className="stat-unit">分钟</span>
          </div>
          <span className="stat-desc">日均时长</span>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon"><Icon name="trophy" size={24} /></div>
          <div className="stat-info">
            <span className="stat-number">{Math.floor(stats.maxMinutes / 60)}</span>
            <span className="stat-unit">小时</span>
          </div>
          <span className="stat-desc">单日最长</span>
        </div>
      </div>

      {/* 图表 */}
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={currentData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#999', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#999', fontSize: 12 }}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,107,107,0.1)' }} />
            <Bar 
              dataKey="minutes" 
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            >
              {currentData.map((entry) => (
                <Cell key={`cell-${view}-${entry.name}`} fill={getBarColor(entry.minutes)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 学习记录列表 */}
      <div className="recent-records">
        <h3>最近学习记录</h3>
        <div className="records-list">
          {state.records
            .slice(-5)
            .reverse()
            .map(record => (
              <div key={record.id} className="record-item">
                <div className="record-date">
                  {format(new Date(record.date), 'MM月dd日')}
                </div>
                <div className="record-duration">
                  {record.duration}分钟
                </div>
                <div className="record-time">
                  {format(new Date(record.startTime), 'HH:mm')} - {format(new Date(record.endTime), 'HH:mm')}
                </div>
              </div>
            ))}
          {state.records.length === 0 && (
            <div className="no-records">暂无学习记录，开始你的第一次学习吧！</div>
          )}
        </div>
      </div>
    </div>
  );
}
